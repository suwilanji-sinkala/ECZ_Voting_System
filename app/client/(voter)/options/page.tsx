'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import Navbar from '../../components/Navbar';

interface VoterInfo {
  id: string;
  First_Name: string;
  Last_Name: string;
  NRC: string;
  Constituency: string;
  Ward: string;
}

export default function OptionsPage() {
  const [voter, setVoter] = useState<VoterInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const voterData = localStorage.getItem('voter');
    if (voterData) {
      setVoter(JSON.parse(voterData));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar title="Voter Dashboard" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading your options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar title="Voter Dashboard" />
      
      <div className={styles.mainContent}>
        <div className={styles.sectionHeader}>
          <h2>Welcome, {voter?.First_Name} {voter?.Last_Name}</h2>
          <p>Choose an option to continue</p>
        </div>

        <div className={styles.optionsContainer}>
          <div className={styles.optionsGrid}>
            <div className={styles.optionCard} onClick={() => window.location.href = '/client/vote-candidates'}>
              <div className={styles.optionIcon}>
                <span className={styles.icon}>🗳️</span>
              </div>
              <div className={styles.optionContent}>
                <h3>Cast Your Vote</h3>
                <p>Participate in active elections and make your voice heard</p>
              </div>
              <div className={styles.optionArrow}>
                <span>→</span>
              </div>
            </div>

            <div className={styles.optionCard} onClick={() => window.location.href = '/client/results'}>
              <div className={styles.optionIcon}>
                <span className={styles.icon}>📊</span>
              </div>
              <div className={styles.optionContent}>
                <h3>View Final Results</h3>
                <p>See the official election results and outcomes</p>
              </div>
              <div className={styles.optionArrow}>
                <span>→</span>
              </div>
            </div>

            <div className={styles.optionCard} onClick={() => window.location.href = '/client/live'}>
              <div className={styles.optionIcon}>
                <span className={styles.icon}>📈</span>
              </div>
              <div className={styles.optionContent}>
                <h3>Live Standings</h3>
                <p>Check real-time election progress and current standings</p>
              </div>
              <div className={styles.optionArrow}>
                <span>→</span>
              </div>
            </div>

            <div className={styles.optionCard} onClick={() => window.location.href = '/client/vote-select'}>
              <div className={styles.optionIcon}>
                <span className={styles.icon}>✅</span>
              </div>
              <div className={styles.optionContent}>
                <h3>Review Selections</h3>
                <p>Review and submit your candidate selections</p>
              </div>
              <div className={styles.optionArrow}>
                <span>→</span>
              </div>
            </div>
          </div>

          <div className={styles.infoSection}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>ℹ️</div>
              <div className={styles.infoContent}>
                <h4>Important Information</h4>
                <ul>
                  <li>Your vote is confidential and secure</li>
                  <li>You can only vote once per election</li>
                  <li>Results are updated in real-time</li>
                  <li>Contact support if you encounter any issues</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}