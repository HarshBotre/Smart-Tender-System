'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { tenderABI } from '../abi';

const CONTRACT_ADDRESS = '0x0FeD7C2d66ceF37BA2a3a53f3de627eF4752F51d';

export default function WithdrawEMD({ tenderId }: { tenderId: bigint }) {
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleWithdraw = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: tenderABI,
      functionName: 'withdrawEMD',
      args: [tenderId],
    });
  };

  return (
    <div className="mt-6 p-5 bg-gray-700 rounded-lg border border-gray-600">
      <h3 className="text-xl font-bold mb-2 text-white">Withdraw EMD Deposit</h3>
      <p className="text-sm text-gray-300 mb-4">
        If the tender is finalized and you are eligible, you can reclaim your locked ETH deposit here.
      </p>
      
      <button
        onClick={handleWithdraw}
        disabled={isPending || isConfirming || isConfirmed}
        className={`w-full font-bold py-3 px-4 rounded text-white transition-colors ${
          isConfirmed ? 'bg-green-600 cursor-not-allowed' :
          isPending || isConfirming ? 'bg-gray-500 cursor-not-allowed' :
          'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isPending ? 'Confirming in Wallet...' : 
         isConfirming ? 'Waiting for block...' : 
         isConfirmed ? 'EMD Withdrawn Successfully!' : 'Withdraw 0.01 ETH'}
      </button>
      
      {/* Display errors if the smart contract rejects the withdrawal */}
      {error && (
        <div className="mt-4 p-3 bg-red-900 border border-red-500 rounded text-red-200 text-sm break-words">
          <strong>Transaction Failed:</strong> {(error as any).shortMessage || error.message}
        </div>
      )}
    </div>
  );
}