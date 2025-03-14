import { NextRequest, NextResponse } from 'next/server';

// In a real app, you would connect to a database here
// This is a simple in-memory store for example purposes
import { formStore } from '../../formStore';

// GET /api/forms/:id/exists
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const formId = params.id;
  const exists = Boolean(formStore[formId]);
  
  return NextResponse.json({ exists });
} 