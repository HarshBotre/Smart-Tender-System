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

  // --- AUTO-FILL LOGIC ---
  useEffect(() => {
    const savedData = localStorage.getItem(`tender_${tenderId.toString()}_receipt`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setBidAmount(parsed.bidAmount);
        setSecretSalt(parsed.secretSalt);
        setAutoFilled(true);
      } catch (e) {
        console.error("Failed to parse local backup");
      }
    }
  }, [tenderId]);

  // --- EXECUTION ---
  const handleReveal = async () => {
    if (!bidAmount || !secretSalt) return alert("Missing reveal data");

    const bidAmountWei = parseEther(bidAmount);

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: tenderABI,
      functionName: 'revealBid',
      args: [tenderId, bidAmountWei, secretSalt],
    });
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-900 text-white mt-6">
      <h3 className="text-xl font-bold mb-4">Reveal Your Bid</h3>
      
      {autoFilled && (
        <div className="mb-4 p-2 bg-green-900 border border-green-500 rounded text-sm">
          ✅ Credentials securely auto-filled from your browser storage.
        </div>
      )}

      <div className="flex flex-col gap-3">
        <label>Financial Bid Amount (ETH)</label>
        <input 
          type="number" 
          value={bidAmount} 
          onChange={(e) => setBidAmount(e.target.value)}
          className="p-2 text-black rounded"
        />

        <label>Secret Salt</label>
        <input 
          type="text" 
          value={secretSalt} 
          onChange={(e) => setSecretSalt(e.target.value)}
          className="p-2 text-black rounded"
        />

        <button 
          onClick={handleReveal} 
          disabled={isPending}
          className="mt-4 p-3 bg-purple-600 rounded hover:bg-purple-700 font-bold"
        >
          {isPending ? 'Revealing...' : 'Reveal Bid'}
        </button>
      </div>
    </div>
  );
}