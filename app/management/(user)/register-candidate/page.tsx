"use client";
import { useEffect, useRef, useState, Component, ReactNode } from "react";
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

interface Party {
  Party_ID: number;
  Party_Name: string;
  Party_Acronym: string;
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
  OtherName: string | null; // Frontend display name
  NickName: string | null; // Frontend display name
  Othername?: string | null; // API field name
  AliasName?: string | null; // API field name
  Party_ID: number | null;
  Position_ID: number | null;
  Ward_Code: string | null;
  party?: Party | null;
  position?: Position | null;
  ward?: Ward | null;
  imageUrl?: string;
}

interface Election {
  Election_ID: number;
  title: string;
  Description: string | null;
  StartDate: string;
  EndDate: string;
  Status: string;
  Year: number;
  Election_Type: string;
  positions: Position[];
}

interface NewCandidate {
  name: string;
  otherName: string;
  nickName: string;
  party: Party | null;
  position: Position | null;
  ward: Ward | null;
  election: Election | null;
  image: File | null;
}

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
  // Tab state
  const [activeTab, setActiveTab] = useState<"register" | "view">("register");

  // Modal states
  const [showWardModal, setShowWardModal] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);

  // Data
  const [wards, setWards] = useState<Ward[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [draftElections, setDraftElections] = useState<Election[]>([]);

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
    election: null,
    image: null,
  });

  // Selected ward code for filtering
  const [selectedWardCode, setSelectedWardCode] = useState<string>("");

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [wardLoading, setWardLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataError, setDataError] = useState("");
  const [wardError, setWardError] = useState("");

  // Edit/Delete states
  const [editCandidateId, setEditCandidateId] = useState<number | null>(null);
  const [editCandidateData, setEditCandidateData] = useState<Partial<Candidate>>({});
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const candidatesPerPage = 10;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch data with error handling
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

  // 1. Fetch draft elections on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setDataError("");
      setWardLoading(true);
      try {
        const [wardsData, partiesData, positionsData, candidatesData, draftElectionsData] = await Promise.all([
          fetchData("/api/ward"),
          fetchData("/api/party"),
          fetchData("/api/position"),
          fetchData("/api/candidate"),
          fetchData("/api/elections"),
        ]);
        setWards(wardsData);
        setParties(partiesData);
        setPositions(positionsData);
        setDraftElections(draftElectionsData);
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
        setWardLoading(false);
      }
    };
    loadData();
  }, []);

  // 2. Step logic for registration
  const handleElectionSelect = (election: Election) => {
    setNewCandidate({
      ...newCandidate,
      election,
      position: null, // reset position and ward when election changes
      ward: null,
    });
  };
  const handlePositionSelect = (position: Position) => {
    setNewCandidate({
      ...newCandidate,
      position,
      ward: null, // reset ward when position changes
    });
  };
  const handleWardSelect = (ward: Ward) => {
    setNewCandidate({
      ...newCandidate,
      ward,
    });
  };
  const handlePartySelect = (party: Party) => {
    setNewCandidate({
      ...newCandidate,
      party,
    });
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCandidate({
      ...newCandidate,
      [name]: value,
    });
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewCandidate({
      ...newCandidate,
      image: file,
    });
  };

  // File to base64 conversion
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

  // 3. Form submission
  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    try {
      if (!newCandidate.election || !newCandidate.position || !newCandidate.ward) {
        setSubmitError("Please select election, position, and ward.");
        setIsSubmitting(false);
        return;
      }
      const payload: any = {
        FirstName: newCandidate.name,
        LastName: newCandidate.name,
        Othername: newCandidate.otherName,
        AliasName: newCandidate.nickName,
        Party_ID: newCandidate.party?.Party_ID || null,
        Position_ID: newCandidate.position.Position_ID,
        Ward_Code: newCandidate.ward.Ward_Code,
        Election_ID: newCandidate.election.Election_ID,
      };
      if (newCandidate.image) {
        const base64 = await fileToBase64(newCandidate.image);
        payload.Image = base64;
      }
      const response = await fetch("/api/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setSubmitError(errorData.message || "Failed to add candidate");
        setIsSubmitting(false);
        return;
      }
      // Refresh candidate list
      const candidatesData = await fetchData("/api/candidate");
      setCandidates(candidatesData);
      // Reset form
      setNewCandidate({
        name: "",
        otherName: "",
        nickName: "",
        party: null,
        position: null,
        ward: null,
        election: null,
        image: null,
      });
      setIsSubmitting(false);
    } catch (error) {
      setSubmitError("Failed to add candidate");
      setIsSubmitting(false);
    }
  };

  // Filtered lists
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

  // Candidate list filter
  const filteredCandidates = candidates.filter(c => {
    if (!c) return false;
    
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

  // Pagination logic
  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);
  const displayedCandidates = filteredCandidates.slice(
    (currentPage - 1) * candidatesPerPage,
    currentPage * candidatesPerPage
  );

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Modal handlers
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

  const closeWardModal = () => {
    setShowWardModal(false);
    setWardSearch("");
    setWardError("");
  };

  const closePartyModal = () => {
    setShowPartyModal(false);
    setPartySearch("");
  };

  const closePositionModal = () => {
    setShowPositionModal(false);
    setPositionSearch("");
  };

  // Handle candidate search with pagination reset
  const handleCandidateSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCandidateSearch(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Clear ward selection
  const clearWardSelection = () => {
    setSelectedWardCode("");
    setNewCandidate(prev => ({
      ...prev,
      ward: null,
    }));
    setCurrentPage(1); // Reset to first page when ward is cleared
  };

  // Edit handlers
  const startEditCandidate = (candidateId: number) => {
    const candidate = candidates.find(c => c.Candidate_ID === candidateId);
    if (candidate) {
      setEditCandidateId(candidateId);
      setEditCandidateData({
        FirstName: candidate.FirstName,
        LastName: candidate.LastName,
        Othername: candidate.OtherName, // Map to correct API field name
        AliasName: candidate.NickName, // Map to correct API field name
        Party_ID: candidate.Party_ID,
        Position_ID: candidate.Position_ID,
        Ward_Code: candidate.Ward_Code,
      });
      setEditError("");
      setEditSuccess("");
    }
  };

  const cancelEditCandidate = () => {
    setEditCandidateId(null);
    setEditCandidateData({});
    setEditImageFile(null);
    setEditError("");
    setEditSuccess("");
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditCandidateData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
    }
  };

  const saveEditCandidate = async () => {
    if (!editCandidateId) return;
    
    setEditError("");
    setEditSuccess("");
    try {
      // Prepare update data
      const updateData = { ...editCandidateData };
      
      // Handle image upload if a new image was selected
      if (editImageFile) {
        const imageBase64 = await fileToBase64(editImageFile);
        (updateData as any).Image = imageBase64;
      }
      

      
      const res = await fetch("/api/candidate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Candidate_ID: editCandidateId,
          ...updateData,
        }),
      });
      
      if (!res.ok) {
        let errorMessage = "Failed to update candidate";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${res.status} ${res.statusText}`;
        }
        setEditError(errorMessage);
        return;
      }

      const updatedCandidate = await res.json();

      // Update the candidate in local state directly - map all fields properly
      setCandidates(prevCandidates => 
        prevCandidates.map(candidate => 
          candidate.Candidate_ID === editCandidateId 
            ? {
                ...candidate,
                FirstName: updatedCandidate.FirstName,
                LastName: updatedCandidate.LastName,
                OtherName: updatedCandidate.Othername, // Map back to frontend display field
                NickName: updatedCandidate.AliasName, // Map back to frontend display field
                Othername: updatedCandidate.Othername,
                AliasName: updatedCandidate.AliasName,
                Party_ID: updatedCandidate.Party_ID,
                Position_ID: updatedCandidate.Position_ID,
                Ward_Code: updatedCandidate.Ward_Code,
                party: updatedCandidate.party,
                position: updatedCandidate.position,
                ward: updatedCandidate.ward,
                imageUrl: updatedCandidate.imageUrl
              }
            : candidate
        )
      );
      
      setEditSuccess("Candidate updated successfully!");
      setEditCandidateId(null);
      setEditCandidateData({});
      setEditImageFile(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setEditSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Error updating candidate:", error);
      setEditError("Failed to update candidate");
    }
  };

  // Delete handler
  const deleteCandidate = async (candidateId: number) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) return;
    
    setDeleteLoadingId(candidateId);
    setDeleteError("");
    
    try {
      const res = await fetch("/api/candidate", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Candidate_ID: candidateId }),
      });
      
      if (!res.ok) {
        let errorMessage = "Failed to delete candidate";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${res.status} ${res.statusText}`;
        }
        setDeleteError(errorMessage);
        setDeleteLoadingId(null);
        return;
      }
      
      // Remove from local state
      setCandidates(prev => prev.filter(c => c.Candidate_ID !== candidateId));
      setDeleteLoadingId(null);
    } catch (error) {
      setDeleteError("Failed to delete candidate");
      setDeleteLoadingId(null);
    }
  };

  return (
    <ErrorBoundary>
      <div className={styles.page}>
        <Navbar title="Register Candidate" />

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

          {/* Tabs */}
          <div className={styles.container}>
            <ul className={styles.nav}>
              <li className={styles.navItem}>
                <button
                  className={`${styles.navLink}${activeTab === "register" ? ` ${styles.active}` : ""}`}
                  onClick={() => setActiveTab("register")}
                >
                  Register Candidate
                </button>
              </li>
              <li className={styles.navItem}>
                <button
                  className={`${styles.navLink}${activeTab === "view" ? ` ${styles.active}` : ""}`}
                  onClick={() => setActiveTab("view")}
                >
                  View Candidates
                </button>
              </li>
            </ul>

            {/* Tab Content */}
            {activeTab === "register" && (
              <div className={styles.row}>
                {/* Form Section */}
                <div className={styles.colLg8}>
                  <div className={`${styles.card} ${styles.shadow} ${styles.fadeIn} ${styles.zoomIn}`}>
                    <div className={styles.cardBody}>
                      <div className="d-flex align-items-center gap-3 mb-4">
                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3">
                          <i className="fas fa-user-plus fa-lg"></i>
                        </div>
                        <h2 className="h4 text-primary mb-0">Register New Candidate</h2>
                      </div>
                      
                      {/* Step-by-step form */}
                      <div style={{ marginBottom: 30 }}>
                        {/* Step 1: Select Election */}
                        <div style={{ marginBottom: 20 }}>
                          <h3 style={{ marginBottom: 10, color: "#333" }}>Step 1: Select Election</h3>
                          {draftElections.length === 0 ? (
                            <div style={{ padding: 12, backgroundColor: "#fff3cd", border: "1px solid #ffeaa7", borderRadius: 4 }}>
                              No draft elections available. Please create an election first.
                            </div>
                          ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
                              {draftElections.map((election) => (
                                <div
                                  key={election.Election_ID}
                                  onClick={() => handleElectionSelect(election)}
                                  style={{
                                    padding: 16,
                                    border: newCandidate.election?.Election_ID === election.Election_ID 
                                      ? "2px solid #007bff" 
                                      : "1px solid #ddd",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    backgroundColor: newCandidate.election?.Election_ID === election.Election_ID 
                                      ? "#f8f9ff" 
                                      : "#fff",
                                    transition: "all 0.2s",
                                  }}
                                >
                                  <h4 style={{ margin: "0 0 8px 0", color: "#333" }}>{election.title}</h4>
                                  <p style={{ margin: "0 0 4px 0", fontSize: 14, color: "#666" }}>
                                    {election.Description}
                                  </p>
                                  <p style={{ margin: "0 0 4px 0", fontSize: 12, color: "#888" }}>
                                    {election.StartDate} - {election.EndDate}
                                  </p>
                                  <p style={{ margin: 0, fontSize: 12, color: "#007bff" }}>
                                    {election.positions.length} positions available
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Step 2: Select Position */}
                        {newCandidate.election && (
                          <div style={{ marginBottom: 20 }}>
                            <h3 style={{ marginBottom: 10, color: "#333" }}>Step 2: Select Position</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                              {newCandidate.election.positions.map((position) => (
                                <div
                                  key={position.Position_ID}
                                  onClick={() => handlePositionSelect(position)}
                                  style={{
                                    padding: 12,
                                    border: newCandidate.position?.Position_ID === position.Position_ID 
                                      ? "2px solid #28a745" 
                                      : "1px solid #ddd",
                                    borderRadius: 6,
                                    cursor: "pointer",
                                    backgroundColor: newCandidate.position?.Position_ID === position.Position_ID 
                                      ? "#f8fff8" 
                                      : "#fff",
                                    textAlign: "center",
                                    transition: "all 0.2s",
                                  }}
                                >
                                  {position.Position_Name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Step 3: Select Ward */}
                        {newCandidate.position && (
                          <div style={{ marginBottom: 20 }}>
                            <h3 style={{ marginBottom: 10, color: "#333" }}>Step 3: Select Ward</h3>
                            <div style={{ marginBottom: 10 }}>
                              <input
                                type="text"
                                placeholder="Search wards..."
                                value={wardSearch}
                                onChange={(e) => setWardSearch(e.target.value)}
                                className={styles.inputField}
                                style={{ width: "100%", maxWidth: 300 }}
                              />
                            </div>
                            <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #ddd", borderRadius: 4 }}>
                              {filteredWards.slice(0, 20).map((ward) => (
                                <div
                                  key={ward.Ward_Code}
                                  onClick={() => handleWardSelect(ward)}
                                  style={{
                                    padding: 12,
                                    borderBottom: "1px solid #eee",
                                    cursor: "pointer",
                                    backgroundColor: newCandidate.ward?.Ward_Code === ward.Ward_Code 
                                      ? "#e8f5e8" 
                                      : "#fff",
                                  }}
                                >
                                  <div style={{ fontWeight: "bold" }}>{ward.Ward_Name}</div>
                                  <div style={{ fontSize: 12, color: "#666" }}>{ward.Ward_Code}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Step 4: Candidate Details */}
                        {newCandidate.ward && (
                          <div style={{ marginBottom: 20 }}>
                            <h3 style={{ marginBottom: 10, color: "#333" }}>Step 4: Candidate Details</h3>
                            
                            <form onSubmit={handleAddCandidate}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                                <div>
                                  <label style={{ display: "block", marginBottom: 4, fontWeight: "bold" }}>
                                    First Name *
                                  </label>
                                  <input
                                    type="text"
                                    name="name"
                                    value={newCandidate.name}
                                    onChange={handleInputChange}
                                    className={styles.inputField}
                                    required
                                  />
                                </div>
                                <div>
                                  <label style={{ display: "block", marginBottom: 4, fontWeight: "bold" }}>
                                    Other Name
                                  </label>
                                  <input
                                    type="text"
                                    name="otherName"
                                    value={newCandidate.otherName}
                                    onChange={handleInputChange}
                                    className={styles.inputField}
                                  />
                                </div>
                              </div>

                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4, fontWeight: "bold" }}>
                                  Nickname/Alias
                                </label>
                                <input
                                  type="text"
                                  name="nickName"
                                  value={newCandidate.nickName}
                                  onChange={handleInputChange}
                                  className={styles.inputField}
                                />
                              </div>

                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4, fontWeight: "bold" }}>
                                  Party
                                </label>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                  <input
                                    type="text"
                                    placeholder="Select party..."
                                    value={newCandidate.party?.Party_Name || ""}
                                    readOnly
                                    className={styles.inputField}
                                    style={{ flex: 1 }}
                                  />
                                  <button
                                    type="button"
                                    onClick={openPartyModal}
                                    className={styles.actionButton}
                                    style={{ padding: "8px 12px" }}
                                  >
                                    Select
                                  </button>
                                </div>
                              </div>

                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4, fontWeight: "bold" }}>
                                  Profile Image
                                </label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  ref={fileInputRef}
                                  className={styles.inputField}
                                />
                              </div>

                              {submitError && (
                                <div style={{ 
                                  marginBottom: 16, 
                                  padding: 12, 
                                  backgroundColor: "#f8d7da", 
                                  color: "#721c24", 
                                  border: "1px solid #f5c6cb", 
                                  borderRadius: 4 
                                }}>
                                  {submitError}
                                </div>
                              )}

                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className={styles.submitButton}
                                style={{ width: "100%" }}
                              >
                                {isSubmitting ? "Registering..." : "Register Candidate"}
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="col-lg-4">
                  <div className="card shadow fade-in zoom-in">
                    <div className="card-body">
                      <div className="d-flex align-items-center gap-3 mb-4">
                        <div className="bg-info bg-opacity-10 text-info rounded-circle p-3">
                          <i className="fas fa-info-circle fa-lg"></i>
                        </div>
                        <h2 className="h5 mb-0">Registration Guide</h2>
                      </div>
                      
                      <div className="mb-3">
                        <h6 className="text-primary">Step-by-Step Process:</h6>
                        <ol className="small text-secondary">
                          <li>Select a draft election</li>
                          <li>Choose a position from that election</li>
                          <li>Select a ward for the candidate</li>
                          <li>Fill in candidate details</li>
                          <li>Upload profile image (optional)</li>
                        </ol>
                      </div>

                      <div className="alert alert-primary mt-3 mb-0" role="alert">
                        <i className="fas fa-lightbulb me-2"></i>
                        <strong>Tip:</strong> Make sure to select a draft election first, as positions are specific to each election.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View Candidates Tab */}
            {activeTab === "view" && (
              <div className="row g-4">
                <div className="col-12">
                  <div className="card shadow fade-in zoom-in">
                    <div className="card-body">
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                        <h2 className="h4 text-primary mb-0">Registered Candidates</h2>
                        <div className="input-group w-100 w-md-auto" style={{ maxWidth: 300 }}>
                          <span className="input-group-text bg-white border-end-0">
                            <i className="fas fa-search text-secondary"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control border-start-0"
                            placeholder="Search candidates..."
                            value={candidateSearch}
                            onChange={handleCandidateSearch}
                          />
                        </div>
                      </div>

                      {loading ? (
                        <div className="text-center text-secondary py-4">
                          <i className="fas fa-spinner fa-spin me-2"></i>
                          Loading candidates...
                        </div>
                      ) : displayedCandidates.length === 0 ? (
                        <div className="text-center text-secondary py-4">
                          <div className="mb-2">👥</div>
                          <div className="fw-bold">No candidates found</div>
                          <div className="small">
                            {candidateSearch 
                              ? "Try adjusting your search terms" 
                              : "Register your first candidate using the Register Candidate tab"
                            }
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="table-responsive">
                            <table className="table table-hover align-middle">
                              <thead className="table-light">
                                <tr>
                                  <th>Name</th>
                                  <th>Party</th>
                                  <th>Position</th>
                                  <th>Ward</th>
                                  <th className="text-end">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {displayedCandidates.map((candidate: any) => (
                                  <tr key={candidate.Candidate_ID}>
                                    <td>
                                      <div className="d-flex align-items-center gap-3">
                                        {candidate.imageUrl ? (
                                          <img
                                            src={candidate.imageUrl}
                                            alt="Candidate"
                                            className="rounded-circle"
                                            style={{ width: 40, height: 40, objectFit: "cover" }}
                                          />
                                        ) : (
                                          <div 
                                            className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                                            style={{ width: 40, height: 40, fontSize: '14px', fontWeight: 'bold' }}
                                          >
                                            {candidate.FirstName?.charAt(0)}{candidate.LastName?.charAt(0)}
                                          </div>
                                        )}
                                        <div>
                                          <div className="fw-bold">
                                            {candidate.FirstName} {candidate.LastName}
                                          </div>
                                          {candidate.OtherName && (
                                            <div className="small text-secondary">{candidate.OtherName}</div>
                                          )}
                                          {candidate.AliasName && (
                                            <div className="small text-primary">"{candidate.AliasName}"</div>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      <span className="badge bg-primary">
                                        {candidate.party?.Party_Name || "Independent"}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="text-secondary">
                                        {candidate.position?.Position_Name || "N/A"}
                                      </span>
                                    </td>
                                    <td>
                                      <div>
                                        <div className="fw-bold">{candidate.ward?.Ward_Name || "N/A"}</div>
                                        {candidate.ward?.constituency && (
                                          <div className="small text-secondary">
                                            {candidate.ward.constituency.Constituency_Name}
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td className="text-end">
                                      <button
                                        onClick={() => startEditCandidate(candidate.Candidate_ID)}
                                        className="btn btn-link text-primary btn-sm me-2"
                                      >
                                        <i className="fas fa-edit"></i> Edit
                                      </button>
                                      <button
                                        onClick={() => deleteCandidate(candidate.Candidate_ID)}
                                        disabled={deleteLoadingId === candidate.Candidate_ID}
                                        className="btn btn-link text-danger btn-sm"
                                      >
                                        {deleteLoadingId === candidate.Candidate_ID ? (
                                          <i className="fas fa-spinner fa-spin"></i>
                                        ) : (
                                          <i className="fas fa-trash"></i>
                                        )} Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination */}
                          {totalPages > 1 && (
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
                              <div className="text-secondary small text-center text-md-start">
                                Showing{" "}
                                <span className="fw-bold">
                                  {(currentPage - 1) * candidatesPerPage + 1}
                                </span>{" "}
                                to{" "}
                                <span className="fw-bold">
                                  {Math.min(currentPage * candidatesPerPage, filteredCandidates.length)}
                                </span>{" "}
                                of{" "}
                                <span className="fw-bold">
                                  {filteredCandidates.length}
                                </span>{" "}
                                results
                              </div>
                              <nav>
                                <ul className="pagination justify-content-end flex-wrap">
                                  <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
                                    <button 
                                      className="page-link" 
                                      onClick={goToPrevPage} 
                                      disabled={currentPage === 1}
                                    >
                                      <i className="fas fa-chevron-left"></i>
                                    </button>
                                  </li>
                                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                      pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                      pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                      pageNum = totalPages - 4 + i;
                                    } else {
                                      pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                      <li key={pageNum} className={`page-item${pageNum === currentPage ? " active" : ""}`}>
                                        <button 
                                          className="page-link" 
                                          onClick={() => goToPage(pageNum)}
                                        >
                                          {pageNum}
                                        </button>
                                      </li>
                                    );
                                  })}
                                  <li className={`page-item${currentPage === totalPages || totalPages === 0 ? " disabled" : ""}`}>
                                    <button 
                                      className="page-link" 
                                      onClick={goToNextPage} 
                                      disabled={currentPage === totalPages || totalPages === 0}
                                    >
                                      <i className="fas fa-chevron-right"></i>
                                    </button>
                                  </li>
                                </ul>
                              </nav>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modals */}
          {/* Ward Selection Modal */}
          {showWardModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h3>Select Ward</h3>
                  <button onClick={closeWardModal} className={styles.closeButton}>
                    ×
                  </button>
                </div>
                <div className={styles.modalBody}>
                  <input
                    type="text"
                    placeholder="Search wards..."
                    value={wardSearch}
                    onChange={(e) => setWardSearch(e.target.value)}
                    className={styles.inputField}
                    style={{ marginBottom: 16 }}
                  />
                  {wardError && (
                    <div style={{ color: "#dc3545", marginBottom: 16 }}>{wardError}</div>
                  )}
                  <div style={{ maxHeight: 300, overflowY: "auto" }}>
                    {filteredWards.map((ward) => (
                      <div
                        key={ward.Ward_Code}
                        onClick={() => handleWardSelect(ward)}
                        style={{
                          padding: 12,
                          border: "1px solid #ddd",
                          marginBottom: 8,
                          borderRadius: 4,
                          cursor: "pointer",
                          backgroundColor: "#fff",
                        }}
                      >
                        <div style={{ fontWeight: "bold" }}>{ward.Ward_Name}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>{ward.Ward_Code}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Party Selection Modal */}
          {showPartyModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h3>Select Party</h3>
                  <button onClick={closePartyModal} className={styles.closeButton}>
                    ×
                  </button>
                </div>
                <div className={styles.modalBody}>
                  <input
                    type="text"
                    placeholder="Search parties..."
                    value={partySearch}
                    onChange={(e) => setPartySearch(e.target.value)}
                    className={styles.inputField}
                    style={{ marginBottom: 16 }}
                  />
                  <div style={{ maxHeight: 300, overflowY: "auto" }}>
                    {filteredParties.map((party) => (
                      <div
                        key={party.Party_ID}
                        onClick={() => handlePartySelect(party)}
                        style={{
                          padding: 12,
                          border: "1px solid #ddd",
                          marginBottom: 8,
                          borderRadius: 4,
                          cursor: "pointer",
                          backgroundColor: "#fff",
                        }}
                      >
                        <div style={{ fontWeight: "bold" }}>{party.Party_Name}</div>
                        {party.Party_Acronym && (
                          <div style={{ fontSize: 12, color: "#666" }}>{party.Party_Acronym}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Position Selection Modal */}
          {showPositionModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h3>Select Position</h3>
                  <button onClick={closePositionModal} className={styles.closeButton}>
                    ×
                  </button>
                </div>
                <div className={styles.modalBody}>
                  <input
                    type="text"
                    placeholder="Search positions..."
                    value={positionSearch}
                    onChange={(e) => setPositionSearch(e.target.value)}
                    className={styles.inputField}
                    style={{ marginBottom: 16 }}
                  />
                  <div style={{ maxHeight: 300, overflowY: "auto" }}>
                    {filteredPositions.map((position) => (
                      <div
                        key={position.Position_ID}
                        onClick={() => handlePositionSelect(position)}
                        style={{
                          padding: 12,
                          border: "1px solid #ddd",
                          marginBottom: 8,
                          borderRadius: 4,
                          cursor: "pointer",
                          backgroundColor: "#fff",
                        }}
                      >
                        {position.Position_Name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Candidate Modal */}
          {editCandidateId && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal} style={{ maxWidth: '600px' }}>
                <div className={styles.modalHeader}>
                  <h3>Edit Candidate</h3>
                  <button onClick={cancelEditCandidate} className={styles.closeButton}>
                    ×
                  </button>
                </div>
                <div className={styles.modalBody}>
                  {editError && (
                    <div style={{ 
                      marginBottom: 16, 
                      padding: 12, 
                      backgroundColor: "#f8d7da", 
                      color: "#721c24", 
                      border: "1px solid #f5c6cb", 
                      borderRadius: 4 
                    }}>
                      {editError}
                    </div>
                  )}
                  
                  {editSuccess && (
                    <div style={{ 
                      marginBottom: 16, 
                      padding: 12, 
                      backgroundColor: "#d4edda", 
                      color: "#155724", 
                      border: "1px solid #c3e6cb", 
                      borderRadius: 4 
                    }}>
                      {editSuccess}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: "block", marginBottom: 4, fontWeight: "bold" }}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="FirstName"
                        value={editCandidateData.FirstName || ""}
                        onChange={handleEditInputChange}
                        className={styles.inputField}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: 4, fontWeight: "bold" }}>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="LastName"
                        value={editCandidateData.LastName || ""}
                        onChange={handleEditInputChange}
                        className={styles.inputField}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: "block", marginBottom: 4, fontWeight: "bold" }}>
                        Other Name
                      </label>
                      <input
                        type="text"
                        name="Othername"
                        value={editCandidateData.Othername || ""}
                        onChange={handleEditInputChange}
                        className={styles.inputField}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: 4, fontWeight: "bold" }}>
                        Nickname/Alias
                      </label>
                      <input
                        type="text"
                        name="AliasName"
                        value={editCandidateData.AliasName || ""}
                        onChange={handleEditInputChange}
                        className={styles.inputField}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", marginBottom: 4, fontWeight: "bold" }}>
                      Profile Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      className={styles.inputField}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button
                      onClick={cancelEditCandidate}
                      className={styles.actionButton}
                      style={{ backgroundColor: '#6c757d', color: 'white' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEditCandidate}
                      className={styles.actionButton}
                      style={{ backgroundColor: '#007bff', color: 'white' }}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}