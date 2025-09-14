import { ethers } from 'ethers';
import ElectionSystemArtifact from '../build/contracts/ElectionSystem.json';

// MetaMask client for browser-based blockchain interactions
export class MetaMaskClient {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private contractAddress: string = '0x086eA9ABD1Fc4C00c74b04aD3BE0F892f3282050';

  // Check if MetaMask is installed
  static isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';
  }

  // Connect to MetaMask
  async connect(): Promise<string> {
    if (!MetaMaskClient.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
      // Request account access
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      // Create provider and signer
      this.provider = new ethers.providers.Web3Provider((window as any).ethereum);
      this.signer = this.provider.getSigner();

      // Get the connected address
      const address = await this.signer.getAddress();
      
      console.log('Connected to MetaMask:', address);
      return address;

    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('User rejected the connection request.');
      }
      throw new Error(`Failed to connect to MetaMask: ${error.message}`);
    }
  }

  // Get contract instance
  async getContract() {
    if (!this.signer) {
      throw new Error('Not connected to MetaMask. Call connect() first.');
    }

    if (!this.contract) {
      this.contract = new ethers.Contract(
        this.contractAddress, 
        ElectionSystemArtifact.abi, 
        this.signer
      );
    }

    return this.contract;
  }

  // Submit vote using MetaMask
  async submitVote(voteData: {
    voteId: string;
    voterId: string;
    electionId: string;
    candidateId: string;
    positionId: string;
    wardCode: string;
  }) {
    try {
      const contract = await this.getContract();
      
      // Estimate gas first
      const gasEstimate = await contract.estimateGas.submitVote(
        voteData.voteId,
        voteData.voterId,
        voteData.electionId,
        voteData.candidateId,
        voteData.positionId,
        voteData.wardCode
      );

      // Submit transaction
      const tx = await contract.submitVote(
        voteData.voteId,
        voteData.voterId,
        voteData.electionId,
        voteData.candidateId,
        voteData.positionId,
        voteData.wardCode,
        {
          gasLimit: gasEstimate.mul(120).div(100), // Add 20% buffer
        }
      );

      console.log('Transaction submitted:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.transactionHash);

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        gasUsed: receipt.gasUsed.toString(),
      };

    } catch (error: any) {
      console.error('MetaMask transaction failed:', error);
      
      if (error.code === 4001) {
        throw new Error('User rejected the transaction.');
      } else if (error.code === -32603) {
        throw new Error('Transaction failed. Please check your gas limit and try again.');
      }
      
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  // Check if voter has voted
  async hasVoterVoted(voterId: string, electionId: string): Promise<boolean> {
    try {
      const contract = await this.getContract();
      const hasVoted = await contract.hasVoterVoted(voterId, electionId);
      return hasVoted;
    } catch (error) {
      console.error('Error checking vote status:', error);
      return false;
    }
  }

  // Get election data
  async getElection(electionId: string) {
    try {
      const contract = await this.getContract();
      const election = await contract.getElection(electionId);
      
      return {
        electionId: election.electionId,
        title: election.title,
        description: election.description,
        startDate: new Date(parseInt(election.startDate) * 1000).toISOString(),
        endDate: new Date(parseInt(election.endDate) * 1000).toISOString(),
        status: election.status,
        year: parseInt(election.year),
        electionType: election.electionType,
        wardCode: election.wardCode,
        constituencyCode: election.constituencyCode,
        districtCode: election.districtCode
      };
    } catch (error) {
      console.error('Error getting election:', error);
      throw error;
    }
  }

  // Get current account
  async getCurrentAccount(): Promise<string> {
    if (!this.signer) {
      throw new Error('Not connected to MetaMask.');
    }
    return await this.signer.getAddress();
  }

  // Get network info
  async getNetworkInfo() {
    if (!this.provider) {
      throw new Error('Not connected to MetaMask.');
    }
    
    const network = await this.provider.getNetwork();
    const balance = await this.signer!.getBalance();
    
    return {
      chainId: network.chainId,
      name: network.name,
      balance: ethers.utils.formatEther(balance),
    };
  }

  // Switch to a specific network (useful for testnets)
  async switchNetwork(chainId: string) {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added, you might want to add it
        throw new Error('Network not found. Please add the network to MetaMask.');
      }
      throw error;
    }
  }
}

// Hook for React components
export function useMetaMask() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [client, setClient] = useState<MetaMaskClient | null>(null);

  const connect = async () => {
    try {
      const metaMaskClient = new MetaMaskClient();
      const address = await metaMaskClient.connect();
      
      setClient(metaMaskClient);
      setAccount(address);
      setIsConnected(true);
      
      return address;
    } catch (error) {
      console.error('Failed to connect to MetaMask:', error);
      throw error;
    }
  };

  const disconnect = () => {
    setClient(null);
    setAccount(null);
    setIsConnected(false);
  };

  return {
    isConnected,
    account,
    client,
    connect,
    disconnect,
    isMetaMaskInstalled: MetaMaskClient.isMetaMaskInstalled(),
  };
}

// Import useState for the hook
import { useState } from 'react';
