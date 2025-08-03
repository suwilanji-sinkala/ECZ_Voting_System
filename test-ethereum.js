const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Test script for Ethereum/Ganache setup
async function testEthereumSetup() {
  console.log('🚀 Testing Ethereum/Ganache Setup for Election System');
  console.log('==================================================');

  try {
    // Connect to Ganache using Web3.js v4 syntax
    const web3 = new Web3('http://127.0.0.1:7545');
    
    // Get accounts
    const accounts = await web3.eth.getAccounts();
    console.log(`✅ Connected to Ganache`);
    console.log(`📊 Available accounts: ${accounts.length}`);
    console.log(`👤 Default account: ${accounts[0]}`);
    console.log(`💰 Balance: ${web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), 'ether')} ETH`);

    // Check if we can deploy contracts
    console.log('\n🔧 Testing contract deployment capability...');
    const gasPrice = await web3.eth.getGasPrice();
    console.log(`⛽ Gas price: ${web3.utils.fromWei(gasPrice, 'gwei')} gwei`);

    // Test basic transaction
    console.log('\n📝 Testing basic transaction...');
    const txCount = await web3.eth.getTransactionCount(accounts[0]);
    console.log(`📊 Transaction count: ${txCount}`);

    // Test network info
    console.log('\n🌐 Network information...');
    const networkId = await web3.eth.net.getId();
    console.log(`🆔 Network ID: ${networkId}`);
    const blockNumber = await web3.eth.getBlockNumber();
    console.log(`📦 Latest block: ${blockNumber}`);

    console.log('\n✅ Ethereum/Ganache setup is working correctly!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run truffle:compile');
    console.log('2. Run: npm run truffle:migrate');
    console.log('3. Update your API routes to use the new Ethereum client');
    console.log('4. Test the election system with the new blockchain setup');

  } catch (error) {
    console.error('❌ Error testing Ethereum setup:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure Ganache is running on port 7545');
    console.log('2. Run: npm run ganache:start');
    console.log('3. Check if the port is available');
    console.log('4. Try restarting Ganache if connection fails');
  }
}

// Run the test
testEthereumSetup(); 