import TenderDashboard from "../components/TenderDashboard"; // Adjust path if you put it elsewhere

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold mb-4">Decentralized Procurement</h2>
        <p className="text-gray-400">Secure, transparent, and tamper-proof government bidding.</p>
      </div>

      {/* We are hardcoding tenderId 1n here for testing. 
        In a full app, you would map through a list of all active tenders.
      */}
      <div className="w-full max-w-4xl">
        <TenderDashboard tenderId={BigInt(2)} />
      </div>
    </div>
  );
}