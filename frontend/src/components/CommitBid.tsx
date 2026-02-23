'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { tenderABI } from '../abi';
import { parseEther, keccak256, encodePacked } from 'viem';
import { UploadCloud, Lock } from 'lucide-react';

const CONTRACT_ADDRESS = '0x0FeD7C2d66ceF37BA2a3a53f3de627eF4752F51d';

export default function CommitBid({ tenderId, emdAmount }: { tenderId: bigint, emdAmount: bigint }) {
  const [file, setFile] = useState<File | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [secretSalt, setSecretSalt] = useState('');
  const [status, setStatus] = useState('');

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !bidAmount || !secretSalt) return alert("Please fill all fields and upload your Technical Plan.");

    try {
      setStatus('1/3: Uploading Technical Plan to IPFS...');
      const formData = new FormData();
      formData.append('file', file);
      const pinataRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}` },
        body: formData
      });
      const pinataData = await pinataRes.json();
      if (!pinataRes.ok) throw new Error('Pinata upload failed');
      
      setStatus('2/3: Securing Financial Bid...');
      const bidHash = keccak256(encodePacked(['uint256', 'string'], [parseEther(bidAmount), secretSalt]));
      localStorage.setItem(`tender_${tenderId.toString()}_receipt`, JSON.stringify({ bidAmount, secretSalt }));

      setStatus('3/3: Waiting for MetaMask Signature...');
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: tenderABI,
        functionName: 'submitCommitment',
        args: [tenderId, `ipfs://${pinataData.IpfsHash}`, bidHash],
        value: emdAmount,
      });
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  };

  if (isConfirmed) return <div className="mt-4 p-4 bg-green-900/40 border border-green-500 rounded-lg text-green-400 text-center font-bold">Bid Submitted Successfully!</div>;

  return (
    <div className="mt-4 p-5 bg-[#183642] border border-[#73628A] rounded-lg">
      <h3 className="text-md font-bold mb-4 text-[#EAEAEA] flex items-center gap-2"><Lock size={16} /> Submit Two-Envelope Bid</h3>
      <form onSubmit={handleCommit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-[#CBC5EA] mb-1 flex items-center gap-1"><UploadCloud size={14}/> 1. Technical Plan (PDF)</label>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-[#EAEAEA] text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#73628A] file:text-white cursor-pointer border border-[#73628A] rounded p-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#CBC5EA] mb-1">2. Secret Bid (ETH)</label>
            <input type="number" step="0.001" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="w-full p-2 rounded bg-[#313D5A] border border-[#73628A] text-white focus:outline-none focus:border-[#CBC5EA]" placeholder="0.05" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#CBC5EA] mb-1">Password (Salt)</label>
            <input type="text" value={secretSalt} onChange={(e) => setSecretSalt(e.target.value)} className="w-full p-2 rounded bg-[#313D5A] border border-[#73628A] text-white focus:outline-none focus:border-[#CBC5EA]" placeholder="Secret string" />
          </div>
        </div>
        <button type="submit" disabled={isPending || isConfirming} className="w-full bg-[#73628A] hover:bg-[#CBC5EA] hover:text-[#183642] text-[#EAEAEA] font-bold py-2.5 rounded transition-all disabled:opacity-50 mt-1">
          {isPending || isConfirming ? 'Processing...' : 'Lock Bid & Pay EMD'}
        </button>
      </form>
      {status && <div className="mt-3 text-[#CBC5EA] text-xs text-center">{status}</div>}
    </div>
  );
}