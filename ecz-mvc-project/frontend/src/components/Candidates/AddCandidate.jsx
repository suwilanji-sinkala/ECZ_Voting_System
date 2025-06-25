import React, { useState } from 'react';

function AddCandidate() {
  const [form, setForm] = useState({
    candidateName: '',
    partyId: '',
    wardCode: '',
    positionId: ''
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    fetch('http://localhost:3001/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(data => alert('Candidate added!'));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="candidateName" placeholder="Candidate Name" onChange={handleChange} required />
      <input name="partyId" placeholder="Party ID" onChange={handleChange} required />
      <input name="wardCode" placeholder="Ward Code" onChange={handleChange} required />
      <input name="positionId" placeholder="Position ID" onChange={handleChange} required />
      <button type="submit">Add Candidate</button>
    </form>
  );
}

export default AddCandidate;