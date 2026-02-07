import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Activate a module for a company
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; module: string } }
) {
  try {
    const { id, module } = params;

    if (!id || !module) {
      return NextResponse.json(
        { error: 'Company ID and module name are required' },
        { status: 400 }
      );
    }

    // Check if module is already active
    const existingModule = await prisma.activeModule.findFirst({
      where: {
        company_id: id,
        module_name: module,
      },
    });

    if (existingModule) {
      return NextResponse.json(
        { error: 'Module is already active' },
        { status: 409 }
      );
    }

    // Activate the module
    const activeModule = await prisma.activeModule.create({
      data: {
        company_id: id,
        module_name: module,
      },
    });

    return NextResponse.json(
      { message: 'Module activated successfully', activeModule },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error activating module:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to activate module' },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate a module for a company
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; module: string } }
) {
  try {
    const { id, module } = params;

    if (!id || !module) {
      return NextResponse.json(
        { error: 'Company ID and module name are required' },
        { status: 400 }
      );
    }

    // Delete the module using the composite primary key
    await prisma.activeModule.delete({
      where: {
        company_id_module_name: {
          company_id: id,
          module_name: module,
        },
      },
    });

    return NextResponse.json(
      { message: 'Module deactivated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deactivating module:', error);
    
    // If the module doesn't exist, return 404
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Module is not active' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to deactivate module' },
      { status: 500 }
    );
  }
}
