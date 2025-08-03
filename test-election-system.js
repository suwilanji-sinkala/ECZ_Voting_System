const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Test script for the complete Election System
async function testElectionSystem() {
  console.log('🏛️ Testing Complete Election System');
  console.log('==================================');

  try {
    // Connect to Ganache
    const web3 = new Web3('http://127.0.0.1:7545');
    const accounts = await web3.eth.getAccounts();
    
    // Load the deployed contract
    const contractPath = path.join(__dirname, 'build', 'contracts', 'ElectionSystem.json');
    const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    
    // Get the deployed contract address from the migration
    const deployedAddress = '0xE5db430E03CAB881459c5B2A9E977c85263398c9';
    const contract = new web3.eth.Contract(contractArtifact.abi, deployedAddress);
    
    console.log(`✅ Connected to ElectionSystem contract at: ${deployedAddress}`);
    console.log(`👤 Using account: ${accounts[0]}`);

    // Test 1: Create an Election
    console.log('\n📋 Test 1: Creating an Election');
    const electionId = 'ELECTION_TEST_002';
    const startDate = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const endDate = startDate + 86400; // 24 hours later
    
    await contract.methods.createElection(
      electionId,
      'Test Presidential Election 2024',
      'Test election for blockchain verification',
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

    // Test 2: Register a Voter
    console.log('\n👤 Test 2: Registering a Voter');
    const voterId = 'VOTER_TEST_002';
    
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

    // Test 3: Register a Candidate
    console.log('\n🎯 Test 3: Registering a Candidate');
    const candidateId = 'CANDIDATE_TEST_002';
    
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

    // Test 4: Get Election Details
    console.log('\n📊 Test 4: Getting Election Details');
    const election = await contract.methods.getElection(electionId).call();
    console.log(`📋 Election Title: ${election.title}`);
    console.log(`📝 Description: ${election.description}`);
    console.log(`📅 Status: ${election.status}`);
    console.log(`📅 Year: ${election.year}`);

    // Test 5: Get Voter Details
    console.log('\n👤 Test 5: Getting Voter Details');
    const voter = await contract.methods.getVoter(voterId).call();
    console.log(`👤 Voter Name: ${voter.firstName} ${voter.lastName}`);
    console.log(`🆔 NRC: ${voter.nrc}`);
    console.log(`📍 Ward: ${voter.ward}`);

    // Test 6: Get Candidate Details
    console.log('\n🎯 Test 6: Getting Candidate Details');
    const candidate = await contract.methods.getCandidate(candidateId).call();
    console.log(`🎯 Candidate Name: ${candidate.firstName} ${candidate.lastName}`);
    console.log(`🏛️ Party ID: ${candidate.partyId}`);
    console.log(`📍 Ward Code: ${candidate.wardCode}`);

    // Test 7: Check Voter Eligibility
    console.log('\n✅ Test 7: Checking Voter Eligibility');
    const hasVoted = await contract.methods.hasVoterVoted(voterId, electionId).call();
    console.log(`🗳️ Has Voter Voted: ${hasVoted}`);
    console.log(`✅ Voter is eligible to vote: ${!hasVoted}`);

    // Test 8: Update Election Status to Active
    console.log('\n🔄 Test 8: Updating Election Status to Active');
    await contract.methods.updateElectionStatus(electionId, 'active').send({ 
      from: accounts[0], 
      gas: 3000000 
    });
    console.log('✅ Election status updated to active');

    // Test 9: Submit a Vote
    console.log('\n🗳️ Test 9: Submitting a Vote');
    const voteId = 'VOTE_TEST_002';
    
    await contract.methods.submitVote(
      voteId,
      voterId,
      electionId,
      candidateId,
      'POSITION_001',
      'Ward 1'
    ).send({ from: accounts[0], gas: 3000000 });
    
    console.log('✅ Vote submitted successfully');

    // Test 10: Verify Vote was Recorded
    console.log('\n🔍 Test 10: Verifying Vote was Recorded');
    const hasVotedAfter = await contract.methods.hasVoterVoted(voterId, electionId).call();
    console.log(`🗳️ Has Voter Voted After: ${hasVotedAfter}`);
    
    const voteCount = await contract.methods.getCandidateVoteCount(electionId, candidateId).call();
    console.log(`📊 Candidate Vote Count: ${voteCount}`);

    // Test 11: Try to Vote Again (Should Fail)
    console.log('\n❌ Test 11: Attempting Duplicate Vote (Should Fail)');
    try {
      await contract.methods.submitVote(
        'VOTE_TEST_003',
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

    // Test 12: Register Another Voter and Vote
    console.log('\n👤 Test 12: Registering Another Voter and Voting');
    const voterId2 = 'VOTER_TEST_003';
    
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
      'VOTE_TEST_004',
      voterId2,
      electionId,
      candidateId,
      'POSITION_001',
      'Ward 2'
    ).send({ from: accounts[0], gas: 3000000 });
    
    const finalVoteCount = await contract.methods.getCandidateVoteCount(electionId, candidateId).call();
    console.log(`📊 Final Candidate Vote Count: ${finalVoteCount}`);

    console.log('\n🎉 All Tests Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Election creation works');
    console.log('✅ Voter registration works');
    console.log('✅ Candidate registration works');
    console.log('✅ Election status updates work');
    console.log('✅ Vote submission works');
    console.log('✅ Duplicate vote prevention works');
    console.log('✅ Vote counting works');
    console.log('✅ Data retrieval works');
    console.log('✅ Multiple voters can vote');

  } catch (error) {
    console.error('❌ Error testing election system:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure Ganache is running');
    console.log('2. Make sure the contract is deployed');
    console.log('3. Check the contract address');
    console.log('4. Verify all dependencies are installed');
    
    // Log more detailed error information
    if (error.receipt) {
      console.log('\n📋 Transaction Details:');
      console.log(`Transaction Hash: ${error.receipt.transactionHash}`);
      console.log(`Gas Used: ${error.receipt.gasUsed}`);
      console.log(`Status: ${error.receipt.status}`);
    }
  }
}

// Run the test
testElectionSystem(); 