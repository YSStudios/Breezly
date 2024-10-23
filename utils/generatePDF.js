import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates a PDF document for the Offer to Purchase Real Estate.
 * @param {Object} formData - The form data containing all necessary information.
 * @returns {Promise<Blob>} - A promise that resolves to a PDF blob.
 */
const generatePDF = async (formData) => {
  // Helper function to safely access nested properties
  const safeGet = (obj, path, defaultValue = 'N/A') => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
  };

  // Create a hidden container to hold the HTML content
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px'; // Hide the container
  container.style.top = '0';
  container.style.width = '210mm'; // A4 width

  // Add the new styles
  const styles = `
    <style>
      body { }
      .container {  }
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
      h3 { font-size: 20px; text-decoration: underline; font-weight: bold; }
      ol { list-style-type: decimal;padding-left: 2em; list-style-position: outside; }
      ol li { padding-left: 2em; }
      .page-break { page-break-before: always; }
      .flex { display: flex; }
      .flex-item { flex: 1; }
    </style>
  `;

  container.innerHTML = `
    ${styles}
    <div class="container">
      <h2 class="font-bold text-center mb-10">Offer to Purchase Real Estate</h2>
      <p class="font-bold mb-5">THIS OFFER TO PURCHASE REAL ESTATE (the "Offer")</p>
      <p class="font-bold mb-5">IS MADE BY:</p>
      <p class="text-center mb-0">${safeGet(formData, 'name-buyer-0')} of ${safeGet(formData, 'address-buyer-0')}</p>
      <p class="text-center mb-10">(the "Buyer")</p>
      <p class="font-bold text-right mb-5">OF THE FIRST PART</p>
      <p class="font-bold text-center mb-5">- TO -</p>
      <p class="text-center mb-0">${safeGet(formData, 'name-seller-0')} of ${safeGet(formData, 'address-seller-0')}</p>
      <p class="text-center mb-10">(the "Seller")</p>
      <p class="font-bold text-right mb-15">OF THE SECOND PART</p>
      
      <h3 class="mb-10 ">Background</h3>
      <p class="mb-10">The Buyer wishes to submit an offer to purchase a certain completed home from the Seller under the terms stated below.</p>
      <p class="mb-15"><strong>IN CONSIDERATION OF</strong> and as a condition of the Seller selling the Property and the Buyer purchasing the Property (collectively the "Parties") and other valuable consideration the receipt of which is hereby acknowledged, the Parties to this Offer to Purchase Real Estate agree as follows:</p>
      
      <ol>
      <li><h3 class="mb-10">Real Property</h3>
      <p class="mb-15">The Property is located at: ${safeGet(formData, 'property-address')}. The legal land description is as follows: ${
        safeGet(formData, 'legal-land-description') === 'attach' ||
        !safeGet(formData, 'legal-land-description-text') ||
        safeGet(formData, 'legal-land-description-text') === 'N/A'
          ? '<br/>____________________________________________________________________________________________________.<br/>'
          : safeGet(formData, 'legal-land-description-text')
      } All Property included within this Offer is referred to as the "Property".</p></li>
      
      <li><h3 class="mb-10">Chattels, Fixtures & Improvements</h3>
      <p class="mb-15">The following chattels, fixtures, and improvements are to be included as part of the sale of the Property:</p>
      <p class="mb-15">${safeGet(formData, 'additional-features-text')}</p></li>
      
      <li><h3 class="mb-10">Sales Price</h3>
      <p class="mb-10">The total purchase price of $${Number(safeGet(formData, 'purchasePrice', '0')).toLocaleString()} (the "Purchase Price") that is to be paid for the Property by the Buyer is payable as follows:</p>
      <p class="ml-20 mb-10">a. The initial earnest money deposit (the "Deposit") accompanying this offer is $${safeGet(formData, 'depositAmount')}. The Deposit will be paid by ${safeGet(formData, 'depositMethod')} on or before ${safeGet(formData, 'depositDueDate')}. The Deposit will be held in escrow by ${safeGet(formData, 'escrowAgentName')} until the sale is closed, at which time this money will be credited to the Buyer, or until this Offer is otherwise terminated; and</p>
      <p class="ml-20 mb-15">b. The balance of the Purchase Price will be paid in cash or equivalent in financing at closing unless otherwise provided in this Offer. The balance will be subject to adjustments.</p></li>
      
      <li><h3 class="mb-10">Return of Deposit</h3>
      <p class="mb-15">${safeGet(formData, 'escrowAgentName', 'The escrow agent')} will return the Deposit to the Buyer if the Offer is rejected or expires prior to acceptance.</p></li>
      
      <li><h3 class="mb-10">Closing & Possession</h3>
      <p class="mb-15">The Closing Date will be on or be prior to ${safeGet(formData, 'closingDate')} or at such other time agreed by the Parties, at which point the Buyer will take possession of the Property. ${
        safeGet(formData, 'possession') === 'Before funding, under a temporary lease'
          ? `The Buyer will take possession on ${safeGet(formData, 'possessionDate')} under a temporary lease arrangement.`
          : ''
      }</p></li>
      
      <li><h3 class="mb-10">Conditions</h3>
      <p class="mb-10">The Buyer's obligation to purchase the Property is contingent upon the following enumerated condition(s):</p>
      ${safeGet(formData, 'conditions', '')
        .split(',')
        .map(
          (condition, index) =>
            `<p class="ml-20 mb-10">${String.fromCharCode(97 + index)}. ${condition.trim()}</p>`
        )
        .join('')}
      <p class="mb-15">All conditions must be satisfied by ${safeGet(formData, 'completionDate')}.</p></li>
      
      <li><h3 class="mb-10">Additional Clauses</h3>
      <p class="mb-15">${safeGet(formData, 'additionalClauses', 'No additional clauses')}</p></li>
      
      <li><h3 class="mb-10">Notices</h3>
      <p class="mb-10">All notices pursuant to this Offer must be written and signed by the respective party or its agent and all such correspondence will be effective upon it being mailed with return receipt requested, hand-delivered, or emailed as follows:</p>
      <p class="mb-5">Buyer</p>
      <p class="ml-20 mb-0">Name: ${safeGet(formData, 'name-buyer-0')}</p>
      <p class="ml-20 mb-0">Address: ${safeGet(formData, 'address-buyer-0')}</p>
      <p class="ml-20 mb-15">Email: ${safeGet(formData, 'email')}</p>
      <p class="mb-5">Seller</p>
      <p class="ml-20 mb-0">Name: ${safeGet(formData, 'name-seller-0')}</p>
      <p class="ml-20 mb-0">Address: ${safeGet(formData, 'address-seller-0')}</p>
      <p class="ml-20 mb-15">Email: ${safeGet(formData, 'seller-email', 'N/A')}</p></li>
      
      <li><h3 class="mb-10">Severability</h3>
      <p class="mb-15">If any term or provision of this Offer will, to any extent, be determined to be invalid or unenforceable by a court of competent jurisdiction, the remainder of this Offer will not be affected and each unaffected term and provision of this Offer will remain valid and be enforceable to the fullest extent permitted by law.</p></li>
      
      <li><h3 class="mb-10">Interpretation</h3>
      <p class="mb-15">Headings are inserted for the convenience of the Parties only and are not to be considered when interpreting this Offer. Words in the singular mean and include the plural and vice versa. Words in the masculine gender mean and include the feminine gender and vice versa. Words importing persons include firms and corporations and vice versa.</p></li>
      
      <li><h3 class="mb-10">Time of Essence</h3>
      <p class="mb-15">Time is of the essence in this Offer. Every calendar day except Saturday, Sunday, or a US national holiday will be deemed a business day and all relevant time periods in this Offer will be calculated in business days. Performance will be due the next business day if any deadline falls on a Saturday, Sunday, or a US national holiday. A business day ends at 5:00 p.m. local time in the time zone in which the Property is situated.</p></li>
      </ol>
      
      <h3 class="mb-10 text-center">Buyer's Offer</h3>
      <p class="mb-15">This is an offer to purchase the Property on the above terms and conditions. The Seller has the right to continue to offer the Property for sale and to accept any other offer at any time prior to acceptance by the Seller. If the Seller does not accept this offer from the Buyer by ${safeGet(formData, 'acceptanceDeadline')}, this offer will lapse and become of no force or effect.</p>
      
      <p class="mb-5">Buyer's Signature: __________________________</p>
      <p class="mb-5">Buyer's Name: ${safeGet(formData, 'name-buyer-0')}</p>
      <p class="mb-5">Address: ${safeGet(formData, 'address-buyer-0')}</p>
      <p class="mb-5">Date: ____________________________</p>
      <p class="mb-20">Email: ${safeGet(formData, 'email')}</p>
      
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
      
      <p class="mb-5">Seller's Name: ${safeGet(formData, 'name-seller-0')}</p>
      <p class="mb-5">Address: ${safeGet(formData, 'address-seller-0')}</p>
      <p class="mb-5">Date: ____________________________</p>
      <p class="mb-20">Email: ${safeGet(formData, 'seller-email', 'N/A')}</p>
    </div>
  `;

  // Append the container to the body
  document.body.appendChild(container);

  // Wait for the content to render
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Define adjustable margins (in mm)
  const margins = {
    top: 20,
    bottom: 40,
    left: 20,
    right: 20
  };

  // Use html2canvas to capture the container
  const canvas = await html2canvas(container, { 
    scale: 2,
    useCORS: true,
    logging: false,
    windowWidth: container.scrollWidth
  });

  // Initialize jsPDF
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Calculate the width and height of the image in the PDF
  const imgWidth = pageWidth - margins.left - margins.right;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Calculate the number of pages
  const totalPages = Math.ceil(imgHeight / (pageHeight - margins.top - margins.bottom));

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) {
      pdf.addPage();
    }

    const srcY = page * (pageHeight - margins.top - margins.bottom) * (canvas.height / imgHeight);
    const srcHeight = Math.min(
      canvas.height - srcY,
      (pageHeight - margins.top - margins.bottom) * (canvas.height / imgHeight)
    );

    // Create a temporary canvas to extract the current page
    const canvasPage = document.createElement('canvas');
    canvasPage.width = canvas.width;
    canvasPage.height = srcHeight;

    const ctx = canvasPage.getContext('2d');
    ctx.drawImage(canvas, 0, srcY, canvas.width, srcHeight, 0, 0, canvas.width, srcHeight);

    const imgPage = canvasPage.toDataURL('image/png');

    // Add the image to the PDF
    pdf.addImage(
      imgPage, 
      'PNG', 
      margins.left, 
      margins.top, 
      imgWidth, 
      (srcHeight * imgWidth) / canvas.width
    );

    // Add footer to the current page
    pdf.setFontSize(10);
    pdf.text(
      'Seller(s) initials: ______________ Date: __________________________',
      margins.left,
      pageHeight - margins.bottom + 15,
      { align: 'left' }
    );
    pdf.text(
      'Buyer(s) initials: ______________ Date: __________________________',
      margins.left,
      pageHeight - margins.bottom + 20,
      { align: 'left' }
    );
    
    // Add page number to the right side
    pdf.text(
      `Page ${page + 1} of ${totalPages}`,
      pageWidth - margins.right,
      pageHeight - margins.bottom + 20,
      { align: 'right' }
    );
  }

  // Construct the filename using the property address
  const propertyAddress = safeGet(formData, 'property-address', 'Property'); // Default to 'Property' if not found
  const filename = `Offer to Purchase ${propertyAddress}.pdf`; // Constructed filename

  // Generate PDF blob
  const pdfBlob = pdf.output('blob');

  // Create a link element to trigger the download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(pdfBlob);
  link.download = filename; // Use the constructed filename
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Remove the container from the DOM
  document.body.removeChild(container);

  return pdfBlob;
};

export default generatePDF;
