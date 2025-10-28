import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_USE_REAL_WALLETS': '"true"',
    'import.meta.env.VITE_SOLANA_NETWORK': '"devnet"',
    'import.meta.env.VITE_SOLANA_RPC_ENDPOINT': '"https://api.devnet.solana.com"',
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: [
      '.replit.dev',
      '.repl.co',
    ],
  },
  preview: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: [
      '.replit.dev',
      '.repl.co',
    ],
  },
});
