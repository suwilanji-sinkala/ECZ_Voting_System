import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEthereumClient, ElectionData } from '@/lib/ethereum-client';
import { logCreate, logUpdate, logDelete, logBlockchainTx, extractUserContext, AuditContext } from '@/lib/audit';

// Helper to format election with positions
const formatElectionWithPositions = (election: any) => ({
  ...election,
  positions: election.ElectionPositions?.map((ep: any) => ep.Positions) || []
});

// GET all elections with their positions
export async function GET() {
  try {
    console.log('Fetching elections...'); // Debug log
    
    const elections = await prisma.elections.findMany({
      include: {
        ElectionPositions: {
          include: {
            Positions: true
          }
        }
      },
      orderBy: { StartDate: 'desc' }
    });

    const formattedElections = elections.map(formatElectionWithPositions);
    return NextResponse.json(formattedElections);
  } catch (error) {
    console.error('Error fetching elections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch elections' },
      { status: 500 }
    );
  }
}

// POST create new election with positions
export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      Description, 
      StartDate, 
      EndDate, 
      Status, 
      Year, 
      Election_Type, 
      positionIds
    } = await request.json();

    // Extract user context for audit logging
    const userContext = await extractUserContext(request);
    const auditContext: AuditContext = {
      request,
      ...userContext
    };

    // Generate unique election ID for blockchain
    const blockchainElectionId = `ELECTION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create election in database first
    const newElection = await prisma.elections.create({
      data: {
        title,
        Description: Description,
        StartDate: StartDate,
        EndDate: EndDate,
        Status: Status || 'draft',
        Year: parseInt(Year) || new Date().getFullYear(),
        Election_Type: Election_Type || 'general',
        ElectionPositions: {
          create: positionIds?.map((id: number) => ({
            Position: id
          })) || []
        }
      },
      include: {
        ElectionPositions: {
          include: {
            Positions: true
          }
        }
      }
    });

    // Log the database creation
    await logCreate(
      'elections',
      newElection.Election_ID.toString(),
      {
        title: newElection.title,
        Description: newElection.Description,
        StartDate: newElection.StartDate,
        EndDate: newElection.EndDate,
        Status: newElection.Status,
        Year: newElection.Year,
        Election_Type: newElection.Election_Type,
        positionIds: positionIds
      },
      auditContext
    );

    // Create election on Ethereum blockchain
    try {
      const ethereumClient = await getEthereumClient();
      
      const electionData: ElectionData = {
        electionId: blockchainElectionId,
        title: title,
        description: Description || '',
        startDate: StartDate,
        endDate: EndDate,
        status: Status || 'draft',
        year: parseInt(Year) || new Date().getFullYear(),
        electionType: Election_Type || 'general',
        wardCode: '',
        constituencyCode: '',
        districtCode: ''
      };

      const txResult = await ethereumClient.createElection(electionData);

      // Log blockchain transaction
      await logBlockchainTx(
        'CREATE_ELECTION',
        'elections',
        newElection.Election_ID.toString(),
        txResult.transactionHash || 'unknown',
        'success',
        undefined,
        auditContext
      );

      console.log('Election created successfully on both database and Ethereum blockchain:', {
        electionId: newElection.Election_ID,
        blockchainId: blockchainElectionId,
        title: title,
        txHash: txResult.transactionHash
      });

      // Return election with blockchain info
      return NextResponse.json({
        ...formatElectionWithPositions(newElection),
        blockchainId: blockchainElectionId,
        blockchainVerified: true,
        transactionHash: txResult.transactionHash
      }, { status: 201 });

    } catch (blockchainError) {
      console.error('Blockchain creation failed, but database election created:', blockchainError);
      
      // Log failed blockchain transaction
      await logBlockchainTx(
        'CREATE_ELECTION',
        'elections',
        newElection.Election_ID.toString(),
        'failed',
        'failed',
        blockchainError instanceof Error ? blockchainError.message : 'Unknown blockchain error',
        auditContext
      );
      
      // Return election without blockchain info (database only)
      return NextResponse.json({
        ...formatElectionWithPositions(newElection),
        blockchainVerified: false,
        blockchainError: 'Failed to create on blockchain'
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error creating election:', error);
    return NextResponse.json(
      { error: 'Failed to create election' },
      { status: 500 }
    );
  }
}

// PUT update election positions
export async function PUT(request: NextRequest) {
  try {
    const { Election_ID, positionIds } = await request.json();

    // Extract user context for audit logging
    const userContext = await extractUserContext(request);
    const auditContext: AuditContext = {
      request,
      ...userContext
    };

    // Get old values before update
    const oldElection = await prisma.elections.findUnique({
      where: { Election_ID: Number(Election_ID) },
      include: {
        ElectionPositions: {
          include: {
            Positions: true
          }
        }
      }
    });

    if (!oldElection) {
      return NextResponse.json(
        { error: 'Election not found' },
        { status: 404 }
      );
    }

    // First remove all existing positions
    await prisma.electionPositions.deleteMany({
      where: { Election: Number(Election_ID) }
    });

    // Then add the new ones
    const updatedElection = await prisma.elections.update({
      where: { Election_ID: Number(Election_ID) },
      data: {
        ElectionPositions: {
          create: positionIds?.map((id: number) => ({
            Position: id
          })) || []
        }
      },
      include: {
        ElectionPositions: {
          include: {
            Positions: true
          }
        }
      }
    });

    // Log the update
    await logUpdate(
      'elections',
      Election_ID.toString(),
      {
        positionIds: oldElection.ElectionPositions?.map(ep => ep.Position) || []
      },
      {
        positionIds: positionIds || []
      },
      auditContext
    );

    return NextResponse.json(formatElectionWithPositions(updatedElection));
  } catch (error) {
    console.error('Error updating election positions:', error);
    return NextResponse.json(
      { error: 'Failed to update election positions' },
      { status: 500 }
    );
  }
}

// DELETE election (will cascade delete ElectionPosition records)
export async function DELETE(request: NextRequest) {
  try {
    const { Election_ID } = await request.json();

    // Extract user context for audit logging
    const userContext = await extractUserContext(request);
    const auditContext: AuditContext = {
      request,
      ...userContext
    };

    // Get election data before deletion for audit log
    const electionToDelete = await prisma.elections.findUnique({
      where: { Election_ID: Number(Election_ID) },
      include: {
        ElectionPositions: {
          include: {
            Positions: true
          }
        },
        Votes: true,
        Election_Voters: true,
        ElectionCandidates: true
      }
    });

    if (!electionToDelete) {
      return NextResponse.json(
        { error: 'Election not found' },
        { status: 404 }
      );
    }

    // First delete all related records to avoid foreign key constraint violations
    await prisma.$transaction(async (tx) => {
      // Delete votes for this election
      await tx.votes.deleteMany({
        where: { Election_ID: Number(Election_ID) }
      });

      // Delete election voters for this election
      await tx.election_Voters.deleteMany({
        where: { ElectionID: Number(Election_ID) }
      });

      // Delete election positions for this election
      await tx.electionPositions.deleteMany({
        where: { Election: Number(Election_ID) }
      });

      // Delete election candidates for this election (fix foreign key constraint)
      await tx.electionCandidates.deleteMany({
        where: { Election: Number(Election_ID) }
      });

      // Finally delete the election
      await tx.elections.delete({
        where: { Election_ID: Number(Election_ID) }
      });
    });

    // Log the deletion
    await logDelete(
      'elections',
      Election_ID.toString(),
      {
        title: electionToDelete.title,
        Description: electionToDelete.Description,
        StartDate: electionToDelete.StartDate,
        EndDate: electionToDelete.EndDate,
        Status: electionToDelete.Status,
        Year: electionToDelete.Year,
        Election_Type: electionToDelete.Election_Type,
        positionCount: electionToDelete.ElectionPositions?.length || 0,
        voteCount: electionToDelete.Votes?.length || 0,
        voterCount: electionToDelete.Election_Voters?.length || 0,
        candidateCount: electionToDelete.ElectionCandidates?.length || 0
      },
      auditContext
    );

    return NextResponse.json(
      { message: 'Election deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting election:', error);
    return NextResponse.json(
      { error: 'Failed to delete election' },
      { status: 500 }
    );
  }
}
