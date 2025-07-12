import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
    return { message: error.message };
  }
  return { message: 'An unknown error occurred' };
}

export async function GET() {
  try {
    const electionPositions = await prisma.electionPositions.findMany({
      include: {
        Elections: true,
        Positions: true
      }
    });
    return NextResponse.json(electionPositions);
  } catch (error) {
    const errorDetails = handleError(error);
    return NextResponse.json(
      { error: 'Failed to fetch election positions', details: errorDetails.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { Election, Position } = await request.json();

    const existing = await prisma.electionPositions.findFirst({
      where: {
        Election: Number(Election),
        Position: Number(Position)
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Position already assigned to election' },
        { status: 400 }
      );
    }

    const newElectionPosition = await prisma.electionPositions.create({
      data: {
        Election: Number(Election),
        Position: Number(Position)
      },
      include: {
        Elections: true,
        Positions: true
      }
    });

    return NextResponse.json(newElectionPosition, { status: 201 });
  } catch (error) {
    const errorDetails = handleError(error);
    return NextResponse.json(
      { error: 'Failed to create relationship', details: errorDetails.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    await prisma.electionPositions.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json(
      { message: 'Relationship deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    const errorDetails = handleError(error);
    return NextResponse.json(
      { error: 'Failed to delete relationship', details: errorDetails.message },
      { status: 500 }
    );
  }
}