import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { NRC, password } = await req.json();
  const voter = await prisma.voters.findUnique({ 
    where: { NRC: NRC },
    include: {
      Wards: {
        include: {
          Constituencies: true
        }
      }
    }
  });
  if (!voter) {
    return NextResponse.json({ error: 'Voter not found' }, { status: 404 });
  }
  if (voter.passwordHash !== password) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }
  return NextResponse.json({ 
    success: true, 
    voter: { 
      id: voter.id, 
      First_Name: voter.First_Name, 
      Last_Name: voter.Last_Name,
      Constituency: voter.Constituency,
      Ward: voter.Ward
    } 
  });
} 