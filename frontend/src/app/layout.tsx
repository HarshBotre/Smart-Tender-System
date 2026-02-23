import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from '../provider';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const metadata = {
  title: 'SmartTender | Procurement',
  description: 'Decentralized Government Bidding',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen font-sans bg-[#183642] text-[#EAEAEA]">
        <Providers>
          <nav className="bg-[#313D5A] border-b border-[#73628A] px-6 py-4 sticky top-0 z-50 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              
              <div className="flex items-center gap-3">
                <div className="bg-[#73628A] text-[#EAEAEA] w-10 h-10 flex items-center justify-center rounded-lg font-bold text-xl shadow-inner">
                  ST
                </div>
                <span className="text-2xl font-bold tracking-tight hidden sm:block text-[#EAEAEA]">
                  Smart<span className="text-[#CBC5EA]">Tender</span>
                </span>
              </div>
              
              {/* UPDATED LINKS HERE */}
              <div className="flex items-center gap-6">
                <a href="/" className="text-[#CBC5EA] hover:text-[#EAEAEA] font-medium transition-colors">Home</a>
                <a href="/dashboard" className="text-[#CBC5EA] hover:text-[#EAEAEA] font-medium transition-colors">Dashboard</a>
                <a href="/admin" className="text-[#CBC5EA] hover:text-[#EAEAEA] font-medium transition-colors">Admin</a>
                <ConnectButton />
              </div>

            </div>
          </nav>

          <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
            {children}
          </main>
          
        </Providers>
      </body>
    </html>
  );
}