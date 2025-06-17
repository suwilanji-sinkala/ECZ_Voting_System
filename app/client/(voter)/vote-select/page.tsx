'use client';
import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';

type SelectedCandidate = {
  position: string;
  name: string;
  party: string;
};

export default function ConfirmationPage() {
  const selectedCandidates: SelectedCandidate[] = [
    { position: 'President', name: 'Hakainde Hichilema', party: 'UPND' },
    { position: 'MP', name: 'David Mumba', party: 'PF' },
    { position: 'Mayor', name: 'Chilanda Chitangala', party: 'PF' },
    { position: 'Counilor', name: 'Bwalya Chishala', party: 'UPND' }
  ];

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('Your vote has been submitted successfully!');
    window.location.href = '/client/options';
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
        <h1 className={styles.title}>ECZ - Online Voting System</h1>
        
        <div className={styles.confirmationContainer}>
          <h2 className={styles.sectionTitle}>Selected Candidates</h2>
          
          <div className={styles.candidatesTable}>
            <div className={styles.tableHeader}>
              <div className={styles.tableCell}>Position</div>
              <div className={styles.tableCell}>Name</div>
              <div className={styles.tableCell}>Party</div>
            </div>
            
            {selectedCandidates.map((candidate, index) => (
              <div key={index} className={styles.tableRow}>
                <div className={`${styles.tableCell} ${styles.positionCell}`}>
                  <strong>{candidate.position}</strong>
                </div>
                <div className={styles.tableCell}>{candidate.name}</div>
                <div className={styles.tableCell}>{candidate.party}</div>
              </div>
            ))}
          </div>
          
          <div className={styles.confirmationActions}>
            <Link href="/client/vote-candidates" className={styles.actionButton}>
              Edit Selection
            </Link>
            
            <button 
              className={styles.actionButton}
              onClick={handleSubmit}
            >
              Confirm & Submit
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}