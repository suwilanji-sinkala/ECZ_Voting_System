import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET parties or a specific party by Party_ID
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const Party_ID = searchParams.get('Party_ID');

  if (Party_ID) {
    const party = await prisma.parties.findUnique({ where: { Party_ID: Number(Party_ID) } });
    if (!party) return NextResponse.json({ message: 'Party not found' }, { status: 404 });
    return NextResponse.json(party);
  }

  // Else return all parties
  const parties = await prisma.parties.findMany();
  return NextResponse.json(parties);
}

// POST create a new party
export async function POST(req: NextRequest) {
  const data = await req.json();
  const party = await prisma.parties.create({ data });
  return NextResponse.json(party, { status: 201 });
}

// PUT update a party (expects Party_ID in body)
export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { Party_ID, ...rest } = data;
  const party = await prisma.parties.update({
    where: { Party_ID: Number(Party_ID) },
    data: rest,
  });
  return NextResponse.json(party);
}

// DELETE a party (expects Party_ID in body)
export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const { Party_ID } = data;
  await prisma.parties.delete({ where: { Party_ID: Number(Party_ID) } });
  return NextResponse.json({ message: 'Party deleted' });
}