import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT update Journal Entry
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { companyId, date, reference, description, lines } = await request.json();
    
    if (!id || !companyId) {
      return NextResponse.json(
        { error: 'Entry ID and Company ID are required' },
        { status: 400 }
      );
    }
    
    const updateData: any = {
      company_id: companyId,
    };
    
    if (date) updateData.date = new Date(date);
    if (reference) updateData.reference = reference;
    if (description) updateData.description = description;
    
    // Handle lines update - delete existing lines and create new ones
    if (lines && Array.isArray(lines)) {
      await prisma.journalLine.deleteMany({
        where: { entry_id: id }
      });
      
      updateData.lines = {
        create: lines.map((line: any) => ({
          account_id: line.accountId,
          description: line.description,
          debit: line.debit || 0,
          credit: line.credit || 0
        }))
      };
    }
    
    const entry = await prisma.journalEntry.update({
      where: { 
        id,
        company_id: companyId
      },
      data: updateData
    });
    
    return NextResponse.json(entry);
  } catch (error: any) {
    console.error('Error updating journal entry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update journal entry' },
      { status: 500 }
    );
  }
}

// DELETE Journal Entry
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId') || await request.json().then(body => body?.companyId).catch(() => null);
    
    console.log('DELETE Journal Entry - ID:', id, 'Company ID:', companyId);
    
    if (!id || !companyId) {
      return NextResponse.json(
        { error: 'Entry ID and Company ID are required' },
        { status: 400 }
      );
    }
    
    // First delete all journal lines associated with this entry
    await prisma.journalLine.deleteMany({
      where: { entry_id: id }
    });
    
    // Then delete the journal entry itself
    await prisma.journalEntry.delete({
      where: { 
        id,
        company_id: companyId
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting journal entry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete journal entry' },
      { status: 500 }
    );
  }
}
