'use client';
import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';

export default function FinalResultsPage() {
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
        <h1 className={styles.title}>Election: Official & Final</h1>
        
        <div className={styles.container}>
          <div className={styles.electionInfo}>
            <p className={styles.electionDate}>Election Date: 04/24/2025</p>
          </div>

          <div className={styles.resultsSection}>
            <h2 className={styles.sectionTitle}>Presidential Election Results</h2>
            <p className={styles.winner}><strong>Winner:</strong> Hakainde Hichilema</p>
            <h3 className={styles.subtitle}>Final Standings:</h3>
            <ul className={styles.resultsList}>
              <li>Hakainde Hichilema <span className={styles.votePercent}>48%</span> (13,660 Votes)</li>
              <li>Edgar Chagwa Lungu <span className={styles.votePercent}>36%</span> (10,120 Votes)</li>
            </ul>
          </div>

          <div className={styles.resultsSection}>
            <h2 className={styles.sectionTitle}>MP Standings (Selected Constituency)</h2>
            <p className={styles.winner}><strong>Winner:</strong> David Mumba</p>
            <h3 className={styles.subtitle}>Final Standings:</h3>
            <ul className={styles.resultsList}>
              <li>David Mumba <span className={styles.votePercent}>52%</span> (1,234 Votes)</li>
              <li>Warren Chisha Mwambazi <span className={styles.votePercent}>42%</span> (908 Votes)</li>
            </ul>
          </div>

          <div className={styles.resultsSection}>
            <h2 className={styles.sectionTitle}>Mayor Election Results</h2>
            <p className={styles.winner}><strong>Winner:</strong> Chilando Chitangala</p>
            <h3 className={styles.subtitle}>Final Standings:</h3>
            <ul className={styles.resultsList}>
              <li>Chilando Chitangala <span className={styles.votePercent}>32%</span> (506 Votes)</li>
              <li>Webster Chileshe <span className={styles.votePercent}>10%</span> (101 Votes)</li>
            </ul>
          </div>

          <div className={styles.resultsSection}>
            <h2 className={styles.sectionTitle}>Councilor Election Results</h2>
            <p className={styles.winner}><strong>Winner:</strong> Bwalya Chishala</p>
            <h3 className={styles.subtitle}>Final Standings:</h3>
            <ul className={styles.resultsList}>
              <li>Bwalya Chishala <span className={styles.votePercent}>23%</span> (203 Votes)</li>
              <li>Pollard Samba <span className={styles.votePercent}>7%</span> (96 Votes)</li>
            </ul>
          </div>

          <div className={styles.actionButtons}>
            <Link href="/download-report" className={styles.downloadButton}>
              Download Full Report
            </Link>
            <Link href="/client/vote-candidates" className={styles.homeButton}>
              Return To Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}