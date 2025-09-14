'use client';

import React, { useState } from 'react';
import { useMetaMask } from '@/lib/metamask-client';

export default function TestMetaMaskPage() {
  const { isConnected, account, client, connect, isMetaMaskInstalled } = useMetaMask();
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult('');
    
    try {
      if (!client) {
        throw new Error('Not connected to MetaMask');
      }

      // Test 1: Get current account
      const currentAccount = await client.getCurrentAccount();
      setTestResult(prev => prev + `✅ Connected Account: ${currentAccount}\n`);

      // Test 2: Get network info
      const networkInfo = await client.getNetworkInfo();
      setTestResult(prev => prev + `✅ Network: ${networkInfo.name} (Chain ID: ${networkInfo.chainId})\n`);
      setTestResult(prev => prev + `✅ Balance: ${parseFloat(networkInfo.balance).toFixed(4)} ETH\n`);

      // Test 3: Test contract connection
      const contract = await client.getContract();
      setTestResult(prev => prev + `✅ Contract connected successfully\n`);

      // Test 4: Test a simple contract call (read-only)
      try {
        const testElectionId = 'TEST_ELECTION_123';
        await contract.getElection(testElectionId);
        setTestResult(prev => prev + `✅ Contract read operation successful\n`);
      } catch (error: any) {
        if (error.message.includes('Election not found')) {
          setTestResult(prev => prev + `✅ Contract read operation successful (election not found as expected)\n`);
        } else {
          setTestResult(prev => prev + `⚠️ Contract read operation failed: ${error.message}\n`);
        }
      }

      setTestResult(prev => prev + `\n🎉 MetaMask integration test completed successfully!`);

    } catch (error: any) {
      setTestResult(prev => prev + `❌ Test failed: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const testVote = async () => {
    setIsLoading(true);
    setTestResult('');
    
    try {
      if (!client) {
        throw new Error('Not connected to MetaMask');
      }

      // Test vote submission
      const voteData = {
        voteId: `TEST_VOTE_${Date.now()}`,
        voterId: 'TEST_VOTER_123',
        electionId: 'TEST_ELECTION_123',
        candidateId: 'TEST_CANDIDATE_456',
        positionId: 'TEST_POSITION_1',
        wardCode: 'TEST_WARD_001'
      };

      setTestResult('🔄 Submitting test vote...\n');
      
      const result = await client.submitVote(voteData);
      
      setTestResult(prev => prev + `✅ Vote submitted successfully!\n`);
      setTestResult(prev => prev + `📝 Transaction Hash: ${result.transactionHash}\n`);
      setTestResult(prev => prev + `⛽ Gas Used: ${result.gasUsed}\n`);

    } catch (error: any) {
      setTestResult(prev => prev + `❌ Vote test failed: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>MetaMask Integration Test</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Status</h2>
        <p><strong>MetaMask Installed:</strong> {isMetaMaskInstalled ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Connected:</strong> {isConnected ? '✅ Yes' : '❌ No'}</p>
        {account && <p><strong>Account:</strong> {account}</p>}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Actions</h2>
        {!isMetaMaskInstalled && (
          <div style={{ padding: '1rem', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            <p><strong>MetaMask not installed!</strong></p>
            <p>Please install MetaMask browser extension to test the integration.</p>
            <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
              Install MetaMask →
            </a>
          </div>
        )}
        
        {!isConnected && isMetaMaskInstalled && (
          <button
            onClick={connect}
            disabled={isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              marginRight: '1rem',
              marginBottom: '1rem'
            }}
          >
            Connect MetaMask
          </button>
        )}
        
        {isConnected && (
          <>
            <button
              onClick={testConnection}
              disabled={isLoading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                marginRight: '1rem',
                marginBottom: '1rem'
              }}
            >
              Test Connection
            </button>
            
            <button
              onClick={testVote}
              disabled={isLoading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                marginRight: '1rem',
                marginBottom: '1rem'
              }}
            >
              Test Vote Submission
            </button>
          </>
        )}
      </div>

      {testResult && (
        <div style={{ marginBottom: '2rem' }}>
          <h2>Test Results</h2>
          <pre style={{
            padding: '1rem',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            {testResult}
          </pre>
        </div>
      )}

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{
            display: 'inline-block',
            width: '2rem',
            height: '2rem',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p>Testing...</p>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
