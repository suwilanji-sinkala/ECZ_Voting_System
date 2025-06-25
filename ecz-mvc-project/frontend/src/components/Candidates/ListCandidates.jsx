import React, { useEffect, useState } from 'react';

function ListCandidates() {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/candidates')
      .then(res => res.json())
      .then(data => setCandidates(data));
  }, []);

  return (
    <div>
      <h2>Candidates</h2>
      <ul>
        {candidates.map(candidate => (
          <li key={candidate.candidateId}>
            {candidate.candidateName} (Party: {candidate.partyId}, Ward: {candidate.wardCode}, Position: {candidate.positionId})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListCandidates;