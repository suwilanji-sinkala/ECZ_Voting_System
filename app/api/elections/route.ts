import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEthereumClient, ElectionData } from '@/lib/ethereum-client';

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
export async function POST(request: Request) {
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

      await ethereumClient.createElection(electionData);

      console.log('Election created successfully on both database and Ethereum blockchain:', {
        electionId: newElection.Election_ID,
        blockchainId: blockchainElectionId,
        title: title
      });

      // Return election with blockchain info
      return NextResponse.json({
        ...formatElectionWithPositions(newElection),
        blockchainId: blockchainElectionId,
        blockchainVerified: true
      }, { status: 201 });

    } catch (blockchainError) {
      console.error('Blockchain creation failed, but database election created:', blockchainError);
      
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
export async function PUT(request: Request) {
  try {
    const { Election_ID, positionIds } = await request.json();

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
export async function DELETE(request: Request) {
  try {
    const { Election_ID } = await request.json();

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