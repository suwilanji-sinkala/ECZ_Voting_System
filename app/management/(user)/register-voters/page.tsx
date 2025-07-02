"use client";
import { useEffect, useRef, useState } from 'react';
import styles from "./page.module.css";
import Navbar from "../../components/Navbar";

interface Ward {
  Ward_Code: string;
  Ward_Name: string;
  constituency?: {
    Constituency_Name: string;
  };
  district?: {
    District_Name: string;
  };
}

interface Voter {
  id: string;
  name: string;
  email: string;
  nrc: string;
  ward: string;
  wardCode: string;
  constituency: string;
  district: string;
}

interface NewVoter {
  name: string;
  nrc: string;
  ward: string;
  wardCode: string;
  constituency: string;
  district: string;
  email: string;
}

export default function VotersList() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const idCounter = useRef(3);
  const [voters, setVoters] = useState<Voter[]>([
    { 
      id: '001W', 
      name: 'Suwilanji Shikala', 
      email: 'suwilanji@example.com', 
      nrc: '111111/11/1', 
      ward: 'Central Ward', 
      wardCode: '001W', 
      constituency: 'Lusaka Central', 
      district: 'Lusaka' 
    },
    { 
      id: '002W', 
      name: 'John Banda', 
      email: 'john@example.com', 
      nrc: '222222/22/2', 
      ward: 'North Ward', 
      wardCode: '002W', 
      constituency: 'Ndola Central', 
      district: 'Ndola' 
    }
  ]);
  
  const [newVoter, setNewVoter] = useState<NewVoter>({
    name: '',
    nrc: '',
    ward: '',
    wardCode: '',
    constituency: '',
    district: '',
    email: ''
  });
  
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Ward selection modal logic
  const [wards, setWards] = useState<Ward[]>([]);
  const [showWardModal, setShowWardModal] = useState(false); // Changed to false initially
  const [wardSearch, setWardSearch] = useState("");
  const [wardError, setWardError] = useState("");
  const [wardLoading, setWardLoading] = useState(false);

  // Voter search logic
  const [voterSearch, setVoterSearch] = useState("");

  // Store selected ward code for filtering
  const [selectedWardCode, setSelectedWardCode] = useState<string>("");

  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Fetch all wards for modal
  useEffect(() => {
    const fetchWards = async () => {
      setWardLoading(true);
      try {
        const res = await fetch("/api/ward");
        if (!res.ok) throw new Error("Failed to fetch wards");
        const data = await res.json();
        setWards(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching wards:", error);
        setWardError("Failed to load wards. Please try again.");
        setWards([]);
      } finally {
        setWardLoading(false);
      }
    };

    fetchWards();
  }, []);

  const filteredWards = wards.filter(
    w =>
      w.Ward_Code.toLowerCase().includes(wardSearch.toLowerCase()) ||
      w.Ward_Name.toLowerCase().includes(wardSearch.toLowerCase())
  );

  // Open ward selection modal
  const openWardModal = () => {
    setShowWardModal(true);
    setWardError("");
  };

  // When a ward is selected, fetch its full details
  const handleWardSelect = async (ward: Ward) => {
    try {
      setWardError("");
      const res = await fetch(`/api/ward?Ward_Code=${encodeURIComponent(ward.Ward_Code)}`);
      if (!res.ok) throw new Error("Ward not found");
      const data = await res.json();
      
      setNewVoter(prev => ({
        ...prev,
        ward: data.Ward_Name || ward.Ward_Name,
        wardCode: data.Ward_Code || ward.Ward_Code,
        constituency: data.constituency?.Constituency_Name || "",
        district: data.district?.District_Name || "",
      }));
      setSelectedWardCode(ward.Ward_Code);
      setShowWardModal(false);
      setWardSearch("");
    } catch (err) {
      console.error("Error selecting ward:", err);
      setWardError("Failed to fetch ward details. Please try again.");
    }
  };

  // Generate secure password
  const generatePassword = (nrc: string, firstName: string): string => {
    const nrcDigits = nrc.replace(/\D/g, "").slice(0, 6);
    const firstNamePart = firstName.slice(0, 3).toLowerCase();
    
    if (nrcDigits.length < 6) {
      throw new Error("NRC must contain at least 6 digits");
    }
    if (firstNamePart.length < 3) {
      throw new Error("First name must be at least 3 characters long");
    }
    
    return nrcDigits + firstNamePart;
  };

  // Validate form data
  const validateForm = (): string | null => {
    if (!newVoter.name.trim()) return "Name is required";
    if (!newVoter.nrc.trim()) return "NRC is required";
    if (!newVoter.ward) return "Ward must be selected";
    if (!newVoter.constituency) return "Constituency is required";
    if (!newVoter.district) return "District is required";
    if (newVoter.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newVoter.email)) {
      return "Please enter a valid email address";
    }
    
    // Check for duplicate NRC
    if (voters.some(v => v.nrc === newVoter.nrc)) {
      return "A voter with this NRC already exists";
    }
    
    return null;
  };

  const formDisabled = !newVoter.ward || !newVoter.constituency || !newVoter.district;

  const handleAddVoter = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Split name into first and last
      const nameParts = newVoter.name.trim().split(/\s+/);
      const First_Name = nameParts[0];
      const Last_Name = nameParts.slice(1).join(" ");

      // Generate password
      const password = generatePassword(newVoter.nrc, First_Name);

      const nextId = `${String(idCounter.current).padStart(3, '0')}W`;
      idCounter.current += 1;

      // Prepare data for API
      const voterData = {
        First_Name,
        Last_Name,
        NRC: parseInt(newVoter.nrc.replace(/\D/g, "")),
        Ward: newVoter.wardCode,
        Constituency: newVoter.constituency,
        Email: newVoter.email || null,
        id: nextId,
        passwordHash: password // In production, hash this on the server side!
      };

      const res = await fetch("/api/voter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voterData)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add voter");
      }

      // Success - show generated password
      setGeneratedPassword(password);
      setShowPasswordModal(true);

      // Add to local state
      const newVoterEntry: Voter = {
        id: nextId,
        name: newVoter.name,
        email: newVoter.email,
        nrc: newVoter.nrc,
        ward: newVoter.ward,
        wardCode: newVoter.wardCode,
        constituency: newVoter.constituency,
        district: newVoter.district,
      };

      setVoters(prev => [...prev, newVoterEntry]);
      
      // Reset form but keep ward info
      setNewVoter(prev => ({
        name: '',
        nrc: '',
        email: '',
        ward: prev.ward,
        wardCode: prev.wardCode,
        constituency: prev.constituency,
        district: prev.district,
      }));

    } catch (err) {
      console.error("Error adding voter:", err);
      setSubmitError(err instanceof Error ? err.message : "Failed to add voter. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewVoter(prev => ({ ...prev, [name]: value }));
    // Clear submit error when user starts typing
    if (submitError) setSubmitError("");
  };

  // Filter voters by selected ward and search query
  const displayedVoters = voters.filter(
    v => {
      const matchesWard = !selectedWardCode || v.wardCode === selectedWardCode;
      const matchesSearch = !voterSearch || 
        v.name.toLowerCase().includes(voterSearch.toLowerCase()) ||
        v.nrc?.toLowerCase().includes(voterSearch.toLowerCase()) ||
        v.email?.toLowerCase().includes(voterSearch.toLowerCase());
      
      return matchesWard && matchesSearch;
    }
  );

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setGeneratedPassword(null);
  };

  const closeWardModal = () => {
    setShowWardModal(false);
    setWardSearch("");
    setWardError("");
  };

  return (
    <div className={styles.page}>
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

      <div className={styles.contentContainer}>
        {/* Voter's List Section */}
        <div className={styles.tableSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 className={styles.sectionTitle}>Voter's List</h2>
            {selectedWardCode && (
              <button 
                onClick={openWardModal}
                className={styles.submitButton}
                style={{ fontSize: 14, padding: '8px 16px' }}
              >
                Change Ward
              </button>
            )}
          </div>
          
          {selectedWardCode && (
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f8f9fa', borderRadius: 4 }}>
              <strong>Selected Ward:</strong> {newVoter.ward} ({selectedWardCode}) - {newVoter.constituency}, {newVoter.district}
            </div>
          )}
          
          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Search voters by name, NRC, or email..."
              value={voterSearch}
              onChange={e => setVoterSearch(e.target.value)}
              className={styles.inputField}
              style={{ width: "100%", maxWidth: 350 }}
            />
          </div>
          
          <div className={styles.tableContainer}>
            <table className={styles.votersTable}>
              <thead>
                <tr>
                  <th>Year Id</th>
                  <th>Name</th>
                  <th>NRC</th>
                  <th>Email</th>
                  <th>Ward</th>
                  <th>Constituency</th>
                  <th>District</th>
                </tr>
              </thead>
              <tbody>
                {displayedVoters.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", color: "#888" }}>
                      {selectedWardCode ? "No voters found." : "Please select a ward to view voters."}
                    </td>
                  </tr>
                ) : (
                  displayedVoters.map((voter) => (
                    <tr key={voter.id}>
                      <td>{voter.id}</td>
                      <td>{voter.name}</td>
                      <td>{voter.nrc}</td>
                      <td>{voter.email || 'N/A'}</td>
                      <td>{voter.ward}</td>
                      <td>{voter.constituency}</td>
                      <td>{voter.district}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Voter Section */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Add Voter</h2>
          
          {!selectedWardCode && (
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#fff3cd', borderRadius: 4, border: '1px solid #ffeaa7' }}>
              <p style={{ margin: 0, color: '#856404' }}>
                Please select a ward first to enable voter registration.
              </p>
              <button 
                onClick={openWardModal}
                className={styles.submitButton}
                style={{ marginTop: 8, fontSize: 14, padding: '8px 16px' }}
              >
                Select Ward
              </button>
            </div>
          )}
          
          <form className={styles.formContainer} onSubmit={handleAddVoter}>
            <div className={styles.formGroup}>
              <label>Name *</label>
              <input 
                type="text" 
                name="name"
                value={newVoter.name}
                onChange={handleInputChange}
                placeholder="Enter Full Name" 
                required
                disabled={formDisabled || isSubmitting}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>NRC *</label>
              <input 
                type="text" 
                name="nrc"
                value={newVoter.nrc}
                onChange={handleInputChange}
                placeholder="Enter NRC (e.g., 123456/78/9)" 
                required
                disabled={formDisabled || isSubmitting}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Ward *</label>
              <input
                type="text"
                name="ward"
                value={newVoter.ward}
                readOnly
                required
                style={{ backgroundColor: "#f8f9fa" }}
                placeholder="Ward will be auto-filled"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Constituency *</label>
              <input
                type="text"
                name="constituency"
                value={newVoter.constituency}
                readOnly
                required
                style={{ backgroundColor: "#f8f9fa" }}
                placeholder="Constituency will be auto-filled"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>District *</label>
              <input
                type="text"
                name="district"
                value={newVoter.district}
                readOnly
                required
                style={{ backgroundColor: "#f8f9fa" }}
                placeholder="District will be auto-filled"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Email</label>
              <input 
                type="email" 
                name="email"
                value={newVoter.email}
                onChange={handleInputChange}
                placeholder="Enter Email (optional)" 
                disabled={formDisabled || isSubmitting}
              />
            </div>
            
            {submitError && (
              <div style={{ color: 'red', marginBottom: 16, padding: 8, backgroundColor: '#ffeaea', borderRadius: 4 }}>
                {submitError}
              </div>
            )}
            
            <button 
              type="submit" 
              className={styles.submitButton} 
              disabled={formDisabled || isSubmitting}
            >
              {isSubmitting ? 'Adding Voter...' : 'Add Voter'}
            </button>
          </form>
        </div>
      </div>

      {/* Ward Selection Modal */}
      {showWardModal && (
        <div className={styles.modalOverlay} onClick={closeWardModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h5 style={{ margin: 0 }}>Select Ward</h5>
              <button 
                onClick={closeWardModal}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Search ward by name or code..."
              value={wardSearch}
              onChange={e => setWardSearch(e.target.value)}
              className={styles.inputField}
              style={{ marginBottom: 12, width: '100%' }}
              autoFocus
            />
            
            <div style={{ maxHeight: 300, overflowY: "auto", border: '1px solid #ddd', borderRadius: 4 }}>
              {wardLoading ? (
                <div style={{ padding: 16, textAlign: 'center' }}>Loading wards...</div>
              ) : filteredWards.length > 0 ? (
                filteredWards.map(ward => (
                  <div
                    key={ward.Ward_Code}
                    className={styles.wardOption}
                    style={{ 
                      padding: 12, 
                      cursor: "pointer", 
                      borderBottom: "1px solid #eee"
                    }}
                    onClick={() => handleWardSelect(ward)}
                  >
                    <div><strong>{ward.Ward_Name}</strong></div>
                    <div style={{ fontSize: 12, color: '#666' }}>Code: {ward.Ward_Code}</div>
                  </div>
                ))
              ) : (
                <div style={{ padding: 16, textAlign: 'center', color: '#666' }}>
                  {wardSearch ? 'No wards found matching your search.' : 'No wards available.'}
                </div>
              )}
            </div>
            
            {wardError && (
              <div style={{ color: "red", marginTop: 12, padding: 8, backgroundColor: '#ffeaea', borderRadius: 4 }}>
                {wardError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Password Display Modal */}
      {showPasswordModal && generatedPassword && (
        <div className={styles.modalOverlay} onClick={closePasswordModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h5>Voter Added Successfully!</h5>
            <p>The generated password for the voter is:</p>
            <div style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              padding: 16, 
              backgroundColor: '#f8f9fa', 
              borderRadius: 4, 
              textAlign: 'center',
              marginBottom: 16
            }}>
              {generatedPassword}
            </div>
            <p style={{ fontSize: 12, color: '#666' }}>
              Please share this password with the voter. For security reasons, this password will not be shown again.
            </p>
            <button onClick={closePasswordModal} className={styles.submitButton}>
              Close
            </button>
          </div>
        </div>
      )}

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