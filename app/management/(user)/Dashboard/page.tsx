"use client";
import { useState } from "react";
import styles from "./page.module.css";
import Navbar from "../../components/Navbar";
import { PieChart, BarChart, LineChart, Bar, Line, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import React from "react";

export default function Dashboard() {
  // Sample data for the dashboard statistics and charts
  const votingStatistics = [
    { id: 1, title: "Total Registered Voters", count: 8543210, icon: "📊" },
    { id: 2, title: "Votes Cast", count: 6234567, icon: "✓" },
    { id: 3, title: "Voter Turnout", count: "73%", icon: "📈" },
    { id: 4, title: "Polling Stations", count: 7896, icon: "🏢" },
  ];

  const partyVotes = [
    { name: "UPND", votes: 2560345 },
    { name: "PF", votes: 2145678 },
    { name: "MMD", votes: 890123 },
    { name: "FDD", votes: 425671 },
    { name: "Other", votes: 212750 },
  ];

  const votingTrends = [
    { time: "08:00", voters: 345678 },
    { time: "10:00", voters: 789123 },
    { time: "12:00", voters: 1234567 },
    { time: "14:00", voters: 2356789 },
    { time: "16:00", voters: 3671234 },
    { time: "18:00", voters: 5234567 },
    { time: "20:00", voters: 6234567 },
  ];

  const provincialData = [
    { province: "Lusaka", turnout: 78 },
    { province: "Copperbelt", turnout: 71 },
    { province: "Eastern", turnout: 69 },
    { province: "Central", turnout: 75 },
    { province: "Northern", turnout: 65 },
    { province: "Western", turnout: 70 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className={styles.page}>
      <Navbar title="ECZ - Online Voting System" />
      
      <div className={styles.dashboardContent}>
        <h2 className={styles.dashboardTitle}>Election Dashboard</h2>
        
        <div className={styles.statisticsGrid}>
          {votingStatistics.map(stat => (
            <div key={stat.id} className={styles.statCard}>
              <div className={styles.statIcon}>{stat.icon}</div>
              <div className={styles.statInfo}>
                <h3 className={styles.statTitle}>{stat.title}</h3>
                <span className={styles.statCount}>{typeof stat.count === 'number' 
                  ? stat.count.toLocaleString() 
                  : stat.count}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.chartsContainer}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Votes by Party</h3>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={partyVotes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="votes"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {partyVotes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Voting Trend (Hourly)</h3>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={votingTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                  <Line type="monotone" dataKey="voters" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Provincial Voter Turnout (%)</h3>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={provincialData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="province" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="turnout" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className={styles.recentActivities}>
          <h3 className={styles.sectionTitle}>Recent Activities</h3>
          <ul className={styles.activityList}>
            <li className={styles.activityItem}>
              <span className={styles.activityTime}>14:32</span>
              <span className={styles.activityDesc}>Results uploaded for Polling Station #2345 (Lusaka)</span>
            </li>
            <li className={styles.activityItem}>
              <span className={styles.activityTime}>14:28</span>
              <span className={styles.activityDesc}>New candidate profile updated: John Mwanza (UPND)</span>
            </li>
            <li className={styles.activityItem}>
              <span className={styles.activityTime}>14:15</span>
              <span className={styles.activityDesc}>Voter verification completed for Western Province</span>
            </li>
            <li className={styles.activityItem}>
              <span className={styles.activityTime}>13:45</span>
              <span className={styles.activityDesc}>System backup completed successfully</span>
            </li>
            <li className={styles.activityItem}>
              <span className={styles.activityTime}>13:22</span>
              <span className={styles.activityDesc}>Polling Station #1823 (Copperbelt) reported connectivity issue - resolved</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}