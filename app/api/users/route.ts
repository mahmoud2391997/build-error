import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Get user by ID
      const user = await prisma.user.findUnique({
        where: { id },
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
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(user);
    }
    
    // Get all users
    const users = await prisma.user.findMany({
      include: {
        memberships: {
          include: {
            company: true
          }
        }
      }
    });
    
    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST new user registration
export async function POST(request: NextRequest) {
  try {
    const { name, email, password, companyName } = await request.json();

    if (!name || !email || !password || !companyName) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    const saltRounds = 10;
    const passwordHash = await hash(password, saltRounds);

    const result = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: { name, email, password_hash: passwordHash },
      });

      const company = await prisma.company.create({
        data: { name: companyName, admin_email: email },
      });

      await prisma.membership.create({
        data: { user_id: user.id, company_id: company.id, role: 'ADMIN' },
      });

      await prisma.activeModule.create({
        data: { company_id: company.id, module_name: 'ACCOUNTING' },
      });

      const accounts = [
        { code: '1101', name: 'الصندوق', type: 'ASSET' },
        { code: '1102', name: 'البنك', type: 'ASSET' },
        { code: '1201', name: 'حسابات المدينين', type: 'ASSET' },
        { code: '2101', name: 'حسابات الدائنين', type: 'LIABILITY' },
        { code: '3101', name: 'رأس المال', type: 'EQUITY' },
        { code: '4101', name: 'إيراد المبيعات', type: 'REVENUE' },
        { code: '5101', name: 'مصاريف تشغيلية', type: 'EXPENSE' },
      ];

      for (const acc of accounts) {
        await prisma.account.create({
          data: { company_id: company.id, ...acc, balance: 0 },
        });
      }

      return { user, company };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
