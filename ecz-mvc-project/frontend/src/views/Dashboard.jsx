import React, { useEffect, useState } from 'react';
import DashboardStats from '../components/dashboard/DashboardStats';

function Dashboard() {
  const [stats, setStats] = useState([
    { label: 'Voters', value: 0 },
    { label: 'Candidates', value: 0 },
    { label: 'Elections', value: 0 }
  ]);

  useEffect(() => {
    // Example: fetch stats from backend
    Promise.all([
      fetch('http://localhost:3001/api/voters').then(res => res.json()),
      fetch('http://localhost:3001/api/candidates').then(res => res.json()),
      fetch('http://localhost:3001/api/elections').then(res => res.json())
    ]).then(([voters, candidates, elections]) => {
      setStats([
        { label: 'Voters', value: voters.length },
        { label: 'Candidates', value: candidates.length },
        { label: 'Elections', value: elections.length }
      ]);
    });
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <DashboardStats stats={stats} />
    </div>
  );
}

export default Dashboard;