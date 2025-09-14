"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./Navbar.module.css";
import Link from "next/link";
import { useAuth } from './AuthProvider';

export default function Navbar({ title }: { title: string }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  
  // Create properly typed refs
  const navMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const { user, logout } = useAuth();

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
        {user ? (
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
        ) : (
          <Link href={"/login"}>Login</Link>
        )}
      </header>

      {showNavMenu && (
        <div ref={navMenuRef} className={styles.navMenu}>
          <ul>
            <li>
              <Link href={"/management/Dashboard"}>Dashboard</Link>
            </li>
            <li>
              <Link href={"/management/register-voters"}>Register Voter</Link>
            </li>
            <li>
              <Link href={"/management/register-candidate"}>Register Candidate</Link>
            </li>
            <li>
              <Link href={"/management/create-ward-district"}>Ward and District Management</Link>
            </li>
             <li>
              <Link href={"/management/create-elections"}>Create Elections</Link>
            </li>
          </ul>
        </div>
      )}

      {showProfileMenu && (
        <div ref={profileMenuRef} className={styles.profileMenu}>
          <ProfileMenu />
        </div>
      )}
    </>
  );
}

function ProfileMenu() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <h3 className={styles.menuTitle}>User Info</h3>
      {user && (
        <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
          <p><strong>{user.firstName} {user.lastName}</strong></p>
          <p>ID: {user.employeeId}</p>
          <p>Role: {user.role}</p>
        </div>
      )}
      <ul>
        <li>Profile</li>
        <li>Settings</li>
        <li>
          <button 
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              padding: 0,
              font: 'inherit'
            }}
          >
            Sign Out
          </button>
        </li>
      </ul>
    </>
  );
}