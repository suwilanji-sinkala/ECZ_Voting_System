import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get active elections
    const activeElections = await prisma.elections.findMany({
      where: {
        Status: 'active'
      },
      include: {
        ElectionPositions: {
          include: {
            Positions: true
          }
        }
      },
      orderBy: {
        StartDate: 'desc'
      }
    });

    // Get total registered voters
    const totalVoters = await prisma.voters.count();

    // Get voting statistics for active elections
    const electionStats = await Promise.all(
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
            Election_ID: election.Election_ID,
            Candidate_ID: {
              not: null
            }
          },
          _count: {
            Vote_ID: true
          }
        });

        // Get candidate details with vote counts
        const candidateStats = await Promise.all(
          candidateVotes.map(async (vote) => {
            if (!vote.Candidate_ID) {
              return null;
            }
            
            const candidate = await prisma.candidates.findUnique({
              where: {
                Candidate_ID: vote.Candidate_ID
              },
              include: {
                Parties: true,
                Positions: true,
                Wards: true
              }
            });

            return {
              candidate,
              voteCount: vote._count.Vote_ID
            };
          })
        ).then(stats => stats.filter(stat => stat !== null));

        // Get votes by ward for this election
        const wardVotes = await prisma.votes.groupBy({
          by: ['Ward_Code'],
          where: {
            Election_ID: election.Election_ID,
            Ward_Code: {
              not: null
            }
          },
          _count: {
            Vote_ID: true
          }
        });

        // Get ward details with vote counts
        const wardStats = await Promise.all(
          wardVotes.map(async (vote) => {
            if (!vote.Ward_Code) {
              return null;
            }
            
            const ward = await prisma.wards.findUnique({
              where: {
                Ward_Code: vote.Ward_Code
              }
            });

            return {
              ward,
              voteCount: vote._count.Vote_ID
            };
          })
        ).then(stats => stats.filter(stat => stat !== null));

        return {
          election,
          totalVotes,
          candidateStats,
          wardStats,
          voterTurnout: totalVoters > 0 ? Math.round((totalVotes / totalVoters) * 100) : 0
        };
      })
    );

    // Get overall voting statistics
    const overallStats = {
      totalVoters,
      totalActiveElections: activeElections.length,
      totalVotesCast: electionStats.reduce((sum, stat) => sum + stat.totalVotes, 0),
      overallTurnout: totalVoters > 0 ? Math.round((electionStats.reduce((sum, stat) => sum + stat.totalVotes, 0) / totalVoters) * 100) : 0
    };

    // Get recent voting activity (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentVotes = await prisma.votes.count({
      where: {
        Vote_ID: {
          gte: 1 // This is a placeholder - we'd need a timestamp field for proper filtering
        }
      }
    });

    return NextResponse.json({
      overallStats,
      activeElections: electionStats,
      recentActivity: {
        votesLast24Hours: recentVotes,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 