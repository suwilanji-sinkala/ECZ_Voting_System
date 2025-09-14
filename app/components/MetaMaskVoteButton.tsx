'use client';

import React, { useState, useEffect } from 'react';
import { useMetaMask } from '@/lib/metamask-client';

interface MetaMaskVoteButtonProps {
  electionId: number;
  candidateId: number;
  positionId: number;
  wardCode: string;
  voterId: string;
  onVoteSuccess?: (transactionHash: string) => void;
  onVoteError?: (error: string) => void;
  disabled?: boolean;
}

export default function MetaMaskVoteButton({
  electionId,
  candidateId,
  positionId,
  wardCode,
  voterId,
  onVoteSuccess,
  onVoteError,
  disabled = false
}: MetaMaskVoteButtonProps) {
  const { isConnected, account, client, connect, isMetaMaskInstalled } = useMetaMask();
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has already voted
  useEffect(() => {
    if (isConnected && client) {
      checkVoteStatus();
    }
  }, [isConnected, client]);

  const checkVoteStatus = async () => {
    try {
      if (client) {
        const voted = await client.hasVoterVoted(voterId, `ELECTION_${electionId}`);
        setHasVoted(voted);
      }
    } catch (error) {
      console.error('Error checking vote status:', error);
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
      const voteData = {
        voteId: `VOTE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        voterId,
        electionId: `ELECTION_${electionId}`,
        candidateId: candidateId.toString(),
        positionId: positionId.toString(),
        wardCode
      };

      const result = await client.submitVote(voteData);
      
      console.log('MetaMask vote submitted successfully:', result);
      setHasVoted(true);
      onVoteSuccess?.(result.transactionHash);
      
    } catch (error: any) {
      console.error('MetaMask vote failed:', error);
      setError(error.message);
      onVoteError?.(error.message);
    } finally {
      setIsVoting(false);
    }
  };

  if (!isMetaMaskInstalled) {
    return (
      <div className="text-xs text-gray-500 mt-1">
        MetaMask not installed
      </div>
    );
  }

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        disabled={disabled}
        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors disabled:bg-gray-400"
      >
        Connect MetaMask
      </button>
    );
  }

  if (hasVoted) {
    return (
      <div className="text-xs text-green-600 mt-1 flex items-center">
        <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
        Voted on Blockchain
      </div>
    );
  }

  return (
    <div className="mt-1">
      <button
        onClick={handleVote}
        disabled={isVoting || disabled}
        className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-colors disabled:bg-gray-400"
      >
        {isVoting ? 'Voting...' : 'Vote with MetaMask'}
      </button>
      
      {error && (
        <div className="text-xs text-red-600 mt-1">
          {error}
        </div>
      )}
      
      <div className="text-xs text-gray-500 mt-1">
        Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
      </div>
    </div>
  );
}
