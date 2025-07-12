import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all districts
export async function GET(req: NextRequest) {
  try {
    const districts = await prisma.districts.findMany({
      include: {
        Provinces: true
      },
      orderBy: { District_Name: 'asc' }
    });
    
    return NextResponse.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch districts' },
      { status: 500 }
    );
  }
}

// POST create new district
export async function POST(req: NextRequest) {
  try {
    const { District_Code, District_Name, Province_Code } = await req.json();
    
    if (!District_Code || !District_Name) {
      return NextResponse.json(
        { error: 'District code and name are required' },
        { status: 400 }
      );
    }

    const district = await prisma.districts.create({
      data: { 
        District_Code, 
        District_Name, 
        Province_Code: Province_Code ? parseInt(Province_Code) : null 
      },
      include: {
        Provinces: true
      }
    });
    
    return NextResponse.json(district, { status: 201 });
  } catch (error) {
    console.error('Error creating district:', error);
    return NextResponse.json(
      { error: 'Failed to create district' },
      { status: 500 }
    );
  }
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