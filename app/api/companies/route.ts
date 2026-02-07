import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET companies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');
    
    if (id) {
      // Get company by ID
      const company = await prisma.company.findUnique({
        where: { id },
        include: {
          active_modules: true,
          memberships: {
            include: {
              user: true
            }
          }
        }
      });
      
      if (!company) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(company);
    }
    
    if (email) {
      // Get companies for specific user by email
      const companies = await prisma.company.findMany({
        where: {
          memberships: {
            some: {
              user: {
                email: email
              }
            }
          }
        },
        include: {
          active_modules: true,
          memberships: {
            include: {
              user: true
            }
          }
        }
      });
      
      return NextResponse.json(companies);
    }
    
    // If no email provided, return empty array for security
    return NextResponse.json([]);
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

// POST new company
export async function POST(request: NextRequest) {
  try {
    const { name, adminEmail } = await request.json();
    
    if (!name || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const company = await prisma.company.create({
      data: {
        name,
        admin_email: adminEmail
      },
      include: {
        active_modules: true
      }
    });
    
    return NextResponse.json(company, { status: 201 });
  } catch (error: any) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create company' },
      { status: 500 }
    );
  }
}
