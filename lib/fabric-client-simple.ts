import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Simplified blockchain simulation for development
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

export interface VoteResult {
  success: boolean;
  message: string;
  voteId?: string;
}

// In-memory blockchain simulation
class SimpleBlockchain {
  private votes: Map<string, any> = new Map();
  private elections: Map<string, ElectionData> = new Map();
  private voters: Map<string, VoterData> = new Map();
  private candidates: Map<string, CandidateData> = new Map();
  private voterElections: Map<string, Set<string>> = new Map(); // voterId -> Set<electionId>

  constructor() {
    this.loadData();
  }

  private getDataPath(): string {
    return path.join(process.cwd(), 'blockchain-data');
  }

  private loadData(): void {
    const dataPath = this.getDataPath();
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
      return;
    }

    try {
      if (fs.existsSync(path.join(dataPath, 'votes.json'))) {
        const votesData = JSON.parse(fs.readFileSync(path.join(dataPath, 'votes.json'), 'utf8'));
        this.votes = new Map(Object.entries(votesData));
      }
      if (fs.existsSync(path.join(dataPath, 'elections.json'))) {
        const electionsData = JSON.parse(fs.readFileSync(path.join(dataPath, 'elections.json'), 'utf8'));
        this.elections = new Map(Object.entries(electionsData));
      }
      if (fs.existsSync(path.join(dataPath, 'voters.json'))) {
        const votersData = JSON.parse(fs.readFileSync(path.join(dataPath, 'voters.json'), 'utf8'));
        this.voters = new Map(Object.entries(votersData));
      }
      if (fs.existsSync(path.join(dataPath, 'candidates.json'))) {
        const candidatesData = JSON.parse(fs.readFileSync(path.join(dataPath, 'candidates.json'), 'utf8'));
        this.candidates = new Map(Object.entries(candidatesData));
      }
      if (fs.existsSync(path.join(dataPath, 'voter-elections.json'))) {
        const voterElectionsData = JSON.parse(fs.readFileSync(path.join(dataPath, 'voter-elections.json'), 'utf8'));
        this.voterElections = new Map(Object.entries(voterElectionsData).map(([k, v]) => [k, new Set(v as string[])]));
      }
    } catch (error) {
      console.warn('Failed to load blockchain data:', error);
    }
  }

  private saveData(): void {
    const dataPath = this.getDataPath();
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }

    try {
      fs.writeFileSync(path.join(dataPath, 'votes.json'), JSON.stringify(Object.fromEntries(this.votes), null, 2));
      fs.writeFileSync(path.join(dataPath, 'elections.json'), JSON.stringify(Object.fromEntries(this.elections), null, 2));
      fs.writeFileSync(path.join(dataPath, 'voters.json'), JSON.stringify(Object.fromEntries(this.voters), null, 2));
      fs.writeFileSync(path.join(dataPath, 'candidates.json'), JSON.stringify(Object.fromEntries(this.candidates), null, 2));
      const voterElectionsData = Object.fromEntries(
        Array.from(this.voterElections.entries()).map(([k, v]) => [k, Array.from(v)])
      );
      fs.writeFileSync(path.join(dataPath, 'voter-elections.json'), JSON.stringify(voterElectionsData, null, 2));
    } catch (error) {
      console.error('Failed to save blockchain data:', error);
    }
  }

  submitVote(voteData: VoteData): VoteResult {
    const voteId = `VOTE_${uuidv4()}`;
    const voteHash = crypto.createHash('sha256').update(`${voteData.voterId}-${voteData.electionId}-${voteData.candidateId}-${Date.now()}`).digest('hex');

    // Check if voter has already voted in this election
    if (this.hasVoterVoted(voteData.voterId, voteData.electionId)) {
      return {
        success: false,
        message: 'Voter has already voted in this election'
      };
    }

    // Check voter eligibility
    if (!this.isVoterEligible(voteData.voterId, voteData.electionId)) {
      return {
        success: false,
        message: 'Voter is not eligible for this election'
      };
    }

    const vote = {
      voteId,
      voterId: voteData.voterId,
      electionId: voteData.electionId,
      candidateId: voteData.candidateId,
      positionId: voteData.positionId,
      wardCode: voteData.wardCode,
      timestamp: new Date().toISOString(),
      voteHash
    };

    this.votes.set(voteId, vote);

    // Mark voter as having voted in this election
    if (!this.voterElections.has(voteData.voterId)) {
      this.voterElections.set(voteData.voterId, new Set());
    }
    this.voterElections.get(voteData.voterId)!.add(voteData.electionId);

    this.saveData();

    return {
      success: true,
      message: 'Vote submitted successfully',
      voteId
    };
  }

  hasVoterVoted(voterId: string, electionId: string): boolean {
    const voterElections = this.voterElections.get(voterId);
    return voterElections ? voterElections.has(electionId) : false;
  }

  isVoterEligible(voterId: string, electionId: string): boolean {
    const voter = this.voters.get(voterId);
    const election = this.elections.get(electionId);

    if (!voter || !election) {
      return false;
    }

    // General elections are open to all
    if (election.electionType === 'general') {
      return true;
    }

    // Check location-based eligibility
    if (election.wardCode && voter.ward === election.wardCode) {
      return true;
    }
    if (election.constituencyCode && voter.constituency === election.constituencyCode) {
      return true;
    }

    return false;
  }

  createElection(electionData: ElectionData): void {
    this.elections.set(electionData.electionId, electionData);
    this.saveData();
  }

  registerVoter(voterData: VoterData): void {
    this.voters.set(voterData.voterId, voterData);
    this.saveData();
  }

  registerCandidate(candidateData: CandidateData): void {
    this.candidates.set(candidateData.candidateId, candidateData);
    this.saveData();
  }

  getElection(electionId: string): ElectionData | undefined {
    return this.elections.get(electionId);
  }

  getVoter(voterId: string): VoterData | undefined {
    return this.voters.get(voterId);
  }

  getElectionResults(electionId: string): Record<string, number> {
    const results: Record<string, number> = {};
    
    for (const vote of this.votes.values()) {
      if (vote.electionId === electionId) {
        results[vote.candidateId] = (results[vote.candidateId] || 0) + 1;
      }
    }

    return results;
  }

  getVoteHistory(voterId: string): any[] {
    const votes: any[] = [];
    
    for (const vote of this.votes.values()) {
      if (vote.voterId === voterId) {
        votes.push(vote);
      }
    }

    return votes;
  }
}

