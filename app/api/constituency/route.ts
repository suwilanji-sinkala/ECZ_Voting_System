import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all constituencies
export async function GET(req: NextRequest) {
  try {
    const constituencies = await prisma.constituencies.findMany({
      include: {
        Districts: {
          include: {
            Provinces: true
          }
        }
      },
      orderBy: { Constituency_Name: 'asc' }
    });
    
    return NextResponse.json(constituencies);
  } catch (error) {
    console.error('Error fetching constituencies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch constituencies' },
      { status: 500 }
    );
  }
}

// POST create new constituency
export async function POST(req: NextRequest) {
  try {
    const { Constituency_Name, District_Code } = await req.json();
    
    if (!Constituency_Name || !District_Code) {
      return NextResponse.json(
        { error: 'Constituency name and district code are required' },
        { status: 400 }
      );
    }

    const constituency = await prisma.constituencies.create({
      data: { 
        Constituency_Name, 
        District_Code 
      },
      include: {
        Districts: {
          include: {
            Provinces: true
          }
        }
      }
    });
    
    return NextResponse.json(constituency, { status: 201 });
  } catch (error) {
    console.error('Error creating constituency:', error);
    return NextResponse.json(
      { error: 'Failed to create constituency' },
      { status: 500 }
    );
  }
}

// PUT update a constituency (expects Constituency_Code in body)
export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { Constituency_Code, ...rest } = data; // Changed from 'id' to 'Constituency_Code'
  const constituency = await prisma.constituencies.update({
    where: { Constituency_Code }, // Use the correct primary key
    data: rest,
  });
  return NextResponse.json(constituency);
}

// DELETE a constituency (expects Constituency_Code in body)
export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const { Constituency_Code } = data; // Changed from 'id' to 'Constituency_Code'
  await prisma.constituencies.delete({ 
    where: { Constituency_Code } // Use the correct primary key
  });
  return NextResponse.json({ message: 'Constituency deleted' });
}