"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./page.module.css";
import Navbar from "../../components/Navbar";

type Candidate = {
  id: number;
  name: string;
  party: string;
  position: string;
  imageUrl: string;
};

type NewCandidate = {
  name: string;
  party: string;
  position: string;
  image: File | null;
};

export default function CandidateList() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);

  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: 1, name: "Hakainde", party: "UPND", position: "President", imageUrl: "" },
    { id: 2, name: "Hichilema", party: "UNPND", position: "President", imageUrl: "" },
    { id: 3, name: "Hakainde Hichilema", party: "UPND", position: "President", imageUrl: "" }
  ]);

  const [newCandidate, setNewCandidate] = useState<NewCandidate>({
    name: "",
    party: "",
    position: "",
    image: null
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddCandidate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newCandidate.name || !newCandidate.party || !newCandidate.position) return;

    const newId = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1;

    const addedCandidate: Candidate = {
      id: newId,
      name: newCandidate.name,
      party: newCandidate.party,
      position: newCandidate.position,
      imageUrl: newCandidate.image ? URL.createObjectURL(newCandidate.image) : ""
    };

    setCandidates(prev => [...prev, addedCandidate]);

    setNewCandidate({
      name: "",
      party: "",
      position: "",
      image: null
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCandidate(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewCandidate(prev => ({
        ...prev,
        image: e.target.files![0]
      }));
    }
  };

  return (
    <div className={styles.page}>
      <Navbar title="Add Candidate" />

      {showNavMenu && (
        <div className={styles.navMenu}>
          <ul>
            <li>Dashboard</li>
            <li>Candidate List</li>
            <li>Voter List</li>
          </ul>
        </div>
      )}

      <div className={styles.contentContainer}>
        <div className={styles.listSection}>
          <h2 className={styles.sectionTitle}>Candidate List</h2>
          <div className={styles.candidateContainer}>
            <ul className={styles.candidateList}>
              {candidates.map(candidate => (
                <li key={candidate.id} className={styles.candidateItem}>
                  <div className={styles.candidateImageContainer}>
                    {candidate.imageUrl ? (
                      <img
                        src={candidate.imageUrl}
                        alt={candidate.name}
                        className={styles.candidateImage}
                      />
                    ) : (
                      <div className={styles.initials}>
                        {candidate.name
                          .split(" ")
                          .map(n => n[0])
                          .join("")}
                      </div>
                    )}
                  </div>
                  <div className={styles.candidateInfo}>
                    <span className={styles.candidateName}>{candidate.name}</span>
                    <span className={styles.candidateParty}>{candidate.party}</span>
                    <span className={styles.candidatePosition}>{candidate.position}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Add Candidate</h2>
          <form className={styles.formContainer} onSubmit={handleAddCandidate}>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={newCandidate.name}
                onChange={handleInputChange}
                placeholder="Enter Name"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Image</label>
              <input
                type="file"
                ref={fileInputRef}
                name="image"
                onChange={handleImageChange}
                className={styles.fileInput}
                accept="image/*"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Party</label>
              <input
                type="text"
                name="party"
                value={newCandidate.party}
                onChange={handleInputChange}
                placeholder="Enter Party Name"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Position</label>
              <input
                type="text"
                name="position"
                value={newCandidate.position}
                onChange={handleInputChange}
                placeholder="Enter Position"
                required
              />
            </div>
            <button type="submit" className={styles.submitButton}>
              Add Candidate
            </button>
          </form>
        </div>
      </div>

      {showProfileMenu && (
        <div className={styles.profileMenu}>
          <h3 className={styles.menuTitle}>Status</h3>
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
