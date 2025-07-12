import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Position {
  Position_ID: number;
  Position_Name: string;
}

// GET positions or a specific position by Position_ID
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const Position_ID = searchParams.get('Position_ID');

    if (Position_ID) {
      const position = await prisma.positions.findUnique({ 
        where: { Position_ID: Number(Position_ID) } 
      });
      if (!position) {
        return NextResponse.json(
          { error: 'Position not found' }, 
          { status: 404 }
        );
      }
      return NextResponse.json(position);
    }

    // Else return all positions with consistent structure
    const positions = await prisma.positions.findMany({
      select: {
        Position_ID: true,
        Position_Name: true
      },
      orderBy: {
        Position_Name: 'asc'
      }
    });

    return NextResponse.json(positions);
  } catch (error) {
    console.error('Error in positions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create a new position
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.Position_Name) {
      return NextResponse.json(
        { error: 'Position_Name is required' },
        { status: 400 }
      );
    }

    // Check for duplicate position name
    const existingPosition = await prisma.positions.findFirst({
      where: { Position_Name: data.Position_Name }
    });
    
    if (existingPosition) {
      return NextResponse.json(
        { error: 'Position with this name already exists' },
        { status: 409 }
      );
    }

    const position = await prisma.positions.create({ 
      data: {
        Position_Name: data.Position_Name.trim()
      }
    });
    
    return NextResponse.json(position, { status: 201 });
  } catch (error) {
    console.error('Error creating position:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update a position
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { Position_ID, ...rest } = data;

    if (!Position_ID) {
      return NextResponse.json(
        { error: 'Position_ID is required' },
        { status: 400 }
      );
    }

    // Check if position exists
    const existingPosition = await prisma.positions.findUnique({
      where: { Position_ID: Number(Position_ID) }
    });
    
    if (!existingPosition) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    // Validate if name is being updated
    if (rest.Position_Name && rest.Position_Name !== existingPosition.Position_Name) {
      const nameExists = await prisma.positions.findFirst({
        where: { 
          Position_Name: rest.Position_Name,
          NOT: { Position_ID: Number(Position_ID) }
        }
      });
      
      if (nameExists) {
        return NextResponse.json(
          { error: 'Position with this name already exists' },
          { status: 409 }
        );
      }
    }

    const updatedPosition = await prisma.positions.update({
      where: { Position_ID: Number(Position_ID) },
      data: {
        ...rest,
        Position_Name: rest.Position_Name?.trim()
      }
    });

    return NextResponse.json(updatedPosition);
  } catch (error) {
    console.error('Error updating position:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE a position
export async function DELETE(req: NextRequest) {
  try {
    const { Position_ID } = await req.json();

    if (!Position_ID) {
      return NextResponse.json(
        { error: 'Position_ID is required' },
        { status: 400 }
      );
    }

    // Check if position exists
    const existingPosition = await prisma.positions.findUnique({
      where: { Position_ID: Number(Position_ID) }
    });
    
    if (!existingPosition) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    // Check if position is being used by any candidates
    const candidatesWithPosition = await prisma.candidates.count({
      where: { Position_ID: Number(Position_ID) }
    });

    if (candidatesWithPosition > 0) {
      return NextResponse.json(
        { error: 'Cannot delete position assigned to candidates' },
        { status: 409 }
      );
    }

    await prisma.positions.delete({
      where: { Position_ID: Number(Position_ID) }
    });

    return NextResponse.json({ 
      message: 'Position deleted successfully',
      deletedPosition: {
        Position_ID: Number(Position_ID),
        Position_Name: existingPosition.Position_Name
      }
    });
  } catch (error) {
    console.error('Error deleting position:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}