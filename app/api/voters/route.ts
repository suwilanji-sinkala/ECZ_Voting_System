import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET voters or a specific voter by voter_id
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const Voter_Id = searchParams.get('Voter_Id');

    if (Voter_Id) {
      const voter = await prisma.voters.findUnique({ 
        where: { id: Voter_Id },
        include: {
          Wards: {
            include: {
              Constituencies: {
                include: {
                  Districts: true
                }
              }
            }
          }
        }
      });
      
      if (!voter) {
        return NextResponse.json({ message: 'Voter not found' }, { status: 404 });
      }

      return NextResponse.json({
        ...voter,
        ward: voter.Wards,
        constituency: voter.Wards?.Constituencies,
        district: voter.Wards?.Constituencies?.Districts,
      });
    }

    // Else return all voters with their ward details
    const voters = await prisma.voters.findMany({
      include: {
        Wards: {
          include: {
            Constituencies: {
              include: {
                Districts: true
              }
            }
          }
        }
      }
    });
    
    return NextResponse.json(voters);
  } catch (error) {
    console.error('Error fetching voters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voters' },
      { status: 500 }
    );
  }
}

// POST create a new voter
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  if (url.pathname.endsWith('/login')) {
    const { NRC, password } = await req.json();
    const voter = await prisma.voters.findUnique({ where: { NRC: NRC } });
    if (!voter) {
      return NextResponse.json({ error: 'Voter not found' }, { status: 404 });
    }
    if (voter.passwordHash !== password) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }
    return NextResponse.json({ success: true, voter: { id: voter.id, First_Name: voter.First_Name, Last_Name: voter.Last_Name } });
  }
  try {
    const data = await req.json();
    console.log('Received voter data:', data); // Debug log
    
    // Validate required fields (remove id)
    if (!data.First_Name || !data.Last_Name || !data.NRC || !data.Ward || !data.Constituency || !data.passwordHash) {
      console.log('Missing fields:', {
        First_Name: !!data.First_Name,
        Last_Name: !!data.Last_Name,
        NRC: !!data.NRC,
        Ward: !!data.Ward,
        Constituency: !!data.Constituency,
        passwordHash: !!data.passwordHash
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if voter with same NRC or Email already exists
    console.log('NRC processing:', { original: data.NRC, type: typeof data.NRC });
    const existingNRC = await prisma.voters.findUnique({
      where: { NRC: data.NRC }
    });

    const existingEmail = data.Email ? await prisma.voters.findFirst({
      where: { Email: data.Email }
    }) : null;

    if (existingNRC) {
      return NextResponse.json(
        { error: `Voter with NRC ${data.NRC} already exists` },
        { status: 409 }
      );
    }

    if (existingEmail) {
      return NextResponse.json(
        { error: `Voter with Email ${data.Email} already exists` },
        { status: 409 }
      );
    }

    // Check if ward exists
    const ward = await prisma.wards.findUnique({
      where: { Ward_Code: data.Ward }
    });

    if (!ward) {
      return NextResponse.json(
        { error: 'Ward not found' },
        { status: 400 }
      );
    }

    // Generate unique voter ID (format: 3-digit number + 'W')
    const allVoters = await prisma.voters.findMany({ select: { id: true } });
    let maxNum = 0;
    for (const v of allVoters) {
      const match = v.id.match(/^(\d{3})W$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    const newId = `${String(maxNum + 1).padStart(3, '0')}W`;

    const voterData = {
      First_Name: data.First_Name,
      Last_Name: data.Last_Name,
      NRC: data.NRC,
      Ward: data.Ward,
      Constituency: data.Constituency,
      Email: data.Email,
      id: newId,
      passwordHash: data.passwordHash
    };
    
    console.log('Creating voter with data:', voterData);
    
    const voter = await prisma.voters.create({ 
      data: voterData,
      include: {
        Wards: {
          include: {
            Constituencies: {
              include: {
                Districts: true
              }
            }
          }
        }
      }
    });
    
    return NextResponse.json(voter, { status: 201 });
  } catch (error) {
    console.error('Error creating voter:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        if (error.message.includes('NRC')) {
          return NextResponse.json(
            { error: 'A voter with this NRC already exists' },
            { status: 409 }
          );
        }
        if (error.message.includes('id')) {
          return NextResponse.json(
            { error: 'A voter with this ID already exists' },
            { status: 409 }
          );
        }
      }
      
      if (error.message.includes('FOREIGN KEY constraint failed')) {
        return NextResponse.json(
          { error: 'Invalid ward reference. Please select a valid ward.' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: `Failed to create voter: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// PUT update a voter (expects id in body)
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, ...rest } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Voter ID is required' },
        { status: 400 }
      );
    }

    // Check if voter exists
    const existingVoter = await prisma.voters.findUnique({
      where: { id }
    });

    if (!existingVoter) {
      return NextResponse.json(
        { error: 'Voter not found' },
        { status: 404 }
      );
    }

    // If NRC is being updated, check for duplicates
    if (rest.NRC && rest.NRC !== existingVoter.NRC) {
      const duplicateNRC = await prisma.voters.findUnique({
        where: { NRC: rest.NRC }
      });

      if (duplicateNRC) {
        return NextResponse.json(
          { error: `Voter with NRC ${rest.NRC} already exists` },
          { status: 409 }
        );
      }
    }

    // If Email is being updated, check for duplicates
    if (rest.Email && rest.Email !== existingVoter.Email) {
      const duplicateEmail = await prisma.voters.findFirst({
        where: { Email: rest.Email }
      });

      if (duplicateEmail) {
        return NextResponse.json(
          { error: `Voter with Email ${rest.Email} already exists` },
          { status: 409 }
        );
      }
    }

    // If ward is being updated, check if it exists
    if (rest.Ward && rest.Ward !== existingVoter.Ward) {
      const ward = await prisma.wards.findUnique({
        where: { Ward_Code: rest.Ward }
      });

      if (!ward) {
        return NextResponse.json(
          { error: 'Ward not found' },
          { status: 400 }
        );
      }
    }

    const voter = await prisma.voters.update({
      where: { id },
      data: {
        ...rest
      },
      include: {
        Wards: {
          include: {
            Constituencies: {
              include: {
                Districts: true
              }
            }
          }
        }
      }
    });
    
    return NextResponse.json(voter);
  } catch (error) {
    console.error('Error updating voter:', error);
    return NextResponse.json(
      { error: 'Failed to update voter' },
      { status: 500 }
    );
  }
}

// DELETE a voter (expects id in body)
export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json();
    const { id } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Voter ID is required' },
        { status: 400 }
      );
    }

    // Check if voter exists
    const existingVoter = await prisma.voters.findUnique({
      where: { id }
    });

    if (!existingVoter) {
      return NextResponse.json(
        { error: 'Voter not found' },
        { status: 404 }
      );
    }

    await prisma.voters.delete({ where: { id } });
    
    return NextResponse.json({ message: 'Voter deleted successfully' });
  } catch (error) {
    console.error('Error deleting voter:', error);
    return NextResponse.json(
      { error: 'Failed to delete voter' },
      { status: 500 }
    );
  }
}
