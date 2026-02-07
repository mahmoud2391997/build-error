import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single Account by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId');
    
    if (!id || !companyId) {
      return NextResponse.json(
        { error: 'Account ID and Company ID are required' },
        { status: 400 }
      );
    }
    
    const account = await prisma.account.findUnique({
      where: { 
        id,
        company_id: companyId
      },
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
  } catch (error: any) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch account' },
      { status: 500 }
    );
  }
}

// PUT update Account
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { code, name, type, balance, companyId } = await request.json();
    
    if (!id || !companyId) {
      return NextResponse.json(
        { error: 'Account ID and Company ID are required' },
        { status: 400 }
      );
    }
    
    const updateData: any = {
      company_id: companyId,
    };
    
    if (code) updateData.code = code;
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (balance !== undefined) updateData.balance = parseFloat(balance.toString());
    
    const account = await prisma.account.update({
      where: { 
        id,
        company_id: companyId
      },
      data: updateData
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

// DELETE Account
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId') || await request.json().then(body => body?.companyId).catch(() => null);
    
    console.log('DELETE Account - Full URL:', request.url);
    console.log('DELETE Account - Parsed params:', params);
    console.log('DELETE Account - ID from params:', id, 'Company ID:', companyId);
    
    if (!id || !companyId) {
      return NextResponse.json(
        { error: 'Account ID and Company ID are required' },
        { status: 400 }
      );
    }
    
    await prisma.account.delete({
      where: { 
        id: id,
        company_id: companyId
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    const { id } = await params;
    console.log('CATCH BLOCK EXECUTED - Error caught:', error);
    console.log('Error code:', error.code);
    
    // Handle Prisma Foreign Key Constraint Violation
    if (error.code === 'P2003') {
      console.log('Attempted to delete account with existing relations:', id);
      return NextResponse.json(
        { error: 'لا يمكن حذف هذا الحساب لأنه مرتبط بعمليات مالية أو قيود يومية. يرجى حذف العمليات المرتبطة أولاً.' },
        { status: 409 }
      );
    }

    // Handle Record Not Found
    if (error.code === 'P2025') {
      console.log('Attempted to delete non-existent account:', id);
      return NextResponse.json(
        { error: 'الحساب غير موجود أو تم حذفه بالفعل.' },
        { status: 404 }
      );
    }

    // Log error for debugging (only if not handled above)
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}
