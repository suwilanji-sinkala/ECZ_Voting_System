"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Navbar from "../../components/Navbar";
import { PieChart, BarChart, LineChart, Bar, Line, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import React from "react";

interface DashboardStats {
  overallStats: {
    totalVoters: number;
    totalActiveElections: number;
    totalVotesCast: number;
    overallTurnout: number;
  };
  activeElections: Array<{
    election: {
      Election_ID: number;
      title: string;
      Description: string;
      StartDate: string;
      EndDate: string;
      Status: string;
      Year: number;
      Election_Type: string;
    };
    totalVotes: number;
    candidateStats: Array<{
      candidate: {
        Candidate_ID: number;
        FirstName: string;
        LastName: string;
        Parties?: {
          Party_Name: string;
          Party_Acronym: string;
        };
        Positions?: {
          Position_Name: string;
        };
      };
      voteCount: number;
    }>;
    wardStats: Array<{
      ward: {
        Ward_Code: string;
        Ward_Name: string;
      };
      voteCount: number;
    }>;
    voterTurnout: number;
  }>;
  recentActivity: {
    votesLast24Hours: number;
    lastUpdated: string;
  };
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();
      setDashboardData(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading && !dashboardData) {
    return (
      <div className={styles.page}>
        <Navbar title="ECZ - Online Voting System" />
        <div className={styles.dashboardContent}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className={styles.page}>
        <Navbar title="ECZ - Online Voting System" />
        <div className={styles.dashboardContent}>
          <div className={styles.errorContainer}>
            <p>Error loading dashboard: {error}</p>
            <button onClick={handleRefresh} className={styles.retryButton}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={styles.page}>
        <Navbar title="ECZ - Online Voting System" />
        <div className={styles.dashboardContent}>
          <div className={styles.errorContainer}>
            <p>No data available</p>
            <button onClick={handleRefresh} className={styles.retryButton}>
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prepare voting statistics
  const votingStatistics = [
    { id: 1, title: "Total Registered Voters", count: dashboardData.overallStats.totalVoters, icon: "📊", color: "#007bff" },
    { id: 2, title: "Votes Cast", count: dashboardData.overallStats.totalVotesCast, icon: "✓", color: "#28a745" },
    { id: 3, title: "Voter Turnout", count: `${dashboardData.overallStats.overallTurnout}%`, icon: "📈", color: "#ffc107" },
    { id: 4, title: "Active Elections", count: dashboardData.overallStats.totalActiveElections, icon: "🏢", color: "#6f42c1" },
  ];

  // Prepare party votes data from candidate statistics
  const partyVotes = dashboardData.activeElections.flatMap(election =>
    election.candidateStats.map(stat => ({
      name: stat.candidate.Parties?.Party_Acronym || stat.candidate.Parties?.Party_Name || 'Independent',
      votes: stat.voteCount,
      candidate: `${stat.candidate.FirstName} ${stat.candidate.LastName}`,
      position: stat.candidate.Positions?.Position_Name || 'Unknown'
    }))
  ).reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.name);
    if (existing) {
      existing.votes += curr.votes;
    } else {
      acc.push({ name: curr.name, votes: curr.votes });
    }
    return acc;
  }, [] as Array<{ name: string; votes: number }>);

  // Prepare ward voting data
  const wardVotingData = dashboardData.activeElections.flatMap(election =>
    election.wardStats.map(stat => ({
      ward: stat.ward.Ward_Name,
      votes: stat.voteCount,
      code: stat.ward.Ward_Code
    }))
  ).slice(0, 10); // Show top 10 wards

  // Prepare candidate performance data
  const candidatePerformance = dashboardData.activeElections.flatMap(election =>
    election.candidateStats.map(stat => ({
      name: `${stat.candidate.FirstName} ${stat.candidate.LastName}`,
      party: stat.candidate.Parties?.Party_Acronym || 'Independent',
      position: stat.candidate.Positions?.Position_Name || 'Unknown',
      votes: stat.voteCount
    }))
  ).sort((a, b) => b.votes - a.votes).slice(0, 10); // Top 10 candidates

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className={styles.page}>
      <Navbar title="ECZ - Online Voting System" />
      
      <div className={styles.dashboardContent}>
        <div className={styles.dashboardHeader}>
          <h2 className={styles.dashboardTitle}>Election Dashboard</h2>
          <div className={styles.dashboardActions}>
            <div className={styles.lastUpdated}>
              Last updated: {lastRefresh.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
            <button 
              onClick={handleRefresh} 
              className={styles.refreshButton}
              disabled={loading}
            >
              <span className={styles.buttonIcon}>🔄</span>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
        
        <div className={styles.statisticsGrid}>
          {votingStatistics.map(stat => (
            <div key={stat.id} className={styles.statCard}>
              <div className={styles.statIcon} style={{ color: stat.color }}>{stat.icon}</div>
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
            <h3 className={styles.chartTitle}>Top Performing Candidates</h3>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={candidatePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                  <Bar dataKey="votes" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Ward Voting Activity</h3>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={wardVotingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ward" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                  <Bar dataKey="votes" fill="#FFBB28" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className={styles.activeElections}>
          <h3 className={styles.sectionTitle}>Active Elections</h3>
          {dashboardData.activeElections.length === 0 ? (
            <div className={styles.noElections}>
              <p>No active elections at the moment.</p>
            </div>
          ) : (
            <div className={styles.electionsGrid}>
              {dashboardData.activeElections.map((electionData) => (
                <div key={electionData.election.Election_ID} className={styles.electionCard}>
                  <div className={styles.electionHeader}>
                    <h4 className={styles.electionTitle}>{electionData.election.title}</h4>
                    <span className={`${styles.electionStatus} ${styles.active}`}>
                      <i className="fas fa-play me-1"></i>
                      Active
                    </span>
                  </div>
                  <div className={styles.electionInfo}>
                    <p className={styles.electionDesc}>{electionData.election.Description}</p>
                    <div className={styles.electionStats}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Total Votes:</span>
                        <span className={styles.statValue}>{electionData.totalVotes.toLocaleString()}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Voter Turnout:</span>
                        <span className={styles.statValue}>{electionData.voterTurnout}%</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Candidates:</span>
                        <span className={styles.statValue}>{electionData.candidateStats.length}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Wards:</span>
                        <span className={styles.statValue}>{electionData.wardStats.length}</span>
                      </div>
                    </div>
                  </div>
                  {electionData.candidateStats.length > 0 && (
                    <div className={styles.candidateResults}>
                      <h5>Top Candidates</h5>
                      <div className={styles.candidateList}>
                        {electionData.candidateStats
                          .sort((a, b) => b.voteCount - a.voteCount)
                          .slice(0, 3)
                          .map((candidate, index) => (
                            <div key={candidate.candidate.Candidate_ID} className={styles.candidateItem}>
                              <div className={styles.candidateRank}>#{index + 1}</div>
                              <div className={styles.candidateInfo}>
                                <div className={styles.candidateName}>
                                  {candidate.candidate.FirstName} {candidate.candidate.LastName}
                                </div>
                                <div className={styles.candidateParty}>
                                  {candidate.candidate.Parties?.Party_Acronym || 'Independent'}
                                </div>
                              </div>
                              <div className={styles.candidateVotes}>
                                {candidate.voteCount.toLocaleString()} votes
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.recentActivities}>
          <h3 className={styles.sectionTitle}>Recent Activities</h3>
          <div className={styles.activityInfo}>
            <p>Votes in last 24 hours: <strong>{dashboardData.recentActivity.votesLast24Hours.toLocaleString()}</strong></p>
            <p>Last updated: <strong>{new Date(dashboardData.recentActivity.lastUpdated).toLocaleString()}</strong></p>
          </div>
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