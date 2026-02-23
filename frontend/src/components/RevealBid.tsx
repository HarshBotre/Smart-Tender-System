'use client';

import { useState, useEffect } from 'react';
import { useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { tenderABI } from '../abi';

const CONTRACT_ADDRESS = '0x0FeD7C2d66ceF37BA2a3a53f3de627eF4752F51d';

export default function RevealBid({ tenderId }: { tenderId: bigint }) {
  const [bidAmount, setBidAmount] = useState('');
  const [secretSalt, setSecretSalt] = useState('');
  const [autoFilled, setAutoFilled] = useState(false);
  const { writeContract, isPending } = useWriteContract();

  useEffect(() => {
    const savedData = localStorage.getItem(`tender_${tenderId.toString()}_receipt`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setBidAmount(parsed.bidAmount);
        setSecretSalt(parsed.secretSalt);
        setAutoFilled(true);
      } catch (e) {}
    }
  }, [tenderId]);

  const handleReveal = () => {
    if (!bidAmount || !secretSalt) return;
    writeContract({ address: CONTRACT_ADDRESS, abi: tenderABI, functionName: 'revealBid', args: [tenderId, parseEther(bidAmount), secretSalt] });
  };

  return (
    <div className="mt-4 p-5 bg-[#183642] border border-[#73628A] rounded-lg">
      <h3 className="text-md font-bold mb-3 text-[#EAEAEA]">Reveal Your Bid</h3>
      {autoFilled && <div className="mb-3 p-2 bg-green-900/40 border border-green-500 rounded text-xs text-green-400">✅ Auto-filled from local storage</div>}
      
      <div className="flex flex-col gap-3">
        <input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="w-full p-2 rounded bg-[#313D5A] border border-[#73628A] text-white focus:outline-none" placeholder="Bid Amount (ETH)" />
        <input type="text" value={secretSalt} onChange={(e) => setSecretSalt(e.target.value)} className="w-full p-2 rounded bg-[#313D5A] border border-[#73628A] text-white focus:outline-none" placeholder="Secret Password" />
        <button onClick={handleReveal} disabled={isPending} className="w-full bg-[#73628A] hover:bg-[#CBC5EA] hover:text-[#183642] text-[#EAEAEA] font-bold py-2.5 rounded transition-all">
          {isPending ? 'Revealing...' : 'Reveal Bid'}
        </button>
      </div>
    </div>
  );
}