import Image from "next/image";
import styles from "./page.module.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Link from "next/link";

export default function VoterLogin() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
      <Image src="/ECZ_Logo.png" alt="ECZ Logo" width={200} height={100} />
        <h1 className={styles.title}>ECZ - Online Voting System</h1>
        
        
        <div className={styles.container}>
          <h2 className={styles.tagline}>Voter Sign In</h2>
          
          <form className={styles.form}>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Voter ID" 
              required
            />
            
            <input 
              type="password" 
              className={styles.input} 
              placeholder="Password" 
              required
            />
            
            <Link href="/client/vote-candidates" className={styles.loginButton}>
              Login
            </Link>
          </form>
        </div>
      </main>
    </div>
  );
}