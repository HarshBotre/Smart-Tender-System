'use client';

import { useState } from 'react';
import { useWriteContract, useReadContract, useAccount } from 'wagmi';
import { tenderABI } from '../../abi';
import { parseEther } from 'viem';
import { Search } from 'lucide-react';

const ADMIN_WALLET = '0x54F99f09aC935AaFe19E4e9C8a9c65c7f28B93fA';
const CONTRACT_ADDRESS = '0x0FeD7C2d66ceF37BA2a3a53f3de627eF4752F51d';
const getIPFSGatewayURL = (uri: string) => uri?.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri;

export default function AdminPage() {
  // 1. ALL REACT HOOKS MUST GO FIRST
  const { address } = useAccount();
  
  const [file, setFile] = useState<File | null>(null);
  const [emd, setEmd] = useState('0.01');
  const [bidDuration, setBidDuration] = useState('1440');
  const [revealDuration, setRevealDuration] = useState('1440');
  
  const [evalTenderId, setEvalTenderId] = useState('');
  const [bidderAddress, setBidderAddress] = useState('');
  const [addressesToApprove, setAddressesToApprove] = useState('');

  const isValidAddress = bidderAddress.startsWith('0x') && bidderAddress.length === 42;

  const { writeContract: writeCreate } = useWriteContract();
  const { writeContract: writeEval } = useWriteContract();

  const { data: bidData, isLoading: isReadingBid } = useReadContract({
    address: CONTRACT_ADDRESS, 
    abi: tenderABI, 
    functionName: 'bids',
    args: evalTenderId && isValidAddress ? [BigInt(evalTenderId), bidderAddress as `0x${string}`] : undefined,
    query: { enabled: !!evalTenderId && isValidAddress }
  });

  // 2. SECURITY GUARD GOES HERE (After hooks, before UI)
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

  // 3. RENDER THE ACTUAL ADMIN UI
  const technicalURI = bidData ? (bidData as any)[0] : '';
  const isTechnicallyValid = bidData ? (bidData as any)[2] : false;

  const handleCreateTender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData(); formData.append('file', file);
    const pinataRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', { method: 'POST', headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}` }, body: formData });
    const pinataData = await pinataRes.json();
    writeCreate({ address: CONTRACT_ADDRESS, abi: tenderABI, functionName: 'createTender', args: [`ipfs://${pinataData.IpfsHash}`, parseEther(emd), BigInt(Number(bidDuration) * 60), BigInt(Number(revealDuration) * 60)] });
  };

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    const addressArray = addressesToApprove.split(',').map(a => a.trim()).filter(a => a.startsWith('0x') && a.length === 42);
    if (addressArray.length > 0) writeEval({ address: CONTRACT_ADDRESS, abi: tenderABI, functionName: 'evaluateTechnical', args: [BigInt(evalTenderId), addressArray as `0x${string}`[]] });
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in">
      <div className="mb-10 border-b border-[#73628A] pb-6">
        <h1 className="text-4xl font-extrabold mb-2 text-[#EAEAEA]">Administration Control</h1>
        <p className="text-[#CBC5EA] text-lg">Manage procurements and evaluate vendor submissions securely.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CARD 1: CREATE TENDER */}
        <div className="bg-[#313D5A] rounded-xl p-8 shadow-xl border border-[#73628A]">
          <h2 className="text-xl font-bold text-[#EAEAEA] mb-6 border-b border-[#73628A] pb-3">1. Initialize New Tender</h2>
          <form onSubmit={handleCreateTender} className="flex flex-col gap-4">
            <div className="bg-[#183642] p-4 rounded border border-[#73628A]">
              <label className="block text-sm font-medium text-[#CBC5EA] mb-2">Official Notice (PDF)</label>
              <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-[#EAEAEA] text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#73628A] file:text-white cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#CBC5EA] mb-1">EMD Amount (ETH)</label>
              <input type="number" step="0.001" value={emd} onChange={(e) => setEmd(e.target.value)} className="w-full p-3 rounded bg-[#183642] border border-[#73628A] text-white focus:outline-none focus:border-[#CBC5EA]" required />
            </div>
            <button type="submit" className="mt-4 w-full bg-[#73628A] hover:bg-[#CBC5EA] hover:text-[#183642] text-[#EAEAEA] font-bold py-3 rounded transition-colors">Upload & Create Tender</button>
          </form>
        </div>

        {/* CARD 2: EVALUATE */}
        <div className="bg-[#313D5A] rounded-xl p-8 shadow-xl border border-[#73628A]">
          <h2 className="text-xl font-bold text-[#EAEAEA] mb-6 border-b border-[#73628A] pb-3">2. Technical Evaluation</h2>
          
          <div className="bg-[#183642] p-5 rounded border border-[#73628A] mb-6">
            <h3 className="text-sm font-bold text-[#EAEAEA] mb-3 flex items-center gap-2"><Search size={16}/> Lookup Submission</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <input type="number" value={evalTenderId} onChange={(e) => setEvalTenderId(e.target.value)} className="col-span-1 p-2 rounded bg-[#313D5A] border border-[#73628A] text-white text-sm outline-none" placeholder="Tender ID" />
              <input type="text" value={bidderAddress} onChange={(e) => setBidderAddress(e.target.value)} className="col-span-2 p-2 rounded bg-[#313D5A] border border-[#73628A] text-white text-sm outline-none" placeholder="Bidder Address (0x...)" />
            </div>
            {isReadingBid ? <p className="text-[#CBC5EA] text-sm">Querying...</p> : technicalURI ? (
              <div className="flex justify-between items-center bg-[#313D5A] p-3 rounded border border-[#73628A]">
                <div>
                  <span className="text-sm text-[#EAEAEA] block">Document Found</span>
                  {isTechnicallyValid && <span className="text-xs text-green-400 font-bold block mt-1">✓ Approved</span>}
                </div>
                <a href={getIPFSGatewayURL(technicalURI)} target="_blank" rel="noopener noreferrer" className="bg-[#73628A] hover:bg-[#CBC5EA] hover:text-[#183642] text-[#EAEAEA] text-xs px-4 py-2 rounded font-bold transition-all">View PDF</a>
              </div>
            ) : null}
          </div>

          <form onSubmit={handleApprove} className="flex flex-col gap-4">
            <textarea value={addressesToApprove} onChange={(e) => setAddressesToApprove(e.target.value)} className="w-full p-3 rounded bg-[#183642] border border-[#73628A] text-white text-sm outline-none focus:border-[#CBC5EA] h-24" placeholder="Paste approved wallet addresses here (comma-separated)..." required />
            <button type="submit" className="w-full bg-[#73628A] hover:bg-[#CBC5EA] hover:text-[#183642] text-[#EAEAEA] font-bold py-3 rounded transition-colors">Approve Valid Bidders</button>
          </form>
        </div>

      </div>
    </div>
  );
}