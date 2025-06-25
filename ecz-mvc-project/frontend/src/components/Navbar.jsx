import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="header">
      <Link to="/">Home</Link> |{' '}
      <Link to="/dashboard">Dashboard</Link> |{' '}
      <Link to="/voters">Voters</Link> |{' '}
      <Link to="/candidates">Candidates</Link> |{' '}
      <Link to="/login">Login</Link>
    </nav>
  );
}

export default Navbar;