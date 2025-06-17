"use client";
import { useState } from "react";
import styles from "./page.module.css";

// ✅ Define the type for the election state
type ElectionType = {
  title: string;
  date: string;
  positions: string[];
  selectedPositions: string[];
};

export default function CreateElection() {
  // ✅ Provide the type to useState
  const [election, setElection] = useState<ElectionType>({
    title: "",
    date: "",
    positions: ["President", "Member of Parliament", "Mayor", "Councilor"],
    selectedPositions: []
  });

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setElection(prev => ({ ...prev, [name]: value }));
  };

  const togglePosition = (position: string) => {
    setElection(prev => ({
      ...prev,
      selectedPositions: prev.selectedPositions.includes(position)
        ? prev.selectedPositions.filter(p => p !== position)
        : [...prev.selectedPositions, position]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating election:", election);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>ECZ - Online Voting System</h1>
        <button 
          className={styles.profileButton}
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          👤
        </button>
        {showProfileMenu && (
          <div className={styles.profileMenu}>
            <ul>
              <li>Profile</li>
              <li>Settings</li>
              <li>Sign Out</li>
            </ul>
          </div>
        )}
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Create Election</h1>
        
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <strong>Election Title</strong>
              <input
                type="text"
                name="title"
                value={election.title}
                onChange={handleInputChange}
                placeholder="Enter Title"
                className={styles.inputField}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <strong>Election Date</strong>
              <input
                type="date"
                name="date"
                value={election.date}
                onChange={handleInputChange}
                className={styles.inputField}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <strong>Positions</strong>
              <div className={styles.positionsList}>
                {election.positions.map(position => (
                  <div key={position} className={styles.positionItem}>
                    <input
                      type="checkbox"
                      id={position}
                      checked={election.selectedPositions.includes(position)}
                      onChange={() => togglePosition(position)}
                    />
                    <label htmlFor={position}>{position}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button type="button" className={styles.actionButton}>
                Cancel
              </button>
              <button type="submit" className={styles.actionButton}>
                Create Election
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
