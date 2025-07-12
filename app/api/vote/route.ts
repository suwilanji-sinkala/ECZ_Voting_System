import { NextRequest, NextResponse } from 'next/server';
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

    console.log('Vote submission:', { voterId, electionId, votesCount: votes.length });

    // Check if voter has already voted in this election
    const existingVotes = await prisma.votes.findMany({
      where: {
        Election_ID: electionId,
        Voters_ID: voterId,
      },
    });
    
    // If voter has already voted for any position in this election, prevent voting again
    if (existingVotes.length > 0) {
      console.log('Voter already voted:', { voterId, electionId, existingVotesCount: existingVotes.length });
      return NextResponse.json({ error: 'You have already voted in this election.' }, { status: 409 });
    }

    // Create votes for each position
    const createdVotes = [];
    for (const vote of votes) {
      if (!vote.candidateId) {
        console.error('Invalid vote data:', vote);
        return NextResponse.json({ error: 'Invalid vote data.' }, { status: 400 });
      }

      const createdVote = await prisma.votes.create({
        data: {
          Election_ID: electionId,
          Voters_ID: voterId,
          Candidate_ID: vote.candidateId,
          // Generate a unique vote hash for security
          Vote_Hash: `${voterId}-${electionId}-${vote.candidateId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        },
      });
      createdVotes.push(createdVote);
    }

    console.log('Votes created successfully:', { 
      voterId, 
      electionId, 
      votesCreated: createdVotes.length 
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully submitted ${createdVotes.length} votes.` 
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    return NextResponse.json({ 
      error: 'Failed to submit vote. Please try again.' 
    }, { status: 500 });
  }
} 