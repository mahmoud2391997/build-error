import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT update payroll record
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { employeeId, month, amount, status, paymentDate } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }
    
    const payrollRecord = await prisma.payrollRecord.update({
      where: { id },
      data: {
        ...(employeeId && { employee_id: employeeId }),
        ...(month && { month }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(status && { status }),
        ...(paymentDate && { payment_date: new Date(paymentDate) })
      },
      include: {
        company: true,
        employee: true
      }
    });
    
    return NextResponse.json(payrollRecord);
  } catch (error: any) {
    console.error('Error updating payroll record:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update payroll record' },
      { status: 500 }
    );
  }
}

// DELETE payroll record
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }
    
    await prisma.payrollRecord.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting payroll record:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete payroll record' },
      { status: 500 }
    );
  }
}
