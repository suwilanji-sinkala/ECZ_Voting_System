import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET voters or a specific voter by voter_id
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const Voter_Id = searchParams.get('Voter_Id');

  if (Voter_Id) {
    const voter = await prisma.voters.findUnique({ where: { id: Voter_Id } });
    if (!voter) return NextResponse.json({ message: 'Voter not found' }, { status: 404 });
    //get voters ward details
    const ward = await prisma.wards.findUnique({ where: { Ward_Code: voter.Ward_Code ?? '' } });

    const constituency = await prisma.constituencies.findUnique({
      where: { Constituency_Code: ward.Constituency_Code ?? '' },
    });

    const district = constituency
      ? await prisma.districts.findUnique({ where: { District_Code: constituency.District_Code } })
      : null;

    return NextResponse.json({
      ...voter,
      ward,
      constituency,
      district,
    });
  }

  // Else return all voters
  const voters = await prisma.voters.findMany();
  return NextResponse.json(voters);
}

// POST create a new voter
export async function POST(req: NextRequest) {
  const data = await req.json();
  const voter = await prisma.voters.create({ data });
  return NextResponse.json(voter, { status: 201 });
}

// PUT update a voter (expects id in body)
export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, ...rest } = data;
  const voter = await prisma.voters.update({
    where: { id },
    data: rest,
  });
  return NextResponse.json(voter);
}

// DELETE a voter (expects id in body)
export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const { Voter_Id } = data;
  await prisma.voters.delete({ where: { id: Voter_Id } });
  return NextResponse.json({ message: 'Voter deleted' });
}
