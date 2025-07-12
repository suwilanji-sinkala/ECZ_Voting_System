import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    return NextResponse.json(formatElectionWithPositions(newElection), { status: 201 });
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