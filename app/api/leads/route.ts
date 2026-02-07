
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET leads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    const leads = await prisma.lead.findMany({
      where: companyId ? { company_id: companyId } : {},
      include: {
        company: true
      },
      orderBy: {
        id: 'desc'
      }
    });
    return NextResponse.json(leads);
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// POST new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, name, company, value, stage, chance } = body;
    
    if (!companyId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const lead = await prisma.lead.create({
      data: {
        company_id: companyId,
        name,
        company_name: company,
        value: value ? parseFloat(value.toString()) : 0,
        stage: stage || 'NEW',
        chance: chance ? parseInt(chance.toString()) : 0,
      }
    });
    
    return NextResponse.json(lead, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create lead' },
      { status: 500 }
    );
  }
}
