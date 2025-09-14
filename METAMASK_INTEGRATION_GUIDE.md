# MetaMask Integration Guide

This guide explains how to integrate MetaMask with your election system for user-controlled blockchain voting.

## 🎯 Overview

MetaMask integration allows voters to:
- Use their own Ethereum wallets
- Sign transactions themselves (better security)
- Pay their own gas fees
- Vote on real Ethereum networks (testnets/mainnet)

## 📋 Prerequisites

1. **Install MetaMask**: Users need MetaMask browser extension
2. **Ethers.js**: Install for better MetaMask integration
3. **Contract ABI**: You'll need your contract's ABI

## 🛠️ Installation

### 1. Install Ethers.js
```bash
npm install ethers
npm install @types/ethers
```

### 2. Update Package.json
```json
{
  "dependencies": {
    "ethers": "^5.7.2"
  }
}
```

## 🔧 Implementation Steps

### Step 1: Create MetaMask Client
The `lib/metamask-client.ts` file provides:
- Connection management
- Transaction handling
- Contract interactions
- Error handling

### Step 2: Add MetaMask Component
The `app/components/MetaMaskVoting.tsx` component provides:
- User-friendly interface
- Connection status
- Vote submission
- Error handling

### Step 3: Update Your Voting Page
```tsx
import MetaMaskVoting from '@/components/MetaMaskVoting';

// In your voting component
<MetaMaskVoting
  electionId="ELECTION_123"
  candidateId="CANDIDATE_456"
  positionId="POSITION_1"
  wardCode="WARD_001"
  voterId="VOTER_789"
  onVoteSuccess={(txHash) => {
    console.log('Vote successful:', txHash);
    // Update UI, show success message
  }}
  onVoteError={(error) => {
    console.error('Vote failed:', error);
    // Show error message
  }}
/>
```

## 🌐 Network Configuration

### Development (Ganache)
- **Chain ID**: 5777
- **RPC URL**: http://localhost:7545
- **Currency**: ETH

### Testnet (Sepolia)
- **Chain ID**: 11155111
- **RPC URL**: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
- **Currency**: ETH

### Mainnet
- **Chain ID**: 1
- **RPC URL**: https://mainnet.infura.io/v3/YOUR_PROJECT_ID
- **Currency**: ETH

## 🔄 Migration Strategy

### Option 1: Gradual Migration
1. Keep current server-side voting
2. Add MetaMask as an option
3. Gradually migrate users

### Option 2: Full Migration
1. Replace all voting with MetaMask
2. Remove server-side blockchain code
3. Use MetaMask for all blockchain operations

## 📱 User Experience Flow

1. **User visits voting page**
2. **MetaMask prompt appears** (if not connected)
3. **User connects wallet**
4. **System checks vote status**
5. **User clicks "Vote"**
6. **MetaMask transaction popup**
7. **User confirms transaction**
8. **Vote recorded on blockchain**

## 🔒 Security Benefits

- **Private keys stay in MetaMask** (not on your server)
- **Users control their own transactions**
- **No server-side wallet management**
- **Better decentralization**

## 💰 Gas Fee Management

### For Users
- Users pay their own gas fees
- Can choose gas price/limit
- MetaMask estimates gas automatically

### For You
- No gas fee costs
- Users responsible for transaction fees
- Can provide gas fee estimates

## 🧪 Testing

### Local Testing
1. Use Ganache Desktop
2. Import Ganache accounts into MetaMask
3. Test voting functionality

### Testnet Testing
1. Deploy contracts to Sepolia testnet
2. Get testnet ETH from faucets
3. Test with real MetaMask

## 🚀 Deployment Steps

### 1. Deploy Contracts
```bash
# Deploy to testnet
npm run truffle:migrate --network sepolia

# Update contract address in MetaMask client
```

### 2. Update Configuration
```typescript
// In metamask-client.ts
private contractAddress: string = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
```

### 3. Add Network Detection
```typescript
// Check if user is on correct network
const network = await client.getNetworkInfo();
if (network.chainId !== 11155111) { // Sepolia
  await client.switchNetwork('0xaa36a7'); // Sepolia chain ID
}
```

## 🔧 Troubleshooting

### Common Issues

1. **"MetaMask not installed"**
   - Show installation prompt
   - Provide download link

2. **"Wrong network"**
   - Detect current network
   - Prompt to switch networks

3. **"Transaction rejected"**
   - User cancelled transaction
   - Show appropriate message

4. **"Insufficient funds"**
   - User doesn't have enough ETH
   - Show balance and suggest getting ETH

5. **"Contract not found"**
   - Wrong contract address
   - Contract not deployed
   - Update contract address

## 📊 Monitoring

### Track Transactions
- Monitor transaction success/failure rates
- Track gas usage patterns
- Monitor user adoption

### Analytics
- Connection success rates
- Vote completion rates
- Error frequency

## 🎯 Benefits Summary

### For Users
- ✅ Control their own wallet
- ✅ Vote from anywhere
- ✅ Transparent blockchain voting
- ✅ No server dependency

### For You
- ✅ Reduced server costs
- ✅ Better security
- ✅ More decentralized
- ✅ Real blockchain integration

## 🔄 Next Steps

1. **Install ethers.js**: `npm install ethers`
2. **Test MetaMask integration** locally
3. **Deploy to testnet** for testing
4. **Gradually roll out** to users
5. **Monitor and optimize**

---

**Note**: MetaMask integration provides a more decentralized and user-controlled voting experience. Users maintain full control of their private keys and transactions.
