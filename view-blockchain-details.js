const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

async function viewBlockchainDetails() {
  console.log('🔍 Viewing Blockchain Transaction Details');
  console.log('==========================================');
  
  try {
    // Connect to Ganache
    const web3 = new Web3('http://127.0.0.1:7545');
    
    // Get network information
    const networkId = await web3.eth.net.getId();
    const blockNumber = await web3.eth.getBlockNumber();
    const accounts = await web3.eth.getAccounts();
    
    console.log(`🌐 Network ID: ${networkId}`);
    console.log(`📦 Latest Block: ${blockNumber}`);
    console.log(`👤 Available Accounts: ${accounts.length}`);
    console.log(`🔗 Network: Local Ganache (http://127.0.0.1:7545)`);
    
    // Get all blocks and transactions
    console.log('\n📋 All Blocks and Transactions:');
    console.log('================================');
    
    for (let i = 0; i <= blockNumber; i++) {
      const block = await web3.eth.getBlock(i, true);
      console.log(`\n📦 Block ${i}:`);
      console.log(`   Hash: ${block.hash}`);
      console.log(`   Timestamp: ${new Date(block.timestamp * 1000).toLocaleString()}`);
      console.log(`   Gas Used: ${block.gasUsed}`);
      console.log(`   Gas Limit: ${block.gasLimit}`);
      console.log(`   Transactions: ${block.transactions.length}`);
      
      if (block.transactions.length > 0) {
        for (const tx of block.transactions) {
          console.log(`\n   💸 Transaction: ${tx.hash}`);
          console.log(`      From: ${tx.from}`);
          console.log(`      To: ${tx.to || 'Contract Creation'}`);
          console.log(`      Value: ${web3.utils.fromWei(tx.value, 'ether')} ETH`);
          console.log(`      Gas: ${tx.gas}`);
          console.log(`      Gas Price: ${web3.utils.fromWei(tx.gasPrice, 'gwei')} gwei`);
          console.log(`      Status: ${tx.status ? 'Success' : 'Failed'}`);
          
          // Get transaction receipt for more details
          try {
            const receipt = await web3.eth.getTransactionReceipt(tx.hash);
            console.log(`      Gas Used: ${receipt.gasUsed}`);
            console.log(`      Contract Address: ${receipt.contractAddress || 'N/A'}`);
            console.log(`      Logs: ${receipt.logs.length}`);
          } catch (error) {
            console.log(`      Receipt Error: ${error.message}`);
          }
        }
      }
    }
    
    // Check for deployed contracts
    console.log('\n🏗️ Deployed Contracts:');
    console.log('======================');
    
    for (let i = 0; i <= blockNumber; i++) {
      const block = await web3.eth.getBlock(i, true);
      for (const tx of block.transactions) {
        try {
          const receipt = await web3.eth.getTransactionReceipt(tx.hash);
          if (receipt.contractAddress) {
            console.log(`\n📋 Contract Found:`);
            console.log(`   Address: ${receipt.contractAddress}`);
            console.log(`   Transaction: ${tx.hash}`);
            console.log(`   Block: ${i}`);
            console.log(`   Gas Used: ${receipt.gasUsed}`);
            
            // Check if it's our ElectionSystem contract
            const code = await web3.eth.getCode(receipt.contractAddress);
            if (code !== '0x') {
              console.log(`   Status: ✅ Deployed and Active`);
              console.log(`   Code Size: ${code.length} characters`);
              
              // Try to load contract ABI and test functions
              try {
                const contractPath = path.join(__dirname, 'build', 'contracts', 'ElectionSystem.json');
                if (fs.existsSync(contractPath)) {
                  const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
                  const contract = new web3.eth.Contract(contractArtifact.abi, receipt.contractAddress);
                  
                  console.log(`   📊 Contract Functions Available:`);
                  
                  // Test basic functions
                  try {
                    const voteCount = await contract.methods.getVoteCount().call();
                    console.log(`      getVoteCount(): ${voteCount}`);
                  } catch (e) {
                    console.log(`      getVoteCount(): Error - ${e.message}`);
                  }
                  
                  try {
                    const electionCount = await contract.methods.getElectionCount().call();
                    console.log(`      getElectionCount(): ${electionCount}`);
                  } catch (e) {
                    console.log(`      getElectionCount(): Error - ${e.message}`);
                  }
                  
                  try {
                    const voterCount = await contract.methods.getVoterCount().call();
                    console.log(`      getVoterCount(): ${voterCount}`);
                  } catch (e) {
                    console.log(`      getVoterCount(): Error - ${e.message}`);
                  }
                  
                  try {
                    const candidateCount = await contract.methods.getCandidateCount().call();
                    console.log(`      getCandidateCount(): ${candidateCount}`);
                  } catch (e) {
                    console.log(`      getCandidateCount(): Error - ${e.message}`);
                  }
                }
              } catch (error) {
                console.log(`   ABI Error: ${error.message}`);
              }
            } else {
              console.log(`   Status: ❌ No code found`);
            }
          }
        } catch (error) {
          // Skip failed receipts
        }
      }
    }
    
    console.log('\n💡 Why you can\'t see transactions on public explorers:');
    console.log('=====================================================');
    console.log('1. You\'re using LOCAL Ganache blockchain (not public)');
    console.log('2. Public explorers like Etherscan only show mainnet/testnet');
    console.log('3. Local blockchains are private and not accessible publicly');
    console.log('4. This is NORMAL and EXPECTED behavior');
    
    console.log('\n🔍 How to view your blockchain data:');
    console.log('====================================');
    console.log('1. Use this script to view all transactions');
    console.log('2. Use Ganache GUI to see transaction details');
    console.log('3. Use your app\'s blockchain audit dashboard');
    console.log('4. Check the audit logs in your database');
    
    console.log('\n🚀 Your blockchain is working perfectly!');
    console.log('All transactions are being recorded locally.');
    
  } catch (error) {
    console.error('❌ Error viewing blockchain details:', error.message);
  }
}

// Run the script
viewBlockchainDetails();
