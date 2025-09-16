import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET candidates or a specific candidate by Candidate_ID
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const Candidate_ID = searchParams.get('Candidate_ID');

    if (Candidate_ID) {
      const candidateId = parseInt(Candidate_ID);
      if (isNaN(candidateId)) {
        return NextResponse.json({ message: 'Invalid Candidate ID' }, { status: 400 });
      }

      const candidate = await prisma.candidates.findUnique({ 
        where: { Candidate_ID: candidateId },
        include: {
          Positions: true,
          Wards: {
            include: {
              Constituencies: {
                include: {
                  Districts: true
                }
              }
            }
          },
          Parties: true,
          Votes: true
        }
      });

      if (!candidate) {
        return NextResponse.json({ message: 'Candidate not found' }, { status: 404 });
      }

      // Convert image buffer to base64 data URL if it exists
      let imageUrl = null;
      if (candidate.Image && Buffer.isBuffer(candidate.Image)) {
        try {
          const base64 = candidate.Image.toString('base64');
          imageUrl = `data:image/jpeg;base64,${base64}`;
        } catch (error) {
          console.error('Error converting image to base64:', error);
        }
      }

      // Format the response to include nested relationships
      const formattedCandidate = {
        ...candidate,
        position: candidate.Positions,
        ward: candidate.Wards,
        constituency: candidate.Wards?.Constituencies,
        district: candidate.Wards?.Constituencies?.Districts,
        party: candidate.Parties,
        voteCount: candidate.Votes.length,
        imageUrl: imageUrl
      };

      return NextResponse.json(formattedCandidate);
    }

    // Return all candidates with their relationships
    const candidates = await prisma.candidates.findMany({
      include: {
        Positions: true,
        Wards: {
          include: {
            Constituencies: {
              include: {
                Districts: true
              }
            }
          }
        },
        Parties: true,
        _count: {
          select: { Votes: true }
        }
      },
      orderBy: [
        { Position_ID: 'asc' },
        { Ward_Code: 'asc' },
        { LastName: 'asc' }
      ]
    });

    // Format the response
    const formattedCandidates = candidates.map(candidate => {
      // Convert image buffer to base64 data URL if it exists
      let imageUrl = null;
      if (candidate.Image && Buffer.isBuffer(candidate.Image)) {
        try {
          const base64 = candidate.Image.toString('base64');
          // Determine MIME type (you might want to store this in the database)
          imageUrl = `data:image/jpeg;base64,${base64}`;
        } catch (error) {
          console.error('Error converting image to base64:', error);
        }
      }

      return {
        ...candidate,
        position: candidate.Positions,
        ward: candidate.Wards,
        constituency: candidate.Wards?.Constituencies,
        district: candidate.Wards?.Constituencies?.Districts,
        party: candidate.Parties,
        voteCount: candidate._count.Votes,
        imageUrl: imageUrl
      };
    });

    return NextResponse.json(formattedCandidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST create a new candidate
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.FirstName || !data.LastName) {
      return NextResponse.json({ 
        message: 'FirstName and LastName are required' 
      }, { status: 400 });
    }

    // Validate election selection
    if (!data.Election_ID) {
      return NextResponse.json({ 
        message: 'Election selection is required' 
      }, { status: 400 });
    }

    // Validate position selection
    if (!data.Position_ID) {
      return NextResponse.json({ 
        message: 'Position selection is required' 
      }, { status: 400 });
    }

    // Validate ward selection
    if (!data.Ward_Code) {
      return NextResponse.json({ 
        message: 'Ward selection is required' 
      }, { status: 400 });
    }

    // Validate that the election is in draft status
    const election = await prisma.elections.findUnique({
      where: { Election_ID: data.Election_ID }
    });

    if (!election) {
      return NextResponse.json({ message: 'Invalid Election_ID' }, { status: 400 });
    }

    if (election.Status !== 'draft') {
      return NextResponse.json({ 
        message: 'Candidates can only be registered for draft elections' 
      }, { status: 400 });
    }

    // Validate that the position is assigned to the selected election
    const electionPosition = await prisma.electionPositions.findFirst({
      where: {
        Election: data.Election_ID,
        Position: data.Position_ID
      }
    });

    if (!electionPosition) {
      return NextResponse.json({ 
        message: 'Selected position is not available for this election' 
      }, { status: 400 });
    }

    // Check for unique constraint (Position_ID, Ward_Code, Party_ID)
    if (data.Position_ID && data.Ward_Code && data.Party_ID) {
      const existingCandidate = await prisma.candidates.findFirst({
        where: {
          Position_ID: data.Position_ID,
          Ward_Code: data.Ward_Code,
          Party_ID: data.Party_ID
        }
      });

      if (existingCandidate) {
        return NextResponse.json({ 
          message: 'A candidate with this position, ward, and party combination already exists' 
        }, { status: 409 });
      }
    }

    // Validate foreign key references
    if (data.Position_ID) {
      const position = await prisma.positions.findUnique({
        where: { Position_ID: data.Position_ID }
      });
      if (!position) {
        return NextResponse.json({ message: 'Invalid Position_ID' }, { status: 400 });
      }
    }

    if (data.Ward_Code) {
      const ward = await prisma.wards.findUnique({
        where: { Ward_Code: data.Ward_Code }
      });
      if (!ward) {
        return NextResponse.json({ message: 'Invalid Ward_Code' }, { status: 400 });
      }
    }

    if (data.Party_ID) {
      const party = await prisma.parties.findUnique({
        where: { Party_ID: data.Party_ID }
      });
      if (!party) {
        return NextResponse.json({ message: 'Invalid Party_ID' }, { status: 400 });
      }
    }

    // Convert image to Buffer if provided as base64
    let imageBuffer = null;
    if (data.Image && typeof data.Image === 'string') {
      try {
        // Remove data URL prefix if present
        const base64Data = data.Image.replace(/^data:image\/[a-z]+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
      } catch (error) {
        console.error('Error processing image:', error);
        return NextResponse.json({ message: 'Invalid image format' }, { status: 400 });
      }
    }

    const candidateData = {
      FirstName: data.FirstName.trim(),
      LastName: data.LastName.trim(),
      Othername: data.Othername?.trim() || null,
      AliasName: data.AliasName?.trim() || null,
      Party_ID: data.Party_ID || null,
      Ward_Code: data.Ward_Code || null,
      Position_ID: data.Position_ID || null,
      Image: imageBuffer
    };

    // Use transaction to create candidate and election candidate relationship
    const result = await prisma.$transaction(async (tx) => {
      // Create the candidate
      const candidate = await tx.candidates.create({ 
        data: candidateData,
        include: {
          Positions: true,
          Wards: true,
          Parties: true
        }
      });

      // Create the election candidate relationship
      await tx.electionCandidates.create({
        data: {
          Election: data.Election_ID,
          Candidate: candidate.Candidate_ID
        }
      });

      return candidate;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating candidate:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT update a candidate (expects Candidate_ID in body)
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { Candidate_ID, ...rest } = data;

    if (!Candidate_ID) {
      return NextResponse.json({ message: 'Candidate_ID is required' }, { status: 400 });
    }

    const candidateId = parseInt(Candidate_ID);
    if (isNaN(candidateId)) {
      return NextResponse.json({ message: 'Invalid Candidate_ID' }, { status: 400 });
    }

    // Check if candidate exists
    const existingCandidate = await prisma.candidates.findUnique({
      where: { Candidate_ID: candidateId }
    });

    if (!existingCandidate) {
      return NextResponse.json({ message: 'Candidate not found' }, { status: 404 });
    }

    // Check for unique constraint if relevant fields are being updated
    if ((rest.Position_ID || rest.Ward_Code || rest.Party_ID) && 
        (rest.Position_ID !== existingCandidate.Position_ID || 
         rest.Ward_Code !== existingCandidate.Ward_Code || 
         rest.Party_ID !== existingCandidate.Party_ID)) {
      
      const conflictCandidate = await prisma.candidates.findFirst({
        where: {
          Position_ID: rest.Position_ID ?? existingCandidate.Position_ID,
          Ward_Code: rest.Ward_Code ?? existingCandidate.Ward_Code,
          Party_ID: rest.Party_ID ?? existingCandidate.Party_ID,
          NOT: { Candidate_ID: candidateId }
        }
      });

      if (conflictCandidate) {
        return NextResponse.json({ 
          message: 'A candidate with this position, ward, and party combination already exists' 
        }, { status: 409 });
      }
    }

    // Validate foreign key references if they're being updated
    if (rest.Position_ID && rest.Position_ID !== existingCandidate.Position_ID) {
      const position = await prisma.positions.findUnique({
        where: { Position_ID: rest.Position_ID }
      });
      if (!position) {
        return NextResponse.json({ message: 'Invalid Position_ID' }, { status: 400 });
      }
    }

    if (rest.Ward_Code && rest.Ward_Code !== existingCandidate.Ward_Code) {
      const ward = await prisma.wards.findUnique({
        where: { Ward_Code: rest.Ward_Code }
      });
      if (!ward) {
        return NextResponse.json({ message: 'Invalid Ward_Code' }, { status: 400 });
      }
    }

    if (rest.Party_ID && rest.Party_ID !== existingCandidate.Party_ID) {
      const party = await prisma.parties.findUnique({
        where: { Party_ID: rest.Party_ID }
      });
      if (!party) {
        return NextResponse.json({ message: 'Invalid Party_ID' }, { status: 400 });
      }
    }

    // Handle image update
    let updateData = { ...rest };
    if (rest.Image && typeof rest.Image === 'string') {
      try {
        const base64Data = rest.Image.replace(/^data:image\/[a-z]+;base64,/, '');
        updateData.Image = Buffer.from(base64Data, 'base64');
      } catch (error) {
        console.error('Error processing image:', error);
        return NextResponse.json({ message: 'Invalid image format' }, { status: 400 });
      }
    }

    // Clean up string fields
    if (updateData.FirstName) updateData.FirstName = updateData.FirstName.trim();
    if (updateData.LastName) updateData.LastName = updateData.LastName.trim();
    if (updateData.Othername) updateData.Othername = updateData.Othername.trim();
    if (updateData.AliasName) updateData.AliasName = updateData.AliasName.trim();


    
    const candidate = await prisma.candidates.update({
      where: { Candidate_ID: candidateId },
      data: updateData,
      include: {
        Positions: true,
        Wards: {
          include: {
            Constituencies: {
              include: {
                Districts: true
              }
            }
          }
        },
        Parties: true,
        _count: {
          select: { Votes: true }
        }
      }
    });



    // Convert image buffer to base64 data URL if it exists
    let imageUrl = null;
    if (candidate.Image && Buffer.isBuffer(candidate.Image)) {
      try {
        const base64 = candidate.Image.toString('base64');
        imageUrl = `data:image/jpeg;base64,${base64}`;
      } catch (error) {
        console.error('Error converting image to base64:', error);
      }
    }

    // Format the response to match GET endpoint
    const formattedCandidate = {
      ...candidate,
      position: candidate.Positions,
      ward: candidate.Wards,
      constituency: candidate.Wards?.Constituencies,
      district: candidate.Wards?.Constituencies?.Districts,
      party: candidate.Parties,
      voteCount: candidate._count.Votes,
      imageUrl: imageUrl
    };

    return NextResponse.json(formattedCandidate);
  } catch (error) {
    console.error('Error updating candidate:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE a candidate (expects Candidate_ID in body)
export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json();
    const { Candidate_ID } = data;

    if (!Candidate_ID) {
      return NextResponse.json({ message: 'Candidate_ID is required' }, { status: 400 });
    }

    const candidateId = parseInt(Candidate_ID);
    if (isNaN(candidateId)) {
      return NextResponse.json({ message: 'Invalid Candidate_ID' }, { status: 400 });
    }

    // Check if candidate exists
    const existingCandidate = await prisma.candidates.findUnique({
      where: { Candidate_ID: candidateId },
      include: { _count: { select: { Votes: true } } }
    });

    if (!existingCandidate) {
      return NextResponse.json({ message: 'Candidate not found' }, { status: 404 });
    }

    // Check if candidate has votes (you might want to prevent deletion if they do)
    if (existingCandidate._count.Votes > 0) {
      return NextResponse.json({ 
        message: 'Cannot delete candidate with existing votes. Consider archiving instead.' 
      }, { status: 409 });
    }

    await prisma.candidates.delete({ 
      where: { Candidate_ID: candidateId } 
    });

    return NextResponse.json({ 
      message: 'Candidate deleted successfully',
      deletedCandidate: {
        Candidate_ID: candidateId,
        name: `${existingCandidate.FirstName} ${existingCandidate.LastName}`
      }
    });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}