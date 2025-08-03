const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Debug script for vote submission
async function debugVote() {
  console.log('🔍 Debugging Vote Submission');
  console.log('============================');

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

    // Create a new election with future time
    console.log('\n📋 Creating Election with Future Time');
    const electionId = 'ELECTION_DEBUG_002';
    const currentTime = Math.floor(Date.now() / 1000);
    const startDate = currentTime + 3600; // Start in 1 hour
    const endDate = startDate + 86400; // End in 25 hours
    
    console.log(`Current time: ${currentTime}`);
    console.log(`Start date: ${startDate} (1 hour from now)`);
    console.log(`End date: ${endDate}`);
    
    await contract.methods.createElection(
      electionId,
      'Debug Election',
      'Debug election for testing',
      startDate,
      endDate,
      'draft',
      2024,
      'general',
      '',
      '',
      ''
    ).send({ from: accounts[0], gas: 3000000 });
    
    console.log('✅ Election created');

    // Register voter and candidate
    console.log('\n👤 Registering Voter and Candidate');
    const voterId = 'VOTER_DEBUG_002';
    const candidateId = 'CANDIDATE_DEBUG_002';
    
    await contract.methods.registerVoter(
      voterId,
      'Debug',
      'User',
      '123456789012',
      'Ward 1',
      'Constituency A',
      'debug@example.com'
    ).send({ from: accounts[0], gas: 3000000 });
    
    await contract.methods.registerCandidate(
      candidateId,
      'Debug',
      'Candidate',
      '',
      'Debug Candidate',
      'PARTY_001',
      'Ward 1',
      'POSITION_001',
      electionId
    ).send({ from: accounts[0], gas: 3000000 });
    
    console.log('✅ Voter and candidate registered');

    // Update election status
    console.log('\n🔄 Updating Election Status');
    await contract.methods.updateElectionStatus(electionId, 'active').send({ 
      from: accounts[0], 
      gas: 3000000 
    });
    
    // Check election details
    const election = await contract.methods.getElection(electionId).call();
    console.log(`Election status: ${election.status}`);
    console.log(`Election start: ${election.startDate}`);
    console.log(`Election end: ${election.endDate}`);
    console.log(`Current time: ${currentTime}`);

    // Check if election is active
    console.log('\n🔍 Checking Election Status');
    const hasVoted = await contract.methods.hasVoterVoted(voterId, electionId).call();
    console.log(`Has voter voted: ${hasVoted}`);

    // Try to vote
    console.log('\n🗳️ Attempting to Vote');
    try {
      await contract.methods.submitVote(
        'VOTE_DEBUG_002',
        voterId,
        electionId,
        candidateId,
        'POSITION_001',
        'Ward 1'
      ).send({ from: accounts[0], gas: 3000000 });
      
      console.log('✅ Vote submitted successfully!');
      
      // Check vote count
      const voteCount = await contract.methods.getCandidateVoteCount(electionId, candidateId).call();
      console.log(`📊 Vote count: ${voteCount}`);
      
    } catch (error) {
      console.log('❌ Vote failed');
      console.log(`Error: ${error.message}`);
      
      // Try to get more details about the failure
      if (error.receipt) {
        console.log(`Transaction hash: ${error.receipt.transactionHash}`);
        console.log(`Gas used: ${error.receipt.gasUsed}`);
        console.log(`Status: ${error.receipt.status}`);
      }
    }

  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

// Run the debug
debugVote(); 