import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET payroll records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    const payrollRecords = await prisma.payrollRecord.findMany({
      where: companyId ? { company_id: companyId } : {}
    });
    return NextResponse.json(payrollRecords);
  } catch (error: any) {
    console.error('Error fetching payroll records:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payroll records' },
      { status: 500 }
    );
  }
}

// POST new payroll record
export async function POST(request: NextRequest) {
  try {
    const { companyId, employeeId, month, amount, status, paymentDate } = await request.json();
    
    if (!companyId || !employeeId || !month || !amount || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const payrollRecord = await prisma.payrollRecord.create({
      data: {
        company_id: companyId,
        employee_id: employeeId,
        month,
        amount: parseFloat(amount),
        status,
        payment_date: paymentDate ? new Date(paymentDate) : null,
      },
    });
    
    console.log('Payroll record created successfully:', payrollRecord.id);
    return NextResponse.json(payrollRecord, { status: 201 });
  } catch (error: any) {
    console.error('Error creating payroll record:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payroll record' },
      { status: 500 }
    );
  }
}
