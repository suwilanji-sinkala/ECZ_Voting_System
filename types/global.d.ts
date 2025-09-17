// Global type augmentation for MetaMask / EIP-1193 provider
// This prevents TS errors like: Property 'ethereum' does not exist on type 'Window & typeof globalThis'
// If you later install @metamask/providers, you can replace 'any' with MetaMaskInpageProvider
// import type { MetaMaskInpageProvider } from '@metamask/providers';

declare global {
  interface Window {
    // ethereum?: MetaMaskInpageProvider;
    ethereum?: any;
  }
}

export {};
