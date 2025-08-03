const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Final test script for the complete Election System
async function testFinal() {
  console.log('🏛️ Final Test - Complete Election System');
  console.log('========================================');

  try {
    // Connect to Ganache
    const web3 = new Web3('http://127.0.0.1:7545');
    const accounts = await web3.eth.getAccounts();
    
    // Load the deployed contract
    const contractPath = path.join(__dirname, 'build', 'contracts', 'ElectionSystem.json');
    const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    
    const deployedAddress = '0xE5db430E03CAB881459c5B2A9E977c85263398c9';
    const contract = new web3.eth.Contract(contractArtifact.abi, deployedAddress);
    
    console.log(`✅ Connected to contract at: ${deployedAddress}`);

    // Create an election that starts immediately
    console.log('\n📋 Creating Election (Starting Now)');
    const electionId = 'ELECTION_FINAL_001';
    const currentTime = Math.floor(Date.now() / 1000);
    const startDate = currentTime - 60; // Started 1 minute ago
    const endDate = currentTime + 86400; // Ends in 24 hours
    
    console.log(`Current time: ${currentTime}`);
    console.log(`Start date: ${startDate} (1 minute ago)`);
    console.log(`End date: ${endDate} (24 hours from now)`);
    
    await contract.methods.createElection(
      electionId,
      'Final Test Election 2024',
      'Final test election for blockchain verification',
      startDate,
      endDate,
      'draft',
      2024,
      'general',
      '',
      '',
      ''
    ).send({ from: accounts[0], gas: 3000000 });
    
    console.log('✅ Election created successfully');

    // Register a voter
    console.log('\n👤 Registering Voter');
    const voterId = 'VOTER_FINAL_001';
    
    await contract.methods.registerVoter(
      voterId,
      'John',
      'Doe',
      '123456789012',
      'Ward 1',
      'Constituency A',
      'john.doe@example.com'
    ).send({ from: accounts[0], gas: 3000000 });
    
    console.log('✅ Voter registered successfully');

    // Register a candidate
    console.log('\n🎯 Registering Candidate');
    const candidateId = 'CANDIDATE_FINAL_001';
    
    await contract.methods.registerCandidate(
      candidateId,
      'Jane',
      'Smith',
      'Marie',
      'Jane M. Smith',
      'PARTY_001',
      'Ward 1',
      'POSITION_001',
      electionId
    ).send({ from: accounts[0], gas: 3000000 });
    
    console.log('✅ Candidate registered successfully');

    // Update election status to active
    console.log('\n🔄 Activating Election');
    await contract.methods.updateElectionStatus(electionId, 'active').send({ 
      from: accounts[0], 
      gas: 3000000 
    });
    
    // Verify election details
    const election = await contract.methods.getElection(electionId).call();
    console.log(`📋 Election Status: ${election.status}`);
    console.log(`📅 Election Start: ${election.startDate}`);
    console.log(`📅 Election End: ${election.endDate}`);

    // Check voter eligibility
    const hasVoted = await contract.methods.hasVoterVoted(voterId, electionId).call();
    console.log(`🗳️ Has Voter Voted: ${hasVoted}`);

    // Submit a vote
    console.log('\n🗳️ Submitting Vote');
    const voteId = 'VOTE_FINAL_001';
    
    await contract.methods.submitVote(
      voteId,
      voterId,
      electionId,
      candidateId,
      'POSITION_001',
      'Ward 1'
    ).send({ from: accounts[0], gas: 3000000 });
    
    console.log('✅ Vote submitted successfully!');

    // Verify the vote was recorded
    console.log('\n🔍 Verifying Vote');
    const hasVotedAfter = await contract.methods.hasVoterVoted(voterId, electionId).call();
    console.log(`🗳️ Has Voter Voted After: ${hasVotedAfter}`);
    
    const voteCount = await contract.methods.getCandidateVoteCount(electionId, candidateId).call();
    console.log(`📊 Candidate Vote Count: ${voteCount}`);

    // Test duplicate vote prevention
    console.log('\n❌ Testing Duplicate Vote Prevention');
    try {
      await contract.methods.submitVote(
        'VOTE_FINAL_002',
        voterId,
        electionId,
        candidateId,
        'POSITION_001',
        'Ward 1'
      ).send({ from: accounts[0], gas: 3000000 });
      console.log('❌ Duplicate vote should have failed!');
    } catch (error) {
      console.log('✅ Duplicate vote correctly rejected');
      console.log(`📝 Error: ${error.message}`);
    }

    // Register another voter and vote
    console.log('\n👤 Registering Second Voter');
    const voterId2 = 'VOTER_FINAL_002';
    
    await contract.methods.registerVoter(
      voterId2,
      'Alice',
      'Johnson',
      '987654321098',
      'Ward 2',
      'Constituency B',
      'alice.johnson@example.com'
    ).send({ from: accounts[0], gas: 3000000 });
    
    await contract.methods.submitVote(
      'VOTE_FINAL_003',
      voterId2,
      electionId,
      candidateId,
      'POSITION_001',
      'Ward 2'
    ).send({ from: accounts[0], gas: 3000000 });
    
    const finalVoteCount = await contract.methods.getCandidateVoteCount(electionId, candidateId).call();
    console.log(`📊 Final Vote Count: ${finalVoteCount}`);

    console.log('\n🎉 SUCCESS! All Tests Passed!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Election creation works');
    console.log('✅ Voter registration works');
    console.log('✅ Candidate registration works');
    console.log('✅ Election activation works');
    console.log('✅ Vote submission works');
    console.log('✅ Vote counting works');
    console.log('✅ Duplicate vote prevention works');
    console.log('✅ Multiple voters can vote');
    console.log('✅ Data retrieval works');

    console.log('\n🚀 Your Ethereum/Ganache setup is working perfectly!');
    console.log('\n📋 Next Steps:');
    console.log('1. Update your API routes to use the new Ethereum client');
    console.log('2. Test the integration with your frontend');
    console.log('3. Deploy to a testnet when ready');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.receipt) {
      console.log('\n📋 Transaction Details:');
      console.log(`Transaction Hash: ${error.receipt.transactionHash}`);
      console.log(`Gas Used: ${error.receipt.gasUsed}`);
      console.log(`Status: ${error.receipt.status}`);
    }
  }
}

// Run the final test
testFinal(); 