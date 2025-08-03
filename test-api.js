// Simple test script for blockchain API endpoints
const testBlockchainAPI = async () => {
  console.log('🧪 Testing Blockchain API Endpoints...\n');

  const baseUrl = 'http://localhost:3003/api';

  try {
    // Test 1: Create an election on blockchain
    console.log('1. Creating election on blockchain...');
    const electionData = {
      title: 'Test Presidential Election 2024',
      description: 'Test election for blockchain integration',
      startDate: '2024-08-12T08:00:00Z',
      endDate: '2024-08-12T18:00:00Z',
      year: 2024,
      electionType: 'general'
    };

    const createResponse = await fetch(`${baseUrl}/blockchain/election`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(electionData)
    });

    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('✅ Election created successfully:', result.message);
    } else {
      console.log('❌ Failed to create election:', await createResponse.text());
    }

    // Test 2: Submit a vote to blockchain
    console.log('\n2. Submitting vote to blockchain...');
    const voteData = {
      voterId: '001W', // Use the voter ID we created
      electionId: 'ELECTION_1', // Use the election ID from the blockchain
      votes: [
        {
          candidateId: 1,
          positionId: 1
        }
      ]
    };

    const voteResponse = await fetch(`${baseUrl}/blockchain/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(voteData)
    });

    if (voteResponse.ok) {
      const result = await voteResponse.json();
      console.log('✅ Vote submitted successfully:', result.message);
    } else {
      console.log('❌ Failed to submit vote:', await voteResponse.text());
    }

    console.log('\n🎉 API tests completed!');
    console.log('\n📊 Next Steps:');
    console.log('- Open http://localhost:3003 in your browser');
    console.log('- Test the voting interface');
    console.log('- Check blockchain-data/ folder for persisted data');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testBlockchainAPI(); 