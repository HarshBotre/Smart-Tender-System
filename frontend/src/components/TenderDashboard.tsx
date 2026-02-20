'use client';

import { useReadContract } from 'wagmi';
import { tenderABI } from '../abi';
import { formatEther } from 'viem';
import CommitBid from './CommitBid'; // The component from the previous step
import RevealBid from './RevealBid'; // The component from the previous step

const CONTRACT_ADDRESS = '0x0FeD7C2d66ceF37BA2a3a53f3de627eF4752F51d';

export default function TenderDashboard({ tenderId }: { tenderId: bigint }) {
  // 1. Fetch Tender Data from Sepolia
  const { data: tender, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: tenderABI,
    functionName: 'tenders',
    args: [tenderId],
  });

  if (isLoading) return <div className="p-4 text-white">Loading Tender #{tenderId.toString()}...</div>;
  
  // NEW: This will print the exact blockchain error on your screen!
  if (error) return <div className="p-4 text-red-500 font-bold border border-red-500 bg-red-900 rounded">Error fetching data: {error.message}</div>;
  
  if (!tender) return <div className="p-4 text-red-500">Tender not found.</div>;

  // Wagmi returns data as an array. Let's check if the ID is 0 (which means empty/doesn't exist)
  const [id, metadataURI, emdAmount, biddingEnd, revealEnd, isOpen, lowestBidder, lowestBidAmount] = tender as any;
  
  if (id === BigInt(0)) return <div className="p-4 text-red-500">Tender ID {tenderId.toString()} exists, but it is empty on the blockchain.</div>;

  // 2. Time Logic (Determine the current phase)
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  const isBiddingPhase = currentTime <= Number(biddingEnd);
  const isRevealPhase = currentTime > Number(biddingEnd) && currentTime <= Number(revealEnd);
  const isAwardPhase = currentTime > Number(revealEnd);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-800 rounded-xl shadow-lg text-white my-8">
      <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
        <h2 className="text-2xl font-bold">Tender #{id.toString()}</h2>
        
        {/* Dynamic Status Badge */}
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
          !isOpen ? 'bg-red-600' : 
          isBiddingPhase ? 'bg-green-600' : 
          isRevealPhase ? 'bg-yellow-600 text-black' : 'bg-blue-600'
        }`}>
          {!isOpen ? 'Closed / Awarded' : isBiddingPhase ? 'Bidding Open' : isRevealPhase ? 'Reveal Phase' : 'Evaluating'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">EMD Required</p>
          <p className="text-xl font-bold">{formatEther(emdAmount)} ETH</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Document Link</p>
          <a href={metadataURI} target="_blank" className="text-blue-400 hover:underline break-all">
            View Notice Inviting Tender
          </a>
        </div>
      </div>

      {/* Conditional Rendering: Only show what the user is legally allowed to do right now */}
      <div className="mt-8">
        {isOpen && isBiddingPhase && (
          <CommitBid tenderId={id} emdAmount={emdAmount} />
        )}

        {isOpen && isRevealPhase && (
          <RevealBid tenderId={id} />
        )}

        {isAwardPhase && (
          <div className="p-4 bg-gray-900 border border-gray-600 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-2">Bidding & Reveal Phases Have Ended</h3>
            <p className="text-gray-400">Waiting for Admin to officially award the contract.</p>
            {lowestBidder !== '0x0000000000000000000000000000000000000000' && (
              <p className="mt-2 text-green-400 font-bold">
                Current Lowest Bidder: {lowestBidder.substring(0,6)}...{lowestBidder.substring(38)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}