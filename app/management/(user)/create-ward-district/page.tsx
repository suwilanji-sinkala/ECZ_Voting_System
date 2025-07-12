"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";

type Ward = { Ward_Code: string; Ward_Name: string };
type District = { District_Code: string; District_Name: string };

export default function WardDistrictTabs() {
  const [activeTab, setActiveTab] = useState<"ward" | "district">("ward");

  // Ward state
  const [wardForm, setWardForm] = useState({ Ward_Code: "", Ward_Name: "" });
  const [wards, setWards] = useState<Ward[]>([]);
  const [wardLoading, setWardLoading] = useState(true);
  const [wardSearch, setWardSearch] = useState("");
  const [wardPage, setWardPage] = useState(1);
  const wardPageSize = 10;

  // District state
  const [districtForm, setDistrictForm] = useState({ District_Code: "", District_Name: "" });
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtLoading, setDistrictLoading] = useState(true);
  const [districtSearch, setDistrictSearch] = useState("");
  const [districtPage, setDistrictPage] = useState(1);
  const districtPageSize = 10;

  // Fetch wards
  useEffect(() => {
    const fetchWards = async () => {
      setWardLoading(true);
      try {
        const res = await fetch("/api/ward");
        const data = await res.json();
        setWards(data);
      } catch {
        setWards([]);
      } finally {
        setWardLoading(false);
      }
    };
    fetchWards();
  }, []);

  // Fetch districts
  useEffect(() => {
    const fetchDistricts = async () => {
      setDistrictLoading(true);
      try {
        const res = await fetch("/api/district");
        const data = await res.json();
        setDistricts(data);
      } catch {
        setDistricts([]);
      } finally {
        setDistrictLoading(false);
      }
    };
    fetchDistricts();
  }, []);

  // Ward search and pagination
  const filteredWards = wards.filter(
    (ward) =>
      ward.Ward_Code.toLowerCase().includes(wardSearch.toLowerCase()) ||
      ward.Ward_Name.toLowerCase().includes(wardSearch.toLowerCase())
  );
  const wardTotalPages = Math.ceil(filteredWards.length / wardPageSize);
  const paginatedWards = filteredWards.slice((wardPage - 1) * wardPageSize, wardPage * wardPageSize);

  // District search and pagination
  const filteredDistricts = districts.filter(
    (district) =>
      district.District_Code.toLowerCase().includes(districtSearch.toLowerCase()) ||
      district.District_Name.toLowerCase().includes(districtSearch.toLowerCase())
  );
  const districtTotalPages = Math.ceil(filteredDistricts.length / districtPageSize);
  const paginatedDistricts = filteredDistricts.slice((districtPage - 1) * districtPageSize, districtPage * districtPageSize);

  // Ward handlers
  const handleWardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWardForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleWardSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWardSearch(e.target.value);
    setWardPage(1);
  };
  const handleWardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wardForm.Ward_Code || !wardForm.Ward_Name) return;
    try {
      const res = await fetch("/api/ward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wardForm),
      });
      if (res.ok) {
        const newWard = await res.json();
        setWards((prev) => [...prev, newWard]);
        setWardForm({ Ward_Code: "", Ward_Name: "" });
      }
    } catch {}
  };
  const deleteWard = async (wardCode: string) => {
    if (!confirm("Are you sure you want to delete this ward?")) return;
    try {
      const res = await fetch("/api/ward", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Ward_Code: wardCode }),
      });
      if (res.ok) {
        setWards((prev) => prev.filter((ward) => ward.Ward_Code !== wardCode));
      }
    } catch {}
  };

  // District handlers
  const handleDistrictChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDistrictForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleDistrictSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDistrictSearch(e.target.value);
    setDistrictPage(1);
  };
  const handleDistrictSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!districtForm.District_Code || !districtForm.District_Name) return;
    try {
      const res = await fetch("/api/district", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(districtForm),
      });
      if (res.ok) {
        const newDistrict = await res.json();
        setDistricts((prev) => [...prev, newDistrict]);
        setDistrictForm({ District_Code: "", District_Name: "" });
      }
    } catch {}
  };
  const deleteDistrict = async (districtCode: string) => {
    if (!confirm("Are you sure you want to delete this district?")) return;
    try {
      const res = await fetch("/api/district", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ District_Code: districtCode }),
      });
      if (res.ok) {
        setDistricts((prev) => prev.filter((district) => district.District_Code !== districtCode));
      }
    } catch {}
  };

  // Pagination helper
  function Pagination({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (n: number) => void }) {
    const getVisiblePages = () => {
      const delta = 2; // Number of pages to show on each side of current page
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
        range.push(i);
      }

      if (page - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (page + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    const visiblePages = getVisiblePages();

    return (
      <nav>
        <ul className="pagination justify-content-end flex-wrap">
          <li className={`page-item${page === 1 ? " disabled" : ""}`}>
            <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>
              <i className="fas fa-chevron-left"></i>
            </button>
          </li>
          {visiblePages.map((pageNum, index) => (
            <li key={index} className={`page-item${pageNum === page ? " active" : ""}${pageNum === "..." ? " disabled" : ""}`}>
              {pageNum === "..." ? (
                <span className="page-link">{pageNum}</span>
              ) : (
                <button className="page-link" onClick={() => setPage(pageNum as number)}>
                  {pageNum}
                </button>
              )}
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
      <Navbar title="Ward and District Management" />
      {/* Tabs */}
      <div className="container mt-4">
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link${activeTab === "ward" ? " active" : ""}`}
              onClick={() => setActiveTab("ward")}
            >
              Wards
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link${activeTab === "district" ? " active" : ""}`}
              onClick={() => setActiveTab("district")}
            >
              Districts
            </button>
          </li>
        </ul>
        <div className="row g-4">
          {/* Table Section */}
          <div className="col-lg-8">
            <div className="card shadow fade-in zoom-in">
              <div className="card-body">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                  <h2 className="h4 text-primary mb-0">
                    {activeTab === "ward" ? "Ward Directory" : "District Directory"}
                  </h2>
                  <div className="input-group w-100 w-md-auto" style={{ maxWidth: 300 }}>
                    <span className="input-group-text bg-white border-end-0">
                      <i className="fas fa-search text-secondary"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder={`Search by code or name...`}
                      value={activeTab === "ward" ? wardSearch : districtSearch}
                      onChange={activeTab === "ward" ? handleWardSearch : handleDistrictSearch}
                    />
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Code</th>
                        <th>{activeTab === "ward" ? "Ward Name" : "District Name"}</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeTab === "ward"
                        ? wardLoading
                          ? (
                            <tr>
                              <td colSpan={3} className="text-center text-secondary">Loading...</td>
                            </tr>
                          )
                          : paginatedWards.length === 0
                            ? (
                              <tr>
                                <td colSpan={3} className="text-center text-secondary">No wards found.</td>
                              </tr>
                            )
                            : paginatedWards.map((ward) => (
                              <tr key={ward.Ward_Code}>
                                <td>{ward.Ward_Code}</td>
                                <td>{ward.Ward_Name}</td>
                                <td className="text-end">
                                  <Link href={`/management/ward/${ward.Ward_Code}`} className="btn btn-link text-primary btn-sm me-2">
                                    <i className="fas fa-eye"></i> View
                                  </Link>
                                  <button
                                    className="btn btn-link text-danger btn-sm"
                                    onClick={() => deleteWard(ward.Ward_Code)}
                                    aria-label={`Delete ${ward.Ward_Name}`}
                                  >
                                    <i className="fas fa-trash"></i> Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                        : districtLoading
                          ? (
                            <tr>
                              <td colSpan={3} className="text-center text-secondary">Loading...</td>
                            </tr>
                          )
                          : paginatedDistricts.length === 0
                            ? (
                              <tr>
                                <td colSpan={3} className="text-center text-secondary">No districts found.</td>
                              </tr>
                            )
                            : paginatedDistricts.map((district) => (
                              <tr key={district.District_Code}>
                                <td>{district.District_Code}</td>
                                <td>{district.District_Name}</td>
                                <td className="text-end">
                                  <button
                                    className="btn btn-link text-danger btn-sm"
                                    onClick={() => deleteDistrict(district.District_Code)}
                                    aria-label={`Delete ${district.District_Name}`}
                                  >
                                    <i className="fas fa-trash"></i> Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                    </tbody>
                  </table>
                </div>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
                  <div className="text-secondary small text-center text-md-start">
                    Showing{" "}
                    <span className="fw-bold">
                      {activeTab === "ward"
                        ? (wardPage - 1) * wardPageSize + 1
                        : (districtPage - 1) * districtPageSize + 1}
                    </span>{" "}
                    to{" "}
                    <span className="fw-bold">
                      {activeTab === "ward"
                        ? Math.min(wardPage * wardPageSize, filteredWards.length)
                        : Math.min(districtPage * districtPageSize, filteredDistricts.length)}
                    </span>{" "}
                    of{" "}
                    <span className="fw-bold">
                      {activeTab === "ward" ? filteredWards.length : filteredDistricts.length}
                    </span>{" "}
                    results
                  </div>
                  <div className="d-flex justify-content-center">
                    {activeTab === "ward" ? (
                      <Pagination page={wardPage} totalPages={wardTotalPages} setPage={setWardPage} />
                    ) : (
                      <Pagination page={districtPage} totalPages={districtTotalPages} setPage={setDistrictPage} />
                    )}
                  </div>
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
                  <h2 className="h5 mb-0">{activeTab === "ward" ? "Add New Ward" : "Add New District"}</h2>
                </div>
                <form onSubmit={activeTab === "ward" ? handleWardSubmit : handleDistrictSubmit}>
                  <div className="mb-3">
                    <label
                      htmlFor={activeTab === "ward" ? "Ward_Code" : "District_Code"}
                      className="form-label"
                    >
                      {activeTab === "ward" ? "Ward Code" : "District Code"}
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-hashtag"></i>
                      </span>
                      <input
                        type="text"
                        id={activeTab === "ward" ? "Ward_Code" : "District_Code"}
                        name={activeTab === "ward" ? "Ward_Code" : "District_Code"}
                        value={
                          activeTab === "ward"
                            ? wardForm.Ward_Code
                            : districtForm.District_Code
                        }
                        onChange={
                          activeTab === "ward" ? handleWardChange : handleDistrictChange
                        }
                        className="form-control"
                        placeholder={
                          activeTab === "ward" ? "e.g. WD001" : "e.g. DT001"
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor={activeTab === "ward" ? "Ward_Name" : "District_Name"}
                      className="form-label"
                    >
                      {activeTab === "ward" ? "Ward Name" : "District Name"}
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-map-marker-alt"></i>
                      </span>
                      <input
                        type="text"
                        id={activeTab === "ward" ? "Ward_Name" : "District_Name"}
                        name={activeTab === "ward" ? "Ward_Name" : "District_Name"}
                        value={
                          activeTab === "ward"
                            ? wardForm.Ward_Name
                            : districtForm.District_Name
                        }
                        onChange={
                          activeTab === "ward" ? handleWardChange : handleDistrictChange
                        }
                        className="form-control"
                        placeholder={
                          activeTab === "ward"
                            ? "e.g. Central Ward"
                            : "e.g. Lusaka District"
                        }
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary w-100 mb-3"
                  >
                    <i className="fas fa-save me-2"></i>
                    Save {activeTab === "ward" ? "Ward" : "District"}
                  </button>
                </form>
                <Link
                  href="/management/register-voters"
                  className="btn btn-success w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
                >
                  <i className="fas fa-users"></i>
                  Register Voters
                  <i className="fas fa-chevron-right"></i>
                </Link>
                <div className="alert alert-primary mt-3 mb-0" role="alert">
                  <i className="fas fa-info-circle me-2"></i>
                  Enter a unique {activeTab === "ward" ? "ward" : "district"} code and descriptive name. Codes cannot be changed after creation.
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
            © 2023 Ward Management System. All rights reserved.
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
