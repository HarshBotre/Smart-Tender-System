'use client';

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { tenderABI } from '../../abi';
import TenderDashboard from '../../components/TenderDashboard';

const CONTRACT_ADDRESS = '0x0FeD7C2d66ceF37BA2a3a53f3de627eF4752F51d';

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const { data: tenderCount, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: tenderABI,
    functionName: 'tenderCount',
  });

  const count = tenderCount ? Number(tenderCount) : 0;
  const tenderIds = Array.from({ length: count }, (_, i) => BigInt(count - i));

  return (
    <div className="w-full animate-fade-in">
      
      {/* HEADER & FILTER BAR */}
      <div className="mb-10 border-b border-[#73628A] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 text-[#EAEAEA]">Active Procurements</h1>
          <p className="text-[#CBC5EA] text-lg">Browse, evaluate, and bid on cryptographically secured government contracts.</p>
        </div>
        
        {/* SEGMENTED FILTER CONTROL */}
        <div className="flex bg-[#313D5A] p-1 rounded-lg border border-[#73628A] shadow-inner shrink-0 overflow-x-auto">
          {['ALL', 'BIDDING', 'REVEAL', 'CLOSED'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setActiveFilter(filterType)}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap ${
                activeFilter === filterType 
                  ? 'bg-[#73628A] text-[#EAEAEA] shadow-md' 
                  : 'text-[#CBC5EA] hover:text-[#EAEAEA] hover:bg-[#183642]'
              }`}
            >
              {filterType === 'ALL' ? 'All Tenders' : 
               filterType === 'BIDDING' ? 'Bidding Open' : 
               filterType === 'REVEAL' ? 'Reveal Phase' : 'Closed / Evaluating'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-[#CBC5EA] text-center mt-20 font-medium">Syncing with Sepolia Blockchain...</div>
      ) : tenderIds.length === 0 ? (
        <div className="bg-[#313D5A] border border-[#73628A] p-12 text-center rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-[#EAEAEA] mb-2">No active tenders</h3>
          <p className="text-[#CBC5EA]">Wait for an administrator to publish a new contract.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tenderIds.map((id) => (
            <TenderDashboard key={id.toString()} tenderId={id} filter={activeFilter} />
          ))}
        </div>
      )}
    </div>
  );
}