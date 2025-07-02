"use client";
import { useEffect, useRef, useState, Component, ReactNode } from "react";
import styles from "./page.module.css";
import Navbar from "../../components/Navbar";

interface Ward {
  Ward_Code: string;
  Ward_Name: string;
  constituency?: { Constituency_Name: string; Districts?: { District_Name: string } };
}

interface Party {
  Party_ID: number;
  Party_Name: string;
  Party_Acronym:	string;
	Slogan: string;
}

interface Position {
  Position_ID: number;
  Position_Name: string;
}

interface Candidate {
  Candidate_ID: number;
  FirstName: string;
  LastName: string;
  OtherName: string | null;
  NickName: string | null;
  Party_ID: number | null;
  Position_ID: number | null;
  Ward_Code: string | null;
  party?: Party | null;
  position?: Position | null;
  ward?: Ward | null;
  imageUrl?: string;
}

interface NewCandidate {
  name: string;
  otherName: string;
  nickName: string;
  party: Party | null;
  position: Position | null;
  ward: Ward | null;
  image: File | null;
}

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  state = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, textAlign: "center", color: "#dc3545" }}>
          <h3>Something went wrong</h3>
          <p>Please refresh the page and try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: "8px 16px", 
              backgroundColor: "#007bff", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function CandidateList() {
  // Modal states
  const [showWardModal, setShowWardModal] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);

  // Data
  const [wards, setWards] = useState<Ward[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // Search
  const [wardSearch, setWardSearch] = useState("");
  const [partySearch, setPartySearch] = useState("");
  const [positionSearch, setPositionSearch] = useState("");
  const [candidateSearch, setCandidateSearch] = useState<string>("");

  // New candidate state
  const [newCandidate, setNewCandidate] = useState<NewCandidate>({
    name: "",
    otherName: "",
    nickName: "",
    party: null,
    position: null,
    ward: null,
    image: null,
  });

  // Selected ward code for filtering
  const [selectedWardCode, setSelectedWardCode] = useState<string>("");

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataError, setDataError] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Safe data fetching function
  const fetchData = async (endpoint: string): Promise<any[]> => {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  };

  // Fetch all data on mount with improved error handling
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setDataError("");
      
      try {
        const [wardsData, partiesData, positionsData, candidatesData] = await Promise.all([
          fetchData("/api/ward"),
          fetchData("/api/party"),
          fetchData("/api/position"),
          fetchData("/api/candidate"),
        ]);

        console.log("Candidates Data:", candidatesData);
        console.log("Wards Data:", wardsData);
        console.log("Parties Data:", partiesData);
        console.log("Positions Data:", positionsData);
        
        setWards(wardsData);
        setParties(partiesData);
        setPositions(positionsData);
        
        // Validate and filter candidates data
        const validCandidates = candidatesData.filter(candidate => {
          if (!candidate || typeof candidate !== 'object') return false;
          if (!candidate.Candidate_ID || typeof candidate.FirstName !== 'string' || typeof candidate.LastName !== 'string') return false;
          return true;
        });
        
        setCandidates(validCandidates);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load data";
        setDataError(errorMessage);
        console.error("Data loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Modal filtered lists with error handling
  const filteredWards = wards.filter(w => {
    if (!w || !w.Ward_Code || !w.Ward_Name) return false;
    const searchLower = wardSearch.toLowerCase();
    return (
      w.Ward_Code.toLowerCase().includes(searchLower) ||
      w.Ward_Name.toLowerCase().includes(searchLower)
    );
  });

  const filteredParties = parties.filter(p => {
    if (!p || !p.Party_Name) return false;
    return p.Party_Name.toLowerCase().includes(partySearch.toLowerCase());
  });

  const filteredPositions = positions.filter(p => {
    if (!p || !p.Position_Name) return false;
    return p.Position_Name.toLowerCase().includes(positionSearch.toLowerCase());
  });

  // Candidate list filter with robust checks
  const displayedCandidates = candidates.filter(c => {
    if (!c) return false;
    
    // Ward filter
    //if (selectedWardCode && c.Ward_Code !== selectedWardCode) return false;
    
    // Search filter
    if (candidateSearch) {
      const searchLower = candidateSearch.toLowerCase();
      const firstName = (c.FirstName || "").toLowerCase();
      const lastName = (c.LastName || "").toLowerCase();
      const otherName = (c.OtherName || "").toLowerCase();
      const nickName = (c.NickName || "").toLowerCase();
      const partyName = (c.party?.Party_Name || "").toLowerCase();
      const positionName = (c.position?.Position_Name || "").toLowerCase();
      
      const matchesSearch = firstName.includes(searchLower) ||
                          lastName.includes(searchLower) ||
                          partyName.includes(searchLower) ||
                          positionName.includes(searchLower);
      
      if (!matchesSearch) return false;
    }
    
    return true;
  });

  // Modal openers with error clearing
  const openWardModal = () => {
    setSubmitError("");
    setShowWardModal(true);
  };
  const openPartyModal = () => {
    setSubmitError("");
    setShowPartyModal(true);
  };
  const openPositionModal = () => {
    setSubmitError("");
    setShowPositionModal(true);
  };

  // Modal closers
  const closeWardModal = () => {
    setShowWardModal(false);
    setWardSearch("");
  };
  const closePartyModal = () => {
    setShowPartyModal(false);
    setPartySearch("");
  };
  const closePositionModal = () => {
    setShowPositionModal(false);
    setPositionSearch("");
  };

  // Modal selectors with validation
  const handleWardSelect = (ward: Ward) => {
    if (!ward || !ward.Ward_Code) {
      setSubmitError("Invalid ward selected");
      return;
    }
    setNewCandidate(prev => ({ ...prev, ward }));
    setSelectedWardCode(ward.Ward_Code);
    closeWardModal();
  };

  const handlePartySelect = (party: Party) => {
    if (!party || !party.Party_ID) {
      setSubmitError("Invalid party selected");
      return;
    }
    setNewCandidate(prev => ({ ...prev, party }));
    closePartyModal();
  };

  const handlePositionSelect = (position: Position) => {
    if (!position || !position.Position_ID) {
      setSubmitError("Invalid position selected");
      return;
    }
    setNewCandidate(prev => ({ ...prev, position }));
    closePositionModal();
  };

  // Form input handlers with validation

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  
  // Map input names to state property names
  const fieldMap: { [key: string]: keyof NewCandidate } = {
    name: 'name',
    nickname: 'nickName', 
    othername: 'otherName'
  };
  
  // Update the corresponding field if it exists in our map
  if (fieldMap[name]) {
    setNewCandidate(prev => ({ 
      ...prev, 
      [fieldMap[name]]: value 
    }));
  }
  
  // Clear any existing error when user starts typing
  if (submitError) setSubmitError("");
};

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError("Image file size must be less than 5MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSubmitError("Please select a valid image file");
        return;
      }
      
      setNewCandidate(prev => ({ ...prev, image: file }));
      if (submitError) setSubmitError("");
    }
  };

  // Form validation with detailed error messages
  const validateForm = (): string | null => {
    if (!newCandidate.name.trim()) {
      return "Candidate name is required";
    }
    
    if (newCandidate.name.trim().length < 2) {
      return "Candidate name must be at least 2 characters long";
    }
    
    if (!newCandidate.party) {
      return "Party selection is required";
    }
    
    if (!newCandidate.position) {
      return "Position selection is required";
    }
    
    if (!newCandidate.ward) {
      return "Ward selection is required";
    }
    
    return null;
  };

  // Convert file to base64 with error handling
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsDataURL(file);
    });
  };

  // Add candidate handler with comprehensive error handling
  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Split name into first and last with validation
      const nameParts = newCandidate.name.trim().split(/\s+/);
      const FirstName = nameParts[0];
      const LastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      // Convert image to base64 if present
      let imageBase64: string | null = null;
      if (newCandidate.image) {
        try {
          imageBase64 = await fileToBase64(newCandidate.image);
        } catch (error) {
          throw new Error("Failed to process image file");
        }
      }

      // Prepare data for API with null checks
      const candidateData = {
        FirstName,
        LastName,
        Othername: newCandidate.otherName || null,
        AickName: newCandidate.nickName || null,
        Party_ID: newCandidate.party?.Party_ID || null,
        Ward_Code: newCandidate.ward?.Ward_Code || null,
        Position_ID: newCandidate.position?.Position_ID || null,
        Image: imageBase64,
      };

      const response = await fetch("/api/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candidateData),
      });

      if (!response.ok) {
        let errorMessage = "Failed to add candidate";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Add to local state
      const addedCandidate = await response.json();
      const newCandidateEntry: Candidate = {
        ...addedCandidate,
        party: newCandidate.party,
        position: newCandidate.position,
        ward: newCandidate.ward,
        imageUrl: imageBase64 || undefined,
      };

      setCandidates(prev => [...prev, newCandidateEntry]);

      // Reset form but keep ward selection
      setNewCandidate({
        name: "",
        otherName: "",
        nickName: "",
        party: null,
        position: null,
        ward: newCandidate.ward, // Keep ward for convenience
        image: null,
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Show success message briefly
      setSubmitError("");
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setSubmitError(errorMessage);
      console.error("Error adding candidate:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear ward selection
  const clearWardSelection = () => {
    setSelectedWardCode("");
    setNewCandidate(prev => ({ ...prev, ward: null, party: null, position: null }));
    setCandidateSearch("");
  };

  return (
    <ErrorBoundary>
      <div className={styles.page}>
        <Navbar title="Add Candidate" />

        <div className={styles.contentContainer}>
          {/* Data Error Display */}
          {dataError && (
            <div style={{
              marginBottom: 20,
              padding: 12,
              backgroundColor: "#f8d7da",
              color: "#721c24",
              border: "1px solid #f5c6cb",
              borderRadius: 4,
            }}>
              <strong>Error loading data:</strong> {dataError}
              <button
                onClick={() => window.location.reload()}
                style={{
                  marginLeft: 12,
                  padding: "4px 8px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Candidate List Section */}
          <div className={styles.tableSection}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}>
              <h2 className={styles.sectionTitle}>Candidate List</h2>
              {selectedWardCode && (
                <div>
                  <button
                    onClick={openWardModal}
                    className={styles.submitButton}
                    style={{ fontSize: 14, padding: "8px 16px", marginRight: 8 }}
                  >
                    Change Ward
                  </button>
                  <button
                    onClick={clearWardSelection}
                    style={{
                      fontSize: 14,
                      padding: "8px 16px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Clear Selection
                  </button>
                </div>
              )}
            </div>

            {selectedWardCode && newCandidate.ward && (
              <div style={{
                marginBottom: 16,
                padding: 12,
                backgroundColor: "#d4edda",
                borderRadius: 4,
                border: "1px solid #c3e6cb",
              }}>
                <strong>Selected Ward:</strong> {newCandidate.ward.Ward_Name} ({selectedWardCode})
                {newCandidate.ward.constituency && (
                  <>
                    {" - "}{newCandidate.ward.constituency.Constituency_Name}
                    {newCandidate.ward.constituency.Districts && 
                      `, ${newCandidate.ward.constituency.Districts.District_Name}`
                    }
                  </>
                )}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Search candidates by name, party, or position..."
                value={candidateSearch}
                onChange={e => setCandidateSearch(e.target.value)}
                className={styles.inputField}
                style={{ width: "100%", maxWidth: 350 }}
              />
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.votersTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Nickname</th>
                    <th>Party</th>
                    <th>Position</th>
                    <th>Ward</th>
                    <th>Image</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", color: "#666", padding: 20 }}>
                        Loading candidates...
                      </td>
                    </tr>
                  ) : displayedCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", color: "#888", padding: 20 }}>
                        {selectedWardCode
                          ? candidateSearch
                            ? "No candidates found matching your search."
                            : "No candidates found for this ward."
                          : "Please select a ward to view candidates."
                        }
                      </td>
                    </tr>
                  ) : (
                    displayedCandidates.map(candidate => (
                      <tr key={candidate.Candidate_ID}>
                        <td>{candidate.FirstName} {candidate.OtherName} {candidate.LastName}</td>
                        <td>{candidate.NickName}</td>
                        <td>{candidate.party?.Party_Name || "N/A"}</td>
                        <td>{candidate.position?.Position_Name || "N/A"}</td>
                        <td>{candidate.ward?.Ward_Name || candidate.Ward_Code || "N/A"}</td>
    
                        <td>
                          {candidate.imageUrl ? (
                            <img
                              src={candidate.imageUrl}
                              alt={`${candidate.FirstName} ${candidate.LastName}`}
                              style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling!.style.display = 'inline';
                              }}
                            />
                          ) : null}
                          <span 
                            style={{ 
                              color: "#bbb", 
                              display: candidate.imageUrl ? "none" : "inline" 
                            }}
                          >
                            No Image
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Candidate Section */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Add Candidate</h2>
            
            {!selectedWardCode && (
              <div style={{
                marginBottom: 16,
                padding: 12,
                backgroundColor: "#fff3cd",
                borderRadius: 4,
                border: "1px solid #ffeaa7",
              }}>
                <p style={{ margin: 0, color: "#856404" }}>
                  Please select a ward first to enable candidate registration.
                </p>
                <button
                  onClick={openWardModal}
                  className={styles.submitButton}
                  style={{ marginTop: 8, fontSize: 14, padding: "8px 16px" }}
                >
                  Select Ward
                </button>
              </div>
            )}

            <form className={styles.formContainer} onSubmit={handleAddCandidate}>
              <div className={styles.formGroup}>
                <label>Name (first surname)*</label>
                <input
                  type="text"
                  name="name"
                  value={newCandidate.name}
                  onChange={handleInputChange}
                  placeholder="Enter Full Name"
                  required
                  disabled={!selectedWardCode || isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Other Name</label>
                <input
                  type="text"
                  name="othername"
                  value={newCandidate.otherName}
                  onChange={handleInputChange}
                  placeholder="Enter Other Name"
                  disabled={!selectedWardCode || isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Alias Name (Nickname)</label>
                <input
                  type="text"
                  name="nickname"
                  value={newCandidate.nickName}
                  onChange={handleInputChange}
                  placeholder="Enter Other Name"
                  disabled={!selectedWardCode || isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Party *</label>
                <input
                  type="text"
                  name="party"
                  value={newCandidate.party?.Party_Name || ""}
                  readOnly
                  required
                  placeholder="Select Party"
                  onClick={openPartyModal}
                  style={{ backgroundColor: "#f8f9fa", cursor: selectedWardCode ? "pointer" : "not-allowed" }}
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Position *</label>
                <input
                  type="text"
                  name="position"
                  value={newCandidate.position?.Position_Name || ""}
                  readOnly
                  required
                  placeholder="Select Position"
                  onClick={openPositionModal}
                  style={{ backgroundColor: "#f8f9fa", cursor: selectedWardCode ? "pointer" : "not-allowed" }}
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Ward *</label>
                <input
                  type="text"
                  name="ward"
                  value={newCandidate.ward?.Ward_Name || ""}
                  readOnly
                  required
                  style={{ backgroundColor: "#f8f9fa", cursor: "pointer" }}
                  placeholder="Ward will be auto-filled"
                  onClick={openWardModal}
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Constituency</label>
                <input
                  type="text"
                  name="constituency"
                  value={newCandidate.ward?.constituency?.Constituency_Name || ""}
                  readOnly
                  style={{ backgroundColor: "#f8f9fa" }}
                  placeholder="Auto-filled"
                />
              </div>

              <div className={styles.formGroup}>
                <label>District</label>
                <input
                  type="text"
                  name="district"
                  value={newCandidate.ward?.constituency?.Districts?.District_Name || ""}
                  readOnly
                  style={{ backgroundColor: "#f8f9fa" }}
                  placeholder="Auto-filled"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Image (optional)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  name="image"
                  onChange={handleImageChange}
                  className={styles.fileInput}
                  accept="image/*"
                  disabled={isSubmitting}
                />
                <small style={{ color: "#666", fontSize: "12px" }}>
                  Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                </small>
              </div>

              {submitError && (
                <div style={{
                  color: "#721c24",
                  marginBottom: 16,
                  padding: 12,
                  backgroundColor: "#f8d7da",
                  borderRadius: 4,
                  border: "1px solid #f5c6cb",
                }}>
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                className={styles.submitButton}
                disabled={!selectedWardCode || isSubmitting}
              >
                {isSubmitting ? "Adding Candidate..." : "Add Candidate"}
              </button>
            </form>
          </div>
        </div>

        {/* Ward Modal */}
        {showWardModal && (
          <div className={styles.modalOverlay} onClick={closeWardModal}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}>
                <h5 style={{ margin: 0 }}>Select Ward</h5>
                <button
                  onClick={closeWardModal}
                  style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}
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
                style={{ marginBottom: 12, width: "100%" }}
                autoFocus
              />
              <div style={{ maxHeight: 300, overflowY: "auto", border: "1px solid #ddd", borderRadius: 4 }}>
                {filteredWards.length > 0 ? (
                  filteredWards.map(ward => (
                    <div
                      key={ward.Ward_Code}
                      className={styles.wardOption}
                      style={{
                        padding: 12,
                        cursor: "pointer",
                        borderBottom: "1px solid #eee",
                        backgroundColor: "white",
                      }}
                      onClick={() => handleWardSelect(ward)}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "white"}
                    >
                      <div>
                        <strong>{ward.Ward_Name}</strong>
                      </div>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        Code: {ward.Ward_Code}
                        {ward.constituency && (
                          <> | {ward.constituency.Constituency_Name}</>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: 16, textAlign: "center", color: "#666" }}>
                    {wardSearch ? "No wards found matching your search." : "No wards available."}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Party Modal */}
        {showPartyModal && (
          <div className={styles.modalOverlay} onClick={closePartyModal}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}>
                <h5 style={{ margin: 0 }}>Select Party</h5>
                <button
                  onClick={closePartyModal}
                  style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                placeholder="Search party by name..."
                value={partySearch}
                onChange={e => setPartySearch(e.target.value)}
                className={styles.inputField}
                style={{ marginBottom: 12, width: "100%" }}
                autoFocus
              />
              <div style={{ maxHeight: 300, overflowY: "auto", border: "1px solid #ddd", borderRadius: 4 }}>
                {filteredParties.length > 0 ? (
                  filteredParties.map(party => (
                    <div
                      key={party.Party_ID}
                      className={styles.wardOption}
                      style={{
                        padding: 12,
                        cursor: "pointer",
                        borderBottom: "1px solid #eee",
                        backgroundColor: "white",
                      }}
                      onClick={() => handlePartySelect(party)}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "white"}
                    >
                      <div>
                        <strong>{party.Party_Name}</strong>
                      </div>
                      <div>
                        <strong>{party.Party_Acronym}</strong>
                      </div>
                      <div>
                        <strong>{party.Slogan}</strong>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: 16, textAlign: "center", color: "#666" }}>
                    {partySearch ? "No parties found matching your search." : "No parties available."}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Position Modal */}
        {showPositionModal && (
          <div className={styles.modalOverlay} onClick={closePositionModal}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}>
                <h5 style={{ margin: 0 }}>Select Position</h5>
                <button
                  onClick={closePositionModal}
                  style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                placeholder="Search position by name..."
                value={positionSearch}
                onChange={e => setPositionSearch(e.target.value)}
                className={styles.inputField}
                style={{ marginBottom: 12, width: "100%" }}
                autoFocus
              />
              <div style={{ maxHeight: 300, overflowY: "auto", border: "1px solid #ddd", borderRadius: 4 }}>
                {filteredPositions.length > 0 ? (
                  filteredPositions.map(position => (
                    <div
                      key={position.Position_ID}
                      className={styles.wardOption}
                      style={{
                        padding: 12,
                        cursor: "pointer",
                        borderBottom: "1px solid #eee",
                        backgroundColor: "white",
                      }}
                      onClick={() => handlePositionSelect(position)}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "white"}
                    >
                      <div>
                        <strong>{position.Position_Name}</strong>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: 16, textAlign: "center", color: "#666" }}>
                    {positionSearch
                      ? "No positions found matching your search."
                      : "No positions available."}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}