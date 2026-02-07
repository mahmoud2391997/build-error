import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET active modules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    const activeModules = await prisma.activeModule.findMany({
      where: companyId ? { company_id: companyId } : {}
    });
    
    return NextResponse.json(activeModules);
  } catch (error: any) {
    console.error('Error fetching active modules:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch active modules' },
      { status: 500 }
    );
  }
}

// POST new active module
export async function POST(request: NextRequest) {
  try {
    const { companyId, moduleName } = await request.json();
    
    if (!companyId || !moduleName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const activeModule = await prisma.activeModule.create({
      data: {
        company_id: companyId,
        module_name: moduleName
      }
    });
    
    return NextResponse.json(activeModule, { status: 201 });
  } catch (error: any) {
    console.error('Error creating active module:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create active module' },
      { status: 500 }
    );
  }
}
