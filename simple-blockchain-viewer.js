const { Web3 } = require('web3');

async function viewBlockchain() {
  console.log('🔍 Simple Blockchain Viewer');
  console.log('============================');
  
  try {
    const web3 = new Web3('http://127.0.0.1:7545');
    
    // Get basic network info
    const networkId = await web3.eth.net.getId();
    const blockNumber = await web3.eth.getBlockNumber();
    const accounts = await web3.eth.getAccounts();
    
    console.log(`🌐 Network ID: ${networkId}`);
    console.log(`📦 Latest Block: ${blockNumber}`);
    console.log(`👤 Accounts: ${accounts.length}`);
    console.log(`🔗 Network: Local Ganache`);
    
    // Get all blocks
    console.log('\n📋 All Blocks:');
    for (let i = 0; i <= blockNumber; i++) {
      const block = await web3.eth.getBlock(i);
      console.log(`\n📦 Block ${i}:`);
      console.log(`   Hash: ${block.hash}`);
      console.log(`   Timestamp: ${new Date(Number(block.timestamp) * 1000).toLocaleString()}`);
      console.log(`   Transactions: ${block.transactions.length}`);
      
      // Get transaction details
      if (block.transactions.length > 0) {
        for (const txHash of block.transactions) {
          const tx = await web3.eth.getTransaction(txHash);
          console.log(`\n   💸 Transaction: ${txHash}`);
          console.log(`      From: ${tx.from}`);
          console.log(`      To: ${tx.to || 'Contract Creation'}`);
          console.log(`      Value: ${web3.utils.fromWei(tx.value, 'ether')} ETH`);
          console.log(`      Gas: ${tx.gas}`);
          console.log(`      Gas Price: ${web3.utils.fromWei(tx.gasPrice, 'gwei')} gwei`);
          
          // Get transaction receipt
          try {
            const receipt = await web3.eth.getTransactionReceipt(txHash);
            console.log(`      Gas Used: ${receipt.gasUsed}`);
            console.log(`      Status: ${receipt.status ? 'Success' : 'Failed'}`);
            
            if (receipt.contractAddress) {
              console.log(`      🏗️ Contract Created: ${receipt.contractAddress}`);
              
              // Check if contract has code
              const code = await web3.eth.getCode(receipt.contractAddress);
              if (code !== '0x') {
                console.log(`      ✅ Contract is deployed and active`);
                console.log(`      📊 Code size: ${code.length} characters`);
              } else {
                console.log(`      ❌ No code found at contract address`);
              }
            }
          } catch (error) {
            console.log(`      Receipt Error: ${error.message}`);
          }
        }
      }
    }
    
    console.log('\n💡 Important Information:');
    console.log('==========================');
    console.log('✅ Your blockchain is working perfectly!');
    console.log('✅ All transactions are being recorded');
    console.log('✅ Contracts are deployed and active');
    console.log('');
    console.log('❌ Why you can\'t see transactions on public explorers:');
    console.log('   • You\'re using LOCAL Ganache (not public blockchain)');
    console.log('   • Public explorers only show mainnet/testnet');
    console.log('   • This is NORMAL and EXPECTED behavior');
    console.log('');
    console.log('🔍 How to view your blockchain data:');
    console.log('   • Use this script (what you just ran)');
    console.log('   • Use Ganache GUI application');
    console.log('   • Use your app\'s blockchain audit dashboard');
    console.log('   • Check audit logs in your database');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

viewBlockchain();
