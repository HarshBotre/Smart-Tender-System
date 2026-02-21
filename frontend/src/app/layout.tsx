import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from '../provider';

export const metadata = {
  title: 'SmartTender | Decentralized Procurement',
  description: 'Secure, transparent, and tamper-proof government bidding.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* BACKGROUND: Deep Teal, PRIMARY TEXT: Off-White */}
      <body className="bg-[#183642] text-[#EAEAEA] min-h-screen flex flex-col font-sans">
        <Providers>
          {/* HEADER: Slate Navy with Muted Purple Border */}
          <header className="w-full bg-[#313D5A] border-b border-[#73628A] sticky top-0 z-50 shadow-md">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#73628A] rounded-lg flex items-center justify-center font-bold text-xl text-[#EAEAEA] shadow-inner">S</div>
                <h1 className="text-2xl font-extrabold tracking-tight text-[#EAEAEA]">
                  Smart<span className="text-[#CBC5EA]">Tender</span>
                </h1>
              </div>
              
              <div className="flex items-center gap-8">
                <a href="/" className="text-[#CBC5EA] hover:text-[#EAEAEA] font-medium transition-colors">Dashboard</a>
                <a href="/admin" className="text-[#CBC5EA] hover:text-[#EAEAEA] font-medium transition-colors">Admin Panel</a>
                <div id="wallet-connect-header"></div> 
              </div>
            </div>
          </header>

          <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
            {children}
          </main>
          
          {/* FOOTER: Slate Navy */}
          <footer className="border-t border-[#73628A] bg-[#313D5A] py-8 text-center text-[#CBC5EA] text-sm shadow-inner">
            <p>© 2026 SmartTender Protocol. Built on Sepolia Testnet.</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}