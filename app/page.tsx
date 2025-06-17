import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import "bootstrap-icons/font/bootstrap-icons.css"; // Import Bootstrap Icons CSS

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
              <p className={styles.buttonLabel}>Register/sign in for ECZ</p>
              <Link href="/management/login" className={styles.button}>
                <div className={styles.iconWrapper}>
                  <i className="bi bi-arrow-left-square"></i>
                </div>
                <span>ECZ</span>
              </Link>
            </div>
            
            <div className={styles.buttonGroup}>
              <p className={styles.buttonLabel}>Sign in to Vote</p>
              <Link href="/client/login" className={styles.button}>
                <span>Voters</span>
                <div className={styles.iconWrapper}>
                  <i className="bi bi-arrow-right-square"></i>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}