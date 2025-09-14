import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import ElectionSystemArtifact from '../build/contracts/ElectionSystem.json';

// Default contract address (update this when you redeploy)
const DEFAULT_CONTRACT_ADDRESS = '0xa2B03C9936Ca166D3b22A77FC2Aa9e7DEe7B6569';
import { v4 as uuidv4 } from 'uuid';

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

export interface EthereumConfig {
  providerUrl: string;
  contractAddress?: string;
}

export class EthereumClient {
  private web3: Web3 | null = null;
  private contract: Contract | null = null;
  private config: EthereumConfig;
  private accounts: string[] = [];

  constructor(config: EthereumConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      // Connect to Ganache
      this.web3 = new Web3(new Web3.providers.HttpProvider(this.config.providerUrl));
      
      // Get accounts
      this.accounts = await this.web3.eth.getAccounts();
      
      if (this.accounts.length === 0) {
        throw new Error('No accounts found. Make sure Ganache is running.');
      }

      console.log('Connected to Ethereum network');
      console.log('Available accounts:', this.accounts.length);
      console.log('Default account:', this.accounts[0]);

      // If contract address is provided, connect to existing contract
      if (this.config.contractAddress) {
        await this.connectToContract(this.config.contractAddress);
      }
    } catch (error) {
      console.error('Failed to connect to Ethereum network:', error);
      throw error;
    }
  }

  async connectToContract(contractAddress: string): Promise<void> {
    if (!this.web3) {
      throw new Error('Web3 not initialized. Call connect() first.');
    }

    try {
      this.contract = new this.web3.eth.Contract(
        ElectionSystemArtifact.abi as AbiItem[],
        contractAddress
      );
      
      console.log('Connected to ElectionSystem contract at:', contractAddress);
    } catch (error) {
      console.error('Failed to connect to contract:', error);
      throw error;
    }
  }

  async deployContract(): Promise<string> {
    if (!this.web3) {
      throw new Error('Web3 not initialized. Call connect() first.');
    }

    try {
      const contract = new this.web3.eth.Contract(ElectionSystemArtifact.abi as AbiItem[]);
      
      const deployedContract = await contract.deploy({
        data: ElectionSystemArtifact.bytecode
      }).send({
        from: this.accounts[0],
        gas: 6721975
      });

      const contractAddress = deployedContract.options.address;
      console.log('Contract deployed at:', contractAddress);
      
      this.contract = deployedContract;
      return contractAddress;
    } catch (error) {
      console.error('Failed to deploy contract:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.web3) {
      this.web3 = null;
      this.contract = null;
      console.log('Disconnected from Ethereum network');
    }
  }

  async submitVote(voteData: VoteData): Promise<any> {
    if (!this.contract) {
      throw new Error('Contract not connected. Call connectToContract() or deployContract() first.');
    }

    try {
      const voteId = this.generateId('VOTE');
      
      const result = await this.contract.methods.submitVote(
        voteId,
        voteData.voterId,
        voteData.electionId,
        voteData.candidateId,
        voteData.positionId,
        voteData.wardCode
      ).send({
        from: this.accounts[0],
        gas: 3000000
      });

      return {
        success: true,
        message: 'Vote submitted successfully',
        voteId: voteId,
        transactionHash: result.transactionHash
      };
    } catch (error) {
      console.error('Failed to submit vote:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit vote'
      };
    }
  }

  async createElection(electionData: ElectionData): Promise<void> {
    if (!this.contract) {
      throw new Error('Contract not connected. Call connectToContract() or deployContract() first.');
    }

    try {
      const startDate = Math.floor(new Date(electionData.startDate).getTime() / 1000);
      const endDate = Math.floor(new Date(electionData.endDate).getTime() / 1000);

      await this.contract.methods.createElection(
        electionData.electionId,
        electionData.title,
        electionData.description,
        startDate,
        endDate,
        electionData.status,
        electionData.year,
        electionData.electionType,
        electionData.wardCode,
        electionData.constituencyCode,
        electionData.districtCode
      ).send({
        from: this.accounts[0],
        gas: 3000000
      });

      console.log('Election created successfully:', electionData.electionId);
    } catch (error) {
      console.error('Failed to create election:', error);
      throw error;
    }
  }

  async registerVoter(voterData: VoterData): Promise<void> {
    if (!this.contract) {
      throw new Error('Contract not connected. Call connectToContract() or deployContract() first.');
    }

    try {
      await this.contract.methods.registerVoter(
        voterData.voterId,
        voterData.firstName,
        voterData.lastName,
        voterData.nrc,
        voterData.ward,
        voterData.constituency,
        voterData.email
      ).send({
        from: this.accounts[0],
        gas: 3000000
      });

      console.log('Voter registered successfully:', voterData.voterId);
    } catch (error) {
      console.error('Failed to register voter:', error);
      throw error;
    }
  }

  async registerCandidate(candidateData: CandidateData): Promise<void> {
    if (!this.contract) {
      throw new Error('Contract not connected. Call connectToContract() or deployContract() first.');
    }

    try {
      await this.contract.methods.registerCandidate(
        candidateData.candidateId,
        candidateData.firstName,
        candidateData.lastName,
        candidateData.otherName,
        candidateData.aliasName,
        candidateData.partyId,
        candidateData.wardCode,
        candidateData.positionId,
        candidateData.electionId
      ).send({
        from: this.accounts[0],
        gas: 3000000
      });

      console.log('Candidate registered successfully:', candidateData.candidateId);
    } catch (error) {
      console.error('Failed to register candidate:', error);
      throw error;
    }
  }

  async getElection(electionId: string): Promise<ElectionData> {
    if (!this.contract) {
      throw new Error('Contract not connected. Call connectToContract() or deployContract() first.');
    }

    try {
      const election = await this.contract.methods.getElection(electionId).call();
      
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
      console.error('Failed to get election:', error);
      throw error;
    }
  }

  async getVoter(voterId: string): Promise<VoterData> {
    if (!this.contract) {
      throw new Error('Contract not connected. Call connectToContract() or deployContract() first.');
    }

    try {
      const voter = await this.contract.methods.getVoter(voterId).call();
      
      return {
        voterId: voter.voterId,
        firstName: voter.firstName,
        lastName: voter.lastName,
        nrc: voter.nrc,
        ward: voter.ward,
        constituency: voter.constituency,
        email: voter.email
      };
    } catch (error) {
      console.error('Failed to get voter:', error);
      throw error;
    }
  }

  async hasVoterVoted(voterId: string, electionId: string): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Contract not connected. Call connectToContract() or deployContract() first.');
    }

    try {
      return await this.contract.methods.hasVoterVoted(voterId, electionId).call();
    } catch (error) {
      console.error('Failed to check if voter has voted:', error);
      throw error;
    }
  }

  async isVoterEligible(voterId: string, electionId: string): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Contract not connected. Call connectToContract() or deployContract() first.');
    }

    try {
      // Check if voter exists and hasn't voted
      const hasVoted = await this.hasVoterVoted(voterId, electionId);
      return !hasVoted;
    } catch (error) {
      console.error('Failed to check voter eligibility:', error);
      return false;
    }
  }

  async getElectionResults(electionId: string): Promise<Record<string, number>> {
    if (!this.contract) {
      throw new Error('Contract not connected. Call connectToContract() or deployContract() first.');
    }

    try {
      // This is a simplified implementation
      // In a real scenario, you'd need to iterate through all candidates
      const results: Record<string, number> = {};
      
      // For now, return empty results
      // You could implement a more sophisticated approach to get all candidates and their vote counts
      
      return results;
    } catch (error) {
      console.error('Failed to get election results:', error);
      throw error;
    }
  }

  async getVoteHistory(voterId: string): Promise<any[]> {
    if (!this.contract) {
      throw new Error('Contract not connected. Call connectToContract() or deployContract() first.');
    }

    try {
      // This would require additional contract methods to track vote history
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Failed to get vote history:', error);
      throw error;
    }
  }

  async getCandidateVoteCount(electionId: string, candidateId: string): Promise<number> {
    if (!this.contract) {
      throw new Error('Contract not connected. Call connectToContract() or deployContract() first.');
    }

    try {
      const voteCount = await this.contract.methods.getCandidateVoteCount(electionId, candidateId).call();
      return parseInt(voteCount);
    } catch (error) {
      console.error('Failed to get candidate vote count:', error);
      throw error;
    }
  }

  generateId(prefix: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${randomId}`;
  }

  getAccounts(): string[] {
    return this.accounts;
  }

  getDefaultAccount(): string {
    return this.accounts[0] || '';
  }
}

export async function getEthereumClient(config?: Partial<EthereumConfig>): Promise<EthereumClient> {
  const defaultConfig: EthereumConfig = {
    providerUrl: 'http://127.0.0.1:7545', // Ganache default
    contractAddress: DEFAULT_CONTRACT_ADDRESS,
    ...config
  };

  const client = new EthereumClient(defaultConfig);
  await client.connect();
  return client;
}

export async function disconnectEthereumClient(): Promise<void> {
  // This would be called when shutting down the application
  console.log('Ethereum client disconnected');
} 