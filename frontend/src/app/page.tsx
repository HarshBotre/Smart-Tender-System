import { ShieldCheck, FileLock2, HardDrive, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="w-full animate-fade-in flex flex-col items-center justify-center pt-10 pb-20">
      
      {/* HERO SECTION */}
      <div className="text-center max-w-4xl mb-20">
        <div className="inline-block bg-[#313D5A] border border-[#73628A] text-[#CBC5EA] px-4 py-1.5 rounded-full text-sm font-bold tracking-wider mb-6 shadow-inner">
          POWERED BY ETHEREUM & IPFS
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-[#EAEAEA] mb-6 leading-tight">
          The Future of <span className="text-[#CBC5EA]">Government Procurement.</span>
        </h1>
        <p className="text-xl text-[#CBC5EA] mb-10 leading-relaxed">
          SmartTender is a next-generation decentralized platform that eliminates corruption, ensures absolute transparency, and secures financial bids using cryptographic proofs.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/dashboard" className="bg-[#73628A] hover:bg-[#CBC5EA] hover:text-[#183642] text-[#EAEAEA] font-bold py-4 px-8 rounded-lg transition-all flex items-center justify-center gap-2 text-lg shadow-lg">
            View Active Tenders <ArrowRight size={20} />
          </a>
          <a href="/admin" className="bg-[#313D5A] border border-[#73628A] hover:bg-[#183642] text-[#EAEAEA] font-bold py-4 px-8 rounded-lg transition-all flex items-center justify-center text-lg">
            Admin Portal
          </a>
        </div>
      </div>

      {/* FEATURES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        
        {/* Feature 1 */}
        <div className="bg-[#313D5A] border border-[#73628A] p-8 rounded-xl shadow-xl hover:border-[#CBC5EA] transition-colors">
          <div className="bg-[#183642] w-14 h-14 rounded-lg flex items-center justify-center mb-6 border border-[#73628A]">
            <FileLock2 className="text-[#CBC5EA]" size={28} />
          </div>
          <h3 className="text-xl font-bold text-[#EAEAEA] mb-3">Two-Envelope System</h3>
          <p className="text-[#CBC5EA] leading-relaxed">
            Technical qualifications are evaluated off-chain first. Financial bids remain cryptographically locked and unreadable until the Reveal Phase.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-[#313D5A] border border-[#73628A] p-8 rounded-xl shadow-xl hover:border-[#CBC5EA] transition-colors">
          <div className="bg-[#183642] w-14 h-14 rounded-lg flex items-center justify-center mb-6 border border-[#73628A]">
            <HardDrive className="text-[#CBC5EA]" size={28} />
          </div>
          <h3 className="text-xl font-bold text-[#EAEAEA] mb-3">IPFS Decentralized Storage</h3>
          <p className="text-[#CBC5EA] leading-relaxed">
            All tender requirements and contractor architectural blueprints are permanently stored on Pinata's IPFS network, completely tamper-proof.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-[#313D5A] border border-[#73628A] p-8 rounded-xl shadow-xl hover:border-[#CBC5EA] transition-colors">
          <div className="bg-[#183642] w-14 h-14 rounded-lg flex items-center justify-center mb-6 border border-[#73628A]">
            <ShieldCheck className="text-[#CBC5EA]" size={28} />
          </div>
          <h3 className="text-xl font-bold text-[#EAEAEA] mb-3">Smart Contract Enforcement</h3>
          <p className="text-[#CBC5EA] leading-relaxed">
            Earnest Money Deposits (EMD) are locked in escrow. The blockchain mathematically guarantees the lowest approved bidder wins the contract.
          </p>
        </div>

      </div>
    </div>
  );
}