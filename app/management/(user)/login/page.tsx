'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import styles from "./page.module.css";
import { useAuth } from '../../components/AuthProvider';
import Link from "next/link";
// Bootstrap Icons are loaded via CDN in layout.tsx

export default function ManagementLogin() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login for:', employeeId);
      const response = await fetch('/api/management/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure cookies are handled properly
        body: JSON.stringify({ employeeId, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Login successful, user data:', data.user);
        // Use the AuthProvider login method to set user state
        login(data.user);
        // Navigate immediately - the AuthProvider should handle the state
        router.push('/management/Dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image src="/ECZ_Logo.png" alt="ECZ Logo" width={200} height={100} />
        <h1 className={styles.title}>ECZ - Online Voting System</h1>
        
        <div className={styles.container}>
          <h2 className={styles.tagline}>Management Sign In</h2>
          
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
              className={styles.input} 
              placeholder="Employee ID" 
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
              disabled={loading}
            />
            
            <input 
              type="password" 
              className={styles.input} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            
            <button 
              type="submit" 
              className={styles.loginButton}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Login'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <p>Don't have an account? <Link href="/management/register" style={{ color: '#007bff' }}>Register Here</Link></p>
          </div>
        </div>
      </main>
    </div>
  );
}