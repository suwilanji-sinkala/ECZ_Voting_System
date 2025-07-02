import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all districts
export async function GET() {
  const districts = await prisma.districts.findMany();
  return NextResponse.json(districts);
}

// POST create a new district
export async function POST(req: NextRequest) {
  const data = await req.json();
  const district = await prisma.districts.create({ data });
  return NextResponse.json(district, { status: 201 });
}

// PUT update a district (expects id in body)
export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, ...rest } = data;
  const district = await prisma.districts.update({
    where: { id },
    data: rest,
  });
  return NextResponse.json(district);
}

// DELETE a district (expects id in body)
export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const { District_Code } = data;
  await prisma.districts.delete({ where: { District_Code } });
  return NextResponse.json({ message: 'district deleted' });
}