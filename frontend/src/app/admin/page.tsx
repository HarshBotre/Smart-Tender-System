'use client';

import { useState } from 'react';
import { useWriteContract, useAccount, usePublicClient } from 'wagmi';
import { tenderABI } from '../../abi';
import { parseEther, parseAbiItem } from 'viem';
import { Search, FileText, CheckSquare } from 'lucide-react';

const ADMIN_WALLET = '0x54F99f09aC935AaFe19E4e9C8a9c65c7f28B93fA';
const CONTRACT_ADDRESS = '0x0FeD7C2d66ceF37BA2a3a53f3de627eF4752F51d';
const getIPFSGatewayURL = (uri: string) => uri?.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : uri;

export default function AdminPage() {
  const { address } = useAccount();
  const publicClient = usePublicClient(); // <-- NEW: Allows us to scan the blockchain
  
  // Create Tender State
  const [file, setFile] = useState<File | null>(null);
  const [emd, setEmd] = useState('0.01');
  const [bidDuration, setBidDuration] = useState('');
  const [revealDuration, setRevealDuration] = useState('');
  
  // Evaluator Dashboard State
  const [evalTenderId, setEvalTenderId] = useState('');
  const [bidders, setBidders] = useState<{address: string, uri: string}[]>([]);
  const [selectedBidders, setSelectedBidders] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const { writeContract: writeCreate } = useWriteContract();
  const { writeContract: writeEval } = useWriteContract();

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

  // NEW: Query the blockchain for all BidCommitted events for this tender
  const handleFetchBidders = async () => {
    if (!publicClient || !evalTenderId) return;
    setIsFetching(true);
    try {
      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: parseAbiItem('event BidCommitted(uint256 indexed tenderId, address indexed bidder, string technicalDocURI)'),
        args: { tenderId: BigInt(evalTenderId) },
        fromBlock: 'earliest',
        toBlock: 'latest'
      });

      // Deduplicate in case a bidder submitted multiple times
      const bidderMap = new Map<string, string>();
      logs.forEach((log) => {
        if (log.args.bidder && log.args.technicalDocURI) {
           bidderMap.set(log.args.bidder, log.args.technicalDocURI);
        }
      });

      setBidders(Array.from(bidderMap.entries()).map(([addr, uri]) => ({ address: addr, uri })));
      setSelectedBidders([]); // Reset checkboxes
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      alert("Error querying blockchain. See console.");
    }
    setIsFetching(false);
  };

  const toggleBidder = (addr: string) => {
    setSelectedBidders(prev => prev.includes(addr) ? prev.filter(a => a !== addr) : [...prev, addr]);
  };

  const handleApprove = () => {
    if (selectedBidders.length === 0) return;
    writeEval({ address: CONTRACT_ADDRESS, abi: tenderABI, functionName: 'evaluateTechnical', args: [BigInt(evalTenderId), selectedBidders as `0x${string}`[]] });
  };

  // --- UI RENDER ---
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
          
          <div className="bg-[#183642] p-5 rounded border border-[#73628A] mb-2">
            <h3 className="text-sm font-bold text-[#EAEAEA] mb-3 flex items-center gap-2"><Search size={16}/> Scan Blockchain for Bids</h3>
            <div className="flex gap-3">
              <input type="number" value={evalTenderId} onChange={(e) => setEvalTenderId(e.target.value)} className="flex-1 p-2 rounded bg-[#313D5A] border border-[#73628A] text-white text-sm outline-none focus:border-[#CBC5EA]" placeholder="Enter Tender ID (e.g., 1)" />
              <button onClick={handleFetchBidders} disabled={isFetching || !evalTenderId} className="bg-[#73628A] hover:bg-[#CBC5EA] hover:text-[#183642] text-[#EAEAEA] px-4 rounded text-sm font-bold transition-colors disabled:opacity-50">
                {isFetching ? 'Scanning...' : 'Scan'}
              </button>
            </div>
          </div>

          {/* DYNAMIC GALLERY OF SUBMITTED PDFS */}
          {bidders.length > 0 && (
            <div className="mt-4 flex-1 flex flex-col animate-fade-in">
              <div className="flex justify-between items-end mb-3">
                <h3 className="text-sm font-bold text-[#CBC5EA]">Submitted Technical Plans</h3>
                <span className="text-xs text-[#CBC5EA]">{selectedBidders.length} / {bidders.length} Selected</span>
              </div>
              
              <div className="flex flex-col gap-3 mb-6 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                {bidders.map((b) => (
                  <label key={b.address} className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors ${selectedBidders.includes(b.address) ? 'bg-[#73628A]/20 border-[#CBC5EA]' : 'bg-[#183642] border-[#73628A] hover:border-[#CBC5EA]'}`}>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={selectedBidders.includes(b.address)} onChange={() => toggleBidder(b.address)} className="w-5 h-5 accent-[#73628A] cursor-pointer" />
                      <span className="text-sm text-[#EAEAEA] font-mono">{b.address.slice(0, 6)}...{b.address.slice(-4)}</span>
                    </div>
                    <a href={getIPFSGatewayURL(b.uri)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="bg-[#313D5A] hover:bg-[#73628A] text-[#CBC5EA] hover:text-[#EAEAEA] text-xs px-3 py-1.5 rounded transition-colors flex items-center gap-1">
                      <FileText size={14} /> View PDF
                    </a>
                  </label>
                ))}
              </div>

              <button onClick={handleApprove} disabled={selectedBidders.length === 0} className="mt-auto w-full bg-[#73628A] hover:bg-[#CBC5EA] hover:text-[#183642] text-[#EAEAEA] font-bold py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Approve {selectedBidders.length} Selected Bidders
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isFetching && evalTenderId && bidders.length === 0 && (
             <p className="text-[#CBC5EA] text-sm text-center mt-6">No bids found for this Tender ID.</p>
          )}

        </div>
      </div>
    </div>
  );
}