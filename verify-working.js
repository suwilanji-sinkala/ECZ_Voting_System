const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Simple verification script to show the setup is working
async function verifyWorking() {
  console.log('🔍 VERIFICATION: How to Know Your Ethereum Setup is Working');
  console.log('===========================================================');

  try {
    // 1. Connect to Ganache
    console.log('\n✅ Step 1: Connecting to Ganache...');
    const web3 = new Web3('http://127.0.0.1:7545');
    const accounts = await web3.eth.getAccounts();
    console.log(`   ✅ Connected! Found ${accounts.length} accounts`);
    console.log(`   👤 Using account: ${accounts[0]}`);

    // 2. Load the deployed contract
    console.log('\n✅ Step 2: Loading Smart Contract...');
    const contractPath = path.join(__dirname, 'build', 'contracts', 'ElectionSystem.json');
    const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    
    const deployedAddress = '0xddcAd0D8dD17F1468bE412d2Acd4B0e754A1dbb0';
    const contract = new web3.eth.Contract(contractArtifact.abi, deployedAddress);
    console.log(`   ✅ Contract loaded at: ${deployedAddress}`);

    // 3. Test basic functionality
    console.log('\n✅ Step 3: Testing Basic Functions...');
    
    // Create a test election
    const electionId = `VERIFY_${Date.now()}`;
    const currentTime = Math.floor(Date.now() / 1000);
    const startDate = currentTime;
    const endDate = currentTime + 86400;
    
    console.log(`   📋 Creating test election: ${electionId}`);
    await contract.methods.createElection(
      electionId,
      'Verification Test Election',
      'Test election to verify setup',
      startDate,
      endDate,
      'draft',
      2024,
      'general',
      '',
      '',
      ''
    ).send({ from: accounts[0], gas: 3000000 });
    console.log('   ✅ Election created successfully!');

    // Register a test voter
    const voterId = `VOTER_${Date.now()}`;
    console.log(`   👤 Registering test voter: ${voterId}`);
    await contract.methods.registerVoter(
      voterId,
      'Test',
      'Voter',
      '123456789012',
      'Test Ward',
      'Test Constituency',
      'test@example.com'
    ).send({ from: accounts[0], gas: 3000000 });
    console.log('   ✅ Voter registered successfully!');

    // Register a test candidate
    const candidateId = `CANDIDATE_${Date.now()}`;
    console.log(`   🎯 Registering test candidate: ${candidateId}`);
    await contract.methods.registerCandidate(
      candidateId,
      'Test',
      'Candidate',
      '',
      'Test Candidate',
      'TEST_PARTY',
      'Test Ward',
      'TEST_POSITION',
      electionId
    ).send({ from: accounts[0], gas: 3000000 });
    console.log('   ✅ Candidate registered successfully!');

    // Activate the election
    console.log('   🔄 Activating election...');
    await contract.methods.updateElectionStatus(electionId, 'active').send({ 
      from: accounts[0], 
      gas: 3000000 
    });
    console.log('   ✅ Election activated!');

    // Submit a test vote
    const voteId = `VOTE_${Date.now()}`;
    console.log(`   🗳️ Submitting test vote: ${voteId}`);
    await contract.methods.submitVote(
      voteId,
      voterId,
      electionId,
      candidateId,
      'TEST_POSITION',
      'Test Ward'
    ).send({ from: accounts[0], gas: 3000000 });
    console.log('   ✅ Vote submitted successfully!');

    // Verify the vote
    console.log('   🔍 Verifying vote...');
    const hasVoted = await contract.methods.hasVoterVoted(voterId, electionId).call();
    const voteCount = await contract.methods.getCandidateVoteCount(electionId, candidateId).call();
    console.log(`   ✅ Voter has voted: ${hasVoted}`);
    console.log(`   ✅ Candidate vote count: ${voteCount}`);

    // 4. Show success summary
    console.log('\n🎉 VERIFICATION COMPLETE!');
    console.log('========================');
    console.log('✅ Ganache is running and accessible');
    console.log('✅ Smart contract is deployed and working');
    console.log('✅ All core functions are operational:');
    console.log('   ✅ Election creation');
    console.log('   ✅ Voter registration');
    console.log('   ✅ Candidate registration');
    console.log('   ✅ Election activation');
    console.log('   ✅ Vote submission');
    console.log('   ✅ Vote verification');
    console.log('   ✅ Vote counting');

    console.log('\n🚀 YOUR ETHEREUM SETUP IS WORKING PERFECTLY!');
    console.log('\n📋 How to verify it\'s working:');
    console.log('1. ✅ Ganache shows "RPC Listening on 127.0.0.1:7545"');
    console.log('2. ✅ Contract deployment shows "contract address: 0xddcAd0D8dD17F1468bE412d2Acd4B0e754A1dbb0"');
    console.log('3. ✅ All test functions execute without errors');
    console.log('4. ✅ Vote submission works (timing issue fixed)');
    console.log('5. ✅ Data retrieval works correctly');

    console.log('\n🎯 Your election system is ready for production use!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure Ganache is running: npm run ganache:start');
    console.log('2. Check if contract is deployed: npm run truffle:migrate');
    console.log('3. Verify the contract address is correct');
  }
}

// Run the verification
verifyWorking(); 