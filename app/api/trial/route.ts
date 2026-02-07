import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET Trial Balance
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
    
    // Get all accounts for the company
    const accounts = await prisma.account.findMany({
      where: { company_id: companyId }
    });
    
    // Calculate trial balance
    const trialBalance = accounts.map((account: any) => {
      const balance = parseFloat(account.balance?.toString() || '0');
      return {
        account: account.code,
        name: account.name,
        type: account.type,
        balance: balance
      };
    });
    
    return NextResponse.json(trialBalance);
  } catch (error: any) {
    console.error('Error generating trial balance:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate trial balance' },
      { status: 500 }
    );
  }
}
