import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET wards or a specific ward by Ward_Code
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const Ward_Code = searchParams.get('Ward_Code');

    if (Ward_Code) {
      const ward = await prisma.wards.findUnique({ 
        where: { Ward_Code },
        include: {
          Constituencies: {
            include: {
              Districts: {
                include: {
                  Provinces: true
                }
              }
            }
          }
        }
      });
      
      if (!ward) {
        return NextResponse.json({ message: 'Ward not found' }, { status: 404 });
      }

      return NextResponse.json({
        ...ward,
        constituency: ward.Constituencies,
        district: ward.Constituencies?.Districts,
        province: ward.Constituencies?.Districts?.Provinces
      });
    }

    // Else return all wards with full location hierarchy
    const wards = await prisma.wards.findMany({
      include: {
        Constituencies: {
          include: {
            Districts: {
              include: {
                Provinces: true
              }
            }
          }
        }
      },
      orderBy: { Ward_Name: 'asc' }
    });
    
    return NextResponse.json(wards);
  } catch (error) {
    console.error('Error fetching wards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wards' },
      { status: 500 }
    );
  }
}

// POST create a new ward
export async function POST(req: NextRequest) {
  try {
    const { Ward_Code, Ward_Name, Constituency_Code } = await req.json();
    
    if (!Ward_Code || !Ward_Name) {
      return NextResponse.json(
        { error: 'Ward code and name are required' },
        { status: 400 }
      );
    }

    const ward = await prisma.wards.create({ 
      data: { 
        Ward_Code, 
        Ward_Name, 
        Constituency_Code: Constituency_Code ? parseInt(Constituency_Code) : null 
      },
      include: {
        Constituencies: {
          include: {
            Districts: {
              include: {
                Provinces: true
              }
            }
          }
        }
      }
    });
    
    return NextResponse.json(ward, { status: 201 });
  } catch (error) {
    console.error('Error creating ward:', error);
    return NextResponse.json(
      { error: 'Failed to create ward' },
      { status: 500 }
    );
  }
}

// PUT update a ward (expects id in body)
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, ...rest } = data;
    
    const ward = await prisma.wards.update({
      where: { id },
      data: rest,
      include: {
        Constituencies: {
          include: {
            Districts: {
              include: {
                Provinces: true
              }
            }
          }
        }
      }
    });
    
    return NextResponse.json(ward);
  } catch (error) {
    console.error('Error updating ward:', error);
    return NextResponse.json(
      { error: 'Failed to update ward' },
      { status: 500 }
    );
  }
}

// DELETE a ward (expects Ward_Code in body)
export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json();
    const { Ward_Code } = data;
    
    await prisma.wards.delete({ where: { Ward_Code } });
    return NextResponse.json({ message: 'Ward deleted successfully' });
  } catch (error) {
    console.error('Error deleting ward:', error);
    return NextResponse.json(
      { error: 'Failed to delete ward' },
      { status: 500 }
    );
  }
}
