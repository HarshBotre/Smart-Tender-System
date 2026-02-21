'use client';

import { useReadContract } from 'wagmi';
import { tenderABI } from '../abi';
import TenderDashboard from '../components/TenderDashboard';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const CONTRACT_ADDRESS = '0x0FeD7C2d66ceF37BA2a3a53f3de627eF4752F51d';

export default function Home() {
  const { data: tenderCount, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: tenderABI,
    functionName: 'tenderCount',
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CBC5EA] mb-4"></div>
        <p className="text-[#CBC5EA] font-medium">Syncing with Sepolia Blockchain...</p>
      </div>
    );
  }

  const count = tenderCount ? Number(tenderCount) : 0;
  const tenderIds = Array.from({ length: count }, (_, i) => BigInt(count - i));

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="flex flex-col items-start justify-between md:flex-row md:items-center mb-12">
        <div>
          <h2 className="text-4xl font-extrabold mb-3 text-[#EAEAEA]">Active Tenders</h2>
          <p className="text-[#CBC5EA] text-lg">Browse and bid on cryptographically secured government contracts.</p>
        </div>
        <div className="mt-6 md:mt-0 shadow-lg rounded-xl">
          <ConnectButton />
        </div>
      </div>

      {/* The Grid Layout */}
      {tenderIds.length === 0 ? (
        <div className="bg-[#313D5A] border border-[#73628A] rounded-xl p-16 text-center shadow-xl">
          <div className="text-5xl mb-4 text-[#CBC5EA]">📭</div>
          <h3 className="text-xl font-bold text-[#EAEAEA] mb-2">No active tenders</h3>
          <p className="text-[#CBC5EA]">Wait for an administrator to publish a new contract.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {tenderIds.map((id) => (
            <TenderDashboard key={id.toString()} tenderId={id} />
          ))}
        </div>
      )}
    </div>
  );
}