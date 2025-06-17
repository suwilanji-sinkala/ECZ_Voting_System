'use client';
import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';

export default function ResultsPage() {
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
        
        <div className={styles.container}>
          <div className={styles.optionsGrid}>
            <Link href="/client/results" className={styles.optionCard}>
              <div className={styles.optionIcon}>
                <Image 
                  src="/images1.jpeg" 
                  alt="Results icon" 
                  width={60} 
                  height={60}
                />
              </div>
              <h3>View Final Results</h3>
            </Link>
            
            <Link href="/client/live" className={styles.optionCard}>
              <div className={styles.optionIcon}>
                <Image 
                  src="/image.png" 
                  alt="Live icon" 
                  width={60} 
                  height={60}
                />
              </div>
              <h3>Check Live Standings</h3>
            </Link>
            
            <Link href="/client/vote-candidates" className={styles.optionCard}>
              <div className={styles.optionIcon}>
                <Image 
                  src="/image2.svg" 
                  alt="Home icon" 
                  width={60} 
                  height={60}
                />
              </div>
              <h3>Return To Home</h3>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}