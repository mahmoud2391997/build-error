import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET Chart of Accounts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }
    
    const accounts = await prisma.account.findMany({
      where: { company_id: companyId },
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
    const { companyId, code, name, type, balance = 0 } = await request.json();
    
    if (!companyId || !code || !name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const account = await prisma.account.create({
      data: {
        company_id: companyId,
        code,
        name,
        type,
        balance: parseFloat(balance)
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
