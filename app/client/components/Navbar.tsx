"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./Navbar.module.css";
import Link from "next/link";

interface VoterInfo {
  id: string;
  First_Name: string;
  Last_Name: string;
  NRC: string;
  Constituency: string;
  Ward: string;
  Email?: string;
}

export default function Navbar({ title }: { title: string }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [voter, setVoter] = useState<VoterInfo | null>(null);
  
  // Create properly typed refs
  const navMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Load voter data from localStorage
    const voterData = localStorage.getItem('voter');
    if (voterData) {
      setVoter(JSON.parse(voterData));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Close nav menu if clicked outside
      if (showNavMenu && 
          navMenuRef.current && 
          !navMenuRef.current.contains(target) &&
          menuButtonRef.current &&
          !menuButtonRef.current.contains(target)) {
        setShowNavMenu(false);
      }

      // Close profile menu if clicked outside
      if (showProfileMenu && 
          profileMenuRef.current && 
          !profileMenuRef.current.contains(target) &&
          profileButtonRef.current &&
          !profileButtonRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNavMenu, showProfileMenu]);

  const handleLogout = () => {
    // Clear any stored session data
    localStorage.removeItem('voterSession');
    sessionStorage.removeItem('voterSession');
    localStorage.removeItem('voter');
    localStorage.removeItem('selectedCandidates');
    
    // Redirect to login page
    window.location.href = '/client/login';
  };

  const handleViewProfile = () => {
    setShowProfileModal(true);
    setShowProfileMenu(false);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
  };

  return (
    <>
      <header className={styles.header}>
        <button
          ref={menuButtonRef}
          className={styles.menuButton}
          onClick={() => {
            setShowNavMenu(!showNavMenu);
            setShowProfileMenu(false);
          }}
        >
          ☰
        </button>
        <h1 className={styles.title}>{title}</h1>
        <button
          ref={profileButtonRef}
          className={styles.profileButton}
          onClick={() => {
            setShowProfileMenu(!showProfileMenu);
            setShowNavMenu(false);
          }}
        >
          👤
        </button>
      </header>

      {showNavMenu && (
        <div ref={navMenuRef} className={styles.navMenu}>
          <ul>
            <li>
              <Link href={"/client/options"}>Dashboard</Link>
            </li>
            <li>
              <Link href={"/client/live"}>Live</Link>
            </li>
            <li>
              <Link href={"/client/results"}>Results</Link>
            </li>
          </ul>
        </div>
      )}

      {showProfileMenu && (
        <div ref={profileMenuRef} className={styles.profileMenu}>
          <h3 className={styles.menuTitle}>Profile</h3>
          <ul>
            <li onClick={handleViewProfile}>View Profile</li>
            <li onClick={handleLogout}>Logout</li>
          </ul>
        </div>
      )}

      {showProfileModal && (
        <div className={styles.modalOverlay} onClick={closeProfileModal}>
          <div className={styles.profileModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Voter Profile</h2>
              <button className={styles.closeButton} onClick={closeProfileModal}>
                ✕
              </button>
            </div>
            
            <div className={styles.profileContent}>
              {voter ? (
                <>
                  <div className={styles.profileAvatar}>
                    <div className={styles.avatarPlaceholder}>
                      {voter.First_Name.charAt(0)}{voter.Last_Name.charAt(0)}
                    </div>
                  </div>
                  
                  <div className={styles.profileInfo}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Full Name:</span>
                      <span className={styles.infoValue}>{voter.First_Name} {voter.Last_Name}</span>
                    </div>
                    
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>NRC Number:</span>
                      <span className={styles.infoValue}>{voter.NRC}</span>
                    </div>
                    
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Constituency:</span>
                      <span className={styles.infoValue}>{voter.Constituency}</span>
                    </div>
                    
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Ward:</span>
                      <span className={styles.infoValue}>{voter.Ward}</span>
                    </div>
                    
                    {voter.Email && (
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Email:</span>
                        <span className={styles.infoValue}>{voter.Email}</span>
                      </div>
                    )}
                    
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Voter ID:</span>
                      <span className={styles.infoValue}>{voter.id}</span>
                    </div>
                  </div>
                  
                  <div className={styles.profileStatus}>
                    <div className={styles.statusCard}>
                      <div className={styles.statusIcon}>✅</div>
                      <div className={styles.statusInfo}>
                        <h4>Voter Status</h4>
                        <p>Active and Eligible to Vote</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.noProfileData}>
                  <p>No profile data available</p>
                </div>
              )}
            </div>
            
            <div className={styles.modalActions}>
              <button onClick={closeProfileModal} className={styles.closeModalButton}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}