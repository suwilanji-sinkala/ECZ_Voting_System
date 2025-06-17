"use client";
import { useState } from "react";
import styles from "./page.module.css";
import Navbar from "../../components/Navbar";
import Link from "next/link";

export default function WardDistrict() {
  const [formData, setFormData] = useState({
    ward: "",
    district: ""
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className={styles.page}>
      {/* Header with profile on right and centered title */}
      <Navbar title="Add Ward & Constituency " />

      {/* Full-width main content */}
      <main className={styles.main}>
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                placeholder="Enter Ward"
                className={styles.inputField}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Enter Constituency"
                className={styles.inputField}
                required
              />
            </div>

            <Link href="/management/register-voters"  className={styles.nextButton}>
              Next
            </Link>
            
          </form>
        </div>
      </main>
    </div>
  );
}