# Real Solana Wallet Setup Guide

**Status**: ✅ **REAL WALLETS ENABLED**

Your BuildPK app is now configured to connect to **real Solana wallets** (Phantom, Solflare, Backpack) instead of demo mode!

---

## 🎯 Quick Start (3 Steps)

### Step 1: Install a Solana Wallet

Choose one of these popular Solana wallets:

**Phantom** (Recommended)
- Website: https://phantom.app
- Chrome Extension: https://chrome.google.com/webstore (search "Phantom")
- Mobile App: Available on iOS and Android

**Solflare**
- Website: https://solflare.com
- Chrome Extension: https://chrome.google.com/webstore (search "Solflare")
- Mobile App: Available on iOS and Android

**Backpack**
- Website: https://backpack.app
- Chrome Extension: https://chrome.google.com/webstore (search "Backpack")
- Mobile App: Available on iOS

### Step 2: Get Devnet SOL (Free Test Tokens)

Your app is configured for Solana **devnet** (test network) so you can experiment without using real money.

1. **Get your wallet address**:
   - Open your wallet extension
   - Copy your wallet address (starts with letters/numbers, e.g., `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`)

2. **Get free devnet SOL** from the faucet:
   - Go to https://faucet.solana.com
   - Paste your wallet address
   - Click "Confirm Airdrop"
   - You'll receive 1-2 SOL for testing (worth $0 - it's fake money!)

### Step 3: Connect Your Wallet to BuildPK

1. Open your BuildPK app in the browser
2. Click **"Connect Wallet"** button (top right)
3. A modal will appear showing detected wallets
4. Click on your wallet (Phantom, Solflare, or Backpack)
5. Approve the connection in your wallet popup
6. ✅ You're connected! Your wallet address will appear in the header

---

## 🔍 How It Works

### Real Wallet Mode (Current Setting)

```javascript
// vite.config.ts - Already configured for you!
define: {
  'import.meta.env.VITE_USE_REAL_WALLETS': '"true"',      // ✅ Real wallets enabled
  'import.meta.env.VITE_SOLANA_NETWORK': '"devnet"',      // Using test network
  'import.meta.env.VITE_SOLANA_RPC_ENDPOINT': '"https://api.devnet.solana.com"',
}
```

When you click "Connect Wallet", the app will:
1. Detect installed Solana wallets in your browser
2. Prompt you to select one
3. Request approval from your wallet
4. Connect to the real Solana devnet blockchain
5. Display your actual wallet address and balance

### What Changed from Demo Mode

| Feature | Demo Mode (Before) | Real Wallet Mode (Now) |
|---------|-------------------|------------------------|
| **Wallet Detection** | Shows all wallets regardless | Only shows installed wallets |
| **Connection** | Simulated, no approval needed | Real connection, requires approval |
| **Wallet Address** | Random mock address | Your actual Solana address |
| **Blockchain** | Local storage only | Real Solana devnet |
| **Transactions** | Simulated instantly | Real blockchain transactions |
| **Token Balance** | Mock balance | Actual SOL balance from faucet |

---

## 🛠️ Technical Details

### Environment Configuration

Your app now uses these environment variables (configured in `vite.config.ts`):

```
VITE_USE_REAL_WALLETS=true              // Enable real wallet connections
VITE_SOLANA_NETWORK=devnet              // Use Solana test network
VITE_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com  // RPC endpoint
```

### Network Selection

**Devnet (Current)**
- Free test network for development
- Get free SOL from faucet
- No real money involved
- Perfect for testing BuildPK features

**Mainnet** (Production - Future)
- Real Solana blockchain
- Real money and transactions
- Deploy when ready to go live
- Change `VITE_SOLANA_NETWORK` to `mainnet-beta`

### Wallet Detection Code

The app automatically detects installed wallets using this logic:

```typescript
// components/WalletConnectModal.tsx
const USE_REAL_WALLETS = import.meta.env.VITE_USE_REAL_WALLETS === 'true';

if (USE_REAL_WALLETS) {
  // Detect which wallets are installed in browser
  const detected = detectInstalledWallets();
  // Show only detected wallets
} else {
  // Demo mode - show all wallets as "installed"
}
```

---

## 🎮 Testing Real Wallet Connections

### Test Checklist

1. **Install Phantom wallet** ✅
   - Go to https://phantom.app/download
   - Add to Chrome/Firefox/Brave

2. **Create/Import wallet** ✅
   - Open Phantom
   - Create new wallet OR import existing
   - Save your seed phrase securely!

