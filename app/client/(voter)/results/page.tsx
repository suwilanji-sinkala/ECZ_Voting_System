'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

interface Candidate {
  candidateId: number;
  name: string;
  party: string;
  partyAcronym: string;
  votes: number;
  percentage: number;
  image?: string;
}

interface Position {
  positionId: number;
  positionName: string;
  candidates: Candidate[];
  totalVotes: number;
}

interface Election {
  electionId: number;
  electionTitle: string;
  electionDescription: string;
  startDate: string;
  endDate: string;
  status: string;
  totalVotes: number;
  totalVoters: number;
  voterTurnout: number;
  positions: Position[];
}

interface FinalResultsData {
  overallStats: {
    totalVoters: number;
    totalVotesCast: number;
    totalCompletedElections: number;
    overallTurnout: number;
  };
  elections: Election[];
  lastUpdated: string;
}

export default function FinalResultsPage() {
  const [resultsData, setResultsData] = useState<FinalResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedElection, setSelectedElection] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const fetchFinalResults = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/elections/final-results');
      if (!response.ok) {
        throw new Error('Failed to fetch final results');
      }
      const data = await response.json();
      setResultsData(data);
      
      // Initialize expanded sections for all positions
      const sections: Record<string, boolean> = {};
      data.elections.forEach((election: Election) => {
        election.positions.forEach((position: Position) => {
          sections[`${election.electionId}-${position.positionId}`] = true;
        });
      });
      setExpandedSections(sections);
      
      // Set first election as selected by default
      if (data.elections.length > 0) {
        setSelectedElection(data.elections[0].electionId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinalResults();
  }, []);

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleRefresh = () => {
    fetchFinalResults();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return '#28a745';
      case 'active': return '#007bff';
      case 'draft': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return '✅';
      case 'active': return '🟢';
      case 'draft': return '📝';
      default: return '❓';
    }
  };

  if (loading && !resultsData) {
    return (
      <div className={styles.page}>
        <Navbar title="Final Election Results" />
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading final results...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !resultsData) {
    return (
      <div className={styles.page}>
        <Navbar title="Final Election Results" />
        <main className={styles.main}>
          <div className={styles.errorContainer}>
            <p>Error loading final results: {error}</p>
            <button onClick={handleRefresh} className={styles.retryButton}>
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!resultsData || resultsData.elections.length === 0) {
    return (
      <div className={styles.page}>
        <Navbar title="Final Election Results" />
        <main className={styles.main}>
          <div className={styles.noDataContainer}>
            <p>No final election results available at the moment.</p>
            <button onClick={handleRefresh} className={styles.retryButton}>
              Refresh
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar title="Final Election Results" />
      
      <main className={styles.main}>
        <div className={styles.headerSection}>
          <div className={styles.headerContent}>
            <h1>Final Election Results</h1>
            <p>Official results from completed elections</p>
          </div>
          <div className={styles.headerActions}>
            <button onClick={handleRefresh} className={styles.refreshButton}>
              <span className={styles.refreshIcon}>🔄</span>
              Refresh
            </button>
          </div>
        </div>

        <div className={styles.overallStats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🏛️</div>
            <div className={styles.statContent}>
              <h3>Completed Elections</h3>
              <p>{resultsData.overallStats.totalCompletedElections}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <h3>Total Voters</h3>
              <p>{resultsData.overallStats.totalVoters.toLocaleString()}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🗳️</div>
            <div className={styles.statContent}>
              <h3>Total Votes Cast</h3>
              <p>{resultsData.overallStats.totalVotesCast.toLocaleString()}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statContent}>
              <h3>Overall Turnout</h3>
              <p>{resultsData.overallStats.overallTurnout.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className={styles.electionSelector}>
          <h3>Select Election</h3>
          <div className={styles.electionTabs}>
            {resultsData.elections.map((election) => (
              <button
                key={election.electionId}
                className={`${styles.electionTab} ${selectedElection === election.electionId ? styles.active : ''}`}
                onClick={() => setSelectedElection(election.electionId)}
              >
                <span className={styles.tabIcon}>{getStatusIcon(election.status)}</span>
                {election.electionTitle}
              </button>
            ))}
          </div>
        </div>

        {selectedElection && (
          <div className={styles.selectedElection}>
            {resultsData.elections
              .filter(election => election.electionId === selectedElection)
              .map((election) => (
                <div key={election.electionId} className={styles.electionCard}>
                  <div className={styles.electionHeader}>
                    <div className={styles.electionInfo}>
                      <div className={styles.electionTitleRow}>
                        <h2>{election.electionTitle}</h2>
                        <span 
                          className={styles.status} 
                          style={{ backgroundColor: getStatusColor(election.status) }}
                        >
                          {getStatusIcon(election.status)} {election.status}
                        </span>
                      </div>
                      <p className={styles.electionDescription}>{election.electionDescription}</p>
                      <div className={styles.electionMeta}>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Start Date:</span>
                          <span className={styles.metaValue}>
                            {new Date(election.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>End Date:</span>
                          <span className={styles.metaValue}>
                            {new Date(election.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Voter Turnout:</span>
                          <span className={styles.metaValue}>
                            {election.voterTurnout.toFixed(1)}%
                          </span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Total Votes:</span>
                          <span className={styles.metaValue}>
                            {election.totalVotes.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.winnersSection}>
                    <h3>🏆 Election Winners</h3>
                    <div className={styles.winnersGrid}>
                      {election.positions.map((position) => {
                        const winner = position.candidates[0]; // First candidate is the winner
                        return (
                          <div key={position.positionId} className={styles.winnerCard}>
                            <div className={styles.winnerHeader}>
                              <h4>{position.positionName}</h4>
                              <div className={styles.winnerCrown}>👑</div>
                            </div>
                            <div className={styles.winnerContent}>
                              <div className={styles.winnerImage}>
                                {winner.image ? (
                                  <img 
                                    src={`data:image/jpeg;base64,${winner.image}`} 
                                    alt={winner.name}
                                    className={styles.winnerImg}
                                  />
                                ) : (
                                  <div className={styles.winnerPlaceholder}>
                                    👤
                                  </div>
                                )}
                              </div>
                              <div className={styles.winnerInfo}>
                                <h5>{winner.name}</h5>
                                <p className={styles.winnerParty}>
                                  {winner.party} ({winner.partyAcronym})
                                </p>
                                <div className={styles.winnerStats}>
                                  <span className={styles.winnerVotes}>
                                    {winner.votes.toLocaleString()} votes
                                  </span>
                                  <span className={styles.winnerPercentage}>
                                    {winner.percentage.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className={styles.positionsContainer}>
                    <h3>📊 Detailed Results</h3>
                    {election.positions.map((position) => {
                      const sectionKey = `${election.electionId}-${position.positionId}`;
                      const isExpanded = expandedSections[sectionKey];
                      
                      return (
                        <div key={position.positionId} className={styles.positionCard}>
                          <div 
                            className={styles.positionHeader}
                            onClick={() => toggleSection(sectionKey)}
                          >
                            <div className={styles.positionInfo}>
                              <h4>{position.positionName}</h4>
                              <p>{position.totalVotes.toLocaleString()} total votes</p>
                            </div>
                            <div className={styles.positionActions}>
                              <span className={styles.expandIcon}>
                                {isExpanded ? '▼' : '▶'}
                              </span>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className={styles.candidatesContainer}>
                              {position.candidates.map((candidate, index) => (
                                <div key={candidate.candidateId} className={styles.candidateCard}>
                                  <div className={styles.candidateRank}>
                                    <span className={styles.rankNumber}>{index + 1}</span>
                                    {index === 0 && <span className={styles.winnerBadge}>🏆</span>}
                                  </div>
                                  <div className={styles.candidateImage}>
                                    {candidate.image ? (
                                      <img 
                                        src={`data:image/jpeg;base64,${candidate.image}`} 
                                        alt={candidate.name}
                                        className={styles.candidateImg}
                                      />
                                    ) : (
                                      <div className={styles.candidatePlaceholder}>
                                        👤
                                      </div>
                                    )}
                                  </div>
                                  <div className={styles.candidateInfo}>
                                    <h5>{candidate.name}</h5>
                                    <p className={styles.partyInfo}>
                                      {candidate.party} ({candidate.partyAcronym})
                                    </p>
                                  </div>
                                  <div className={styles.candidateStats}>
                                    <div className={styles.voteCount}>
                                      <span className={styles.voteNumber}>{candidate.votes.toLocaleString()}</span>
                                      <span className={styles.voteLabel}>votes</span>
                                    </div>
                                    <div className={styles.percentage}>
                                      {candidate.percentage.toFixed(1)}%
                                    </div>
                                  </div>
                                  <div className={styles.progressBar}>
                                    <div 
                                      className={styles.progressFill}
                                      style={{ width: `${candidate.percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
  );
}