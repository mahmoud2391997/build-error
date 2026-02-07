
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET warehouses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    const warehouses = await prisma.warehouse.findMany({
      where: companyId ? { company_id: companyId } : {},
      include: {
        company: true
      }
    });
    return NextResponse.json(warehouses);
  } catch (error: any) {
    console.error('Error fetching warehouses:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch warehouses' },
      { status: 500 }
    );
  }
}

// POST new warehouse
export async function POST(request: NextRequest) {
  try {
    const { companyId, name, location } = await request.json();
    
    if (!companyId || !name || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const warehouse = await prisma.warehouse.create({
      data: {
        company_id: companyId,
        name,
        location
      }
    });
    
    return NextResponse.json(warehouse, { status: 201 });
  } catch (error: any) {
    console.error('Error creating warehouse:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create warehouse' },
      { status: 500 }
    );
  }
}
