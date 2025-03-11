import { NextRequest, NextResponse } from 'next/server';

// GET /api/forms/:id/status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const formId = params.id;
  
  // In a real app, you would check the database for the form's status
  // For this example, we'll just return that the form is not locked
  return NextResponse.json({ 
    locked: false,
    status: 'draft',
    lastUpdated: new Date().toISOString()
  });
} 