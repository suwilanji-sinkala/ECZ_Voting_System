# 🚀 Development Scripts - Run Blockchain & App Simultaneously

## 📋 Overview

This project includes several scripts to help you run both the Ethereum blockchain (Ganache) and your Next.js application simultaneously during development.

## 🎯 Available Scripts

### 1. **Node.js Script (Recommended)**
```bash
npm run dev:full
```
- **What it does**: Starts Ganache, deploys smart contract, then starts Next.js app
- **Features**: Automatic deployment, status monitoring, graceful shutdown
- **Best for**: Cross-platform development

### 2. **Windows Batch File**
```bash
start-dev.bat
```
- **What it does**: Opens separate command windows for Ganache and Next.js
- **Features**: Visual separation of processes, easy to monitor
- **Best for**: Windows users who prefer separate windows

### 3. **PowerShell Script**
```bash
.\start-dev.ps1
```
- **What it does**: Runs everything in background jobs
- **Features**: Background processing, easy shutdown
- **Best for**: Windows PowerShell users

## 🚀 Quick Start

### **Option 1: Node.js Script (Recommended)**
```bash
# Start everything with one command
npm run dev:full
```

### **Option 2: Windows Batch**
```bash
# Double-click or run from command line
start-dev.bat
```

### **Option 3: PowerShell**
```bash
# Run PowerShell script
.\start-dev.ps1
```

## 📊 What Each Script Does

### **Step-by-Step Process:**
1. **🚀 Start Ganache** - Local Ethereum blockchain on port 7545
2. **📦 Deploy Contract** - Deploy ElectionSystem smart contract
3. **🌐 Start Next.js** - Development server on port 3000
4. **✅ Show Status** - Display all available endpoints

### **Expected Output:**
```
🚀 Starting Development Environment
===================================
[GANACHE] ganache v7.9.1
[GANACHE] RPC Listening on 127.0.0.1:7545
✅ Ganache is ready!
[DEPLOY] Contract deployed to: 0x...
✅ Smart contract deployed successfully!
[NEXT] Ready - started server on 0.0.0.0:3000
✅ Next.js app is ready!

🎉 DEVELOPMENT SERVER READY!
============================
✅ Ganache blockchain: http://127.0.0.1:7545
✅ Next.js app: http://localhost:3000
✅ Smart contract: Deployed and ready
```

## 🌐 Available Endpoints

Once everything is running, you can access:

- **Frontend**: http://localhost:3000
- **API Routes**: http://localhost:3000/api
- **Blockchain API**: http://localhost:3000/api/blockchain
- **Ganache**: http://127.0.0.1:7545

## 🛑 Stopping Services

### **Node.js Script:**
- Press `Ctrl+C` to stop all services gracefully

### **Batch File:**
- Close the command windows

### **PowerShell:**
- Press any key to stop all services

## 🔧 Troubleshooting

### **Port Already in Use:**
```bash
# Check what's using port 7545
netstat -ano | findstr :7545

# Check what's using port 3000
netstat -ano | findstr :3000
```

### **Ganache Won't Start:**
```bash
# Kill existing processes
taskkill /f /im node.exe

# Start manually
npm run ganache:start
```

### **Contract Deployment Fails:**
```bash
# Reset and redeploy
npm run truffle:migrate --reset
```

### **Next.js Won't Start:**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## 📋 Manual Commands (If Scripts Don't Work)

If the automated scripts don't work, you can run everything manually:

### **Terminal 1 - Ganache:**
```bash
npm run ganache:start
```

### **Terminal 2 - Deploy Contract:**
```bash
npm run truffle:migrate
```

### **Terminal 3 - Next.js App:**
```bash
npm run dev
```

## 🎯 Verification

To verify everything is working:

```bash
# Test blockchain connection
node test-ethereum.js

# Test full functionality
node verify-working.js

# Test API integration
node test-api-integration.js
```

## 📝 Notes

- **Ganache**: Provides 10 accounts with 100 ETH each
- **Smart Contract**: Automatically deployed to latest address
- **Next.js**: Hot reload enabled for development
- **API Routes**: Updated to use Ethereum client
- **Database**: SQLite database maintained alongside blockchain

## 🚀 Production

For production deployment:
1. Deploy smart contract to testnet/mainnet
2. Update contract address in `lib/ethereum-client.ts`
3. Build and deploy Next.js app
4. Configure environment variables

---

**Happy Development! 🎉** 