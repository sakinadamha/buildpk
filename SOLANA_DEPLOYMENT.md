# 🚀 BuildPK Solana Deployment Guide

Complete guide to deploying BuildPK to the Solana blockchain.

## 📋 Prerequisites

### 1. Install Solana CLI Tools
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Verify installation
solana --version

# Set network to devnet for testing
solana config set --url https://api.devnet.solana.com
```

### 2. Install Anchor Framework
```bash
# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Verify installation
anchor --version
```

### 3. Create Solana Wallet
```bash
# Generate new keypair
solana-keygen new

# Get your public key
solana address

# Get airdrop (devnet only - 2 SOL per request)
solana airdrop 2

# Check balance
solana balance
```

## 🔧 Step 1: Configure Environment

1. **Copy environment template**
```bash
cp .env.example .env
```

2. **Edit `.env` file**
```env
# For testing (devnet)
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
VITE_USE_REAL_WALLETS=true

# For production (mainnet)
# VITE_SOLANA_NETWORK=mainnet-beta
# VITE_SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
# VITE_USE_REAL_WALLETS=true
```

## 🏗️ Step 2: Build Smart Contracts

```bash
cd smart-contracts

# Install dependencies
npm install

# Build the program
anchor build

# Your program ID will be in:
# target/deploy/depin_network-keypair.json
```

## 🚀 Step 3: Deploy to Solana

### Deploy to Devnet (Testing)
```bash
# Make sure you're on devnet
solana config set --url https://api.devnet.solana.com

# Get more SOL if needed (devnet)
solana airdrop 2

# Deploy the program
anchor deploy

# Save the Program ID that's displayed
```

### Deploy to Mainnet (Production)
```bash
# Switch to mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Make sure you have enough SOL for deployment (~5-10 SOL)
solana balance

# Deploy to mainnet
anchor deploy --provider.cluster mainnet
```

## 📝 Step 4: Initialize Smart Contract

After deployment, initialize the program:

```bash
# Run deployment script
node deploy.js

# Or use Anchor
anchor run initialize
```

## 🔑 Step 5: Update Frontend Configuration

1. **Update `.env` with deployed addresses**
```env
VITE_DEPIN_PROGRAM_ID=<your_program_id_from_deployment>
VITE_BUILD_TOKEN_MINT_ADDRESS=<token_mint_address>
VITE_USE_REAL_WALLETS=true
```

2. **Restart the development server**
```bash
npm run dev
```

## 🌐 Step 6: Production RPC Endpoints

For production, use a dedicated RPC provider for better performance:

### Option 1: QuickNode
1. Sign up at https://www.quicknode.com
2. Create a Solana endpoint
3. Update `.env`:
```env
VITE_SOLANA_RPC_ENDPOINT=https://your-endpoint.solana-mainnet.quiknode.pro/<api-key>
```

### Option 2: Helius
1. Sign up at https://www.helius.dev
2. Create an API key
3. Update `.env`:
```env
VITE_SOLANA_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=<your-api-key>
```

### Option 3: Alchemy
1. Sign up at https://www.alchemy.com
2. Create a Solana app
3. Update `.env`:
```env
VITE_SOLANA_RPC_ENDPOINT=https://solana-mainnet.g.alchemy.com/v2/<your-api-key>
```

## 🧪 Step 7: Testing

### Test Wallet Connection
1. Install a Solana wallet (Phantom, Solflare, or Backpack)
2. Switch wallet to devnet
3. Get devnet SOL from faucet: https://faucet.solana.com
4. Connect wallet in BuildPK app
5. Test transactions

### Test Smart Contract Functions
```bash
cd smart-contracts

# Run tests
anchor test

# Run specific test file
anchor test tests/infrastructure.ts
```

## 📊 Step 8: Verify Deployment

After deployment, verify everything works:

1. **Check Program on Explorer**
   - Devnet: https://explorer.solana.com/?cluster=devnet
   - Mainnet: https://explorer.solana.com/
   - Search for your program ID

2. **Test Core Functions**
   - ✅ Wallet connection
   - ✅ Token claiming
   - ✅ Staking pools
   - ✅ Infrastructure deployment
   - ✅ Rewards distribution

## 🔒 Security Checklist

Before mainnet deployment:

- [ ] Smart contracts audited
- [ ] All private keys secured
- [ ] Environment variables not committed to git
- [ ] RPC endpoints using HTTPS
- [ ] Wallet permissions properly scoped
- [ ] Transaction confirmations implemented
- [ ] Error handling tested
- [ ] Rate limiting configured

## 💰 Cost Estimates

### Devnet (Free - Testing)
- Program deployment: 0 SOL (use airdrop)
- Transactions: 0 SOL (use airdrop)

### Mainnet (Production)
- Program deployment: ~5-10 SOL (~$500-1000)
- Account creation: ~0.00089 SOL per account
- Transaction fees: ~0.000005 SOL per transaction
- Monthly operations: Varies based on usage

## 🛠️ Troubleshooting

### "Insufficient funds for deployment"
```bash
# Check balance
solana balance

# For devnet, get airdrop
solana airdrop 2

# For mainnet, transfer SOL to your wallet
```

### "Program already deployed"
```bash
# Upgrade existing program
anchor upgrade <program-id> target/deploy/depin_network.so
```

### "Wallet connection failed"
- Make sure wallet extension is installed
- Check if wallet is on correct network (devnet/mainnet)
- Verify `VITE_USE_REAL_WALLETS=true` in `.env`
- Clear browser cache and reconnect

## 📚 Additional Resources

- **Solana Docs**: https://docs.solana.com
- **Anchor Docs**: https://www.anchor-lang.com
- **Solana Cookbook**: https://solanacookbook.com
- **Solana Explorer**: https://explorer.solana.com
- **Solana Status**: https://status.solana.com

## 🎯 Next Steps

After successful deployment:

1. **Monitor Performance**
   - Set up monitoring with Solana Beach or Solscan
   - Track program usage and transactions

2. **Scale Infrastructure**
   - Add load balancers
   - Implement caching layer
   - Set up redundant RPC endpoints

3. **Enhance Security**
   - Implement multi-sig for admin functions
   - Add transaction monitoring
   - Set up alerts for unusual activity

4. **Community Launch**
   - Announce on Twitter/X
   - Create Discord server
   - Launch incentive programs

---

## 🚨 Important Notes

⚠️ **Devnet is for testing only** - Do not use for real value
⚠️ **Mainnet costs real SOL** - Triple-check everything before deploying
⚠️ **Smart contracts are immutable** - Test thoroughly on devnet first
⚠️ **Backup your keys** - Losing them means losing access forever

Good luck with your deployment! 🚀
