import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { formStore } from './formStore';

// POST /api/forms
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate a unique ID for the form
    const formId = crypto.randomUUID();
    
    // Store the form data
    formStore[formId] = body;
    
    return NextResponse.json({ formId, success: true });
  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json(
      { error: 'Failed to create form' },
      { status: 500 }
    );
  }
} 