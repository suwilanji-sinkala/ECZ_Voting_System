# MetaMask Integration Testing Guide

This guide will help you test the MetaMask integration with your election system.

## 🚀 Quick Setup

### 1. Install MetaMask Browser Extension
1. Go to [metamask.io](https://metamask.io/)
2. Install the browser extension
3. Create a new wallet or import existing one

### 2. Connect MetaMask to Ganache
1. **Open MetaMask**
2. **Click on the network dropdown** (top of MetaMask)
3. **Select "Add Network"**
4. **Add Ganache network:**
   - **Network Name**: Ganache Local
   - **RPC URL**: http://localhost:7545
   - **Chain ID**: 5777
   - **Currency Symbol**: ETH
   - **Block Explorer URL**: (leave empty)

### 3. Import Ganache Account
1. **In Ganache Desktop**, copy the private key of the first account
2. **In MetaMask**, click account icon → Import Account
3. **Paste the private key** and import
4. **You should see 100 ETH** in your MetaMask account

## 🧪 Testing Steps

### Step 1: Test Basic Connection
1. **Open your app**: `http://localhost:3000`
2. **Navigate to**: `http://localhost:3000/test-metamask`
3. **Click "Connect MetaMask"**
4. **Click "Test Connection"**
5. **Verify results** show:
   - ✅ Connected Account
   - ✅ Network: Ganache Local (Chain ID: 5777)
   - ✅ Balance: ~100 ETH
   - ✅ Contract connected successfully

### Step 2: Test Voting Integration
1. **Go to voting page**: `http://localhost:3000/client/vote-candidates`
2. **Login as a voter**
3. **Select an election**
4. **Choose a candidate**
5. **Look for MetaMask vote button** below the candidate
6. **Click "Connect MetaMask"** (if not connected)
7. **Click "Vote with MetaMask"**
8. **Confirm transaction** in MetaMask popup
9. **Verify vote appears** in Ganache Desktop transactions

### Step 3: Verify Blockchain Transactions
1. **Open Ganache Desktop**
2. **Go to "Transactions" tab**
3. **Look for new transactions** when you vote
4. **Click on transaction** to see details
5. **Verify gas usage** and transaction data

## 🔧 Troubleshooting

### Common Issues

#### 1. "MetaMask not installed"
- **Solution**: Install MetaMask browser extension
- **Check**: Extension is enabled in browser

#### 2. "Wrong network"
- **Solution**: Switch to Ganache Local network in MetaMask
- **Check**: Chain ID is 5777

#### 3. "Insufficient funds"
- **Solution**: Import Ganache account with 100 ETH
- **Check**: Account balance in MetaMask

#### 4. "Contract not found"
- **Solution**: Ensure Ganache is running and contract is deployed
- **Check**: Contract address in `lib/metamask-client.ts`

#### 5. "Transaction rejected"
- **Solution**: User cancelled transaction in MetaMask
- **Check**: Try again and confirm transaction

#### 6. "Gas estimation failed"
- **Solution**: Increase gas limit in MetaMask
- **Check**: Contract is properly deployed

## 📊 Expected Behavior

### Successful Integration
- ✅ MetaMask connects without errors
- ✅ Network shows as "Ganache Local"
- ✅ Account shows ~100 ETH balance
- ✅ Vote transactions appear in Ganache
- ✅ Vote status updates in UI
- ✅ Transaction hashes are displayed

### Transaction Details
- **Gas Used**: ~300,000 gas per vote
- **Gas Price**: 20 gwei (Ganache default)
- **Cost**: ~0.006 ETH per vote
- **Status**: Success

## 🎯 Testing Checklist

### Basic Functionality
- [ ] MetaMask extension installed
- [ ] Ganache network added to MetaMask
- [ ] Ganache account imported
- [ ] Connection test passes
- [ ] Network detection works
- [ ] Balance shows correctly

### Voting Functionality
- [ ] Vote button appears for selected candidates
- [ ] MetaMask connection works
- [ ] Vote transaction submits successfully
- [ ] Transaction appears in Ganache
- [ ] Vote status updates in UI
- [ ] Error handling works

### Edge Cases
- [ ] User rejects transaction
- [ ] Insufficient gas
- [ ] Network disconnection
- [ ] Multiple votes (should fail)
- [ ] Invalid candidate selection

## 🚀 Production Considerations

### For Real Networks
1. **Deploy contracts** to testnet (Sepolia/Goerli)
2. **Update contract address** in MetaMask client
3. **Add network detection** for correct testnet
4. **Handle gas price** estimation
5. **Add transaction monitoring**

### Security
- **Never store private keys** in your app
- **Always use MetaMask** for user transactions
- **Validate transactions** on blockchain
- **Handle failed transactions** gracefully

## 📈 Performance Monitoring

### Track These Metrics
- **Connection success rate**
- **Transaction success rate**
- **Gas usage patterns**
- **User adoption rate**
- **Error frequency**

### Analytics
- **MetaMask installation rate**
- **Vote completion rate**
- **Transaction confirmation time**
- **User experience metrics**

## 🎉 Success Criteria

Your MetaMask integration is working correctly when:

1. ✅ **Users can connect MetaMask** without errors
2. ✅ **Votes are submitted** to blockchain successfully
3. ✅ **Transactions appear** in Ganache Desktop
4. ✅ **Vote status updates** in real-time
5. ✅ **Error handling** works properly
6. ✅ **User experience** is smooth and intuitive

---

**Note**: This integration provides a decentralized voting experience where users control their own transactions and private keys remain secure in MetaMask.
