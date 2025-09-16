"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./Navbar.module.css";
import Link from "next/link";

export default function Navbar({ title }: { title: string }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  
  // Create properly typed refs
  const navMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

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
          <h3 className={styles.menuTitle}>Status</h3>
          <ul>
            <li>Profile</li>
            <li>Settings</li>
            <li>Sign Out</li>
          </ul>
        </div>
      )}
    </>
  );
}