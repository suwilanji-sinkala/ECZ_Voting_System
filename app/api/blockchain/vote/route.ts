import { NextRequest, NextResponse } from 'next/server';
import { getEthereumClient, VoteData } from '@/lib/ethereum-client';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { voterId, electionId, votes } = await req.json();

    // Validate input
    if (!voterId || !electionId || !votes || !Array.isArray(votes)) {
      return NextResponse.json({ 
        error: 'Invalid request data. voterId, electionId, and votes array are required.' 
      }, { status: 400 });
    }

    console.log('Ethereum blockchain vote submission:', { voterId, electionId, votesCount: votes.length });

    // Get voter details from database
    const voter = await prisma.voters.findUnique({
      where: { id: voterId },
      include: {
        Wards: {
          include: {
            Constituencies: {
              include: {
                Districts: true
              }
            }
          }
        }
      }
    });

    if (!voter) {
      return NextResponse.json({ error: 'Voter not found.' }, { status: 404 });
    }

    // Get election details from database
    const election = await prisma.elections.findUnique({
      where: { Election_ID: Number(electionId) }
    });

    if (!election) {
      return NextResponse.json({ error: 'Election not found.' }, { status: 404 });
    }

    // Check if voter has already voted in this election (database check)
    const existingVotes = await prisma.votes.findMany({
      where: {
        Election_ID: Number(electionId),
        Voters_ID: voterId,
      },
    });
    
    if (existingVotes.length > 0) {
      console.log('Voter already voted:', { voterId, electionId, existingVotesCount: existingVotes.length });
      return NextResponse.json({ error: 'You have already voted in this election.' }, { status: 409 });
    }

    // Get Ethereum client
    const ethereumClient = await getEthereumClient();

    // Submit votes to blockchain
    const blockchainResults = [];
    const databaseVotes = [];

    for (const vote of votes) {
      if (!vote.candidateId) {
        console.error('Invalid vote data:', vote);
        return NextResponse.json({ error: 'Invalid vote data.' }, { status: 400 });
      }

      // Prepare vote data for Ethereum blockchain
      const voteData: VoteData = {
        voterId: voterId,
        electionId: electionId,
        candidateId: vote.candidateId.toString(),
        positionId: vote.positionId?.toString() || '',
        wardCode: voter.Ward
      };

      try {
        // Submit to Ethereum blockchain
        const blockchainResult = await ethereumClient.submitVote(voteData);
        blockchainResults.push(blockchainResult);

        // Prepare for database storage
        databaseVotes.push({
          Election_ID: Number(electionId),
          Voters_ID: voterId,
          Candidate_ID: vote.candidateId,
          Vote_Hash: blockchainResult.voteId || `${voterId}-${electionId}-${vote.candidateId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        });
      } catch (blockchainError) {
        console.error('Ethereum blockchain vote submission failed:', blockchainError);
        return NextResponse.json({ 
          error: 'Failed to submit vote to Ethereum blockchain. Please try again.' 
        }, { status: 500 });
      }
    }

    // Store votes in database as backup/audit trail
    const createdVotes = [];
    for (const voteData of databaseVotes) {
      const createdVote = await prisma.votes.create({
        data: voteData,
      });
      createdVotes.push(createdVote);
    }

    console.log('Votes submitted successfully to both blockchain and database:', { 
      voterId, 
      electionId, 
      blockchainResults: blockchainResults.length,
      databaseVotes: createdVotes.length 
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully submitted ${createdVotes.length} votes to blockchain and database.`,
      blockchainResults,
      databaseVotes: createdVotes
    });

  } catch (error) {
    console.error('Error submitting blockchain vote:', error);
    return NextResponse.json({ 
      error: 'Failed to submit vote. Please try again.' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const voterId = searchParams.get('voterId');
    const electionId = searchParams.get('electionId');

    if (!voterId || !electionId) {
      return NextResponse.json({ error: 'Missing voterId or electionId' }, { status: 400 });
    }

    // Get Ethereum client
    const ethereumClient = await getEthereumClient();

    // Check if voter has voted (Ethereum blockchain check)
    const hasVoted = await ethereumClient.hasVoterVoted(voterId, electionId);

    return NextResponse.json({ hasVoted });
  } catch (error) {
    console.error('Error checking blockchain vote:', error);
    return NextResponse.json({ error: 'Failed to check vote.' }, { status: 500 });
  }
} 