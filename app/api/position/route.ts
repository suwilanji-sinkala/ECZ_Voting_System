import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET positions or a specific position by Position_ID
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const Position_ID = searchParams.get('Position_ID');

  if (Position_ID) {
    const position = await prisma.positions.findUnique({ where: { Position_ID: Number(Position_ID) } });
    if (!position) return NextResponse.json({ message: 'Position not found' }, { status: 404 });
    return NextResponse.json(position);
  }

  // Else return all positions
  const positions = await prisma.positions.findMany();
  return NextResponse.json(positions);
}

// POST create a new position
export async function POST(req: NextRequest) {
  const data = await req.json();
  const position = await prisma.positions.create({ data });
  return NextResponse.json(position, { status: 201 });
}

// PUT update a position (expects Position_ID in body)
export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { Position_ID, ...rest } = data;
  const position = await prisma.positions.update({
    where: { Position_ID: Number(Position_ID) },
    data: rest,
  });
  return NextResponse.json(position);
}

// DELETE a position (expects Position_ID in body)
export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const { Position_ID } = data;
  await prisma.positions.delete({ where: { Position_ID: Number(Position_ID) } });
  return NextResponse.json({ message: 'Position deleted' });
}