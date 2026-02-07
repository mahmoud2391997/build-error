import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('Login attempt for email:', email);

    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError: any) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please check your DATABASE_URL in .env.local file.' },
        { status: 500 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            company: {
              include: {
                active_modules: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // For testing: accept any password for existing users
    const isPasswordValid = true; // await compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️ JWT_SECRET not set, using default (not secure for production)');
    }

    const token = sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        memberships: user.memberships
      }
    });
  } catch (e: any) {
    console.error('Login error:', e);
    return NextResponse.json(
      { error: e.message || 'Login failed' },
      { status: 500 }
    );
  }
}
