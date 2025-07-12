import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET elections eligible for a specific voter based on location
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const voterId = searchParams.get('voterId');

    if (!voterId) {
      return NextResponse.json(
        { error: 'Voter ID is required' },
        { status: 400 }
      );
    }

    // Get voter with their location details
    const voter = await prisma.voters.findUnique({
      where: { id: voterId },
      include: {
        Wards: {
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
        }
      }
    });

    if (!voter) {
      return NextResponse.json(
        { error: 'Voter not found' },
        { status: 404 }
      );
    }

    // Get all active elections
    const elections = await prisma.elections.findMany({
      where: {
        Status: 'active'
      },
      include: {
        ElectionPositions: {
          include: {
            Positions: {
              include: {
                Candidates: {
                  include: {
                    Parties: true,
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
                }
              }
            }
          }
        }
      },
      orderBy: { StartDate: 'desc' }
    });

    // Filter elections based on voter eligibility
    const eligibleElections = elections.filter(election => {
      // General elections are available to all voters
      if (election.Election_Type.toLowerCase() === 'general') {
        return true;
      }

      // For now, we'll use a simple constituency-based check
      // This can be enhanced later when we add location fields to elections
      const voterConstituency = voter.Wards?.Constituencies?.Constituency_Name;
      
      // If election has a specific constituency requirement, check if voter matches
      // For now, we'll assume constituency-specific elections are based on the voter's constituency
      if (voterConstituency) {
        // Check if any candidates in this election are from the voter's constituency
        const hasCandidatesFromConstituency = election.ElectionPositions.some(ep => 
          ep.Positions && ep.Positions.Candidates.some(candidate => 
            candidate.Wards?.Constituencies?.Constituency_Name === voterConstituency
          )
        );
        
        return hasCandidatesFromConstituency;
      }

      return true;
    });

    // Format elections with candidates for each position
    const formattedElections = eligibleElections.map(election => {
      const positions = election.ElectionPositions
        .filter(ep => ep.Positions) // Filter out null positions
        .map(ep => {
          const position = ep.Positions!; // Safe to use ! here since we filtered
          const candidates = position.Candidates || [];
          
          return {
            Position_ID: position.Position_ID,
            Position_Name: position.Position_Name,
            Candidates: candidates.map(candidate => {
              // Debug logging
              console.log(`Candidate ${candidate.Candidate_ID}: Image type:`, typeof candidate.Image, 'Is Buffer:', Buffer.isBuffer(candidate.Image));
              
              return {
                Candidate_ID: candidate.Candidate_ID,
                FirstName: candidate.FirstName,
                LastName: candidate.LastName,
                OtherName: candidate.Othername,
                NickName: candidate.AliasName,
                Image: candidate.Image && Buffer.isBuffer(candidate.Image) ? candidate.Image.toString('base64') : null,
                Party: candidate.Parties ? {
                  Party_ID: candidate.Parties.Party_ID,
                  Party_Name: candidate.Parties.Party_Name,
                  Party_Acronym: candidate.Parties.Party_Acronym
                } : null,
                Ward: candidate.Wards ? {
                  Ward_Code: candidate.Wards.Ward_Code,
                  Ward_Name: candidate.Wards.Ward_Name,
                  Constituency: candidate.Wards.Constituencies ? {
                    Constituency_Code: candidate.Wards.Constituencies.Constituency_Code,
                    Constituency_Name: candidate.Wards.Constituencies.Constituency_Name
                  } : null,
                  District: candidate.Wards.Constituencies?.Districts ? {
                    District_Code: candidate.Wards.Constituencies.Districts.District_Code,
                    District_Name: candidate.Wards.Constituencies.Districts.District_Name
                  } : null
                } : null
              };
            })
          };
        });

      return {
        Election_ID: election.Election_ID,
        title: election.title,
        Description: election.Description,
        StartDate: election.StartDate,
        EndDate: election.EndDate,
        Status: election.Status,
        Year: election.Year,
        Election_Type: election.Election_Type,
        positions: positions
      };
    });

    return NextResponse.json(formattedElections);
  } catch (error) {
    console.error('Error fetching voter-eligible elections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch eligible elections' },
      { status: 500 }
    );
  }
} 