import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { parseEther, keccak256, encodePacked } from 'viem';
import { tenderABI } from '../abi'; // Your compiled contract ABI

const CONTRACT_ADDRESS = '0x0FeD7C2d66ceF37BA2a3a53f3de627eF4752F51d';

export default function CommitBid({ tenderId, emdAmount }: { tenderId: bigint, emdAmount: bigint }) {
  const [bidAmount, setBidAmount] = useState('');
  const [techURI, setTechURI] = useState('');
  
  const { writeContract, isPending } = useWriteContract();

  // --- SECRET MANAGEMENT UTILS ---
  
  const generateSalt = () => {
    // Generates a random 16-character string for the salt
    return Math.random().toString(36).substring(2, 18);
  };

  const saveBackup = (tenderIdStr: string, amountStr: string, salt: string) => {
    const receipt = { tenderId: tenderIdStr, bidAmount: amountStr, secretSalt: salt, date: new Date().toISOString() };
    
    // 1. Auto-Save to LocalStorage
    localStorage.setItem(`tender_${tenderIdStr}_receipt`, JSON.stringify(receipt));

    // 2. Hard Backup: Trigger File Download
    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tender_${tenderIdStr}_Secret_Receipt.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- EXECUTION ---

  const handleCommit = async () => {
    if (!bidAmount || !techURI) return alert("Please fill all fields");

    const secretSalt = generateSalt();
    const bidAmountWei = parseEther(bidAmount);

    // CRITICAL: Viem Client-Side Hashing
    // This perfectly mimics Solidity's keccak256(abi.encodePacked(amount, salt))
    // The raw bidAmountWei is NEVER sent in the transaction payload.
    const commitmentHash = keccak256(
      encodePacked(
        ['uint256', 'string'], 
        [bidAmountWei, secretSalt]
      )
    );

    // Prompt user to save their backup before MetaMask opens
    saveBackup(tenderId.toString(), bidAmount, secretSalt);

    // Send the hash and the EMD to the blockchain
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: tenderABI,
      functionName: 'submitCommitment',
      args: [tenderId, techURI, commitmentHash],
      value: emdAmount, // Send EMD natively
    });
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-900 text-white">
      <h3 className="text-xl font-bold mb-4">Submit Sealed Bid (Commit)</h3>
      
      <div className="flex flex-col gap-3">
        <label>Technical Document URI (IPFS)</label>
        <input 
          type="text" 
          value={techURI} 
          onChange={(e) => setTechURI(e.target.value)}
          className="p-2 text-black rounded"
          placeholder="ipfs://Qm..."
        />

        <label>Financial Bid Amount (ETH)</label>
        <input 
          type="number" 
          value={bidAmount} 
          onChange={(e) => setBidAmount(e.target.value)}
          className="p-2 text-black rounded"
          placeholder="e.g. 5.5"
        />

        <button 
          onClick={handleCommit} 
          disabled={isPending}
          className="mt-4 p-3 bg-blue-600 rounded hover:bg-blue-700 font-bold"
        >
          {isPending ? 'Confirming in Wallet...' : 'Lock Bid & Download Receipt'}
        </button>
        <p className="text-xs text-gray-400 mt-2">
          Warning: A secret file will download. Do not lose it, or you will forfeit your EMD.
        </p>
      </div>
    </div>
  );
}