3. **Get devnet SOL** ✅
   - Copy your wallet address from Phantom
   - Visit https://faucet.solana.com
   - Request airdrop (1-2 SOL)

4. **Connect to BuildPK** ✅
   - Open BuildPK app
   - Click "Connect Wallet"
   - Select Phantom
   - Approve connection
   - See your address in header

5. **Verify Balance** ✅
   - Your devnet SOL balance should appear
   - Try deploying infrastructure
   - Transactions will appear in your wallet history

---

## 🚀 Next Steps

### Deploy BuildPK Smart Contracts (Optional)

To enable **full blockchain features** (staking, rewards, token transfers), you need to deploy the BUILD token smart contract:

1. **Follow the deployment guide**: See `SOLANA_DEPLOYMENT.md`
2. **Deploy to devnet first**: Test everything before mainnet
3. **Update token address**: Set `VITE_BUILD_TOKEN_MINT_ADDRESS` after deployment
4. **Test staking pools**: Ensure everything works on devnet
5. **Deploy to mainnet**: When ready for production

### Switch to Mainnet (Production)

When you're ready to launch with real money:

1. **Update vite.config.ts**:
   ```typescript
   define: {
     'import.meta.env.VITE_SOLANA_NETWORK': '"mainnet-beta"',
     'import.meta.env.VITE_SOLANA_RPC_ENDPOINT': '"https://api.mainnet-beta.solana.com"',
   }
   ```

2. **Deploy smart contracts to mainnet**
3. **Get real SOL** in your wallet (buy from exchange)
4. **Update BUILD token address** with mainnet deployment
5. **Test thoroughly** before public launch

---

## 🔧 Troubleshooting

### Wallet Not Detected

**Problem**: "No wallets installed" message appears

**Solutions**:
1. Make sure you installed the wallet extension
2. Refresh the BuildPK page after installing wallet
3. Check that the wallet extension is enabled
4. Try a different browser if issues persist

### Connection Rejected

**Problem**: Wallet popup appears but connection fails

**Solutions**:
1. Make sure you clicked "Approve" in the wallet popup
2. Check that your wallet is unlocked
3. Try disconnecting and reconnecting
4. Clear browser cache and try again

### No Balance Showing

**Problem**: Wallet connected but balance shows 0 SOL

**Solutions**:
1. Make sure you requested devnet SOL from faucet
2. Check your wallet is on "Devnet" network (switch in wallet settings)
3. Wait 30 seconds for blockchain to update
4. Refresh the page

### Transactions Failing

**Problem**: Transactions rejected or fail to process

**Solutions**:
1. Make sure you have enough SOL for gas fees
2. Check network status: https://status.solana.com
3. Try again in a few minutes (network congestion)
4. Ensure you're on the correct network (devnet vs mainnet)

---

## 📊 Wallet Mode Indicator

Your BuildPK app now shows a **real-time wallet mode indicator** at the bottom:

```
🟢 Production Mode | Devnet | RPC: https://api.devnet.solana.com
```

This confirms:
- ✅ Real wallets enabled (not demo mode)
- ✅ Connected to Solana devnet
- ✅ Using official Solana RPC endpoint

---

## 🎯 Summary

**You're all set!** Your BuildPK app now supports real Solana wallet connections:

✅ **Real wallet mode enabled** via `vite.config.ts`  
✅ **Devnet configured** for safe testing  
✅ **Wallet detection working** - shows only installed wallets  
✅ **Free test SOL available** from Solana faucet  
✅ **Ready to connect** Phantom, Solflare, or Backpack  

### What to Do Now

1. **Install Phantom wallet** (recommended for beginners)
2. **Get free devnet SOL** from https://faucet.solana.com
3. **Connect your wallet** to BuildPK
4. **Start deploying infrastructure** and earning BUILD tokens!
5. **Test all features** on devnet before mainnet launch

---

## 📞 Need Help?

**Documentation**:
- Phantom Wallet Guide: https://phantom.app/learn
- Solana Faucet: https://faucet.solana.com
- Solana Devnet Explorer: https://explorer.solana.com/?cluster=devnet
- BuildPK Deployment Guide: `SOLANA_DEPLOYMENT.md`

**Support**:
- Email: tech@buildpk.io
- Discord: discord.gg/buildpk
- Twitter: @BuildPK_Official

---

**Welcome to real blockchain development with BuildPK! 🇵🇰🚀**

*Last Updated: October 26, 2025*
