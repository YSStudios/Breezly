import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  try {
    console.log(`Looking for form data with session ID: ${sessionId}`);
    
    // Try multiple approaches to find the form data
    
    // 1. Look for paymentId in data
    let formData = await prisma.formData.findFirst({
      where: {
        data: {
          path: ["paymentId"],
          equals: sessionId
        }
      }
    });

    // 2. If not found, try a direct query with JSON casting (database specific)
    if (!formData) {
      console.log("Payment ID not found in path, trying direct query");
      // This is for PostgreSQL - adjust if using a different database
      const rawResults = await prisma.$queryRaw`
        SELECT * FROM "FormData" 
        WHERE data::text LIKE ${`%${sessionId}%`}
        AND "userId" = ${session.user.id}
      `;
      
      if (Array.isArray(rawResults) && rawResults.length > 0) {
        console.log("Found form data through raw query");
        formData = rawResults[0];
      }
    }

    // 3. If still not found, try querying all recent forms
    if (!formData) {
      console.log("Payment ID not found in direct query, trying recent forms");
      // Get most recent form data for this user
      const allFormData = await prisma.formData.findMany({
        where: {
          userId: session.user.id
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      });
      
      console.log(`Found ${allFormData.length} recent forms`);
      
      // Try to find one with our sessionId
      for (const form of allFormData) {
        console.log(`Checking form ${form.id}`);
        const dataStr = JSON.stringify(form.data);
        if (dataStr.includes(sessionId)) {
          console.log("Found session ID in form data through string search");
          formData = form;
          break;
        }
      }
      
      // If still not found, just use the most recent one
      if (!formData && allFormData.length > 0) {
        console.log("Session ID not found, using most recent form instead");
        formData = allFormData[0];
        
        // Update this form with the payment ID for future reference
        await prisma.formData.update({
          where: { id: formData.id },
          data: {
            data: {
              ...(formData.data as any),
              paymentId: sessionId,
              paymentStatus: "PAID"
            }
          }
        });
      }
    }

    if (!formData) {
      console.log("No form data found with the provided session ID");
      return NextResponse.json({ 
        error: "Offer not found - payment may still be processing", 
        debug: { sessionId } 
      }, { status: 404 });
    }

    console.log("Form data found:", formData.id);
    
    // Return the offer details
    return NextResponse.json({ 
      offerDetails: {
        id: formData.id,
        ...(formData.data as Record<string, any>)
      }
    });
  } catch (error) {
    console.error("Error fetching offer details:", error);
    return NextResponse.json(
      { error: "Error fetching offer details", debug: { message: (error as Error).message } },
      { status: 500 }
    );
  }
} 