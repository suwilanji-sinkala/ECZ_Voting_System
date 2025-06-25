import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import RegisterVoters from './views/RegisterVoters';
// import other views as you create them

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/voters" element={<RegisterVoters />} />
        {/* Add more routes for dashboard, candidates, login, etc. */}
        <Route path="/" element={<div>Welcome to ECZ Voting System</div>} />
      </Routes>
    </Router>
  );
}

export default App;