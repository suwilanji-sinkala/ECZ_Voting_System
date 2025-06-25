import React from 'react';
import ListVoters from '../components/voters/ListVoters';
import AddVoter from '../components/voters/AddVoter';

function RegisterVoters() {
  return (
    <div>
      <h1>Register Voters</h1>
      <AddVoter />
      <ListVoters />
    </div>
  );
}

export default RegisterVoters;