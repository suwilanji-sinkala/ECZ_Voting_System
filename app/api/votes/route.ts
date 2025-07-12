import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const electionId = Number(searchParams.get('electionId'));
    const voterId = searchParams.get('voterId');

    if (!electionId || !voterId) {
      return NextResponse.json({ error: 'Missing electionId or voterId' }, { status: 400 });
    }

    const vote = await prisma.votes.findFirst({
      where: {
        Election_ID: electionId,
        Voters_ID: voterId, // Updated field name
      },
    });

    return NextResponse.json({ hasVoted: !!vote });
  } catch (error) {
    console.error('Error checking vote:', error);
    return NextResponse.json({ error: 'Failed to check vote.' }, { status: 500 });
  }
} 