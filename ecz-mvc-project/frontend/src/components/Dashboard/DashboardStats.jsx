import React from 'react';

function DashboardStats({ stats }) {
  return (
    <div>
      <h2>Dashboard Statistics</h2>
      <ul>
        {stats.map(stat => (
          <li key={stat.label}>
            {stat.label}: {stat.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DashboardStats;