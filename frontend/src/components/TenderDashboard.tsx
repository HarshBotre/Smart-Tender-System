'use client';

import { useReadContract } from 'wagmi';
import { tenderABI } from '../abi';
import { formatEther } from 'viem';
import CommitBid from './CommitBid'; 
import RevealBid from './RevealBid'; 
import WithdrawEMD from './WithdrawEMD';

const CONTRACT_ADDRESS = '0x0FeD7C2d66ceF37BA2a3a53f3de627eF4752F51d';

const getIPFSGatewayURL = (uri: string) => {
  if (uri && uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
  }
  return uri;
};

export default function TenderDashboard({ tenderId }: { tenderId: bigint }) {
  const { data: tender, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: tenderABI,
    functionName: 'tenders',
    args: [tenderId],
  });

  if (isLoading) return <div className="p-4 text-[#CBC5EA]">Loading Tender #{tenderId.toString()}...</div>;
  if (error) return <div className="p-4 text-red-400 font-bold border border-red-500 bg-red-900/30 rounded">Error fetching data: {error.message}</div>;
  if (!tender) return <div className="p-4 text-red-400">Tender not found.</div>;

  const [id, metadataURI, emdAmount, biddingEnd, revealEnd, isOpen, lowestBidder, lowestBidAmount] = tender as any;
  if (id === BigInt(0)) return <div className="p-4 text-red-400">Tender ID {tenderId.toString()} exists, but it is empty.</div>;

  const currentTime = Math.floor(Date.now() / 1000); 
  const isBiddingPhase = currentTime <= Number(biddingEnd);
  const isRevealPhase = currentTime > Number(biddingEnd) && currentTime <= Number(revealEnd);
  const isAwardPhase = currentTime > Number(revealEnd);

  return (
    // MAIN CARD: Slate Navy
    <div className="w-full flex flex-col p-6 bg-[#313D5A] border border-[#73628A] rounded-2xl shadow-xl text-[#EAEAEA] hover:border-[#CBC5EA] transition-all duration-300">
      <div className="flex justify-between items-center border-b border-[#73628A] pb-5 mb-5">
        <h2 className="text-2xl font-bold tracking-wide">Tender #{id.toString()}</h2>
        
        {/* Semantic Status Badges (Kept generic for UX recognition) */}
        <span className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-bold shadow-sm ${
          !isOpen ? 'bg-red-500/20 text-red-300 border border-red-500/50' : 
          isBiddingPhase ? 'bg-green-500/20 text-green-300 border border-green-500/50' : 
          isRevealPhase ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50' : 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
        }`}>
          {!isOpen ? 'Closed / Awarded' : isBiddingPhase ? 'Bidding Open' : isRevealPhase ? 'Reveal Phase' : 'Evaluating'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* INNER BOXES: Deep Teal */}
        <div className="bg-[#183642] border border-[#73628A] p-4 rounded-xl shadow-inner">
          <p className="text-[#CBC5EA] text-xs font-bold uppercase tracking-wider mb-1">EMD Required</p>
          <p className="text-xl font-bold text-[#EAEAEA]">{formatEther(emdAmount)} ETH</p>
        </div>
        <div className="bg-[#183642] border border-[#73628A] p-4 rounded-xl shadow-inner">
          <p className="text-[#CBC5EA] text-xs font-bold uppercase tracking-wider mb-1">Document Link</p>
          <a href={getIPFSGatewayURL(metadataURI)} target="_blank" rel="noopener noreferrer" className="text-[#CBC5EA] hover:text-[#EAEAEA] underline break-all transition-colors">
            View Notice Inviting Tender
          </a>
        </div>
      </div>

      <div className="mt-auto pt-2">
        {isOpen && isBiddingPhase && <CommitBid tenderId={id} emdAmount={emdAmount} />}
        {isOpen && isRevealPhase && <RevealBid tenderId={id} />}
        {isOpen && isAwardPhase && (
          <div className="p-6 bg-[#183642] border border-[#73628A] rounded-xl text-center shadow-inner">
            <h3 className="text-lg font-bold mb-2 text-[#EAEAEA]">Bidding & Reveal Phases Have Ended</h3>
            <p className="text-[#CBC5EA] text-sm">Waiting for Admin to officially award the contract.</p>
            {lowestBidder !== '0x0000000000000000000000000000000000000000' && (
              <div className="mt-4 pt-4 border-t border-[#73628A]">
                <p className="text-xs text-[#CBC5EA] uppercase tracking-wider mb-1">Current Lowest Bidder</p>
                <p className="text-[#EAEAEA] font-mono font-bold bg-[#313D5A] py-2 px-4 rounded inline-block">
                  {lowestBidder.substring(0,6)}...{lowestBidder.substring(38)}
                </p>
              </div>
            )}
          </div>
        )}
        {(!isOpen || isAwardPhase) && <WithdrawEMD tenderId={id} />}
      </div>
    </div>
  );
}