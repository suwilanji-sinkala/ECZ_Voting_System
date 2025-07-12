'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import Navbar from '../../components/Navbar';

interface SelectedCandidate {
  Candidate_ID: number;
  FirstName: string;
  LastName: string;
  OtherName?: string;
  NickName?: string;
  Image?: string | null;
  Position_Name: string;
  Party?: {
    Party_ID: number;
    Party_Name: string;
    Party_Acronym: string;
  } | null;
  Ward?: {
    Ward_Code: string;
    Ward_Name: string;
  } | null;
}

interface VoterInfo {
  id: string;
  First_Name: string;
  Last_Name: string;
  NRC: string;
  Constituency: string;
  Ward: string;
}

export default function VoteSelectPage() {
  const [voter, setVoter] = useState<VoterInfo | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<SelectedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Get voter info and selected candidates from localStorage
  useEffect(() => {
    const voterData = localStorage.getItem('voter');
    const selectedData = localStorage.getItem('selectedCandidates');
    
    if (voterData) {
      setVoter(JSON.parse(voterData));
    } else {
      setError('Voter not logged in.');
    }

    if (selectedData) {
      setSelectedCandidates(JSON.parse(selectedData));
    } else {
      setError('No candidates selected.');
    }

    setLoading(false);
  }, []);

  const handleEditSelection = () => {
    window.location.href = '/client/vote-candidates';
  };

  const handleSubmitVote = async () => {
    if (!voter || selectedCandidates.length === 0) return;
    
    setSubmitting(true);
    try {
      // Here you would typically submit the vote to your API
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Clear localStorage
      localStorage.removeItem('selectedCandidates');
      
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit vote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    window.location.href = '/client/options';
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar title="Review Your Vote" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading your selections...</p>
        </div>
      </div>
    );
  }

  if (!voter) {
    return (
      <div className={styles.page}>
        <Navbar title="Review Your Vote" />
        <div className={styles.errorContainer}>
          <p>Please log in to review your vote.</p>
          <button onClick={() => window.location.href = '/client/login'} className={styles.retryButton}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!selectedCandidates || Object.keys(selectedCandidates).length === 0) {
    return (
      <div className={styles.page}>
        <Navbar title="Review Your Vote" />
        <div className={styles.errorContainer}>
          <p>No candidate selections found. Please go back and select candidates.</p>
          <button onClick={() => window.location.href = '/client/vote-candidates'} className={styles.retryButton}>
            Go Back to Voting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar title="Review Your Vote" />
      
      <div className={styles.mainContent}>
        <div className={styles.headerSection}>
          <h1>Review Your Vote</h1>
          <p>Please review your selections before submitting</p>
        </div>

        <div className={styles.voterInfo}>
          <div className={styles.voterCard}>
            <div className={styles.voterIcon}>👤</div>
            <div className={styles.voterDetails}>
              <h3>{voter.First_Name} {voter.Last_Name}</h3>
              <p>NRC: {voter.NRC}</p>
              <p>{voter.Constituency} • {voter.Ward}</p>
            </div>
          </div>
        </div>

        <div className={styles.selectionsContainer}>
          <h2>Your Selections</h2>
          <div className={styles.selectionsGrid}>
                         {Object.entries(selectedCandidates).map(([positionId, candidate]) => (
               <div key={positionId} className={styles.selectionCard}>
                 <div className={styles.positionHeader}>
                   <h3>{candidate.Position_Name}</h3>
                 </div>
                 
                 <div className={styles.candidateInfo}>
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
                   
                   <div className={styles.candidateDetails}>
                     <h4>{candidate.FirstName} {candidate.LastName}</h4>
                     {candidate.OtherName && <p className={styles.otherName}>{candidate.OtherName}</p>}
                     {candidate.NickName && <p className={styles.nickName}>"{candidate.NickName}"</p>}
                     
                     {candidate.Party && (
                       <div className={styles.partyInfo}>
                         <span className={styles.partyName}>{candidate.Party.Party_Name}</span>
                         {candidate.Party.Party_Acronym && (
                           <span className={styles.partyAcronym}>({candidate.Party.Party_Acronym})</span>
                         )}
                       </div>
                     )}
                     
                     {candidate.Ward && (
                       <div className={styles.locationInfo}>
                         <span>{candidate.Ward.Ward_Name}</span>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </div>

        <div className={styles.instructions}>
          <div className={styles.instructionCard}>
            <h3>Important Information</h3>
            <ul>
              <li>Your vote is confidential and secure</li>
              <li>You can only vote once per election</li>
              <li>Votes cannot be changed after submission</li>
              <li>Results will be available after the election ends</li>
            </ul>
          </div>
        </div>

        <div className={styles.actionButtons}>
          <button 
            onClick={() => window.location.href = '/client/vote-candidates'}
            className={styles.backButton}
          >
            Back to Voting
          </button>
          <button 
            onClick={handleSubmitVote}
            disabled={submitting}
            className={styles.submitButton}
          >
            {submitting ? 'Submitting...' : 'Submit Vote'}
          </button>
        </div>
      </div>
    </div>
  );
}