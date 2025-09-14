import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logVoteSubmit, logBlockchainTx, extractUserContext, AuditContext } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { voterId, electionId, candidateId, positionId, wardCode } = await req.json();

    // Extract user context for audit logging
    const userContext = await extractUserContext(req);
    const auditContext: AuditContext = {
      request: req,
      ...userContext
    };

    // Validate required fields
    if (!voterId || !electionId || !candidateId || !positionId) {
      return NextResponse.json(
        { error: 'Missing required fields: voterId, electionId, candidateId, positionId' },
        { status: 400 }
      );
    }

    // Check if voter exists
    const voter = await prisma.voters.findUnique({
      where: { id: voterId }
    });

    if (!voter) {
      return NextResponse.json(
        { error: 'Voter not found' },
        { status: 404 }
      );
    }

    // Check if election exists and is active
    const election = await prisma.elections.findUnique({
      where: { Election_ID: Number(electionId) }
    });

    if (!election) {
      return NextResponse.json(
        { error: 'Election not found' },
        { status: 404 }
      );
    }

    if (election.Status !== 'active') {
      return NextResponse.json(
        { error: 'Election is not active' },
        { status: 400 }
      );
    }

    // Check if voter has already voted in this election
    const existingVote = await prisma.votes.findFirst({
      where: {
        Voters_ID: voterId,
        Election_ID: Number(electionId)
      }
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'Voter has already voted in this election' },
        { status: 400 }
      );
    }

    // Check if candidate exists
    const candidate = await prisma.candidates.findUnique({
      where: { Candidate_ID: Number(candidateId) }
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Generate vote hash for integrity
    const voteHash = `VOTE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create vote in database
    const createdVote = await prisma.votes.create({
      data: {
        Candidate_ID: Number(candidateId),
        Ward_Code: wardCode || voter.Ward,
        Election_ID: Number(electionId),
        Vote_Hash: voteHash,
        Voters_ID: voterId
      }
    });

    // Log the vote submission
    await logVoteSubmit(
      voterId,
      electionId,
      candidateId,
      undefined, // No blockchain transaction hash yet
      auditContext
    );

    // Try to submit vote to blockchain
    try {
      // Import blockchain client
      const { getEthereumClient } = await import('@/lib/ethereum-client');
      const ethereumClient = await getEthereumClient();
      
      const blockchainVoteId = `VOTE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const txResult = await ethereumClient.submitVote({
        voteId: blockchainVoteId,
        voterId: voterId,
        electionId: electionId,
        candidateId: candidateId,
        positionId: positionId,
        wardCode: wardCode || voter.Ward
      });

      // Update vote record with blockchain transaction hash
      await prisma.votes.update({
        where: { Vote_ID: createdVote.Vote_ID },
        data: {
          Vote_Hash: `${voteHash}_${txResult.transactionHash}`
        }
      });

      // Log blockchain transaction
      await logBlockchainTx(
        'VOTE_SUBMIT',
        'votes',
        createdVote.Vote_ID.toString(),
        txResult.transactionHash || 'unknown',
        'success',
        undefined,
        auditContext
      );

      console.log('Vote submitted successfully to both database and blockchain:', {
        voteId: createdVote.Vote_ID,
        voterId: voterId,
        electionId: electionId,
        candidateId: candidateId,
        txHash: txResult.transactionHash
      });

      return NextResponse.json({
        success: true,
        voteId: createdVote.Vote_ID,
        voteHash: `${voteHash}_${txResult.transactionHash}`,
        blockchainVerified: true,
        transactionHash: txResult.transactionHash,
        message: 'Vote submitted successfully'
      });

    } catch (blockchainError) {
      console.error('Blockchain vote submission failed, but database vote created:', blockchainError);
      
      // Log failed blockchain transaction
      await logBlockchainTx(
        'VOTE_SUBMIT',
        'votes',
        createdVote.Vote_ID.toString(),
        'failed',
        'failed',
        blockchainError instanceof Error ? blockchainError.message : 'Unknown blockchain error',
        auditContext
      );

      // Return success with database-only vote
      return NextResponse.json({
        success: true,
        voteId: createdVote.Vote_ID,
        voteHash: voteHash,
        blockchainVerified: false,
        blockchainError: 'Failed to submit to blockchain',
        message: 'Vote submitted to database only'
      });
    }

  } catch (error) {
    console.error('Error submitting vote:', error);
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const voterId = searchParams.get('voterId');
    const electionId = searchParams.get('electionId');

    if (!voterId || !electionId) {
      return NextResponse.json(
        { error: 'Missing required parameters: voterId, electionId' },
        { status: 400 }
      );
    }

    // Check if voter has voted in this election
    const vote = await prisma.votes.findFirst({
      where: {
        Voters_ID: voterId,
        Election_ID: Number(electionId)
      },
      include: {
        Candidates: {
          select: {
            FirstName: true,
            LastName: true,
            AliasName: true
          }
        }
      }
    });

    if (!vote) {
      return NextResponse.json({
        hasVoted: false,
        message: 'Voter has not voted in this election'
      });
    }

    return NextResponse.json({
      hasVoted: true,
      voteId: vote.Vote_ID,
      voteHash: vote.Vote_Hash,
      candidate: vote.Candidates ? {
        name: `${vote.Candidates.FirstName} ${vote.Candidates.LastName}`,
        alias: vote.Candidates.AliasName
      } : null,
      message: 'Voter has already voted in this election'
    });

  } catch (error) {
    console.error('Error checking vote status:', error);
    return NextResponse.json(
      { error: 'Failed to check vote status' },
      { status: 500 }
    );
  }
}
