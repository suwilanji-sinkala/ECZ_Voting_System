const fetch = require('node-fetch');

// Debug script for candidate deletion issues
async function debugCandidateDelete() {
  console.log('🔍 Debugging Candidate Deletion Issues');
  console.log('=====================================');
  
  const baseUrl = 'http://localhost:3000/api';
  
  try {
    // Get all candidates
    console.log('\n📋 Getting all candidates...');
    const getResponse = await fetch(`${baseUrl}/candidate`);
    
    if (!getResponse.ok) {
      console.log(`❌ Failed to fetch candidates: ${getResponse.status} ${getResponse.statusText}`);
      return;
    }
    
    const candidates = await getResponse.json();
    console.log(`✅ Found ${candidates.length} candidates`);
    
    if (candidates.length === 0) {
      console.log('ℹ️ No candidates found to test with');
      return;
    }
    
    // Test each candidate for deletion
    for (let i = 0; i < Math.min(3, candidates.length); i++) {
      const candidate = candidates[i];
      console.log(`\n🧪 Testing candidate ${i + 1}: ${candidate.FirstName} ${candidate.LastName} (ID: ${candidate.Candidate_ID})`);
      
      // Get detailed candidate info
      const detailResponse = await fetch(`${baseUrl}/candidate?Candidate_ID=${candidate.Candidate_ID}`);
      
      if (detailResponse.ok) {
        const candidateDetail = await detailResponse.json();
        console.log(`   Vote count: ${candidateDetail.voteCount || 0}`);
        console.log(`   Position: ${candidateDetail.position?.Position_Name || 'N/A'}`);
        console.log(`   Ward: ${candidateDetail.ward?.Ward_Name || 'N/A'}`);
        console.log(`   Party: ${candidateDetail.party?.Party_Name || 'N/A'}`);
        
        // Try to delete
        console.log(`   Attempting to delete...`);
        const deleteResponse = await fetch(`${baseUrl}/candidate`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Candidate_ID: candidate.Candidate_ID })
        });
        
        if (deleteResponse.ok) {
          const deleteResult = await deleteResponse.json();
          console.log(`   ✅ Successfully deleted: ${deleteResult.message}`);
        } else {
          const errorData = await deleteResponse.json();
          console.log(`   ❌ Delete failed: ${deleteResponse.status} - ${errorData.message || deleteResponse.statusText}`);
          
          // Check specific error types
          if (errorData.message && errorData.message.includes('votes')) {
            console.log(`   ℹ️ Reason: Candidate has votes and cannot be deleted`);
          } else if (errorData.message && errorData.message.includes('constraint')) {
            console.log(`   ℹ️ Reason: Foreign key constraint violation`);
          } else if (errorData.message && errorData.message.includes('not found')) {
            console.log(`   ℹ️ Reason: Candidate not found`);
          } else {
            console.log(`   ℹ️ Reason: ${errorData.message || 'Unknown error'}`);
          }
        }
      } else {
        console.log(`   ❌ Failed to get candidate details: ${detailResponse.status}`);
      }
    }
    
    // Test creating and immediately deleting a candidate
    console.log('\n🧪 Testing create and delete cycle...');
    
    // Get required data for creation
    const electionsResponse = await fetch(`${baseUrl}/elections`);
    const positionsResponse = await fetch(`${baseUrl}/position`);
    const wardsResponse = await fetch(`${baseUrl}/ward`);
    const partiesResponse = await fetch(`${baseUrl}/party`);
    
    if (electionsResponse.ok && positionsResponse.ok && wardsResponse.ok && partiesResponse.ok) {
      const elections = await electionsResponse.json();
      const positions = await positionsResponse.json();
      const wards = await wardsResponse.json();
      const parties = await partiesResponse.json();
      
      const draftElection = elections.find(e => e.Status === 'draft');
      
      if (draftElection && positions.length > 0 && wards.length > 0 && parties.length > 0) {
        const testCandidateData = {
          FirstName: 'Debug Test',
          LastName: 'Candidate',
          Othername: 'Debug Other',
          AliasName: 'Debug Alias',
          Party_ID: parties[0].Party_ID,
          Ward_Code: wards[0].Ward_Code,
          Position_ID: positions[0].Position_ID,
          Election_ID: draftElection.Election_ID
        };
        
        console.log('   Creating test candidate...');
        const createResponse = await fetch(`${baseUrl}/candidate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testCandidateData)
        });
        
        if (createResponse.ok) {
          const newCandidate = await createResponse.json();
          console.log(`   ✅ Created test candidate: ${newCandidate.FirstName} ${newCandidate.LastName} (ID: ${newCandidate.Candidate_ID})`);
          
          // Wait a moment
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Try to delete immediately
          console.log('   Attempting to delete test candidate...');
          const deleteResponse = await fetch(`${baseUrl}/candidate`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Candidate_ID: newCandidate.Candidate_ID })
          });
          
          if (deleteResponse.ok) {
            const deleteResult = await deleteResponse.json();
            console.log(`   ✅ Successfully deleted test candidate: ${deleteResult.message}`);
          } else {
            const errorData = await deleteResponse.json();
            console.log(`   ❌ Failed to delete test candidate: ${deleteResponse.status} - ${errorData.message || deleteResponse.statusText}`);
          }
        } else {
          const errorData = await createResponse.json();
          console.log(`   ❌ Failed to create test candidate: ${createResponse.status} - ${errorData.message || createResponse.statusText}`);
        }
      } else {
        console.log('   ℹ️ Skipping create/delete test - missing required data');
      }
    } else {
      console.log('   ℹ️ Skipping create/delete test - failed to fetch required data');
    }
    
    console.log('\n🎉 Debug completed!');
    console.log('\n💡 Common issues and solutions:');
    console.log('1. If candidate has votes: Cannot delete candidates with existing votes');
    console.log('2. If foreign key constraint: Check for related records in other tables');
    console.log('3. If not found: Candidate may have been already deleted');
    console.log('4. If server error: Check database connection and constraints');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugCandidateDelete();
