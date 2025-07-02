import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all constituencies
export async function GET() {
  const constituencies = await prisma.constituencies.findMany();
  return NextResponse.json(constituencies);
}

// POST create a new constitueny
export async function POST(req: NextRequest) {
  const data = await req.json();
  const constitueny = await prisma.constituencies.create({ data });
  return NextResponse.json(constitueny, { status: 201 });
}

// PUT update a constitueny (expects id in body)
export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, ...rest } = data;
  const constitueny = await prisma.constituencies.update({
    where: { id },
    data: rest,
  });
  return NextResponse.json(constitueny);
}

// DELETE a constitueny (expects id in body)
export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const { id } = data;
  await prisma.constituencies.delete({ where: { id } });
  return NextResponse.json({ message: 'constitueny deleted' });
}