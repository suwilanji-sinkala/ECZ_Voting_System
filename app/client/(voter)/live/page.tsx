'use client';
import { useState } from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';

export default function LiveResultsPage() {
  const lastUpdated = new Date('2025-04-24T14:30:00');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    president: true,
    mp: true,
    mayor: true,
    councilor: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const candidates = {
    president: [
      { name: 'Hakainde Hichilema', percent: '48%', votes: '13,660' },
      { name: 'Edgar Chagwa Lungu', percent: '36%', votes: '10,120' },
      { name: 'Other Candidates', percent: '16%', votes: '4,710' }
    ],
    mp: [
      { name: 'David Mumba', percent: '52%', votes: '1,234' },
      { name: 'Warren Chisha Mwambazi', percent: '42%', votes: '908' },
      { name: 'Other Candidates', percent: '6%', votes: '142' }
    ],
    mayor: [
      { name: 'Chilando Chitangala', percent: '32%', votes: '506' },
      { name: 'Webster Chileshe', percent: '10%', votes: '101' },
      { name: 'Other Candidates', percent: '58%', votes: '893' }
    ],
    councilor: [
      { name: 'Bwalya Chishala', percent: '23%', votes: '203' },
      { name: 'Pollard Samba', percent: '7%', votes: '96' },
      { name: 'Other Candidates', percent: '70%', votes: '604' }
    ]
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image 
          src="/ECZ_Logo.png" 
          alt="Electoral Commission of Zambia Logo" 
          width={200} 
          height={100} 
          priority
          className={styles.logo}
        />
        <h1 className={styles.title}>Live Election Results</h1>
        
        <div className={styles.container}>
          <div className={styles.electionProgress}>
            <p className={styles.progressText}>
              <strong>Election Progress:</strong> 28,490 / 100,000
            </p>
            <p className={styles.lastUpdated}>
              Last Updated {lastUpdated.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}, {lastUpdated.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>

          <div className={styles.resultsSection}>
            <div 
              className={styles.sectionHeader}
              onClick={() => toggleSection('president')}
            >
              <h2 className={styles.sectionTitle}>Presidential Standings</h2>
              <span className={styles.dropdownIcon}>
                {expandedSections.president ? '−' : '+'}
              </span>
            </div>
            {expandedSections.president && (
              <div className={styles.candidateList}>
                {candidates.president.map((candidate, index) => (
                  <div key={index} className={styles.candidateResult}>
                    <span className={styles.candidateName}>{candidate.name}</span>
                    <span className={styles.voteInfo}>
                      {candidate.percent} ({candidate.votes} Votes)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Repeat for other sections */}
          <div className={styles.resultsSection}>
            <div 
              className={styles.sectionHeader}
              onClick={() => toggleSection('mp')}
            >
              <h2 className={styles.sectionTitle}>MP Standings (Selected Constituency)</h2>
              <span className={styles.dropdownIcon}>
                {expandedSections.mp ? '−' : '+'}
              </span>
            </div>
            {expandedSections.mp && (
              <div className={styles.candidateList}>
                {candidates.mp.map((candidate, index) => (
                  <div key={index} className={styles.candidateResult}>
                    <span className={styles.candidateName}>{candidate.name}</span>
                    <span className={styles.voteInfo}>
                      {candidate.percent} ({candidate.votes} Votes)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.resultsSection}>
            <div 
              className={styles.sectionHeader}
              onClick={() => toggleSection('mayor')}
            >
              <h2 className={styles.sectionTitle}>Mayor Standings</h2>
              <span className={styles.dropdownIcon}>
                {expandedSections.mayor ? '−' : '+'}
              </span>
            </div>
            {expandedSections.mayor && (
              <div className={styles.candidateList}>
                {candidates.mayor.map((candidate, index) => (
                  <div key={index} className={styles.candidateResult}>
                    <span className={styles.candidateName}>{candidate.name}</span>
                    <span className={styles.voteInfo}>
                      {candidate.percent} ({candidate.votes} Votes)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.resultsSection}>
            <div 
              className={styles.sectionHeader}
              onClick={() => toggleSection('councilor')}
            >
              <h2 className={styles.sectionTitle}>Councilor Standings</h2>
              <span className={styles.dropdownIcon}>
                {expandedSections.councilor ? '−' : '+'}
              </span>
            </div>
            {expandedSections.councilor && (
              <div className={styles.candidateList}>
                {candidates.councilor.map((candidate, index) => (
                  <div key={index} className={styles.candidateResult}>
                    <span className={styles.candidateName}>{candidate.name}</span>
                    <span className={styles.voteInfo}>
                      {candidate.percent} ({candidate.votes} Votes)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.actionButtons}>
            <Link href="/client/live" className={styles.actionButton}>
              Refresh Results
            </Link>
            <Link href="/client/vote-candidates" className={styles.actionButton}>
              Return To Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}