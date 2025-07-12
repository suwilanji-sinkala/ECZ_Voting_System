import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all active elections
    const activeElections = await prisma.elections.findMany({
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
                    Wards: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        StartDate: 'desc'
      }
    });

    // Get total registered voters
    const totalVoters = await prisma.voters.count();

    // Process each election to get live results
    const liveResults = await Promise.all(
      activeElections.map(async (election) => {
        // Get total votes for this election
        const totalVotes = await prisma.votes.count({
          where: {
            Election_ID: election.Election_ID
          }
        });

        // Get votes by candidate for this election
        const candidateVotes = await prisma.votes.groupBy({
          by: ['Candidate_ID'],
          where: {
            Election_ID: election.Election_ID
          },
          _count: {
            Vote_ID: true
          }
        });

        // Process each position in the election
        const positionResults = await Promise.all(
          election.ElectionPositions.map(async (electionPosition) => {
            const position = electionPosition.Positions;
            if (!position) return null;

            // Get candidates for this position
            const candidates = position.Candidates || [];
            
            // Get vote counts for each candidate
            const candidatesWithVotes = await Promise.all(
              candidates.map(async (candidate) => {
                const voteCount = candidateVotes.find(
                  v => v.Candidate_ID === candidate.Candidate_ID
                )?._count.Vote_ID || 0;

                const percentage = totalVotes > 0 ? Math.round((Number(voteCount) / Number(totalVotes)) * 100) : 0;

                return {
                  candidateId: candidate.Candidate_ID,
                  name: `${candidate.FirstName} ${candidate.LastName}`,
                  party: candidate.Parties?.Party_Name || 'Independent',
                  partyAcronym: candidate.Parties?.Party_Acronym || 'IND',
                  votes: voteCount,
                  percentage: percentage,
                  image: candidate.Image ? `data:image/jpeg;base64,${Buffer.from(candidate.Image).toString('base64')}` : null
                };
              })
            );

            // Sort candidates by vote count (descending)
            const sortedCandidates = candidatesWithVotes.sort((a, b) => b.votes - a.votes);

            return {
              positionId: position.Position_ID,
              positionName: position.Position_Name,
              candidates: sortedCandidates,
              totalVotes: totalVotes
            };
          })
        );

        // Filter out null positions
        const validPositionResults = positionResults.filter(result => result !== null);

        return {
          electionId: election.Election_ID,
          electionTitle: election.title,
          electionDescription: election.Description,
          startDate: election.StartDate,
          endDate: election.EndDate,
          status: election.Status,
          totalVotes: totalVotes,
          totalVoters: totalVoters,
          voterTurnout: totalVoters > 0 ? Math.round((totalVotes / totalVoters) * 100) : 0,
          positions: validPositionResults
        };
      })
    );

    // Calculate overall statistics
    const overallStats = {
      totalVoters: totalVoters,
      totalVotesCast: liveResults.reduce((sum, election) => sum + election.totalVotes, 0),
      totalActiveElections: activeElections.length,
      overallTurnout: totalVoters > 0 ? Math.round((liveResults.reduce((sum, election) => sum + election.totalVotes, 0) / totalVoters) * 100) : 0
    };

    return NextResponse.json({
      overallStats,
      elections: liveResults,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching live results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live results' },
      { status: 500 }
    );
  }
} 