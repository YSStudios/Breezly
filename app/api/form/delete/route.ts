import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma'; // Adjust this import path as needed

export async function DELETE(request: NextRequest) {
  console.error('DELETE route hit');
  console.log('Delete request received');

  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    console.log('Unauthorized: No session found');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Get the form ID from the URL
  const url = new URL(request.url);
  const formId = url.searchParams.get('id');

  if (!formId) {
    console.log('Bad Request: No form ID provided');
    return NextResponse.json({ message: 'Form ID is required' }, { status: 400 });
  }

  console.log('Attempting to delete form:', formId);

  try {
    const deletedForm = await prisma.formData.delete({
      where: { id: formId },
    });
    console.log('Form deleted successfully:', deletedForm);
    return NextResponse.json({ message: 'Form deleted successfully', deletedForm }, { status: 200 });
  } catch (error) {
    console.error('Error deleting form:', error);
    if (error instanceof Error) {
      return NextResponse.json({ message: 'Error deleting form', error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ message: 'Error deleting form', error: String(error) }, { status: 500 });
    }
  }
}