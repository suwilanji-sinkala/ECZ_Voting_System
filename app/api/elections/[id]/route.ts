import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to format election with positions
const formatElectionWithPositions = (election: any) => ({
  ...election,
  positions: election.ElectionPositions?.map((ep: any) => ep.Positions) || []
});

// GET specific election by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const election = await prisma.elections.findUnique({
      where: { Election_ID: Number(params.id) },
      include: {
        ElectionPositions: {
          include: {
            Positions: true
          }
        }
      }
    });

    if (!election) {
      return NextResponse.json(
        { error: 'Election not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(formatElectionWithPositions(election));
  } catch (error) {
    console.error('Error fetching election:', error);
    return NextResponse.json(
      { error: 'Failed to fetch election' },
      { status: 500 }
    );
  }
}

// PUT update specific election
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updateData = await request.json();
    
    const updatedElection = await prisma.elections.update({
      where: { Election_ID: Number(params.id) },
      data: updateData,
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
    console.error('Error updating election:', error);
    return NextResponse.json(
      { error: 'Failed to update election' },
      { status: 500 }
    );
  }
}

// DELETE specific election
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.elections.delete({
      where: { Election_ID: Number(params.id) }
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