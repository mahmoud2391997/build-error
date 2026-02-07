import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET Journal Entries
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
    
    const entries = await prisma.journalEntry.findMany({
      where: { company_id: companyId },
      include: {
        company: true,
        lines: {
          include: {
            account: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });
    
    return NextResponse.json(entries);
  } catch (error: any) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
}

// POST new Journal Entry
export async function POST(request: NextRequest) {
  try {
    const { companyId, date, reference, description, lines } = await request.json();
    
    if (!companyId || !date || !lines || !Array.isArray(lines)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const entry = await prisma.journalEntry.create({
      data: {
        company_id: companyId,
        date: new Date(date),
        reference,
        description,
        lines: {
          create: lines.map((line: any) => ({
            account_id: line.accountId,
            description: line.description,
            debit: line.debit || 0,
            credit: line.credit || 0
          }))
        }
      }
    });
    
    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create journal entry' },
      { status: 500 }
    );
  }
}

