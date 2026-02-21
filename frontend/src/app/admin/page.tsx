'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { tenderABI } from '../../abi';
import { parseEther } from 'viem';

const CONTRACT_ADDRESS = '0x0FeD7C2d66ceF37BA2a3a53f3de627eF4752F51d';

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [emd, setEmd] = useState('0.01');
  const [bidDuration, setBidDuration] = useState('1440'); // Default to 24 hours (in minutes)
  const [revealDuration, setRevealDuration] = useState('1440');
  
  const [status, setStatus] = useState('');

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleCreateTender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a PDF document first!");

    try {
      setStatus('Uploading document to IPFS via Pinata...');

      // 1. Upload the physical file to Pinata (IPFS)
      const formData = new FormData();
      formData.append('file', file);

      const pinataRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        },
        body: formData
      });

      const pinataData = await pinataRes.json();
      if (!pinataRes.ok) throw new Error(pinataData.error?.details || 'Pinata upload failed');

      const ipfsUri = `ipfs://${pinataData.IpfsHash}`;
      setStatus(`File securely uploaded! IPFS Hash: ${pinataData.IpfsHash}. Waiting for MetaMask...`);

      // 2. Send the IPFS link and Tender details to the Blockchain
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: tenderABI,
        functionName: 'createTender',
        args: [
          ipfsUri,
          parseEther(emd), // viem's parseEther automatically converts "0.01" to Wei!
          BigInt(Number(bidDuration) * 60), // Convert minutes to seconds
          BigInt(Number(revealDuration) * 60)
        ],
      });

    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gray-900 border border-gray-700 rounded-xl my-10 text-white shadow-2xl">
      <h2 className="text-3xl font-extrabold mb-6 text-blue-400">Admin Control Panel</h2>
      <p className="text-gray-400 mb-8">Upload official Notice Inviting Tender (NIT) documents to IPFS and initialize a new smart contract bidding cycle.</p>

      <form onSubmit={handleCreateTender} className="flex flex-col gap-6">
        
        {/* File Upload */}
        <div className="p-4 border-2 border-dashed border-gray-600 rounded-lg text-center hover:border-blue-500 transition-colors">
          <label className="block text-sm font-bold text-gray-300 mb-2">1. Upload Tender PDF</label>
          <input type="file" accept="application/pdf" onChange={handleFileChange} className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
        </div>

        {/* EMD Input */}
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-1">2. EMD Amount (ETH)</label>
          <input type="number" step="0.001" value={emd} onChange={(e) => setEmd(e.target.value)} className="w-full p-3 rounded bg-gray-800 border border-gray-600 text-white" required />
        </div>

        {/* Timers */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1">Bidding Duration (Minutes)</label>
            <input type="number" value={bidDuration} onChange={(e) => setBidDuration(e.target.value)} className="w-full p-3 rounded bg-gray-800 border border-gray-600 text-white" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1">Reveal Duration (Minutes)</label>
            <input type="number" value={revealDuration} onChange={(e) => setRevealDuration(e.target.value)} className="w-full p-3 rounded bg-gray-800 border border-gray-600 text-white" required />
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={isPending || isConfirming} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg text-lg disabled:bg-gray-600 transition-colors">
          {isPending || isConfirming ? 'Processing...' : 'Upload to IPFS & Create Tender'}
        </button>

      </form>

      {/* Status Messages */}
      {status && <div className="mt-6 p-4 bg-gray-800 border border-blue-500 rounded text-blue-300 text-sm font-mono break-words">{status}</div>}
      {isConfirming && <div className="mt-2 p-4 bg-yellow-900 border border-yellow-500 rounded text-yellow-200 text-sm">Waiting for blockchain confirmation...</div>}
      {isConfirmed && <div className="mt-2 p-4 bg-green-900 border border-green-500 rounded text-green-200 text-sm font-bold">Success! Tender created on the blockchain!</div>}

    </div>
  );
}