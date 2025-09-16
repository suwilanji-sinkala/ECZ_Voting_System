"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import Navbar from "../../components/Navbar";

interface Candidate {
  Candidate_ID: number;
  FirstName: string;
  LastName: string;
  OtherName?: string;
  NickName?: string;
  Image?: string | null;
  Party?: {
    Party_ID: number;
    Party_Name: string;
    Party_Acronym: string;
  } | null;
  Ward?: {
    Ward_Code: string;
    Ward_Name: string;
    Constituency?: {
      Constituency_Code: number;
      Constituency_Name: string;
    };
    District?: {
      District_Code: string;
      District_Name: string;
    };
  } | null;
}

interface Position {
  Position_ID: number;
  Position_Name: string;
  Candidates: Candidate[];
}

interface Election {
  Election_ID: number;
  title: string;
  Description?: string;
  StartDate: string;
  EndDate: string;
  Status: string;
  Year: number;
  Election_Type: string;
  positions: Position[];
}

interface VoterInfo {
  id: string;
  First_Name: string;
  Last_Name: string;
  NRC: string;
  Constituency: string;
  Ward: string;
}

export default function VoteCandidatesPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [voter, setVoter] = useState<VoterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [votes, setVotes] = useState<Record<number, number>>({}); // positionId -> candidateId
  const [hasVoted, setHasVoted] = useState<Record<number, boolean>>({}); // electionId -> bool
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'elections' | 'voting' | 'confirmation'>('elections');

  // Fetch voter info
  useEffect(() => {
    if (!voter) {
      setVoter(JSON.parse(localStorage.getItem('voter') || 'null'));
    } else {
      setError('Voter not logged in.');
    }
  }, []);

  // Fetch elections
  useEffect(() => {
    if (!voter) {
      setLoading(false);
      return;
    }

    async function fetchElections() {
      try {
        const res = await fetch(`/api/elections/voter-eligible?voterId=${voter!.id}`);
        if (!res.ok) throw new Error('Failed to fetch elections');
        const data = await res.json();
        
        // Debug: Log the data to see what we're getting
        console.log('Elections data:', data);
        if (Array.isArray(data) && data.length > 0) {
          data.forEach((election: any) => {
            if (election.positions) {
              election.positions.forEach((position: any) => {
                if (position.Candidates) {
                  position.Candidates.forEach((candidate: any) => {
                    console.log(`Candidate ${candidate.Candidate_ID}:`, {
                      name: `${candidate.FirstName} ${candidate.LastName}`,
                      hasImage: !!candidate.Image,
                      imageLength: candidate.Image?.length || 0
                    });
                  });
                }
              });
            }
          });
        }
        
        setElections(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load elections.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchElections();
  }, [voter]);

  // Check if voter has already voted in each election
  useEffect(() => {
    if (!voter) return;
    async function checkVotes() {
      const results: Record<number, boolean> = {};
      for (const election of elections) {
        const res = await fetch(`/api/votes?electionId=${election.Election_ID}&voterId=${voter!.id}`);
        if (res.ok) {
          const data = await res.json();
          results[election.Election_ID] = !!data.hasVoted;
        }
      }
      setHasVoted(results);
    }
    if (elections.length > 0) checkVotes();
  }, [elections, voter]);

  // No need to filter elections here anymore since the API handles it
  const eligibleElections = elections;

  // Handle candidate selection
  const handleSelectCandidate = (positionId: number, candidateId: number) => {
    setVotes(prev => ({ ...prev, [positionId]: candidateId }));
  };

  // Handle vote submission
  const handleSubmitVote = async () => {
    if (!voter || !selectedElection) return;
    setSubmitting(true);
    try {
      const votePayload = {
        voterId: voter.id,
        electionId: selectedElection.Election_ID,
        votes: Object.entries(votes).map(([positionId, candidateId]) => ({
          positionId: Number(positionId),
          candidateId: candidateId
        }))
      };
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(votePayload)
      });
      if (!res.ok) throw new Error('Failed to submit vote');
      setCurrentStep('confirmation');
      setHasVoted(prev => ({ ...prev, [selectedElection.Election_ID]: true }));
    } catch (err) {
      alert('Failed to submit vote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get election status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return '#28a745';
      case 'draft': return '#ffc107';
      case 'completed': return '#6c757d';
      default: return '#6c757d';
    }
  };

  // UI
  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar title="Vote for Candidates" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading elections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <Navbar title="Vote for Candidates" />
        <div className={styles.errorContainer}>
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!voter) {
    return (
      <div className={styles.page}>
        <Navbar title="Vote for Candidates" />
        <div className={styles.errorContainer}>
          <p>Please log in to vote.</p>
          <button onClick={() => window.location.href = '/client/login'} className={styles.retryButton}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'elections') {
    return (
      <div className={styles.page}>
        <Navbar title="Vote for Candidates" />
        
        <div className={styles.mainContent}>
          <div className={styles.headerSection}>
            <h1>Available Elections</h1>
            <p>Select an election to cast your vote</p>
          </div>

          {eligibleElections.length === 0 ? (
            <div className={styles.noElectionsContainer}>
              <div className={styles.noElectionsCard}>
                <div className={styles.noElectionsIcon}>🗳️</div>
                <h2>No Elections Available</h2>
                <p>There are currently no active elections for your constituency.</p>
                <button 
                  onClick={() => window.location.href = '/client/options'} 
                  className={styles.backToDashboardButton}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.electionsGrid}>
              {eligibleElections.map((election) => (
                <div key={election.Election_ID} className={styles.electionCard}>
                  <div className={styles.electionHeader}>
                    <h2>{election.title}</h2>
                    <div className={styles.electionMeta}>
                      <span 
                        className={styles.status} 
                        style={{ backgroundColor: getStatusColor(election.Status) }}
                      >
                        {election.Status}
                      </span>
                      <span className={styles.electionType}>{election.Election_Type}</span>
                    </div>
                  </div>
                  
                  <div className={styles.electionDetails}>
                    <p>{election.Description}</p>
                    <div className={styles.electionDates}>
                      <div className={styles.dateItem}>
                        <span className={styles.dateLabel}>Start:</span>
                        <span className={styles.dateValue}>{formatDate(election.StartDate)}</span>
                      </div>
                      <div className={styles.dateItem}>
                        <span className={styles.dateLabel}>End:</span>
                        <span className={styles.dateValue}>{formatDate(election.EndDate)}</span>
                      </div>
                    </div>
                    <div className={styles.positionsInfo}>
                      <span>{election.positions.length} position(s) to vote for</span>
                    </div>
                  </div>

                  <div className={styles.electionActions}>
                    {hasVoted[election.Election_ID] ? (
                      <div className={styles.votedStatus}>
                        <span className={styles.votedIcon}>✅</span>
                        <span>Already Voted</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          setSelectedElection(election);
                          setCurrentStep('voting');
                        }}
                        className={styles.voteButton}
                      >
                        Cast Vote
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 'voting' && selectedElection) {
    return (
      <div className={styles.page}>
        <Navbar title={`Voting - ${selectedElection.title}`} />
        
        <div className={styles.mainContent}>
          <div className={styles.headerSection}>
            <h1>Cast Your Vote</h1>
            <p>{selectedElection.title}</p>
          </div>

          <div className={styles.votingInstructions}>
            <div className={styles.instructionCard}>
              <h3>Voting Instructions</h3>
              <ul>
                <li>Select one candidate for each position</li>
                <li>You can only vote once per election</li>
                <li>Review your selections before submitting</li>
                <li>Your vote is confidential and secure</li>
              </ul>
            </div>
          </div>

          <div className={styles.positionsContainer}>
            {selectedElection.positions.map((position) => (
              <div key={position.Position_ID} className={styles.positionCard}>
                <div className={styles.positionHeader}>
                  <h2>{position.Position_Name}</h2>
                  <p>Select your preferred candidate</p>
                </div>

                <div className={styles.candidatesGrid}>
                  {position.Candidates.map((candidate) => (
                    <div 
                      key={candidate.Candidate_ID} 
                      className={`${styles.candidateCard} ${
                        votes[position.Position_ID] === candidate.Candidate_ID ? styles.selected : ''
                      }`}
                      onClick={() => handleSelectCandidate(position.Position_ID, candidate.Candidate_ID)}
                    >
                      <div className={styles.candidateImage}>
                        {candidate.Image ? (
                          <img 
                            src={`data:image/jpeg;base64,${candidate.Image}`} 
                            alt={`${candidate.FirstName} ${candidate.LastName}`}
                            className={styles.candidateImg}
                          />
                        ) : (
                          <div className={styles.candidatePlaceholder}>
                            👤
                          </div>
                        )}
                      </div>
                      
                      <div className={styles.candidateInfo}>
                        <h3>{candidate.FirstName} {candidate.LastName}</h3>
                        {candidate.OtherName && <p className={styles.otherName}>{candidate.OtherName}</p>}
                        {candidate.NickName && <p className={styles.nickName}>"{candidate.NickName}"</p>}
                        
                        {candidate.Party && (
                          <div className={styles.partyInfo}>
                            <span className={styles.partyName}>{candidate.Party.Party_Name}</span>
                            <span className={styles.partyAcronym}>({candidate.Party.Party_Acronym})</span>
                          </div>
                        )}
                        
                        {candidate.Ward && (
                          <div className={styles.locationInfo}>
                            <span>{candidate.Ward.Ward_Name}</span>
                            {candidate.Ward.Constituency && (
                              <span> • {candidate.Ward.Constituency.Constituency_Name}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className={styles.selectionIndicator}>
                        {votes[position.Position_ID] === candidate.Candidate_ID && (
                          <span className={styles.selectedIcon}>✓</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.votingActions}>
            <button 
              onClick={() => setCurrentStep('elections')}
              className={styles.backButton}
            >
              Back to Elections
            </button>
            <button 
              onClick={handleSubmitVote}
              disabled={submitting || Object.keys(votes).length !== selectedElection.positions.length}
              className={styles.submitButton}
            >
              {submitting ? 'Submitting...' : 'Submit Vote'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'confirmation') {
    return (
      <div className={styles.page}>
        <Navbar title="Vote Confirmation" />
        
        <div className={styles.mainContent}>
          <div className={styles.confirmationContainer}>
            <div className={styles.confirmationCard}>
              <div className={styles.confirmationIcon}>✅</div>
              <h1>Vote Submitted Successfully!</h1>
              <p>Thank you for participating in the democratic process.</p>
              
              <div className={styles.confirmationDetails}>
                <h3>Vote Details</h3>
                <p><strong>Election:</strong> {selectedElection?.title}</p>
                <p><strong>Voter:</strong> {voter?.First_Name} {voter?.Last_Name}</p>
                <p><strong>Constituency:</strong> {voter?.Constituency}</p>
                <p><strong>Ward:</strong> {voter?.Ward}</p>
              </div>

              <div className={styles.confirmationActions}>
                <button 
                  onClick={() => window.location.href = '/client/options'}
                  className={styles.dashboardButton}
                >
                  Go to Dashboard
                </button>
                <button 
                  onClick={() => window.location.href = '/client/live'}
                  className={styles.liveButton}
                >
                  View Live Results
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}