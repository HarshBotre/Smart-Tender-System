'use client';

import { useReadContract, useAccount } from 'wagmi';
import { tenderABI } from '../abi';
import { formatEther } from 'viem';
import CommitBid from './CommitBid'; 
import RevealBid from './RevealBid'; 
import WithdrawEMD from './WithdrawEMD';

const CONTRACT_ADDRESS = '0x0FeD7C2d66ceF37BA2a3a53f3de627eF4752F51d';
const getIPFSGatewayURL = (uri: string) => uri?.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri;

export default function TenderDashboard({ tenderId, filter = 'ALL' }: { tenderId: bigint, filter?: string }) {
  const { address } = useAccount(); // NEW: Get the current user's wallet
  
  const { data: tender, isLoading } = useReadContract({ 
    address: CONTRACT_ADDRESS, 
    abi: tenderABI, 
    functionName: 'tenders', 
    args: [tenderId] 
  });

  if (isLoading) return <div className="bg-[#313D5A] border border-[#73628A] rounded-xl p-8 text-[#CBC5EA] text-center shadow-lg">Loading...</div>;
  if (!tender) return null;

  const [id, metadataURI, emdAmount, biddingEnd, revealEnd, isOpen, lowestBidder] = tender as any;
  if (id === BigInt(0)) return null;

  // Phase Calculations
  const currentTime = Math.floor(Date.now() / 1000); 
  const isBiddingPhase = currentTime <= Number(biddingEnd);
  const isRevealPhase = currentTime > Number(biddingEnd) && currentTime <= Number(revealEnd);
  const isAwardPhase = currentTime > Number(revealEnd);

  // Filter Logic
  let currentPhaseCategory = 'CLOSED';
  if (isOpen && isBiddingPhase) currentPhaseCategory = 'BIDDING';
  else if (isOpen && isRevealPhase) currentPhaseCategory = 'REVEAL';

  if (filter !== 'ALL' && filter !== currentPhaseCategory) {
    return null; 
  }

  // NEW: Check if the logged-in user is the official winner
  const isWinner = address && lowestBidder && address.toLowerCase() === lowestBidder.toLowerCase();

  return (
    <div className="bg-[#313D5A] border border-[#73628A] rounded-xl p-6 shadow-xl flex flex-col h-full hover:border-[#CBC5EA] transition-colors relative overflow-hidden">
      
      {/* If they won, add a subtle green glow to the whole card! */}
      {!isOpen && isWinner && (
        <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_20px_rgba(34,197,94,1)]"></div>
      )}

      <div className="flex justify-between items-center border-b border-[#73628A] pb-4 mb-6">
        <h2 className="text-2xl font-bold text-[#EAEAEA]">Tender #{id.toString()}</h2>
        <div className={`px-3 py-1 rounded text-xs uppercase font-bold tracking-wider border ${
          !isOpen ? 'bg-slate-900/60 text-slate-300 border-slate-700' : 
          isBiddingPhase ? 'bg-green-900/40 text-green-300 border-green-700' : 
          isRevealPhase ? 'bg-yellow-900/40 text-yellow-300 border-yellow-700' : 'bg-blue-900/40 text-blue-300 border-blue-700'
        }`}>
          {!isOpen ? 'Officially Awarded' : isBiddingPhase ? 'Bidding Open' : isRevealPhase ? 'Reveal Phase' : 'Evaluating'}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="bg-[#183642] p-4 rounded-lg border border-[#73628A]">
          <p className="text-[#CBC5EA] text-xs uppercase tracking-wider mb-1">EMD Required</p>
          <div className="text-2xl font-bold text-[#EAEAEA]">{formatEther(emdAmount)} ETH</div>
        </div>
        <div className="bg-[#183642] p-4 rounded-lg border border-[#73628A]">
          <p className="text-[#CBC5EA] text-xs uppercase tracking-wider mb-1">Official Notice</p>
          <a href={getIPFSGatewayURL(metadataURI)} target="_blank" rel="noopener noreferrer" className="text-[#CBC5EA] hover:text-[#EAEAEA] font-medium underline text-sm block mt-1 transition-colors">
            View Requirements (PDF)
          </a>
        </div>
      </div>

      <div className="mt-auto pt-2 flex flex-col gap-4">
        {isOpen && isBiddingPhase && <CommitBid tenderId={id} emdAmount={emdAmount} />}
        {isOpen && isRevealPhase && <RevealBid tenderId={id} />}
        
        {isOpen && isAwardPhase && (
           <div className="p-4 bg-[#183642] rounded-lg border border-[#73628A] text-center">
             <p className="text-[#CBC5EA] text-sm mb-2">Waiting for Admin to sign final paperwork.</p>
             {lowestBidder !== '0x0000000000000000000000000000000000000000' && (
                <div className="mt-3 pt-3 border-t border-[#73628A]">
                  <p className="text-xs text-[#CBC5EA] uppercase tracking-wider mb-1">Current Lowest Bidder</p>
                  <p className="text-green-400 font-mono text-sm break-all">{lowestBidder}</p>
                </div>
             )}
           </div>
        )}

        {/* NEW: THE WINNER / LOSER BANNER */}
        {!isOpen && (
          <div className={`p-6 rounded-lg border text-center animate-fade-in ${
            isWinner 
              ? 'bg-green-900/30 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
              : 'bg-[#183642] border-[#73628A]'
          }`}>
            {isWinner ? (
              <>
                <h3 className="text-2xl font-extrabold text-green-400 mb-2">🏆 YOU WON!</h3>
                <p className="text-green-200/80 text-sm">The Admin has officially awarded this contract to you. Your EMD is now permanently locked as a performance guarantee.</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-[#EAEAEA] mb-2">Contract Awarded</h3>
                <p className="text-[#CBC5EA] text-sm">This contract has been officially awarded to another contractor.</p>
                <div className="mt-3 pt-3 border-t border-[#73628A]/50">
                  <p className="text-xs text-[#CBC5EA] uppercase tracking-wider mb-1">Winning Address</p>
                  <p className="text-red-300 font-mono text-xs break-all">{lowestBidder}</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* NEW: Only show withdraw button if they are NOT the winner, or if the tender hasn't been officially awarded yet */}
        {(!isOpen || isAwardPhase) && !isWinner && <WithdrawEMD tenderId={id} />}
      </div>
    </div>
  );
}