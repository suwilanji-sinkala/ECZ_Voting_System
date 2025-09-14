import { NextRequest, NextResponse } from 'next/server';
import { getEthereumClient, ElectionData } from '@/lib/ethereum-client';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { 
      title, 
      description, 
      startDate, 
      endDate, 
      status, 
      year, 
      electionType, 
      wardCode, 
      constituencyCode, 
      districtCode,
      positionIds 
    } = await req.json();

    // Validate required fields
    if (!title || !startDate || !endDate || !year) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, startDate, endDate, year' 
      }, { status: 400 });
    }

    // Generate unique election ID
    const electionId = `ELECTION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create election in database first
    const newElection = await prisma.elections.create({
      data: {
        title,
        Description: description,
        StartDate: startDate,
        EndDate: endDate,
        Status: status || 'draft',
        Year: parseInt(year) || new Date().getFullYear(),
        Election_Type: electionType || 'general',
        Ward_Code: wardCode,
        Constituency_Code: constituencyCode ? parseInt(constituencyCode) : null,
        District_Code: districtCode,
        ElectionPositions: {
          create: positionIds?.map((id: number) => ({
            Position: id
          })) || []
        }
      },
      include: {
        ElectionPositions: {
          include: {
            Positions: true
          }
        }
      }
    });

    // Create election on Ethereum blockchain
    const ethereumClient = await getEthereumClient();
    
    const electionData: ElectionData = {
      electionId: electionId,
      title: title,
      description: description || '',
      startDate: startDate,
      endDate: endDate,
      status: status || 'draft',
      year: parseInt(year) || new Date().getFullYear(),
      electionType: electionType || 'general',
      wardCode: wardCode || '',
      constituencyCode: constituencyCode || '',
      districtCode: districtCode || ''
    };

    await ethereumClient.createElection(electionData);

    console.log('Election created successfully on both database and Ethereum blockchain:', {
      electionId: newElection.Election_ID,
      blockchainId: electionId,
      title: title
    });

    return NextResponse.json({
      success: true,
      message: 'Election created successfully on database and Ethereum blockchain',
      election: {
        ...newElection,
        blockchainId: electionId
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating election:', error);
    return NextResponse.json(
      { error: 'Failed to create election' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const electionId = searchParams.get('electionId');

    if (electionId) {
      // Get specific election
      const election = await prisma.elections.findUnique({
        where: { Election_ID: Number(electionId) },
        include: {
          ElectionPositions: {
            include: {
              Positions: true
            }
          }
        }
      });

      if (!election) {
        return NextResponse.json({ error: 'Election not found' }, { status: 404 });
      }

              // Verify election exists on blockchain
        try {
          const ethereumClient = await getEthereumClient();
          const blockchainElection = await ethereumClient.getElection(electionId);
        
        return NextResponse.json({
          ...election,
          blockchainVerified: true,
          blockchainData: blockchainElection
        });
      } catch (blockchainError) {
        console.warn('Blockchain verification failed:', blockchainError);
        return NextResponse.json({
          ...election,
          blockchainVerified: false,
          blockchainError: 'Unable to verify on blockchain'
        });
      }
    } else {
      // Get all elections
      const elections = await prisma.elections.findMany({
        include: {
          ElectionPositions: {
            include: {
              Positions: true
            }
          }
        },
        orderBy: { StartDate: 'desc' }
      });

      return NextResponse.json(elections);
    }
  } catch (error) {
    console.error('Error fetching election(s):', error);
    return NextResponse.json(
      { error: 'Failed to fetch election(s)' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { electionId, ...updateData } = await req.json();

    if (!electionId) {
      return NextResponse.json({ error: 'Election ID is required' }, { status: 400 });
    }

    // Update election in database
    const updatedElection = await prisma.elections.update({
      where: { Election_ID: Number(electionId) },
      data: updateData,
      include: {
        ElectionPositions: {
          include: {
            Positions: true
          }
        }
      }
    });

    // Note: Blockchain updates would require additional smart contract functions
    // For now, we'll just update the database and log the change
    console.log('Election updated in database:', {
      electionId: updatedElection.Election_ID,
      updates: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Election updated successfully',
      election: updatedElection
    });

  } catch (error) {
    console.error('Error updating election:', error);
    return NextResponse.json(
      { error: 'Failed to update election' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { electionId } = await req.json();

    if (!electionId) {
      return NextResponse.json({ error: 'Election ID is required' }, { status: 400 });
    }

    // Delete from database (existing logic)
    await prisma.$transaction(async (tx) => {
      // Delete votes for this election
      await tx.votes.deleteMany({
        where: { Election_ID: Number(electionId) }
      });

      // Delete election voters for this election
      await tx.election_Voters.deleteMany({
        where: { ElectionID: Number(electionId) }
      });

      // Delete election positions for this election
      await tx.electionPositions.deleteMany({
        where: { Election: Number(electionId) }
      });

      // Delete election candidates for this election
      await tx.electionCandidates.deleteMany({
        where: { Election: Number(electionId) }
      });

      // Finally delete the election
      await tx.elections.delete({
        where: { Election_ID: Number(electionId) }
      });
    });

    // Note: Blockchain deletion would require additional smart contract functions
    // For now, we'll just delete from database and log the change
    console.log('Election deleted from database:', { electionId });

    return NextResponse.json({
      success: true,
      message: 'Election deleted successfully from database'
    });

  } catch (error) {
    console.error('Error deleting election:', error);
    return NextResponse.json(
      { error: 'Failed to delete election' },
      { status: 500 }
    );
  }
} 