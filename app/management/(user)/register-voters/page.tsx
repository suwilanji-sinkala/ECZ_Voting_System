"use client";
import Image from "next/image";
import { useRef, useState } from 'react';
import styles from "./page.module.css";
import Navbar from "../../components/Navbar";

export default function VotersList() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const idCounter = useRef(3); // Starting from 3 since we have 2 existing voters
  const [voters, setVoters] = useState([
    { id: '001W', name: 'Suwilanji Shikala', email: 'suwilanji@example.com', ward: 'Central Ward', constituency: 'Lusaka Central' },
    { id: '002W', name: 'John Banda', email: 'john@example.com', ward: 'North Ward', constituency: 'Ndola Central' }
  ]);
  const [newVoter, setNewVoter] = useState({
    name: '',
    nrc: '',
    ward: '',
    constituency: '',
    email: ''
  });

  const handleAddVoter = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    if (!newVoter.name || !newVoter.nrc) return;
    
    const nextId = `${String(idCounter.current).padStart(3, '0')}W`;
    idCounter.current += 1;
    
    const addedVoter = {
      id: nextId,
      name: newVoter.name,
      email: newVoter.email,
      ward: newVoter.ward,
      constituency: newVoter.constituency
    };
    
    setVoters([...voters, addedVoter]);
    setNewVoter({
      name: '',
      nrc: '',
      ward: '',
      constituency: '',
      email: ''
    });
  };

  const handleInputChange = (event: { target: { name: any; value: any; }; }) => {
    const { name, value } = event.target;
    setNewVoter(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.page}>
      {/* Header */}
       <Navbar title="Add Voter" />

      {/* Navigation Menu */}
      {showNavMenu && (
        <div className={styles.navMenu}>
          <ul>
            <li>Dashboard</li>
            <li>Candidate List</li>
            <li>Voter List</li>
          </ul>
        </div>
      )}

      {/* Main Content - Side by Side */}
      <div className={styles.contentContainer}>
        {/* Voter's List Section */}
        <div className={styles.tableSection}>
          <h2 className={styles.sectionTitle}>Voter's List</h2>
          <div className={styles.tableContainer}>
            <table className={styles.votersTable}>
              <thead>
                <tr>
                  <th>Year Id</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Ward</th>
                  <th>Constituency</th>
                </tr>
              </thead>
              <tbody>
                {voters.map((voter) => (
                  <tr key={voter.id}>
                    <td>{voter.id}</td>
                    <td>{voter.name}</td>
                    <td>{voter.email}</td>
                    <td>{voter.ward}</td>
                    <td>{voter.constituency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Voter Section */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Add Voter</h2>
          <form className={styles.formContainer} onSubmit={handleAddVoter}>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input 
                type="text" 
                name="name"
                value={newVoter.name}
                onChange={handleInputChange}
                placeholder="Enter Name" 
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>NRC</label>
              <input 
                type="text" 
                name="nrc"
                value={newVoter.nrc}
                onChange={handleInputChange}
                placeholder="Enter NRC" 
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Ward</label>
              <input 
                type="text" 
                name="ward"
                value={newVoter.ward}
                onChange={handleInputChange}
                placeholder="Enter Ward" 
              />
            </div>
            <div className={styles.formGroup}>
              <label>Constituency</label>
              <input 
                type="text" 
                name="constituency"
                value={newVoter.constituency}
                onChange={handleInputChange}
                placeholder="Enter Constituency" 
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input 
                type="email" 
                name="email"
                value={newVoter.email}
                onChange={handleInputChange}
                placeholder="Enter Email" 
              />
            </div>
            <button type="submit" className={styles.submitButton}>
              Add Voter
            </button>
          </form>
        </div>
      </div>

      {/* Profile Menu */}
      {showProfileMenu && (
        <div className={styles.profileMenu}>
         
          <ul>
            <li>Profile</li>
            <li>Settings</li>
            <li>Sign Out</li>
          </ul>
        </div>
      )}
    </div>
  );
}