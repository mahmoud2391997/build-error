import { NextRequest, NextResponse } from 'next/server';
import { AccountType } from '../../../types';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET accounts
export async function GET(request: NextRequest) {
  try {
    // Handle build-time requests more comprehensively
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      // During build, database is not available. Return empty array.
      return NextResponse.json([]);
    }
    
    // Additional build-time safety check
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json([]);
    }

    // Import prisma only when needed
    const { prisma } = await import('../../../lib/prisma');

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const id = searchParams.get('id');
    
    if (id) {
      // Get account by ID
      const account = await prisma.account.findUnique({
        where: { id },
        include: {
          company: true
        }
      });
      
      if (!account) {
        return NextResponse.json(
          { error: 'Account not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(account);
    }
    
    // Get all accounts (optionally filtered by company)
    const accounts = await prisma.account.findMany({
      where: companyId ? { company_id: companyId } : {},
      include: {
        company: true
      },
      orderBy: { code: 'asc' }
    });
    
    return NextResponse.json(accounts);
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

// POST new account
export async function POST(request: NextRequest) {
  try {
    // Import prisma only when needed
    const { prisma } = await import('../../../lib/prisma');
    
    const { companyId, name, code, type, balance } = await request.json();
    
    if (!companyId || !name || !code || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const account = await prisma.account.create({
      data: {
        company_id: companyId,
        name,
        code,
        type: type as AccountType,
        balance: parseFloat(balance) || 0
      },
      include: {
        company: true
      }
    });
    
    return NextResponse.json(account, { status: 201 });
  } catch (error: any) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}

// PUT update account
export async function PUT(request: NextRequest) {
  try {
    // Import prisma only when needed
    const { prisma } = await import('../../../lib/prisma');
    
    const { id, name, code, type, balance } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }
    
    const account = await prisma.account.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(type && { type: type as AccountType }),
        ...(balance !== undefined && { balance: parseFloat(balance) })
      },
      include: {
        company: true
      }
    });
    
    return NextResponse.json(account);
  } catch (error: any) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update account' },
      { status: 500 }
    );
  }
}

// DELETE account
export async function DELETE(request: NextRequest) {
  try {
    // Import prisma only when needed
    const { prisma } = await import('../../../lib/prisma');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }
    
    await prisma.account.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}
