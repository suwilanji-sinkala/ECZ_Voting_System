import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET wards or a specific ward by Ward_Code
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const Ward_Code = searchParams.get('Ward_Code');

  if (Ward_Code) {
    const ward = await prisma.wards.findUnique({ where: { Ward_Code } });
    if (!ward) return NextResponse.json({ message: 'Ward not found' }, { status: 404 });

    const constituency = await prisma.constituencies.findUnique({
      where: { Constituency_Code: ward.Constituency_Code ?? '' },
    });

    const district = constituency
      ? await prisma.districts.findUnique({ where: { District_Code: constituency.District_Code } })
      : null;

    return NextResponse.json({
      ...ward,
      constituency,
      district,
    });
  }

  // Else return all wards
  const wards = await prisma.wards.findMany();
  return NextResponse.json(wards);
}

// POST create a new ward
export async function POST(req: NextRequest) {
  const data = await req.json();
  const ward = await prisma.wards.create({ data });
  return NextResponse.json(ward, { status: 201 });
}

// PUT update a ward (expects id in body)
export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, ...rest } = data;
  const ward = await prisma.wards.update({
    where: { id },
    data: rest,
  });
  return NextResponse.json(ward);
}

// DELETE a ward (expects id in body)
export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const { Ward_Code } = data;
  await prisma.wards.delete({ where: { Ward_Code } });
  return NextResponse.json({ message: 'Ward deleted' });
}
