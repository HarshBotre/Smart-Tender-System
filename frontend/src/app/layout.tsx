import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../provider"; // The provider file we made earlier
import { ConnectButton } from '@rainbow-me/rainbowkit';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Tender System",
  description: "A secure Commit-Reveal bidding platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`}>
        <Providers>
          {/* Navigation Bar */}
          <nav className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900">
            <h1 className="text-2xl font-bold text-blue-400">SmartTender</h1>
            <ConnectButton />
          </nav>
          
          {/* Main App Content */}
          <main className="p-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}