import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { employeeId, firstName, lastName, email, password, role } = await req.json();

    // Validate required fields
    if (!employeeId || !firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if employee ID already exists
    const existingEmployeeId = await prisma.managementUsers.findUnique({
      where: { employeeId: employeeId }
    });

    if (existingEmployeeId) {
      return NextResponse.json(
        { error: 'Employee ID already exists' },
        { status: 409 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.managementUsers.findUnique({
      where: { email: email }
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Create new management user
    // Note: In production, password should be properly hashed using bcrypt
    const newUser = await prisma.managementUsers.create({
      data: {
        employeeId,
        firstName,
        lastName,
        email,
        passwordHash: password, // In production, hash this with bcrypt
        role: role || 'operator', // Default role
        isActive: true
      }
    });

    // Return success response (don't include password)
    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        employeeId: newUser.employeeId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
