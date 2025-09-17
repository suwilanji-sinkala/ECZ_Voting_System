import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
// Bootstrap Icons are loaded via CDN in layout.tsx

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image src="/ECZ_Logo.png" alt="ECZ Logo" width={200} height={100} />
        <h1 className={styles.title}>ECZ - Online Voting System</h1>
        
        <div className={styles.container}>
          <p className={styles.tagline}>Make your vote count</p>
          
          <div className={styles.buttonContainer}>
            <div className={styles.buttonGroup}>
              <p className={styles.buttonLabel}>Election Management</p>
              <Link href="/management/login" className={styles.button}>
                <div className={styles.iconWrapper}>
                  <i className="bi bi-shield-lock"></i>
                </div>
                <span>Admin Portal</span>
              </Link>
            </div>
            
            <div className={styles.buttonGroup}>
              <p className={styles.buttonLabel}>Voter Access</p>
              <Link href="/client/login" className={styles.button}>
                <div className={styles.iconWrapper}>
                  <i className="bi bi-person-check"></i>
                </div>
                <span>Voter Login</span>
              </Link>
            </div>

            <div className={styles.buttonGroup}>
              <p className={styles.buttonLabel}>Blockchain Voting</p>
              <Link href="/client/election" className={`${styles.button} ${styles.blockchainButton}`}>
                <div className={styles.iconWrapper}>
                  <i className="bi bi-shuffle"></i>
                </div>
                <span>Vote on Blockchain</span>
              </Link>
            </div>
          </div>

          <div className={styles.infoBox}>
            <h3>About Blockchain Voting</h3>
            <p>Experience secure and transparent voting powered by blockchain technology.</p>
            <p>Your vote is recorded immutably on the Ethereum blockchain.</p>
            <p className={styles.smallText}>Make sure you have MetaMask installed to participate.</p>
          </div>
        </div>
      </main>
    </div>
  );
}