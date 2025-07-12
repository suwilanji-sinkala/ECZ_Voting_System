import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all provinces
export async function GET(req: NextRequest) {
  try {
    const provinces = await prisma.provinces.findMany({
      orderBy: { Province_Name: 'asc' }
    });
    
    return NextResponse.json(provinces);
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provinces' },
      { status: 500 }
    );
  }
}

// POST create new province
export async function POST(req: NextRequest) {
  try {
    const { Province_Name } = await req.json();
    
    if (!Province_Name) {
      return NextResponse.json(
        { error: 'Province name is required' },
        { status: 400 }
      );
    }

    const province = await prisma.provinces.create({
      data: { Province_Name }
    });
    
    return NextResponse.json(province, { status: 201 });
  } catch (error) {
    console.error('Error creating province:', error);
    return NextResponse.json(
      { error: 'Failed to create province' },
      { status: 500 }
    );
  }
} 