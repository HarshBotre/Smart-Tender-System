'use client';

import { useState } from 'react';
import { useWriteContract, useReadContract, useAccount } from 'wagmi';
import { tenderABI } from '../../abi';
import { parseEther } from 'viem';
import { Search, FileText, CheckSquare, Award } from 'lucide-react';

const ADMIN_WALLET = '0x54F99f09aC935AaFe19E4e9C8a9c65c7f28B93fA';
const CONTRACT_ADDRESS = '0x0FeD7C2d66ceF37BA2a3a53f3de627eF4752F51d';
const getIPFSGatewayURL = (uri: string) => uri?.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri;

export default function AdminPage() {
  const { address } = useAccount();
  
  // Create Tender State
  const [file, setFile] = useState<File | null>(null);
  const [emd, setEmd] = useState('0.01');
  const [bidDuration, setBidDuration] = useState('');
  const [revealDuration, setRevealDuration] = useState('');
  
  // Evaluator Dashboard State
  const [evalTenderId, setEvalTenderId] = useState('');
  const [bidderAddress, setBidderAddress] = useState('');

  // NEW: Award Contract State
  const [awardTenderId, setAwardTenderId] = useState('');

  const isValidAddress = bidderAddress.startsWith('0x') && bidderAddress.length === 42;

  const { writeContract: writeCreate } = useWriteContract();
  const { writeContract: writeEval } = useWriteContract();
  const { writeContract: writeAward } = useWriteContract(); // NEW HOOK

  // Direct Blockchain Lookup
  const { data: bidData, isLoading: isReadingBid } = useReadContract({
    address: CONTRACT_ADDRESS, 
    abi: tenderABI, 
    functionName: 'bids',
    args: evalTenderId && isValidAddress ? [BigInt(evalTenderId), bidderAddress as `0x${string}`] : undefined,
    query: { enabled: !!evalTenderId && isValidAddress }
  });

  const technicalURI = bidData ? (bidData as any)[0] : '';
  const isTechnicallyValid = bidData ? (bidData as any)[2] : false;

  // --- SECURITY GUARD ---
  if (!address || address.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
    return (
      <div className="w-full max-w-6xl mx-auto animate-fade-in flex flex-col items-center justify-center mt-20">
        <div className="bg-[#313D5A] border border-red-500/50 p-12 text-center rounded-xl shadow-xl max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
          <p className="text-[#CBC5EA] mb-6">You must connect the official Administrator wallet to view this portal.</p>
        </div>
      </div>
    );
  }

  // --- FUNCTIONS ---
  const handleCreateTender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData(); formData.append('file', file);
    const pinataRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', { method: 'POST', headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}` }, body: formData });
    const pinataData = await pinataRes.json();
    writeCreate({ address: CONTRACT_ADDRESS, abi: tenderABI, functionName: 'createTender', args: [`ipfs://${pinataData.IpfsHash}`, parseEther(emd), BigInt(Number(bidDuration) * 60), BigInt(Number(revealDuration) * 60)] });
  };

  const handleApprove = () => {
    if (!isValidAddress) return;
    writeEval({ address: CONTRACT_ADDRESS, abi: tenderABI, functionName: 'evaluateTechnical', args: [BigInt(evalTenderId), [bidderAddress as `0x${string}`]] });
  };

  // NEW: Award Function
  const handleAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardTenderId) return;
    writeAward({ address: CONTRACT_ADDRESS, abi: tenderABI, functionName: 'awardContract', args: [BigInt(awardTenderId)] });
  };

  // --- UI RENDER ---
  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="mb-10 border-b border-[#73628A] pb-6">
        <h1 className="text-4xl font-extrabold mb-2 text-[#EAEAEA]">Administration Control</h1>
        <p className="text-[#CBC5EA] text-lg">Manage procurements and evaluate vendor submissions securely.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* CARD 1: CREATE TENDER */}
        <div className="bg-[#313D5A] rounded-xl p-8 shadow-xl border border-[#73628A]">
          <h2 className="text-xl font-bold text-[#EAEAEA] mb-6 border-b border-[#73628A] pb-3">1. Initialize New Tender</h2>
          <form onSubmit={handleCreateTender} className="flex flex-col gap-4">
            <div className="bg-[#183642] p-4 rounded border border-[#73628A]">
              <label className="block text-sm font-medium text-[#CBC5EA] mb-2">Official Notice (PDF)</label>
              <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-[#EAEAEA] text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#73628A] file:text-white cursor-pointer" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#CBC5EA] mb-1">EMD Amount (ETH)</label>
              <input type="number" step="0.001" value={emd} onChange={(e) => setEmd(e.target.value)} className="w-full p-3 rounded bg-[#183642] border border-[#73628A] text-white focus:outline-none focus:border-[#CBC5EA]" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#CBC5EA] mb-1">Bidding (Min)</label>
                <input type="number" value={bidDuration} onChange={(e) => setBidDuration(e.target.value)} className="w-full p-3 rounded bg-[#183642] border border-[#73628A] text-white focus:outline-none focus:border-[#CBC5EA]" placeholder="e.g. 1440" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#CBC5EA] mb-1">Reveal (Min)</label>
                <input type="number" value={revealDuration} onChange={(e) => setRevealDuration(e.target.value)} className="w-full p-3 rounded bg-[#183642] border border-[#73628A] text-white focus:outline-none focus:border-[#CBC5EA]" placeholder="e.g. 1440" required />
              </div>
            </div>
            <button type="submit" className="mt-4 w-full bg-[#73628A] hover:bg-[#CBC5EA] hover:text-[#183642] text-[#EAEAEA] font-bold py-3 rounded transition-colors">Upload & Create Tender</button>
          </form>
        </div>

        {/* CARD 2: EVALUATOR'S DASHBOARD */}
        <div className="bg-[#313D5A] rounded-xl p-8 shadow-xl border border-[#73628A] flex flex-col">
          <h2 className="text-xl font-bold text-[#EAEAEA] mb-6 border-b border-[#73628A] pb-3">2. Evaluator's Dashboard</h2>
          
          <div className="bg-[#183642] p-5 rounded border border-[#73628A] mb-4">
            <h3 className="text-sm font-bold text-[#EAEAEA] mb-3 flex items-center gap-2"><Search size={16}/> Direct Submission Lookup</h3>
            <div className="flex flex-col gap-3">
              <input type="number" value={evalTenderId} onChange={(e) => setEvalTenderId(e.target.value)} className="w-full p-3 rounded bg-[#313D5A] border border-[#73628A] text-white text-sm outline-none focus:border-[#CBC5EA]" placeholder="Enter Tender ID (e.g., 1)" />
              <input type="text" value={bidderAddress} onChange={(e) => setBidderAddress(e.target.value)} className="w-full p-3 rounded bg-[#313D5A] border border-[#73628A] text-white text-sm outline-none focus:border-[#CBC5EA]" placeholder="Paste Contractor Wallet Address (0x...)" />
            </div>
          </div>

          <div className="mt-2 flex-1 flex flex-col animate-fade-in">
            {isReadingBid ? (
              <p className="text-[#CBC5EA] text-sm text-center mt-4">Querying Blockchain...</p>
            ) : technicalURI ? (
              <div className="bg-[#183642] border border-[#73628A] p-4 rounded-lg flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold text-[#EAEAEA] block">Technical Document Found</span>
                    {isTechnicallyValid ? (
                      <span className="text-xs text-green-400 font-bold flex items-center gap-1 mt-1"><CheckSquare size={14}/> Whitelisted</span>
                    ) : (
                      <span className="text-xs text-yellow-400 font-bold mt-1 block">Pending Evaluation</span>
                    )}
                  </div>
                  <a href={getIPFSGatewayURL(technicalURI)} target="_blank" rel="noopener noreferrer" className="bg-[#313D5A] hover:bg-[#73628A] text-[#CBC5EA] hover:text-[#EAEAEA] text-xs px-4 py-2 rounded font-bold transition-all flex items-center gap-2">
                    <FileText size={14} /> View PDF
                  </a>
                </div>
                
                {!isTechnicallyValid && (
                  <button onClick={handleApprove} className="w-full bg-[#73628A] hover:bg-[#CBC5EA] hover:text-[#183642] text-[#EAEAEA] font-bold py-3 rounded transition-colors">
                    Approve & Whitelist Bidder
                  </button>
                )}
              </div>
            ) : (evalTenderId && isValidAddress) ? (
              <p className="text-red-400 text-sm text-center mt-4">No submission found for this address.</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* CARD 3: AWARD CONTRACT */}
      <div className="bg-[#313D5A] rounded-xl p-8 shadow-xl border border-[#73628A] w-full">
        <h2 className="text-xl font-bold text-[#EAEAEA] mb-4 border-b border-[#73628A] pb-3 flex items-center gap-2">
          <Award size={24} className="text-yellow-400" /> 
          3. Finalize & Award Contract
        </h2>
        <p className="text-[#CBC5EA] mb-6">Officially close the tender and lock the winning contractor's EMD. You can only execute this action after the <span className="text-yellow-400 font-bold">Reveal Phase</span> has completely expired.</p>
        
        <form onSubmit={handleAward} className="flex flex-col sm:flex-row gap-4">
          <input 
            type="number" 
            value={awardTenderId} 
            onChange={(e) => setAwardTenderId(e.target.value)} 
            className="flex-1 p-3 rounded bg-[#183642] border border-[#73628A] text-white text-lg outline-none focus:border-[#CBC5EA]" 
            placeholder="Enter Tender ID to Award (e.g., 6)" 
            required 
          />
          <button type="submit" className="bg-green-700 hover:bg-green-600 text-white font-bold py-3 px-8 rounded transition-colors whitespace-nowrap">
            Officially Award Contract
          </button>
        </form>
      </div>

    </div>
  );
}