import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './views/Home';
import Dashboard from './views/Dashboard';
import RegisterVoters from './views/RegisterVoters';
import RegisterCandidate from './views/RegisterCandidate';
import Login from './views/Login';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/voters" element={<RegisterVoters />} />
        <Route path="/candidates" element={<RegisterCandidate />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;