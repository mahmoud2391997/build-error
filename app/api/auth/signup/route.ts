import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password, name, companyName } = await request.json();

    if (!email || !password || !name || !companyName) {
      return NextResponse.json(
        { error: 'Email, password, name, and company name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);

    // Create user and company in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password_hash: hashedPassword,
          name,
        },
      });

      // Create company
      const company = await tx.company.create({
        data: {
          id: crypto.randomUUID(),
          name: companyName,
          admin_email: email,
          created_at: new Date(),
        },
      });

      // Create membership linking user to company
      await tx.membership.create({
        data: {
          user_id: user.id,
          company_id: company.id,
          role: 'ADMIN',
        },
      });

      // Activate default modules for the company
      const defaultModules = ['ACCOUNTING', 'INVENTORY', 'HR', 'CRM'];
      await tx.activeModule.createMany({
        data: defaultModules.map((module) => ({
          company_id: company.id,
          module_name: module,
        })),
      });

      return { user, company };
    });

    // Remove password hash from response
    const { password_hash, ...userResponse } = result.user;

    return NextResponse.json(
      { 
        user: userResponse, 
        company: result.company,
        message: 'User and company created successfully' 
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error('Signup error:', e);
    return NextResponse.json(
      { error: e.message || 'Signup failed' },
      { status: 500 }
    );
  }
}
