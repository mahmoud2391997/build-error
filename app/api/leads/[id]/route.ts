
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT update lead
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, company, value, stage, chance } = body;
    
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(company && { company_name: company }),
        ...(value !== undefined && { value: parseFloat(value.toString()) }),
        ...(stage && { stage }),
        ...(chance !== undefined && { chance: parseInt(chance.toString()) }),
      }
    });
    
    return NextResponse.json(lead);
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update lead' },
      { status: 500 }
    );
  }
}

// DELETE lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.lead.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
