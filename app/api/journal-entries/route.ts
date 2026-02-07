import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET journal entries (including invoices/payments)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    const journalEntries = await prisma.journalEntry.findMany({
      where: companyId ? { company_id: companyId } : {},
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
    
    return NextResponse.json(journalEntries);
  } catch (error: any) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
}

// POST new journal entry (including invoices/payments)
export async function POST(request: NextRequest) {
  try {
    const { companyId, date, reference, description, lines, status } = await request.json();
    
    if (!companyId || !date || !lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: companyId, date, and lines array' },
        { status: 400 }
      );
    }
    
    // Validate that debits equal credits
    const totalDebits = lines.reduce((sum: number, line: any) => sum + (parseFloat(line.debit) || 0), 0);
    const totalCredits = lines.reduce((sum: number, line: any) => sum + (parseFloat(line.credit) || 0), 0);
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return NextResponse.json(
        { error: 'Debits and credits must balance' },
        { status: 400 }
      );
    }
    
    const journalEntry = await prisma.journalEntry.create({
      data: {
        company_id: companyId,
        date: new Date(date),
        reference: reference || null,
        description: description || null,
        lines: {
          create: lines.map((line: any) => ({
            account_id: line.accountId,
            description: line.description || null,
            debit: parseFloat(line.debit) || 0,
            credit: parseFloat(line.credit) || 0
          }))
        }
      },
      include: {
        lines: {
          include: {
            account: true
          }
        }
      }
    });
    
    return NextResponse.json(journalEntry, { status: 201 });
  } catch (error: any) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create journal entry' },
      { status: 500 }
    );
  }
}

// PUT update journal entry
export async function PUT(request: NextRequest) {
  try {
    const { id, date, reference, description, lines } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }
    
    if (lines && Array.isArray(lines)) {
      // Validate that debits equal credits
      const totalDebits = lines.reduce((sum: number, line: any) => sum + (parseFloat(line.debit) || 0), 0);
      const totalCredits = lines.reduce((sum: number, line: any) => sum + (parseFloat(line.credit) || 0), 0);
      
      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        return NextResponse.json(
          { error: 'Debits and credits must balance' },
          { status: 400 }
        );
      }
    }
    
    // Delete existing lines and create new ones
    if (lines && Array.isArray(lines)) {
      await prisma.journalLine.deleteMany({
        where: { entry_id: id }
      });
    }
    
    const journalEntry = await prisma.journalEntry.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(reference !== undefined && { reference }),
        ...(description !== undefined && { description }),
        ...(lines && Array.isArray(lines) && {
          lines: {
            create: lines.map((line: any) => ({
              account_id: line.accountId,
              description: line.description || null,
              debit: parseFloat(line.debit) || 0,
              credit: parseFloat(line.credit) || 0
            }))
          }
        })
      },
      include: {
        lines: {
          include: {
            account: true
          }
        }
      }
    });
    
    return NextResponse.json(journalEntry);
  } catch (error: any) {
    console.error('Error updating journal entry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update journal entry' },
      { status: 500 }
    );
  }
}

// DELETE journal entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }
    
    // Delete journal entry (cascade will delete lines)
    await prisma.journalEntry.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting journal entry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete journal entry' },
      { status: 500 }
    );
  }
}
