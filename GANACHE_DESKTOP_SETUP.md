# Ganache Desktop Integration Guide

This guide will help you integrate the Ganache Desktop application with your election system project.

## 🚀 Quick Setup

### 1. Start Ganache Desktop
1. Open the Ganache Desktop application
2. Click "New Workspace" or use the default workspace
3. Make sure these settings are configured:
   - **Hostname**: `127.0.0.1`
   - **Port**: `7545`
   - **Network ID**: `5777`
   - **Accounts**: `10` (or more)
   - **Gas Limit**: `6721975`
   - **Gas Price**: `20`

### 2. Deploy Smart Contracts
```bash
# Compile the contracts
npm run truffle:compile

# Deploy to Ganache
npm run truffle:migrate
```

### 3. Start Your Application
```bash
# Start the Next.js development server
npm run dev
```

## 🔧 Configuration Details

### Ganache Settings
- **RPC Server**: `http://127.0.0.1:7545`
- **Network ID**: `5777`
- **Chain ID**: `5777`
- **Gas Limit**: `6721975`
- **Gas Price**: `20 gwei`

### Contract Deployment
After running `npm run truffle:migrate`, you'll see output like:
```
Contract deployed at: 0x...
```

Copy this contract address and update it in:
- `lib/ethereum-client.ts` (line 7: `DEFAULT_CONTRACT_ADDRESS`)

## 🧪 Testing the Setup

### Test Connection
```bash
node test-ethereum.js
```

### Expected Output
```
🚀 Testing Ethereum/Ganache Setup for Election System
==================================================
✅ Connected to Ganache
📊 Available accounts: 10
👤 Default account: 0x...
💰 Balance: 100 ETH
⛽ Gas price: 20 gwei
📊 Transaction count: 0
✅ Ethereum/Ganache setup is working correctly!
```

## 🔍 Troubleshooting

### Common Issues

1. **Connection Refused Error**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:7545
   ```
   **Solution**: Make sure Ganache Desktop is running and listening on port 7545

2. **No Accounts Found**
   ```
   Error: No accounts found
   ```
   **Solution**: Restart Ganache Desktop and ensure accounts are generated

3. **Contract Not Found**
   ```
   Error: Contract not deployed
   ```
   **Solution**: Run `npm run truffle:migrate` to deploy contracts

4. **Gas Estimation Failed**
   ```
   Error: Gas estimation failed
   ```
   **Solution**: Increase gas limit in Ganache settings or check contract code

## 📋 Workflow

### Daily Development
1. **Start Ganache Desktop** (keep it running)
2. **Deploy contracts** (if you made changes): `npm run truffle:migrate`
3. **Start your app**: `npm run dev`
4. **Test functionality**: Use the web interface or API endpoints

### Making Changes
1. **Modify contracts**: Edit `contracts/ElectionSystem.sol`
2. **Compile**: `npm run truffle:compile`
3. **Deploy**: `npm run truffle:migrate`
4. **Update contract address**: Copy new address to `lib/ethereum-client.ts`

## 🎯 Benefits of Desktop Ganache

- **Visual Interface**: See accounts, transactions, and blocks
- **Easy Account Management**: Copy private keys and addresses
- **Transaction History**: Track all blockchain activity
- **Gas Monitoring**: See gas usage for each transaction
- **Network Status**: Monitor connection and performance

## 🔗 Integration Points

Your project connects to Ganache through:
- **Truffle**: For contract compilation and deployment
- **Web3.js**: For blockchain interactions in your API routes
- **Ethereum Client**: Custom client in `lib/ethereum-client.ts`

## 📚 Next Steps

1. **Test the API**: Try creating elections and submitting votes
2. **Monitor Transactions**: Watch them appear in Ganache Desktop
3. **Check Balances**: See how gas fees affect account balances
4. **Explore Features**: Use Ganache's built-in tools for debugging

---

**Note**: Keep Ganache Desktop running while developing. If you restart it, you'll need to redeploy your contracts.
