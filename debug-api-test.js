const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Debug script for API integration issues
async function debugApiTest() {
  console.log('🔍 Debugging API Integration Issues');
  console.log('===================================');

  try {
    // Connect to Ganache
    const web3 = new Web3('http://127.0.0.1:7545');
    const accounts = await web3.eth.getAccounts();
    
    // Load the deployed contract
    const contractPath = path.join(__dirname, 'build', 'contracts', 'ElectionSystem.json');
    const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    
    const deployedAddress = '0x08eBb403149e61ae33bce43929Ff440Ff81256c0';
    const contract = new web3.eth.Contract(contractArtifact.abi, deployedAddress);
    
    console.log(`✅ Connected to contract at: ${deployedAddress}`);
    console.log(`👤 Using account: ${accounts[0]}`);

    // Test with a unique election ID
    const electionId = `ELECTION_DEBUG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const currentTime = Math.floor(Date.now() / 1000);
    const startDate = currentTime;
    const endDate = currentTime + 86400;
    
    console.log(`\n📋 Debug Info:`);
    console.log(`Election ID: ${electionId}`);
    console.log(`Current time: ${currentTime}`);
    console.log(`Start date: ${startDate}`);
    console.log(`End date: ${endDate}`);
    console.log(`Start date > Current time: ${startDate > currentTime}`);
    console.log(`Start date >= Current time: ${startDate >= currentTime}`);

    // Check if election already exists
    try {
      const existingElection = await contract.methods.getElection(electionId).call();
      console.log(`❌ Election already exists: ${existingElection.title}`);
    } catch (error) {
      console.log(`✅ Election does not exist (expected)`);
    }

    console.log('\n📋 Attempting to create election...');
    
    await contract.methods.createElection(
      electionId,
      'Debug Test Election',
      'Test election for debugging',
      startDate,
      endDate,
      'draft',
      2024,
      'general',
      '',
      '',
      ''
    ).send({ from: accounts[0], gas: 3000000 });
    
    console.log('✅ Election created successfully!');

    // Verify the election was created
    const election = await contract.methods.getElection(electionId).call();
    console.log(`📋 Election Title: ${election.title}`);
    console.log(`📅 Election Status: ${election.status}`);

    console.log('\n🎉 Debug test completed successfully!');

  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
    
    if (error.receipt) {
      console.log('\n📋 Transaction Details:');
      console.log(`Transaction Hash: ${error.receipt.transactionHash}`);
      console.log(`Gas Used: ${error.receipt.gasUsed}`);
      console.log(`Status: ${error.receipt.status}`);
    }
  }
}

// Run the debug test
debugApiTest(); 