import React, { useEffect, useState } from 'react';

function ListVoters() {
  const [voters, setVoters] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/voters')
      .then(res => res.json())
      .then(data => setVoters(data));
  }, []);

  return (
    <div>
      <h2>Voters</h2>
      <ul>
        {voters.map(voter => (
          <li key={voter.id}>{voter.firstName} {voter.lastName}</li>
        ))}
      </ul>
    </div>
  );
}

export default ListVoters;