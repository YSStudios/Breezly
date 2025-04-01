import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import { jsPDF } from "jspdf";
import puppeteer from 'puppeteer';
import type { PaperFormat } from 'puppeteer';

/**
 * Generates a PDF from form data using HTML structure and puppeteer
 * @param data The form data object
 * @returns Buffer containing the PDF
 */
async function generatePDF(data: any): Promise<Buffer> {
  try {
    // Helper function to safely access nested properties
    const safeGet = (obj: any, path: string, defaultValue = 'N/A') => {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
    };

    // Ensure conditions is a string
    const conditions = safeGet(data, 'conditions', '');
    const conditionsHtml = typeof conditions === 'string' 
      ? conditions.split(',')
        .map((condition: string, index: number) => 
          `<p class="ml-20 mb-10">${String.fromCharCode(97 + index)}. ${condition.trim()}</p>`
        )
        .join('') 
      : '<p class="ml-20 mb-10">No conditions specified.</p>';

    // Create HTML content for the PDF based on the structure from utils/generatePDF.js
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.5; }
          .container { max-width: 210mm; margin: 0 auto; padding: 20px; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .mb-5 { margin-bottom: 5px; }
          .mb-10 { margin-bottom: 10px; }
          .mb-15 { margin-bottom: 15px; }
          .mb-20 { margin-bottom: 20px; }
          .mt-0 { margin-top: 0; }
          .font-bold { font-weight: bold; }
          .text-lg { font-size: 14px; }
          .text-xl { font-size: 16px; }
          .ml-20 { margin-left: 20px; }
          h2 { font-size: 20px; }
          h3 { font-size: 18px; text-decoration: underline; font-weight: bold; }
          ol { list-style-type: decimal; padding-left: 2em; list-style-position: outside; }
          ol li { padding-left: 2em; margin-bottom: 15px; }
          .page-break { page-break-before: always; }
          .flex { display: flex; }
          .flex-item { flex: 1; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="font-bold text-center mb-10">Offer to Purchase Real Estate</h2>
          <p class="font-bold mb-5">THIS OFFER TO PURCHASE REAL ESTATE (the "Offer")</p>
          <p class="font-bold mb-5">IS MADE BY:</p>
          <p class="text-center mb-0">${safeGet(data, 'name-buyer-0')} of ${safeGet(data, 'address-buyer-0')}</p>
          <p class="text-center mb-10">(the "Buyer")</p>
          <p class="font-bold text-right mb-5">OF THE FIRST PART</p>
          <p class="font-bold text-center mb-5">- TO -</p>
          <p class="text-center mb-0">${safeGet(data, 'name-seller-0')} of ${safeGet(data, 'address-seller-0')}</p>
          <p class="text-center mb-10">(the "Seller")</p>
          <p class="font-bold text-right mb-15">OF THE SECOND PART</p>
          
          <h3 class="mb-10">Background</h3>
          <p class="mb-10">The Buyer wishes to submit an offer to purchase a certain completed home from the Seller under the terms stated below.</p>
          <p class="mb-15"><strong>IN CONSIDERATION OF</strong> and as a condition of the Seller selling the Property and the Buyer purchasing the Property (collectively the "Parties") and other valuable consideration the receipt of which is hereby acknowledged, the Parties to this Offer to Purchase Real Estate agree as follows:</p>
          
          <ol>
          <li><h3 class="mb-10">Real Property</h3>
          <p class="mb-15">The Property is located at: ${safeGet(data, 'property-address')}. The legal land description is as follows: ${
            safeGet(data, 'legal-land-description') === 'attach' ||
            !safeGet(data, 'legal-land-description-text') ||
            safeGet(data, 'legal-land-description-text') === 'N/A'
              ? '<br/>____________________________________________________________________________________________________.<br/>'
              : safeGet(data, 'legal-land-description-text')
          } All Property included within this Offer is referred to as the "Property".</p></li>
          
          <li><h3 class="mb-10">Chattels, Fixtures & Improvements</h3>
          <p class="mb-15">The following chattels, fixtures, and improvements are to be included as part of the sale of the Property:</p>
          <p class="mb-15">${safeGet(data, 'additional-features-text')}</p></li>
          
          <li><h3 class="mb-10">Sales Price</h3>
          <p class="mb-10">The total purchase price of $${Number(safeGet(data, 'purchasePrice', '0')).toLocaleString()} (the "Purchase Price") that is to be paid for the Property by the Buyer is payable as follows:</p>
          <p class="ml-20 mb-10">a. The initial earnest money deposit (the "Deposit") accompanying this offer is $${safeGet(data, 'depositAmount')}. The Deposit will be paid by ${safeGet(data, 'depositMethod')} on or before ${safeGet(data, 'depositDueDate')}. The Deposit will be held in escrow by ${safeGet(data, 'escrowAgentName')} until the sale is closed, at which time this money will be credited to the Buyer, or until this Offer is otherwise terminated; and</p>
          <p class="ml-20 mb-15">b. The balance of the Purchase Price will be paid in cash or equivalent in financing at closing unless otherwise provided in this Offer. The balance will be subject to adjustments.</p></li>
          
          <li><h3 class="mb-10">Return of Deposit</h3>
          <p class="mb-15">${safeGet(data, 'escrowAgentName', 'The escrow agent')} will return the Deposit to the Buyer if the Offer is rejected or expires prior to acceptance.</p></li>
          
          <li><h3 class="mb-10">Closing & Possession</h3>
          <p class="mb-15">The Closing Date will be on or be prior to ${safeGet(data, 'closingDate')} or at such other time agreed by the Parties, at which point the Buyer will take possession of the Property. ${
            safeGet(data, 'possession') === 'Before funding, under a temporary lease'
              ? `The Buyer will take possession on ${safeGet(data, 'possessionDate')} under a temporary lease arrangement.`
              : ''
          }</p></li>
          
          <li><h3 class="mb-10">Conditions</h3>
          <p class="mb-10">The Buyer's obligation to purchase the Property is contingent upon the following enumerated condition(s):</p>
          ${conditionsHtml}
          <p class="mb-15">All conditions must be satisfied by ${safeGet(data, 'completionDate')}.</p></li>
          
          <li><h3 class="mb-10">Additional Clauses</h3>
          <p class="mb-15">${safeGet(data, 'additionalClauses', 'No additional clauses')}</p></li>
          
          <li><h3 class="mb-10">Notices</h3>
          <p class="mb-10">All notices pursuant to this Offer must be written and signed by the respective party or its agent and all such correspondence will be effective upon it being mailed with return receipt requested, hand-delivered, or emailed as follows:</p>
          <p class="mb-5">Buyer</p>
          <p class="ml-20 mb-0">Name: ${safeGet(data, 'name-buyer-0')}</p>
          <p class="ml-20 mb-0">Address: ${safeGet(data, 'address-buyer-0')}</p>
          <p class="ml-20 mb-15">Email: ${safeGet(data, 'email')}</p>
          <p class="mb-5">Seller</p>
          <p class="ml-20 mb-0">Name: ${safeGet(data, 'name-seller-0')}</p>
          <p class="ml-20 mb-0">Address: ${safeGet(data, 'address-seller-0')}</p>
          <p class="ml-20 mb-15">Email: ${safeGet(data, 'seller-email', 'N/A')}</p></li>
          
          <li><h3 class="mb-10">Severability</h3>
          <p class="mb-15">If any term or provision of this Offer will, to any extent, be determined to be invalid or unenforceable by a court of competent jurisdiction, the remainder of this Offer will not be affected and each unaffected term and provision of this Offer will remain valid and be enforceable to the fullest extent permitted by law.</p></li>
          
          <li><h3 class="mb-10">Interpretation</h3>
          <p class="mb-15">Headings are inserted for the convenience of the Parties only and are not to be considered when interpreting this Offer. Words in the singular mean and include the plural and vice versa. Words in the masculine gender mean and include the feminine gender and vice versa. Words importing persons include firms and corporations and vice versa.</p></li>
          
          <li><h3 class="mb-10">Time of Essence</h3>
          <p class="mb-15">Time is of the essence in this Offer. Every calendar day except Saturday, Sunday, or a US national holiday will be deemed a business day and all relevant time periods in this Offer will be calculated in business days. Performance will be due the next business day if any deadline falls on a Saturday, Sunday, or a US national holiday. A business day ends at 5:00 p.m. local time in the time zone in which the Property is situated.</p></li>
          </ol>
          
          <h3 class="mb-10 text-center">Buyer's Offer</h3>
          <p class="mb-15">This is an offer to purchase the Property on the above terms and conditions. The Seller has the right to continue to offer the Property for sale and to accept any other offer at any time prior to acceptance by the Seller. If the Seller does not accept this offer from the Buyer by ${safeGet(data, 'acceptanceDeadline')}, this offer will lapse and become of no force or effect.</p>
          
          <p class="mb-5">Buyer's Signature: __________________________</p>
          <p class="mb-5">Buyer's Name: ${safeGet(data, 'name-buyer-0')}</p>
          <p class="mb-5">Address: ${safeGet(data, 'address-buyer-0')}</p>
          <p class="mb-5">Date: ____________________________</p>
          <p class="mb-20">Email: ${safeGet(data, 'email')}</p>
          
          <div class="page-break"></div>
          <h3 class="mb-10 text-center">Seller's Acceptance/ Counteroffer/ Rejection</h3>
          <p class="mb-10"><strong>_____Acceptance of offer to purchase:</strong> The Seller accepts the foregoing offer on the terms and conditions specified above, and agrees to convey the Property to the Buyer.</p>
          <div class="flex">
            <div class="flex-item"> 
            <p class="mb-5">_________________________</p>
            <p class="mb-10">Seller's Signature</p>
            </div>
            <div class="flex-item">
            <p class="mb-5">_________________________</p>
            <p class="mb-10">Date</p>
            </div>
            <div class="flex-item">
            <p class="mb-5">_________________________</p>
            <p class="mb-15">Time</p>
            </div>
          </div>
          
          <p class="mb-10"><strong>_____Counteroffer:</strong> The Seller presents for the Buyer's Acceptance the terms of the Buyer's offer subject to the exceptions or modifications as specified in the attached addendum.</p>
          <div class="flex">
            <div class="flex-item"> 
            <p class="mb-5">_________________________</p>
            <p class="mb-10">Seller's Signature</p>
            </div>
            <div class="flex-item">
            <p class="mb-5">_________________________</p>
            <p class="mb-10">Date</p>
            </div>
            <div class="flex-item">
            <p class="mb-5">_________________________</p>
            <p class="mb-15">Time</p>
            </div>
          </div>
          
          <p class="mb-10"><strong>_____Rejection:</strong> The Seller rejects the foregoing offer.</p>
          <div class="flex">
            <div class="flex-item"> 
            <p class="mb-5">_________________________</p>
            <p class="mb-10">Seller's Signature</p>
            </div>
            <div class="flex-item">
            <p class="mb-5">_________________________</p>
            <p class="mb-10">Date</p>
            </div>
            <div class="flex-item">
            <p class="mb-5">_________________________</p>
            <p class="mb-15">Time</p>
            </div>
          </div>
          
          <p class="mb-5">Seller's Name: ${safeGet(data, 'name-seller-0')}</p>
          <p class="mb-5">Address: ${safeGet(data, 'address-seller-0')}</p>
          <p class="mb-5">Date: ____________________________</p>
          <p class="mb-20">Email: ${safeGet(data, 'seller-email', 'N/A')}</p>
        </div>
      </body>
      </html>
    `;

    // Use puppeteer to generate PDF from HTML content
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set content and wait for rendering
    await page.setContent(htmlContent);
    await page.evaluateHandle('document.fonts.ready');
    
    // Set PDF options
    const pdfOptions = {
      format: 'a4' as PaperFormat,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '40mm',
        left: '20mm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      footerTemplate: `
        <div style="width: 100%; font-size: 8px; color: #666; padding: 0 20mm; display: flex; justify-content: space-between;">
          <div>Seller(s) initials: ______________ Date: __________________________</div>
          <div>Buyer(s) initials: ______________ Date: __________________________</div>
          <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
        </div>
      `
    };
    
    // Generate PDF buffer
    const pdfBuffer = await page.pdf(pdfOptions);
    await browser.close();
    
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF: ' + (error instanceof Error ? error.message : String(error)));
  }
}

// Support both POST and GET methods
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { formId } = await req.json();
    
    if (!formId) {
      return NextResponse.json({ error: "Form ID required" }, { status: 400 });
    }

    // Get form data from database
    const formData = await prisma.formData.findUnique({
      where: { id: formId }
    });

    if (!formData) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Check if the user has paid for this offer
    const formDataObj = formData.data as any;
    if (!formDataObj.paymentStatus || formDataObj.paymentStatus !== "PAID") {
      return NextResponse.json({ error: "Payment required" }, { status: 403 });
    }

    // Generate PDF with all form data
    const pdfBuffer = await generatePDF({
      id: formData.id,
      ...formDataObj
    });
    
    // Return the PDF
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Offer_${formDataObj["property-address"]?.replace(/\s+/g, '_') || 'Document'}.pdf"`
      }
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Error generating PDF", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const formId = url.searchParams.get("formId");
    
    if (!formId) {
      return NextResponse.json({ error: "Form ID required" }, { status: 400 });
    }

    // Get form data from database
    const formData = await prisma.formData.findUnique({
      where: { id: formId }
    });

    if (!formData) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Check if the user has paid for this offer
    const formDataObj = formData.data as any;
    if (!formDataObj.paymentStatus || formDataObj.paymentStatus !== "PAID") {
      return NextResponse.json({ error: "Payment required" }, { status: 403 });
    }

    // Generate PDF with all form data
    const pdfBuffer = await generatePDF({
      id: formData.id,
      ...formDataObj
    });
    
    // Return the PDF
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Offer_${formDataObj["property-address"]?.replace(/\s+/g, '_') || 'Document'}.pdf"`
      }
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Error generating PDF", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}