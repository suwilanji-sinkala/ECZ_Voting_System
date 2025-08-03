import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET draft elections with their positions
export async function GET() {
  try {
    console.log('Fetching draft elections...'); // Debug log
    
    const draftElections = await prisma.elections.findMany({
      where: {
        Status: 'draft'
      },
      include: {
        ElectionPositions: {
          include: {
            Positions: true
          }
        }
      },
      orderBy: { StartDate: 'desc' }
    });

    const formattedElections = draftElections.map(election => ({
      ...election,
      positions: election.ElectionPositions?.map((ep: any) => ep.Positions) || []
    }));

    return NextResponse.json(formattedElections);
  } catch (error) {
    console.error('Error fetching draft elections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draft elections' },
      { status: 500 }
    );
  }
} 