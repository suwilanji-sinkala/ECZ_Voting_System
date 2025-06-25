import React, { useState } from 'react';

function AddVoter() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    nrc: '',
    ward: '',
    constituency: '',
    email: '',
    passwordHash: ''
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    fetch('http://localhost:3001/api/voters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(data => alert('Voter added!'));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="firstName" placeholder="First Name" onChange={handleChange} required />
      <input name="lastName" placeholder="Last Name" onChange={handleChange} required />
      <input name="nrc" placeholder="NRC" onChange={handleChange} required />
      <input name="ward" placeholder="Ward" onChange={handleChange} required />
      <input name="constituency" placeholder="Constituency" onChange={handleChange} required />
      <input name="email" placeholder="Email" onChange={handleChange} required />
      <input name="passwordHash" placeholder="Password" type="password" onChange={handleChange} required />
      <button type="submit">Add Voter</button>
    </form>
  );
}

export default AddVoter;