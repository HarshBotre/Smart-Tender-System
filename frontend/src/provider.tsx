'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';

// 1. Configure Wagmi and the target network (Sepolia Testnet)
const config = getDefaultConfig({
  appName: 'Smart Tender System',
  projectId: '7ed0211351e70456f2522233e24d6122', // Get for free at cloud.walletconnect.com
  chains: [sepolia],
  ssr: true, // Set to false if not using Next.js App Router
});

// 2. Initialize React Query for caching blockchain reads
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}