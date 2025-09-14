import { verify } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface ManagementUser {
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  role: string;
}

export async function verifyManagementToken(req: NextRequest): Promise<ManagementUser | null> {
  try {
    const token = req.cookies.get('management-token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = verify(token, JWT_SECRET) as any;
    
    return {
      userId: decoded.userId,
      employeeId: decoded.employeeId,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      role: decoded.role
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function requireManagementAuth(handler: (req: NextRequest, user: ManagementUser) => Promise<Response>) {
  return async (req: NextRequest) => {
    const user = await verifyManagementToken(req);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return handler(req, user);
  };
}
