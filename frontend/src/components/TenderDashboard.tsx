'use client';

import { useReadContract } from 'wagmi';
import { tenderABI } from '../abi';
import { formatEther } from 'viem';
import CommitBid from './CommitBid'; 
import RevealBid from './RevealBid'; 
import WithdrawEMD from './WithdrawEMD';

const CONTRACT_ADDRESS = '0x0FeD7C2d66ceF37BA2a3a53f3de627eF4752F51d';
const getIPFSGatewayURL = (uri: string) => uri?.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri;

export default function TenderDashboard({ tenderId }: { tenderId: bigint }) {
  const { data: tender, isLoading } = useReadContract({ address: CONTRACT_ADDRESS, abi: tenderABI, functionName: 'tenders', args: [tenderId] });

  if (isLoading) return <div className="bg-[#313D5A] border border-[#73628A] rounded-xl p-8 text-[#CBC5EA] text-center shadow-lg">Loading...</div>;
  if (!tender) return null;

  const [id, metadataURI, emdAmount, biddingEnd, revealEnd, isOpen, lowestBidder] = tender as any;
  if (id === BigInt(0)) return null;

  const currentTime = Math.floor(Date.now() / 1000); 
  const isBiddingPhase = currentTime <= Number(biddingEnd);
  const isRevealPhase = currentTime > Number(biddingEnd) && currentTime <= Number(revealEnd);
  const isAwardPhase = currentTime > Number(revealEnd);

  return (
    <div className="bg-[#313D5A] border border-[#73628A] rounded-xl p-6 shadow-xl flex flex-col h-full hover:border-[#CBC5EA] transition-colors">
      
      <div className="flex justify-between items-center border-b border-[#73628A] pb-4 mb-6">
        <h2 className="text-2xl font-bold text-[#EAEAEA]">Tender #{id.toString()}</h2>
        <div className={`px-3 py-1 rounded text-xs uppercase font-bold tracking-wider border ${
          !isOpen ? 'bg-red-900/40 text-red-300 border-red-700' : 
          isBiddingPhase ? 'bg-green-900/40 text-green-300 border-green-700' : 
          isRevealPhase ? 'bg-yellow-900/40 text-yellow-300 border-yellow-700' : 'bg-blue-900/40 text-blue-300 border-blue-700'
        }`}>
          {!isOpen ? 'Closed / Awarded' : isBiddingPhase ? 'Bidding Open' : isRevealPhase ? 'Reveal Phase' : 'Evaluating'}
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

      <div className="mt-auto pt-2">
        {isOpen && isBiddingPhase && <CommitBid tenderId={id} emdAmount={emdAmount} />}
        {isOpen && isRevealPhase && <RevealBid tenderId={id} />}
        {isOpen && isAwardPhase && (
           <div className="p-4 bg-[#183642] rounded-lg border border-[#73628A] text-center">
             <p className="text-[#CBC5EA] text-sm mb-2">Waiting for Admin to award contract.</p>
             {lowestBidder !== '0x0000000000000000000000000000000000000000' && (
                <div className="mt-3 pt-3 border-t border-[#73628A]">
                  <p className="text-xs text-[#CBC5EA] uppercase tracking-wider mb-1">Current Lowest Bidder</p>
                  <p className="text-green-400 font-mono text-sm">{lowestBidder}</p>
                </div>
             )}
           </div>
        )}
        {(!isOpen || isAwardPhase) && <WithdrawEMD tenderId={id} />}
      </div>
    </div>
  );
}