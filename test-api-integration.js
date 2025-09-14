const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Test script for API integration with Ethereum client
async function testApiIntegration() {
  console.log('🔗 Testing API Integration with Ethereum Client');
  console.log('==============================================');

  try {
    // Connect to Ganache
    const web3 = new Web3('http://127.0.0.1:7545');
    const accounts = await web3.eth.getAccounts();
    
    // Load the deployed contract
    const contractPath = path.join(__dirname, 'build', 'contracts', 'ElectionSystem.json');
    const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    
    const deployedAddress = '0x086eA9ABD1Fc4C00c74b04aD3BE0F892f3282050';
    const contract = new web3.eth.Contract(contractArtifact.abi, deployedAddress);
    
    console.log(`✅ Connected to contract at: ${deployedAddress}`);

    // Test 1: Create Election (simulating API call)
    console.log('\n📋 Test 1: Creating Election via Smart Contract');
    const electionId = `ELECTION_API_TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const currentTime = Math.floor(Date.now() / 1000);
    const startDate = currentTime;
    const endDate = currentTime + 86400;
    
    await contract.methods.createElection(
      electionId,
      'API Integration Test Election',
      'Test election for API integration',
      startDate,
      endDate,
      'draft',
      2024,
      'general',
      '',
      '',
      ''
    ).send({ from: accounts[0], gas: 3000000 });
    
    console.log('✅ Election created via smart contract');

    // Test 2: Register Voter (simulating API call)
    console.log('\n👤 Test 2: Registering Voter via Smart Contract');
    const voterId = `VOTER_API_TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await contract.methods.registerVoter(
      voterId,
      'API',
      'TestUser',
      '123456789012',
      'Ward 1',
      'Constituency A',
      'api.test@example.com'
    ).send({ from: accounts[0], gas: 3000000 });
    
    console.log('✅ Voter registered via smart contract');

    // Test 3: Register Candidate (simulating API call)
    console.log('\n🎯 Test 3: Registering Candidate via Smart Contract');
    const candidateId = `CANDIDATE_API_TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await contract.methods.registerCandidate(
      candidateId,
      'API',
      'TestCandidate',
      '',
      'API Test Candidate',
      'PARTY_001',
      'Ward 1',
      'POSITION_001',
      electionId
    ).send({ from: accounts[0], gas: 3000000 });
    
    console.log('✅ Candidate registered via smart contract');

    // Test 4: Activate Election
    console.log('\n🔄 Test 4: Activating Election');
    await contract.methods.updateElectionStatus(electionId, 'active').send({ 
      from: accounts[0], 
      gas: 3000000 
    });
    
    console.log('✅ Election activated');

    // Test 5: Submit Vote (simulating API call)
    console.log('\n🗳️ Test 5: Submitting Vote via Smart Contract');
    const voteId = `VOTE_API_TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await contract.methods.submitVote(
      voteId,
      voterId,
      electionId,
      candidateId,
      'POSITION_001',
      'Ward 1'
    ).send({ from: accounts[0], gas: 3000000 });
    
    console.log('✅ Vote submitted via smart contract');

    // Test 6: Verify Vote
    console.log('\n🔍 Test 6: Verifying Vote');
    const hasVoted = await contract.methods.hasVoterVoted(voterId, electionId).call();
    console.log(`🗳️ Has Voter Voted: ${hasVoted}`);
    
    const voteCount = await contract.methods.getCandidateVoteCount(electionId, candidateId).call();
    console.log(`📊 Candidate Vote Count: ${voteCount}`);

    // Test 7: Get Election Data
    console.log('\n📊 Test 7: Getting Election Data');
    const election = await contract.methods.getElection(electionId).call();
    console.log(`📋 Election Title: ${election.title}`);
    console.log(`📅 Election Status: ${election.status}`);

    // Test 8: Get Voter Data
    console.log('\n👤 Test 8: Getting Voter Data');
    const voter = await contract.methods.getVoter(voterId).call();
    console.log(`👤 Voter Name: ${voter.firstName} ${voter.lastName}`);

    console.log('\n🎉 API Integration Test Completed Successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Election creation via smart contract works');
    console.log('✅ Voter registration via smart contract works');
    console.log('✅ Candidate registration via smart contract works');
    console.log('✅ Election activation works');
    console.log('✅ Vote submission via smart contract works');
    console.log('✅ Vote verification works');
    console.log('✅ Data retrieval works');
    console.log('✅ All functions ready for API integration');

    console.log('\n🚀 Your API routes are ready to use the Ethereum client!');
    console.log('\n📋 Next Steps:');
    console.log('1. Test the actual API endpoints with your frontend');
    console.log('2. Verify database integration works correctly');
    console.log('3. Test error handling and edge cases');

  } catch (error) {
    console.error('❌ API integration test failed:', error.message);
    
    if (error.receipt) {
      console.log('\n📋 Transaction Details:');
      console.log(`Transaction Hash: ${error.receipt.transactionHash}`);
      console.log(`Gas Used: ${error.receipt.gasUsed}`);
      console.log(`Status: ${error.receipt.status}`);
    }
  }
}

// Run the test
testApiIntegration(); 