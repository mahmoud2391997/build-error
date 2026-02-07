
import { NextRequest, NextResponse } from 'next/server';

// GET invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    // Return mock invoices data since Invoice model doesn't exist yet
    const mockInvoices = [
      {
        id: 'inv-001',
        company_id: companyId,
        total: 1000,
        status: 'PAID',
        created_at: new Date().toISOString(),
        items: [
          {
            id: 'item-001',
            invoice_id: 'inv-001',
            product_id: 'prod-001',
            quantity: 2,
            price: 500
          }
        ],
        company: {
          id: companyId,
          name: 'Test Company'
        }
      }
    ];
    
    return NextResponse.json(mockInvoices);
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST new invoice
export async function POST(request: NextRequest) {
  try {
    const { companyId, items, total, status } = await request.json();
    
    if (!companyId || !items || !total || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Return mock invoice creation response since Invoice model doesn't exist yet
    const mockInvoice = {
      id: `inv-${Date.now()}`,
      company_id: companyId,
      total: parseFloat(total),
      status,
      created_at: new Date().toISOString(),
      items: items.map((item: any, index: number) => ({
        id: `item-${Date.now()}-${index}`,
        invoice_id: `inv-${Date.now()}`,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      company: {
        id: companyId,
        name: 'Test Company'
      }
    };
    
    return NextResponse.json(mockInvoice, { status: 201 });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
