'use client';

import React, { useState, useEffect } from 'react';
import { useMetaMask } from '@/lib/metamask-client';

interface VoteData {
  voteId: string;
  voterId: string;
  electionId: string;
  candidateId: string;
  positionId: string;
  wardCode: string;
}

interface MetaMaskVotingProps {
  electionId: string;
  candidateId: string;
  positionId: string;
  wardCode: string;
  voterId: string;
  onVoteSuccess?: (transactionHash: string) => void;
  onVoteError?: (error: string) => void;
}

export default function MetaMaskVoting({
  electionId,
  candidateId,
  positionId,
  wardCode,
  voterId,
  onVoteSuccess,
  onVoteError
}: MetaMaskVotingProps) {
  const { isConnected, account, client, connect, isMetaMaskInstalled } = useMetaMask();
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user has already voted
  useEffect(() => {
    if (isConnected && client) {
      checkVoteStatus();
      getNetworkInfo();
    }
  }, [isConnected, client]);

  const checkVoteStatus = async () => {
    try {
      if (client) {
        const voted = await client.hasVoterVoted(voterId, electionId);
        setHasVoted(voted);
      }
    } catch (error) {
      console.error('Error checking vote status:', error);
    }
  };

  const getNetworkInfo = async () => {
    try {
      if (client) {
        const info = await client.getNetworkInfo();
        setNetworkInfo(info);
      }
    } catch (error) {
      console.error('Error getting network info:', error);
    }
  };

  const handleConnect = async () => {
    try {
      setError(null);
      await connect();
    } catch (error: any) {
      setError(error.message);
      onVoteError?.(error.message);
    }
  };

  const handleVote = async () => {
    if (!client || !account) {
      setError('Please connect to MetaMask first');
      return;
    }

    if (hasVoted) {
      setError('You have already voted in this election');
      return;
    }

    setIsVoting(true);
    setError(null);

    try {
      const voteData: VoteData = {
        voteId: `VOTE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        voterId,
        electionId,
        candidateId,
        positionId,
        wardCode
      };

      const result = await client.submitVote(voteData);
      
      console.log('Vote submitted successfully:', result);
      setHasVoted(true);
      onVoteSuccess?.(result.transactionHash);
      
    } catch (error: any) {
      console.error('Vote failed:', error);
      setError(error.message);
      onVoteError?.(error.message);
    } finally {
      setIsVoting(false);
    }
  };

  if (!isMetaMaskInstalled) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              MetaMask Required
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Please install MetaMask to vote in this election.</p>
              <a 
                href="https://metamask.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium underline hover:text-yellow-600"
              >
                Install MetaMask →
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Connect MetaMask to Vote
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              Connect your MetaMask wallet to submit your vote on the blockchain.
            </p>
          </div>
          <button
            onClick={handleConnect}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Connect MetaMask
          </button>
        </div>
        {error && (
          <div className="mt-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Blockchain Voting
          </h3>
          <p className="text-sm text-gray-600">
            Connected as: <span className="font-mono text-xs">{account}</span>
          </p>
          {networkInfo && (
            <p className="text-xs text-gray-500">
              Network: {networkInfo.name} | Balance: {parseFloat(networkInfo.balance).toFixed(4)} ETH
            </p>
          )}
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
          <span className="text-sm text-green-600">Connected</span>
        </div>
      </div>

      {hasVoted ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-green-800">
              You have already voted in this election
            </span>
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={handleVote}
            disabled={isVoting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-md font-medium transition-colors"
          >
            {isVoting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting Vote...
              </div>
            ) : (
              'Submit Vote on Blockchain'
            )}
          </button>
          
          <p className="mt-2 text-xs text-gray-500 text-center">
            Your vote will be recorded on the Ethereum blockchain
          </p>
        </div>
      )}

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
