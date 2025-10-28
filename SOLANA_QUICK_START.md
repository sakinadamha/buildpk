# ⚡ BuildPK Solana Quick Start

Get BuildPK running on Solana in 5 minutes!

## 🎯 Option 1: Demo Mode (Instant - No Setup)

Already working! Just use the app as-is with simulated wallets.

```bash
# Application is already running in demo mode
# Click "Experience It" to test all features
```

## 🚀 Option 2: Enable Real Solana Wallets (5 minutes)

Connect real Solana wallets without deploying smart contracts.

### Step 1: Install a Solana Wallet
Choose one:
- **Phantom**: https://phantom.app/download  
- **Solflare**: https://solflare.com/download  
- **Backpack**: https://backpack.app/download

### Step 2: Enable Real Wallets

Create `.env` file:
```bash
# Copy template
cp .env.example .env
```

Edit `.env`:
```env
VITE_USE_REAL_WALLETS=true
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
```

### Step 3: Restart Server
```bash
# The server will auto-restart
# Or manually: npm run dev
```

### Step 4: Get Devnet SOL
1. Open your wallet
2. Switch to Devnet network
3. Get free SOL: https://faucet.solana.com
4. Connect wallet in BuildPK

✅ **Done!** You're now using real Solana wallets with BuildPK!

---

## 🏗️ Option 3: Deploy Smart Contracts (Advanced)

Deploy your own BuildPK smart contracts to Solana.

### Prerequisites
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### Deploy to Devnet
```bash
# 1. Create wallet
solana-keygen new

# 2. Get devnet SOL
solana airdrop 2

# 3. Deploy contracts
cd smart-contracts
anchor build
anchor deploy

# 4. Update .env with your program ID
VITE_DEPIN_PROGRAM_ID=<your_program_id>
```

📖 **Full deployment guide**: See `SOLANA_DEPLOYMENT.md`

---

## 🌐 Current Status

**Your BuildPK App**:
- ✅ Frontend: Running on port 5000
- ✅ Demo Mode: Active (simulated wallets)
- ✅ Smart Contracts: Written and ready to deploy
- ✅ Wallet Support: Phantom, Solflare, Backpack
- ⏸️ Blockchain: Not deployed yet (using demo mode)

**To Go Live on Solana**:
1. ✅ Enable real wallets (Option 2 above)
2. 📋 Deploy smart contracts (Option 3 above)  
3. 📋 Deploy frontend to Netlify
4. 📋 Switch to mainnet

---

## 🎮 What Works Now (Demo Mode)

Everything! The app is fully functional:
- ✅ Wallet connection (simulated)
- ✅ Token economics
- ✅ Staking pools
- ✅ All 5 DePIN phases
- ✅ Analytics & leaderboard
- ✅ Data export

---

## 💡 Recommended Path

**For Testing** → Enable real wallets (Option 2)  
**For Production** → Deploy contracts + mainnet (Option 3 + Full Guide)

Need help? Check `SOLANA_DEPLOYMENT.md` for the complete guide!
