'use client';

import { useAuth } from '../../components/AuthProvider';
import { useState, useEffect } from 'react';

export default function DebugPage() {
  const { user, loading } = useAuth();
  const [tokenStatus, setTokenStatus] = useState('checking...');
  const [localStorageData, setLocalStorageData] = useState('');

  useEffect(() => {
    // Check localStorage
    const stored = localStorage.getItem('managementUser');
    setLocalStorageData(stored || 'No data in localStorage');

    // Check token verification
    fetch('/api/management/verify', { credentials: 'include' })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      })
      .then(data => {
        setTokenStatus(`Valid token: ${JSON.stringify(data)}`);
      })
      .catch(error => {
        setTokenStatus(`Invalid token: ${error.message}`);
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Authentication Debug Page</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>AuthProvider State:</h3>
        <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
        <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>Token Verification:</h3>
        <p>{tokenStatus}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>LocalStorage Data:</h3>
        <pre>{localStorageData}</pre>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>Actions:</h3>
        <button 
          onClick={() => window.location.reload()}
          style={{ marginRight: '10px', padding: '5px 10px' }}
        >
          Refresh Page
        </button>
        <button 
          onClick={() => {
            localStorage.removeItem('managementUser');
            window.location.reload();
          }}
          style={{ marginRight: '10px', padding: '5px 10px' }}
        >
          Clear LocalStorage
        </button>
        <button 
          onClick={() => {
            fetch('/api/management/logout', { method: 'POST', credentials: 'include' })
              .then(() => window.location.reload());
          }}
          style={{ padding: '5px 10px' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
