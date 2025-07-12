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
  // Remove hardcoded voters, start with empty array
  const [voters, setVoters] = useState<Voter[]>([]);
  
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

  // Add sorting and pagination state
  const [sortConfig, setSortConfig] = useState<{ key: keyof Voter; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const votersPerPage = 10;

  // Sorting logic
  const sortedVoters = [...voters].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const aValue = a[key] ? a[key].toString().toLowerCase() : '';
    const bValue = b[key] ? b[key].toString().toLowerCase() : '';
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedVoters.length / votersPerPage);
  const paginatedVoters = sortedVoters.slice((currentPage - 1) * votersPerPage, currentPage * votersPerPage);

  // Sorting handler
  const handleSort = (key: keyof Voter) => {
    setSortConfig(prev => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
    setCurrentPage(1);
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

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

  // Fetch all voters on mount
  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const res = await fetch("/api/voters");
        if (!res.ok) throw new Error("Failed to fetch voters");
        const data = await res.json();
        setVoters(Array.isArray(data) ? data.map((v: any) => ({
          id: v.id,
          name: v.First_Name + (v.Last_Name ? ' ' + v.Last_Name : ''),
          email: v.Email || '',
          nrc: v.NRC ? v.NRC.toString() : '',
          ward: v.Wards?.Ward_Name || v.Ward || '',
          wardCode: v.Ward || '',
          constituency: v.Wards?.Constituencies?.Constituency_Name || v.Constituency || '',
          district: v.Wards?.Constituencies?.Districts?.District_Name || '',
        })) : []);
      } catch (error) {
        console.error("Error fetching voters:", error);
        setVoters([]);
      }
    };
    fetchVoters();
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
        NRC: newVoter.nrc,
        Ward: newVoter.wardCode,
        Constituency: newVoter.constituency,
        Email: newVoter.email || null,
        id: nextId,
        passwordHash: password // In production, hash this on the server side!
      };

      const res = await fetch("/api/voters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voterData)
      });
      if (!res.ok) {
        let errorMessage = "Failed to add voter";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${res.status} ${res.statusText}`;
        }
        setSubmitError(errorMessage);
        return;
      }

      // Success - show generated password
      setGeneratedPassword(password);
      setShowPasswordModal(true);

      // Add to local state
      const createdVoter = await res.json();
      setVoters(prev => [
        ...prev,
        {
          id: createdVoter.id,
          name: createdVoter.First_Name + (createdVoter.Last_Name ? ' ' + createdVoter.Last_Name : ''),
          email: createdVoter.Email || '',
          nrc: createdVoter.NRC ? createdVoter.NRC.toString() : '',
          ward: createdVoter.Wards?.Ward_Name || createdVoter.Ward || '',
          wardCode: createdVoter.Ward || '',
          constituency: createdVoter.Wards?.Constituencies?.Constituency_Name || createdVoter.Constituency || '',
          district: createdVoter.Wards?.Constituencies?.Districts?.District_Name || '',
        }
      ]);
      
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

  // Add edit/delete state
  const [editVoterId, setEditVoterId] = useState<string | null>(null);
  const [editVoterData, setEditVoterData] = useState<Partial<Voter>>({});
  const [editError, setEditError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  // Edit handlers
  const startEditVoter = (voter: Voter) => {
    setEditVoterId(voter.id);
    setEditVoterData({ ...voter });
    setEditError("");
  };
  const cancelEditVoter = () => {
    setEditVoterId(null);
    setEditVoterData({});
    setEditError("");
  };
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditVoterData(prev => ({ ...prev, [name]: value }));
  };
  const saveEditVoter = async () => {
    setEditError("");
    try {
      const res = await fetch("/api/voters", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editVoterData.id,
          First_Name: (editVoterData.name || '').split(' ')[0],
          Last_Name: (editVoterData.name || '').split(' ').slice(1).join(' '),
          NRC: editVoterData.nrc,
          Email: editVoterData.email,
          Ward: editVoterData.wardCode,
          Constituency: editVoterData.constituency,
        }),
      });
      if (!res.ok) {
        let errorMessage = "Failed to update voter";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${res.status} ${res.statusText}`;
        }
        setEditError(errorMessage);
        return;
      }
      const updatedVoter = await res.json();
      setVoters(prev => prev.map(v => v.id === updatedVoter.id ? {
        id: updatedVoter.id,
        name: updatedVoter.First_Name + (updatedVoter.Last_Name ? ' ' + updatedVoter.Last_Name : ''),
        email: updatedVoter.Email || '',
        nrc: updatedVoter.NRC ? updatedVoter.NRC.toString() : '',
        ward: updatedVoter.Wards?.Ward_Name || updatedVoter.Ward || '',
        wardCode: updatedVoter.Ward || '',
        constituency: updatedVoter.Wards?.Constituencies?.Constituency_Name || updatedVoter.Constituency || '',
        district: updatedVoter.Wards?.Constituencies?.Districts?.District_Name || '',
      } : v));
      setEditVoterId(null);
      setEditVoterData({});
    } catch (error) {
      setEditError("Failed to update voter");
    }
  };

  // Delete handler
  const deleteVoter = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this voter?")) return;
    setDeleteLoadingId(id);
    setDeleteError("");
    try {
      const res = await fetch("/api/voters", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        let errorMessage = "Failed to delete voter";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${res.status} ${res.statusText}`;
        }
        setDeleteError(errorMessage);
        setDeleteLoadingId(null);
        return;
      }
      setVoters(prev => prev.filter(v => v.id !== id));
      setDeleteLoadingId(null);
    } catch (error) {
      setDeleteError("Failed to delete voter");
      setDeleteLoadingId(null);
    }
  };

  // In the table body, for each row, show Edit/Delete buttons
  // If editVoterId === voter.id, show inline edit form for that row
  // Show error messages for edit/delete if any

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
                  <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>Year Id {sortConfig?.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Name {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('nrc')} style={{ cursor: 'pointer' }}>NRC {sortConfig?.key === 'nrc' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>Email {sortConfig?.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('ward')} style={{ cursor: 'pointer' }}>Ward {sortConfig?.key === 'ward' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('constituency')} style={{ cursor: 'pointer' }}>Constituency {sortConfig?.key === 'constituency' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => handleSort('district')} style={{ cursor: 'pointer' }}>District {sortConfig?.key === 'district' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVoters.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", color: "#888" }}>
                      {selectedWardCode ? "No voters found." : "Please select a ward to view voters."}
                    </td>
                  </tr>
                ) : (
                  paginatedVoters.map((voter) => (
                    <tr key={voter.id}>
                      {editVoterId === voter.id ? (
                        <>
                          <td><input name="id" value={editVoterData.id || ''} disabled style={{ width: 60 }} /></td>
                          <td><input name="name" value={editVoterData.name || ''} onChange={handleEditInputChange} style={{ width: 120 }} /></td>
                          <td><input name="nrc" value={editVoterData.nrc || ''} onChange={handleEditInputChange} style={{ width: 100 }} /></td>
                          <td><input name="email" value={editVoterData.email || ''} onChange={handleEditInputChange} style={{ width: 140 }} /></td>
                          <td>{voter.ward}</td>
                          <td>{voter.constituency}</td>
                          <td>{voter.district}</td>
                          <td>
                            <button onClick={saveEditVoter} disabled={isSubmitting} style={{ marginRight: 4 }} aria-label="Save Edit">💾</button>
                            <button onClick={cancelEditVoter} disabled={isSubmitting} aria-label="Cancel Edit">✖️</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{voter.id}</td>
                          <td>{voter.name}</td>
                          <td>{voter.nrc}</td>
                          <td>{voter.email || 'N/A'}</td>
                          <td>{voter.ward}</td>
                          <td>{voter.constituency}</td>
                          <td>{voter.district}</td>
                          <td>
                            <button onClick={() => startEditVoter(voter)} disabled={editVoterId !== null} aria-label="Edit Voter" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                              ✏️
                            </button>
                            <button onClick={() => deleteVoter(voter.id)} disabled={deleteLoadingId === voter.id} aria-label="Delete Voter" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, marginLeft: 4 }}>
                              {deleteLoadingId === voter.id ? '⏳' : '🗑️'}
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, gap: 8 }}>
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
            </div>
          )}
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
      {editError && (
        <div style={{ color: 'red', marginTop: 8 }}>{editError}</div>
      )}
      {deleteError && (
        <div style={{ color: 'red', marginTop: 8 }}>{deleteError}</div>
      )}
    </div>
  );
}