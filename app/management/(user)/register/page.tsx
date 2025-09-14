'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import styles from "../login/page.module.css"; // Reuse login styles

export default function ManagementRegister() {
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'operator'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/management/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: formData.employeeId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/management/login');
        }, 2000);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <Image src="/ECZ_Logo.png" alt="ECZ Logo" width={200} height={100} />
          <h1 className={styles.title}>ECZ - Online Voting System</h1>
          
          <div className={styles.container}>
            <h2 className={styles.tagline}>Registration Successful!</h2>
            <div style={{ 
              color: 'green', 
              textAlign: 'center', 
              padding: '1rem',
              backgroundColor: '#e6ffe6',
              border: '1px solid #99ff99',
              borderRadius: '4px',
              marginBottom: '1rem'
            }}>
              <p>Your account has been created successfully.</p>
              <p>Redirecting to login page...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image src="/ECZ_Logo.png" alt="ECZ Logo" width={200} height={100} />
        <h1 className={styles.title}>ECZ - Online Voting System</h1>
        
        <div className={styles.container}>
          <h2 className={styles.tagline}>Management Registration</h2>
          
          {error && (
            <div style={{ 
              color: 'red', 
              marginBottom: '1rem', 
              padding: '0.5rem', 
              backgroundColor: '#ffe6e6', 
              border: '1px solid #ff9999', 
              borderRadius: '4px' 
            }}>
              {error}
            </div>
          )}
          
          <form className={styles.form} onSubmit={handleSubmit}>
            <input 
              type="text" 
              name="employeeId"
              className={styles.input} 
              placeholder="Employee ID (e.g., ECZ001)" 
              value={formData.employeeId}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <input 
              type="text" 
              name="firstName"
              className={styles.input} 
              placeholder="First Name" 
              value={formData.firstName}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <input 
              type="text" 
              name="lastName"
              className={styles.input} 
              placeholder="Last Name" 
              value={formData.lastName}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <input 
              type="email" 
              name="email"
              className={styles.input} 
              placeholder="Email Address" 
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <select 
              name="role"
              className={styles.input}
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="operator">Operator</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Administrator</option>
            </select>

            <input 
              type="password" 
              name="password"
              className={styles.input} 
              placeholder="Password (min. 6 characters)" 
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={6}
            />

            <input 
              type="password" 
              name="confirmPassword"
              className={styles.input} 
              placeholder="Confirm Password" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={6}
            />
            
            <button 
              type="submit" 
              className={styles.loginButton}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <p>Already have an account? <Link href="/management/login" style={{ color: '#007bff' }}>Sign In</Link></p>
          </div>
        </div>
      </main>
    </div>
  );
}