// Singleton instance
const blockchain = new SimpleBlockchain();

export class SimpleFabricClient {
  async submitVote(voteData: VoteData): Promise<VoteResult> {
    return blockchain.submitVote(voteData);
  }

  async hasVoterVoted(voterId: string, electionId: string): Promise<boolean> {
    return blockchain.hasVoterVoted(voterId, electionId);
  }

  async isVoterEligible(voterId: string, electionId: string): Promise<boolean> {
    return blockchain.isVoterEligible(voterId, electionId);
  }

  async createElection(electionData: ElectionData): Promise<void> {
    blockchain.createElection(electionData);
  }

  async registerVoter(voterData: VoterData): Promise<void> {
    blockchain.registerVoter(voterData);
  }

  async registerCandidate(candidateData: CandidateData): Promise<void> {
    blockchain.registerCandidate(candidateData);
  }

  async getElection(electionId: string): Promise<ElectionData | undefined> {
    return blockchain.getElection(electionId);
  }

  async getVoter(voterId: string): Promise<VoterData | undefined> {
    return blockchain.getVoter(voterId);
  }

  async getElectionResults(electionId: string): Promise<Record<string, number>> {
    return blockchain.getElectionResults(electionId);
  }

  async getVoteHistory(voterId: string): Promise<any[]> {
    return blockchain.getVoteHistory(voterId);
  }

  generateId(prefix: string): string {
    return `${prefix}_${uuidv4()}`;
  }
}

// Export singleton instance
export const simpleFabricClient = new SimpleFabricClient(); 