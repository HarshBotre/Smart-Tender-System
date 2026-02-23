'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { tenderABI } from '../abi';

const CONTRACT_ADDRESS = '0x0FeD7C2d66ceF37BA2a3a53f3de627eF4752F51d';

export default function WithdrawEMD({ tenderId }: { tenderId: bigint }) {
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const handleWithdraw = () => {
    writeContract({ address: CONTRACT_ADDRESS, abi: tenderABI, functionName: 'withdrawEMD', args: [tenderId] });
  };

  return (
    <div className="mt-4 p-5 bg-[#183642] border border-[#73628A] rounded-lg text-center">
      <h3 className="text-md font-bold mb-1 text-[#EAEAEA]">Withdraw EMD Deposit</h3>
      <p className="text-xs text-[#CBC5EA] mb-4">Reclaim your locked ETH deposit here.</p>
      
      <button onClick={handleWithdraw} disabled={isPending || isConfirming || isConfirmed} className="w-full bg-transparent border border-[#73628A] hover:bg-[#73628A] text-[#EAEAEA] font-medium py-2 rounded transition-all disabled:opacity-50">
        {isPending || isConfirming ? 'Processing...' : isConfirmed ? 'Successfully Withdrawn!' : 'Withdraw ETH'}
      </button>
      {error && <div className="mt-3 text-red-400 text-xs">{(error as any).shortMessage || 'Transaction failed'}</div>}
    </div>
  );
}