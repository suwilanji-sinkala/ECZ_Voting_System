import React from 'react';
import AddCandidate from '../components/candidates/AddCandidate';
import ListCandidates from '../components/candidates/ListCandidates';

function RegisterCandidate() {
  return (
    <div>
      <h1>Register Candidate</h1>
      <AddCandidate />
      <ListCandidates />
    </div>
  );
}

export default RegisterCandidate;