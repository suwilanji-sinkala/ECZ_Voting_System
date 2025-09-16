import { Wallets, Gateway, Network, Contract } from 'fabric-network';
import * as FabricCAServices from 'fabric-ca-client';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { credentials } from '@grpc/grpc-js';

export interface FabricConfig {
  channelName: string;
  chaincodeName: string;
  mspId: string;
  walletPath: string;
  connectionProfilePath: string;
}

export interface VoteData {
  voterId: string;
  electionId: string;
  candidateId: string;
  positionId: string;
  wardCode: string;
}

export interface ElectionData {
  electionId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  year: number;
  electionType: string;
  wardCode: string;
  constituencyCode: string;
  districtCode: string;
}

export interface VoterData {
  voterId: string;
  firstName: string;
  lastName: string;
  nrc: string;
  ward: string;
  constituency: string;
  email: string;
}

export interface CandidateData {
  candidateId: string;
  firstName: string;
  lastName: string;
  otherName: string;
  aliasName: string;
  partyId: string;
  wardCode: string;
  positionId: string;
  electionId: string;
}

export class FabricClient {
  private gateway: Gateway | null = null;
  private network: Network | null = null;
  private contract: Contract | null = null;
  private config: FabricConfig;

  constructor(config: FabricConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      // Create a new file system based wallet for managing identities
      const wallet = await Wallets.newFileSystemWallet(this.config.walletPath);

      // Check to see if we've already enrolled the user
      const identity = await wallet.get('admin');
      if (!identity) {
        throw new Error('Admin identity not found in wallet. Please run enrollAdmin.ts first.');
      }

      // Create a new gateway for connecting to our peer node
      this.gateway = new Gateway();
      await this.gateway.connect(this.config.connectionProfilePath, {
        wallet,
        identity: 'admin',
        discovery: { enabled: true, asLocalhost: true }
      });

      // Get the network (channel) our contract is deployed to
      this.network = this.gateway.getNetwork(this.config.channelName);

      // Get the contract from the network
      this.contract = this.network.getContract(this.config.chaincodeName);

      console.log('Successfully connected to Hyperledger Fabric network');
    } catch (error) {
      console.error('Failed to connect to Fabric network:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.gateway) {
      this.gateway.disconnect();
      this.gateway = null;
      this.network = null;
      this.contract = null;
    }
  }

  async submitVote(voteData: VoteData): Promise<any> {
    if (!this.contract) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      const result = await this.contract.submitTransaction(
        'SubmitVote',
        voteData.voterId,
        voteData.electionId,
        voteData.candidateId,
        voteData.positionId,
        voteData.wardCode
      );

      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Failed to submit vote:', error);
      throw error;
    }
  }

  async createElection(electionData: ElectionData): Promise<void> {
    if (!this.contract) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      await this.contract.submitTransaction(
        'CreateElection',
        electionData.electionId,
        electionData.title,
        electionData.description,
        electionData.startDate,
        electionData.endDate,
        electionData.status,
        electionData.electionType,
        electionData.wardCode,
        electionData.constituencyCode,
        electionData.districtCode,
        electionData.year.toString()
      );

      console.log('Election created successfully on blockchain');
    } catch (error) {
      console.error('Failed to create election:', error);
      throw error;
    }
  }

  async registerVoter(voterData: VoterData): Promise<void> {
    if (!this.contract) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      await this.contract.submitTransaction(
        'RegisterVoter',
        voterData.voterId,
        voterData.firstName,
        voterData.lastName,
        voterData.nrc,
        voterData.ward,
        voterData.constituency,
        voterData.email
      );

      console.log('Voter registered successfully on blockchain');
    } catch (error) {
      console.error('Failed to register voter:', error);
      throw error;
    }
  }

  async registerCandidate(candidateData: CandidateData): Promise<void> {
    if (!this.contract) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      await this.contract.submitTransaction(
        'RegisterCandidate',
        candidateData.candidateId,
        candidateData.firstName,
        candidateData.lastName,
        candidateData.otherName,
        candidateData.aliasName,
        candidateData.partyId,
        candidateData.wardCode,
        candidateData.positionId,
        candidateData.electionId
      );

      console.log('Candidate registered successfully on blockchain');
    } catch (error) {
      console.error('Failed to register candidate:', error);
      throw error;
    }
  }

  async getElection(electionId: string): Promise<ElectionData> {
    if (!this.contract) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      const result = await this.contract.evaluateTransaction('GetElection', electionId);
      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Failed to get election:', error);
      throw error;
    }
  }

  async getVoter(voterId: string): Promise<VoterData> {
    if (!this.contract) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      const result = await this.contract.evaluateTransaction('GetVoter', voterId);
      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Failed to get voter:', error);
      throw error;
    }
  }

  async hasVoterVoted(voterId: string, electionId: string): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      const result = await this.contract.evaluateTransaction('HasVoterVoted', voterId, electionId);
      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Failed to check if voter has voted:', error);
      throw error;
    }
  }

  async isVoterEligible(voterId: string, electionId: string): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      const result = await this.contract.evaluateTransaction('IsVoterEligible', voterId, electionId);
      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Failed to check voter eligibility:', error);
      throw error;
    }
  }

  async getElectionResults(electionId: string): Promise<Record<string, number>> {
    if (!this.contract) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      const result = await this.contract.evaluateTransaction('GetElectionResults', electionId);
      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Failed to get election results:', error);
      throw error;
    }
  }

  async getVoteHistory(voterId: string): Promise<any[]> {
    if (!this.contract) {
      throw new Error('Not connected to Fabric network');
    }

    try {
      const result = await this.contract.evaluateTransaction('GetVoteHistory', voterId);
      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Failed to get vote history:', error);
      throw error;
    }
  }

  // Helper method to generate unique IDs
  generateId(prefix: string): string {
    return `${prefix}_${uuidv4()}`;
  }
}

// Default configuration
export const defaultFabricConfig: FabricConfig = {
  channelName: 'electionchannel',
  chaincodeName: 'election',
  mspId: 'ECZMSP',
  walletPath: path.join(process.cwd(), 'wallet'),
  connectionProfilePath: path.join(process.cwd(), 'blockchain', 'connection-profile.json')
};

// Singleton instance
let fabricClientInstance: FabricClient | null = null;

export async function getFabricClient(config?: Partial<FabricConfig>): Promise<FabricClient> {
  if (!fabricClientInstance) {
    const finalConfig = { ...defaultFabricConfig, ...config };
    fabricClientInstance = new FabricClient(finalConfig);
    await fabricClientInstance.connect();
  }
  return fabricClientInstance;
}

export async function disconnectFabricClient(): Promise<void> {
  if (fabricClientInstance) {
    await fabricClientInstance.disconnect();
    fabricClientInstance = null;
  }
} 