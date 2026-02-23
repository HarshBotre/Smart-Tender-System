'use client';

import { useReadContract } from 'wagmi';
import { tenderABI } from '../../abi';
import TenderDashboard from '../../components/TenderDashboard';

const CONTRACT_ADDRESS = '0x0FeD7C2d66ceF37BA2a3a53f3de627eF4752F51d';

export default function Dashboard() {
  const { data: tenderCount, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: tenderABI,
    functionName: 'tenderCount',
  });

  const count = tenderCount ? Number(tenderCount) : 0;
  const tenderIds = Array.from({ length: count }, (_, i) => BigInt(count - i));

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-10 border-b border-[#73628A] pb-6">
        <h1 className="text-4xl font-extrabold mb-2 text-[#EAEAEA]">Active Procurements</h1>
        <p className="text-[#CBC5EA] text-lg">Browse and bid on cryptographically secured government contracts.</p>
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
            <TenderDashboard key={id.toString()} tenderId={id} />
          ))}
        </div>
      )}
    </div>
  );
}