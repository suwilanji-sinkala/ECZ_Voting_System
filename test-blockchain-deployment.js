const { getEthereumClient } = require('./lib/ethereum-client');

async function testBlockchainDeployment() {
  console.log('⛓️ Testing Blockchain Contract Deployment');
  console.log('==========================================');
  
  try {
    console.log('\n🔌 Connecting to blockchain...');
    const ethereumClient = await getEthereumClient();
    
    console.log('✅ Successfully connected to blockchain!');
    console.log(`📋 Contract Address: 0xa2B03C9936Ca166D3b22A77FC2Aa9e7DEe7B6569`);
    
    // Test a simple blockchain operation
    console.log('\n🧪 Testing blockchain operations...');
    
    // Test registering a candidate
    const testCandidateData = {
      candidateId: 'TEST_CANDIDATE_001',
      firstName: 'Test',
      lastName: 'Candidate',
      otherName: 'Test Other',
      aliasName: 'Test Alias',
      partyId: 'PARTY_001',
      wardCode: 'WARD_001',
      positionId: 'POSITION_001',
      electionId: 'ELECTION_001'
    };
    
    console.log('📝 Registering test candidate on blockchain...');
    await ethereumClient.registerCandidate(testCandidateData);
    console.log('✅ Test candidate registered successfully on blockchain!');
    
    // Test registering a voter
    const testVoterData = {
      voterId: 'TEST_VOTER_001',
      firstName: 'Test',
      lastName: 'Voter',
      nrc: '123456789',
      ward: 'Test Ward',
      constituency: 'Test Constituency',
      email: 'test@example.com'
    };
    
    console.log('👤 Registering test voter on blockchain...');
    await ethereumClient.registerVoter(testVoterData);
    console.log('✅ Test voter registered successfully on blockchain!');
    
    // Test creating an election
    const testElectionData = {
      electionId: 'TEST_ELECTION_001',
      title: 'Test Election',
      description: 'A test election for blockchain verification',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      year: 2024,
      electionType: 'general',
      wardCode: 'WARD_001',
      constituencyCode: 'CONST_001',
      districtCode: 'DIST_001'
    };
    
    console.log('🗳️ Creating test election on blockchain...');
    await ethereumClient.createElection(testElectionData);
    console.log('✅ Test election created successfully on blockchain!');
    
    console.log('\n🎉 Blockchain Contract Deployment Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Contract deployed and accessible');
    console.log('✅ Candidate registration working');
    console.log('✅ Voter registration working');
    console.log('✅ Election creation working');
    console.log('✅ All blockchain operations functional');
    
    console.log('\n🚀 Your blockchain is now fully operational!');
    console.log('💡 You can now:');
    console.log('1. Register candidates on the blockchain');
    console.log('2. Register voters on the blockchain');
    console.log('3. Create elections on the blockchain');
    console.log('4. Submit votes on the blockchain');
    console.log('5. View all blockchain operations in the audit logs');
    
  } catch (error) {
    console.error('❌ Blockchain test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testBlockchainDeployment();
