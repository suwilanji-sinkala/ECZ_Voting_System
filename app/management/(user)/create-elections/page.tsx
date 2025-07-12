"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";

interface Election {
  Election_ID: number;
  title: string;
  Description: string;
  StartDate: string;
  EndDate: string;
  Status: string;
  Year: number;
  Election_Type: string;
  positions: Position[];
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
  party?: {
    Party_ID: number;
    Party_Name: string;
    Party_Acronym: string;
  } | null;
  position?: {
    Position_ID: number;
    Position_Name: string;
  } | null;
  ward?: {
    Ward_Code: string;
    Ward_Name: string;
    constituency?: {
      Constituency_Name: string;
    };
    district?: {
      District_Name: string;
    };
  } | null;
  imageUrl?: string;
}

export default function ElectionsPage() {
  // Elections state
  const [elections, setElections] = useState<Election[]>([]);
  const [electionLoading, setElectionLoading] = useState(true);
  const [electionSearch, setElectionSearch] = useState("");
  const [electionPage, setElectionPage] = useState(1);
  const electionPageSize = 10;

  // Positions state
  const [positions, setPositions] = useState<Position[]>([]);
  const [positionLoading, setPositionLoading] = useState(true);
  const [positionSearch, setPositionSearch] = useState("");
  const [positionPage, setPositionPage] = useState(1);
  const positionPageSize = 10;

  // Candidates state
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true);

  // Form state
  const [electionForm, setElectionForm] = useState({
    title: "",
    Description: "",
    StartDate: "",
    EndDate: "",
    Status: "draft",
    Year: new Date().getFullYear(),
    Election_Type: "general",
    positionIds: [] as number[],
    selectedCandidates: {} as { [positionId: number]: number[] } // positionId -> candidateIds[]
  });

  const [positionForm, setPositionForm] = useState({
    Position_Name: ""
  });

  const [activeTab, setActiveTab] = useState<"elections" | "positions">("elections");

  // Fetch elections
  useEffect(() => {
  const fetchElections = async () => {
      setElectionLoading(true);
    try {
        const res = await fetch("/api/elections");
      const data = await res.json();
      setElections(data);
      } catch {
        setElections([]);
      } finally {
        setElectionLoading(false);
      }
    };
    fetchElections();
  }, []);

  // Fetch positions
  useEffect(() => {
    const fetchPositions = async () => {
      setPositionLoading(true);
      try {
        const res = await fetch("/api/position");
        const data = await res.json();
        setPositions(data);
      } catch {
        setPositions([]);
      } finally {
        setPositionLoading(false);
      }
    };
    fetchPositions();
  }, []);

  // Fetch candidates
  useEffect(() => {
    const fetchCandidates = async () => {
      setCandidatesLoading(true);
      try {
        const res = await fetch("/api/candidate");
        const data = await res.json();
        setCandidates(data);
      } catch {
        setCandidates([]);
      } finally {
        setCandidatesLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  // Auto-select all positions when election type is "general" and positions are loaded
  useEffect(() => {
    if (electionForm.Election_Type === "general" && positions.length > 0 && !positionLoading) {
      const allPositionIds = positions.map(position => position.Position_ID);
      console.log("Auto-selecting positions on positions load:", allPositionIds); // Debug log
      setElectionForm(prev => ({
        ...prev,
        positionIds: allPositionIds
      }));
    }
  }, [positions, electionForm.Election_Type, positionLoading]);

  // Function to determine election status based on current date/time
  const getElectionStatus = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 'draft';
    
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'draft';
    if (now >= start && now <= end) return 'active';
    if (now > end) return 'completed';
    
    return 'draft';
  };

  // Auto-update election status based on date/time
  useEffect(() => {
    if (electionForm.StartDate && electionForm.EndDate) {
      const newStatus = getElectionStatus(electionForm.StartDate, electionForm.EndDate);
      if (newStatus !== electionForm.Status) {
        console.log(`Auto-updating status from ${electionForm.Status} to ${newStatus}`);
        setElectionForm(prev => ({
          ...prev,
          Status: newStatus
        }));
      }
    }
  }, [electionForm.StartDate, electionForm.EndDate, electionForm.Status]);

  // Periodic status check for existing elections (every minute)
  useEffect(() => {
    const checkElectionStatuses = async () => {
      const updatedElections = elections.map(election => {
        const newStatus = getElectionStatus(election.StartDate, election.EndDate);
        if (newStatus !== election.Status) {
          console.log(`Election ${election.title}: status changed from ${election.Status} to ${newStatus}`);
          return { ...election, Status: newStatus };
        }
        return election;
      });

      // Check if any elections need status updates
      const hasChanges = updatedElections.some((election, index) => 
        election.Status !== elections[index].Status
      );

      if (hasChanges) {
        setElections(updatedElections);
        
        // Update elections in database
        for (const election of updatedElections) {
          if (election.Status !== elections.find(e => e.Election_ID === election.Election_ID)?.Status) {
            try {
              await fetch(`/api/elections/${election.Election_ID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Status: election.Status })
              });
            } catch (error) {
              console.error('Error updating election status:', error);
            }
          }
        }
      }
    };

    const interval = setInterval(checkElectionStatuses, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [elections]);

  // Elections search and pagination
  const filteredElections = elections.filter(
    (election) =>
      election.title.toLowerCase().includes(electionSearch.toLowerCase()) ||
      election.Election_Type.toLowerCase().includes(electionSearch.toLowerCase()) ||
      election.Status.toLowerCase().includes(electionSearch.toLowerCase())
  );
  const electionTotalPages = Math.ceil(filteredElections.length / electionPageSize);
  const paginatedElections = filteredElections.slice((electionPage - 1) * electionPageSize, electionPage * electionPageSize);

  // Positions search and pagination
  const filteredPositions = positions.filter(
    (position) =>
      position.Position_Name.toLowerCase().includes(positionSearch.toLowerCase())
  );
  const positionTotalPages = Math.ceil(filteredPositions.length / positionPageSize);
  const paginatedPositions = filteredPositions.slice((positionPage - 1) * positionPageSize, positionPage * positionPageSize);

  // Election handlers
  const handleElectionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // If the election type is being changed to "general", automatically select all positions
    if (name === "Election_Type" && value === "general") {
      const allPositionIds = positions.map(position => position.Position_ID);
      console.log("Auto-selecting positions for general election:", allPositionIds); // Debug log
      setElectionForm((prev) => ({ 
        ...prev, 
        [name]: value,
        positionIds: allPositionIds
      }));
    } 
    // If the start date is being changed, automatically update the year
    else if (name === "StartDate" && value) {
      const startDate = new Date(value);
      const year = startDate.getFullYear();
      console.log("Auto-updating year to:", year); // Debug log
      setElectionForm((prev) => ({ 
        ...prev, 
        [name]: value,
        Year: year
      }));
    } else {
      setElectionForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleElectionSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setElectionSearch(e.target.value);
    setElectionPage(1);
  };

  const handleElectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!electionForm.title || !electionForm.StartDate || !electionForm.EndDate) return;
    
    try {
      const res = await fetch("/api/elections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(electionForm),
      });
      if (res.ok) {
        const newElection = await res.json();
        setElections((prev) => [...prev, newElection]);
        setElectionForm({
          title: "",
          Description: "",
          StartDate: "",
          EndDate: "",
          Status: "draft",
          Year: new Date().getFullYear(),
          Election_Type: "general",
          positionIds: [],
          selectedCandidates: {}
        });
      }
    } catch (error) {
      console.error("Error creating election:", error);
    }
  };

  const deleteElection = async (electionId: number) => {
    if (!confirm("Are you sure you want to delete this election?")) return;
    try {
      const res = await fetch("/api/elections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Election_ID: electionId }),
      });
      if (res.ok) {
        setElections((prev) => prev.filter((election) => election.Election_ID !== electionId));
      }
    } catch (error) {
      console.error("Error deleting election:", error);
    }
  };

  // Position handlers
  const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPositionForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePositionSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPositionSearch(e.target.value);
    setPositionPage(1);
  };

  const handlePositionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!positionForm.Position_Name) return;
    try {
      const res = await fetch("/api/position", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(positionForm),
      });
      if (res.ok) {
        const newPosition = await res.json();
        setPositions((prev) => [...prev, newPosition]);
        setPositionForm({ Position_Name: "" });
      }
    } catch (error) {
      console.error("Error creating position:", error);
    }
  };

  const deletePosition = async (positionId: number) => {
    if (!confirm("Are you sure you want to delete this position?")) return;
    try {
      const res = await fetch("/api/position", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Position_ID: positionId }),
      });
      if (res.ok) {
        setPositions((prev) => prev.filter((position) => position.Position_ID !== positionId));
      }
    } catch (error) {
      console.error("Error deleting position:", error);
    }
  };

  // Handle position selection for elections
  const handlePositionSelection = (positionId: number, checked: boolean) => {
    setElectionForm(prev => {
      const newPositionIds = checked 
        ? [...prev.positionIds, positionId]
        : prev.positionIds.filter(id => id !== positionId);
      console.log("Position selection changed:", { positionId, checked, newPositionIds }); // Debug log
      return {
        ...prev,
        positionIds: newPositionIds
      };
    });
  };

  // Handle candidate selection for positions
  const handleCandidateSelection = (positionId: number, candidateId: number, checked: boolean) => {
    setElectionForm(prev => {
      const currentCandidates = prev.selectedCandidates[positionId] || [];
      const newCandidates = checked 
        ? [...currentCandidates, candidateId]
        : currentCandidates.filter(id => id !== candidateId);
      
      return {
        ...prev,
        selectedCandidates: {
          ...prev.selectedCandidates,
          [positionId]: newCandidates
        }
      };
    });
  };

  // Get candidates for a specific position
  const getCandidatesForPosition = (positionId: number) => {
    return candidates.filter(candidate => candidate.Position_ID === positionId);
  };

  // Pagination helper
  function Pagination({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (n: number) => void }) {
    return (
      <nav>
        <ul className="pagination justify-content-end">
          <li className={`page-item${page === 1 ? " disabled" : ""}`}>
            <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>
              <i className="fas fa-chevron-left"></i>
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => (
            <li key={i + 1} className={`page-item${page === i + 1 ? " active" : ""}`}>
              <button className="page-link" onClick={() => setPage(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))}
          <li className={`page-item${page === totalPages || totalPages === 0 ? " disabled" : ""}`}>
            <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages || totalPages === 0}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    );
  }

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <Navbar title="Elections Management" />
      
      {/* Tabs */}
      <div className="container mt-4">
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link${activeTab === "elections" ? " active" : ""}`}
              onClick={() => setActiveTab("elections")}
            >
              Elections
            </button>
          </li>
          <li className="nav-item">
                  <button 
              className={`nav-link${activeTab === "positions" ? " active" : ""}`}
              onClick={() => setActiveTab("positions")}
                  >
              Positions
                  </button>
                </li>
            </ul>
            
        <div className="row g-4">
          {/* Table Section */}
          <div className="col-lg-8">
            <div className="card shadow fade-in zoom-in">
              <div className="card-body">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <h2 className="h4 text-primary mb-0">
                      {activeTab === "elections" ? "Elections Directory" : "Positions Directory"}
                    </h2>
                    {activeTab === "elections" && (
                      <span className="badge bg-success">
                        <i className="fas fa-clock me-1"></i>
                        Auto Status
                      </span>
                    )}
                  </div>
                  <div className="input-group w-100 w-md-auto" style={{ maxWidth: 300 }}>
                    <span className="input-group-text bg-white border-end-0">
                      <i className="fas fa-search text-secondary"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder={`Search ${activeTab === "elections" ? "elections" : "positions"}...`}
                      value={activeTab === "elections" ? electionSearch : positionSearch}
                      onChange={activeTab === "elections" ? handleElectionSearch : handlePositionSearch}
                    />
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      {activeTab === "elections" ? (
                        <tr>
                          <th>Title</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Year</th>
                          <th>Positions</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      ) : (
                        <tr>
                          <th>Position Name</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {activeTab === "elections" ? (
                        electionLoading ? (
                          <tr>
                            <td colSpan={6} className="text-center text-secondary">Loading...</td>
                          </tr>
                        ) : paginatedElections.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center text-secondary">No elections found.</td>
                          </tr>
                        ) : (
                          paginatedElections.map((election) => (
                            <tr key={election.Election_ID}>
                              <td>
                                <div>
                                  <strong>{election.title}</strong>
                                  {election.Description && (
                                    <div className="text-muted small">{election.Description}</div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <span className="badge bg-info">{election.Election_Type}</span>
                              </td>
                              <td>
                                <div className="d-flex flex-column gap-1">
                                  <span className={`badge ${
                                    election.Status === 'active' ? 'bg-success' : 
                                    election.Status === 'draft' ? 'bg-warning' : 
                                    election.Status === 'completed' ? 'bg-primary' : 'bg-secondary'
                                  }`}>
                                    {election.Status === 'draft' && <i className="fas fa-edit me-1"></i>}
                                    {election.Status === 'active' && <i className="fas fa-play me-1"></i>}
                                    {election.Status === 'completed' && <i className="fas fa-check me-1"></i>}
                                    {election.Status === 'cancelled' && <i className="fas fa-times me-1"></i>}
                                    {election.Status}
                                  </span>
                                  <small className="text-muted">
                                    {(() => {
                                      const now = new Date();
                                      const start = new Date(election.StartDate);
                                      const end = new Date(election.EndDate);
                                      
                                      if (now < start) {
                                        const diff = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                        return `Starts in ${diff} day${diff !== 1 ? 's' : ''}`;
                                      } else if (now >= start && now <= end) {
                                        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                        return `Ends in ${diff} day${diff !== 1 ? 's' : ''}`;
                                      } else if (now > end) {
                                        const diff = Math.ceil((now.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
                                        return `Ended ${diff} day${diff !== 1 ? 's' : ''} ago`;
                                      }
                                      return '';
                                    })()}
                                  </small>
                                </div>
                              </td>
                              <td>{election.Year}</td>
                              <td>
                                <div className="d-flex flex-wrap gap-1">
                                  {election.positions.map((position) => (
                                    <span key={position.Position_ID} className="badge bg-light text-dark">
                                      {position.Position_Name}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="text-end">
                                <button
                                  className="btn btn-link text-danger btn-sm"
                                  onClick={() => deleteElection(election.Election_ID)}
                                  aria-label={`Delete ${election.title}`}
                                >
                                  <i className="fas fa-trash"></i> Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        )
                      ) : (
                        positionLoading ? (
                          <tr>
                            <td colSpan={2} className="text-center text-secondary">Loading...</td>
                          </tr>
                        ) : paginatedPositions.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="text-center text-secondary">No positions found.</td>
                          </tr>
                        ) : (
                          paginatedPositions.map((position) => (
                            <tr key={position.Position_ID}>
                              <td>{position.Position_Name}</td>
                              <td className="text-end">
                                <button
                                  className="btn btn-link text-danger btn-sm"
                                  onClick={() => deletePosition(position.Position_ID)}
                                  aria-label={`Delete ${position.Position_Name}`}
                                >
                                  <i className="fas fa-trash"></i> Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="text-secondary small">
                    Showing{" "}
                    <span className="fw-bold">
                      {activeTab === "elections"
                        ? (electionPage - 1) * electionPageSize + 1
                        : (positionPage - 1) * positionPageSize + 1}
                    </span>{" "}
                    to{" "}
                    <span className="fw-bold">
                      {activeTab === "elections"
                        ? Math.min(electionPage * electionPageSize, filteredElections.length)
                        : Math.min(positionPage * positionPageSize, filteredPositions.length)}
                    </span>{" "}
                    of{" "}
                    <span className="fw-bold">
                      {activeTab === "elections" ? filteredElections.length : filteredPositions.length}
                    </span>{" "}
                    results
                  </div>
                  {activeTab === "elections" ? (
                    <Pagination page={electionPage} totalPages={electionTotalPages} setPage={setElectionPage} />
                  ) : (
                    <Pagination page={positionPage} totalPages={positionTotalPages} setPage={setPositionPage} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="col-lg-4">
            <div className="card shadow fade-in zoom-in">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3">
                    <i className="fas fa-plus-circle fa-lg"></i>
                  </div>
                  <h2 className="h5 mb-0">
                    {activeTab === "elections" ? "Create New Election" : "Add New Position"}
                  </h2>
                </div>

                {activeTab === "elections" ? (
                  <form onSubmit={handleElectionSubmit}>
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">Election Title</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fas fa-vote-yea"></i>
                        </span>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={electionForm.title}
                          onChange={handleElectionChange}
                          className="form-control"
                          placeholder="e.g. General Election 2024"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="Description" className="form-label">Description</label>
                      <textarea
                        id="Description"
                        name="Description"
                        value={electionForm.Description}
                        onChange={handleElectionChange}
                        className="form-control"
                        rows={3}
                        placeholder="Brief description of the election..."
                      />
                    </div>

                    <div className="row mb-3">
                      <div className="col-6">
                        <label htmlFor="StartDate" className="form-label">Start Date & Time</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="fas fa-calendar"></i>
                          </span>
                          <input
                            type="datetime-local"
                            id="StartDate"
                            name="StartDate"
                            value={electionForm.StartDate}
                            onChange={handleElectionChange}
                            className="form-control"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-6">
                        <label htmlFor="EndDate" className="form-label">End Date & Time</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="fas fa-calendar"></i>
                          </span>
                          <input
                            type="datetime-local"
                            id="EndDate"
                            name="EndDate"
                            value={electionForm.EndDate}
                            onChange={handleElectionChange}
                            className="form-control"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-6">
                        <label htmlFor="Year" className="form-label">
                          Year
                          <span className="badge bg-info ms-2">
                            <i className="fas fa-calendar-alt me-1"></i>
                            Auto-Set
                          </span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="fas fa-calendar-alt"></i>
                          </span>
                          <input
                            type="number"
                            id="Year"
                            name="Year"
                            value={electionForm.Year}
                            className="form-control"
                            readOnly
                            style={{ backgroundColor: '#f8f9fa' }}
                            min={2000}
                            max={2100}
                            required
                          />
                          <span className="input-group-text">
                            <i className="fas fa-sync-alt text-info"></i>
                          </span>
                        </div>
                        <div className="form-text">
                          Year automatically set from start date.
                        </div>
                      </div>
                      <div className="col-6">
                        <label htmlFor="Election_Type" className="form-label">Type</label>
                        <select
                          id="Election_Type"
                          name="Election_Type"
                          value={electionForm.Election_Type}
                          onChange={handleElectionChange}
                          className="form-select"
                          required
                        >
                          <option value="general">General</option>
                          <option value="local">Local</option>
                          <option value="by-election">By-Election</option>
                          <option value="referendum">Referendum</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="Status" className="form-label">
                        Status
                        <span className="badge bg-info ms-2">
                          <i className="fas fa-clock me-1"></i>
                          Auto-Managed
                        </span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fas fa-info-circle"></i>
                        </span>
                        <input
                          type="text"
                          id="Status"
                          name="Status"
                          value={electionForm.Status}
                          className="form-control"
                          readOnly
                          style={{ backgroundColor: '#f8f9fa' }}
                        />
                        <span className="input-group-text">
                          {electionForm.Status === 'draft' && <i className="fas fa-edit text-warning"></i>}
                          {electionForm.Status === 'active' && <i className="fas fa-play text-success"></i>}
                          {electionForm.Status === 'completed' && <i className="fas fa-check text-primary"></i>}
                          {electionForm.Status === 'cancelled' && <i className="fas fa-times text-danger"></i>}
                        </span>
                      </div>
                      <div className="form-text">
                        Status automatically updates based on current date/time relative to start and end dates.
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label">
                        Select Positions
                        {electionForm.Election_Type === "general" && electionForm.positionIds.length === positions.length && positions.length > 0 && (
                          <span className="badge bg-success ms-2">
                            <i className="fas fa-check me-1"></i>
                            All Selected
                          </span>
                        )}
                      </label>
                      {electionForm.Election_Type === "general" && (
                        <div className="alert alert-info mb-3" role="alert">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <i className="fas fa-info-circle me-2"></i>
                              General elections automatically include all available positions. You can manually deselect specific positions if needed.
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => {
                                const allPositionIds = positions.map(position => position.Position_ID);
                                console.log("Manual trigger - selecting positions:", allPositionIds);
                                setElectionForm(prev => ({
                                  ...prev,
                                  positionIds: allPositionIds
                                }));
                              }}
                            >
                              <i className="fas fa-check me-1"></i>
                              Select All
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="border rounded p-3" style={{ maxHeight: 200, overflowY: 'auto' }}>
                        {/* Debug info - remove in production */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="alert alert-warning mb-2" style={{ fontSize: '0.75rem' }}>
                            <strong>Debug:</strong> Positions: {positions.length}, Selected: {electionForm.positionIds.length}, Type: {electionForm.Election_Type}
                          </div>
                        )}
                        {positions.map((position) => (
                          <div key={position.Position_ID} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`position-${position.Position_ID}`}
                              checked={electionForm.positionIds.includes(position.Position_ID)}
                              onChange={(e) => handlePositionSelection(position.Position_ID, e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor={`position-${position.Position_ID}`}>
                    {position.Position_Name}
                            </label>
                          </div>
                        ))}
                        {positions.length === 0 && (
                          <div className="text-muted small">No positions available. Create positions first.</div>
                        )}
                      </div>
                    </div>

                    {/* Candidate Selection Section */}
                    {electionForm.positionIds.length > 0 && (
                      <div className="mb-4">
                        <label className="form-label">
                          <i className="fas fa-users me-2"></i>
                          Select Candidates by Position
                          <span className="badge bg-info ms-2">
                            {Object.values(electionForm.selectedCandidates).flat().length} Selected
                          </span>
                        </label>
                        
                        <div className="border rounded p-3" style={{ maxHeight: 400, overflowY: 'auto' }}>
                          {electionForm.positionIds.map((positionId) => {
                            const position = positions.find(p => p.Position_ID === positionId);
                            const candidatesForPosition = getCandidatesForPosition(positionId);
                            const selectedCandidates = electionForm.selectedCandidates[positionId] || [];
                            
                            return (
                              <div key={positionId} className="mb-4">
                                <h6 className="text-primary mb-2">
                                  <i className="fas fa-user-tie me-1"></i>
                                  {position?.Position_Name}
                                  <span className="badge bg-secondary ms-2">
                                    {candidatesForPosition.length} candidates
                                  </span>
                                </h6>
                                
                                {candidatesForPosition.length > 0 ? (
                                  <div className="row g-2">
                                    {candidatesForPosition.map((candidate) => (
                                      <div key={candidate.Candidate_ID} className="col-12">
                                        <div className="form-check border rounded p-2">
                                          <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`candidate-${candidate.Candidate_ID}`}
                                            checked={selectedCandidates.includes(candidate.Candidate_ID)}
                                            onChange={(e) => handleCandidateSelection(positionId, candidate.Candidate_ID, e.target.checked)}
                                          />
                                          <label className="form-check-label d-flex align-items-center" htmlFor={`candidate-${candidate.Candidate_ID}`}>
                                            <div className="d-flex align-items-center flex-grow-1">
                                              {candidate.imageUrl && (
                                                <img
                                                  src={candidate.imageUrl}
                                                  alt={`${candidate.FirstName} ${candidate.LastName}`}
                                                  className="rounded-circle me-2"
                                                  style={{ width: 32, height: 32, objectFit: 'cover' }}
                                                  onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                                  }}
                                                />
                                              )}
                                              <div>
                                                <strong>
                                                  {candidate.FirstName} {candidate.OtherName} {candidate.LastName}
                                                </strong>
                                                {candidate.NickName && (
                                                  <span className="text-muted ms-2">({candidate.NickName})</span>
                                                )}
                                                <div className="small text-muted">
                                                  {candidate.party?.Party_Name || 'Independent'} • {candidate.ward?.Ward_Name || 'No Ward'}
                                                </div>
                                              </div>
                                            </div>
                                          </label>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="alert alert-warning mb-0" style={{ fontSize: '0.875rem' }}>
                                    <i className="fas fa-exclamation-triangle me-1"></i>
                                    No candidates registered for this position. 
                                    <Link href="/management/register-candidate" className="alert-link ms-1">
                                      Register candidates
                                    </Link>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        {candidatesLoading && (
                          <div className="text-center text-muted">
                            <i className="fas fa-spinner fa-spin me-2"></i>
                            Loading candidates...
                          </div>
                        )}
                      </div>
                    )}

                    <button type="submit" className="btn btn-primary w-100 mb-3">
                      <i className="fas fa-save me-2"></i>
                      Create Election
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handlePositionSubmit}>
                    <div className="mb-4">
                      <label htmlFor="Position_Name" className="form-label">Position Name</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fas fa-user-tie"></i>
                        </span>
                        <input
                          type="text"
                          id="Position_Name"
                          name="Position_Name"
                          value={positionForm.Position_Name}
                          onChange={handlePositionChange}
                          className="form-control"
                          placeholder="e.g. President, Mayor, Councilor"
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mb-3">
                      <i className="fas fa-save me-2"></i>
                      Add Position
                    </button>
                  </form>
                )}

                <Link
                  href="/management/register-candidate"
                  className="btn btn-success w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
                >
                  <i className="fas fa-user-plus"></i>
                  Register Candidates
                  <i className="fas fa-chevron-right"></i>
                </Link>

                <div className="alert alert-primary mt-3 mb-0" role="alert">
                  <i className="fas fa-info-circle me-2"></i>
                  {activeTab === "elections" 
                    ? "Create elections with specific positions. Voters can only vote for positions assigned to their election."
                    : "Add positions that candidates can run for. Positions are reusable across multiple elections."
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-top mt-auto py-3">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div className="text-secondary small mb-2 mb-md-0">
            © 2023 Elections Management System. All rights reserved.
          </div>
          <div className="d-flex gap-3">
            <a href="#" className="text-secondary"><i className="fab fa-twitter"></i></a>
            <a href="#" className="text-secondary"><i className="fab fa-facebook"></i></a>
            <a href="#" className="text-secondary"><i className="fab fa-instagram"></i></a>
            <a href="#" className="text-secondary"><i className="fab fa-github"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
}