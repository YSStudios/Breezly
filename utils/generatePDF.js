import html2pdf from 'html2pdf.js';

const generatePDF = (formData) => {
  // Helper function to safely get nested properties
  const safeGet = (obj, path, defaultValue = 'N/A') => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
  };

  // Consolidated CSS styles
  const styles = `
    <style>
      body { font-family: Times New Roman, serif; font-size: 12px; line-height: 1.5; }
      .container { padding: 40px 40px 20px 40px; }
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
      h2 { font-size: 16px; }
      h3 { font-size: 14px; }
    </style>
  `;

  // Create an HTML structure that matches the PDF content with improved styling
  const content = `
    <div class="container">
      ${styles}
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

      <h3 class="mb-10">Background</h3>
      <p class="mb-10">The Buyer wishes to submit an offer to purchase a certain completed home from the Seller under the terms stated below.</p>
      <p class="mb-15">IN CONSIDERATION OF and as a condition of the Seller selling the Property and the Buyer purchasing the Property (collectively the "Parties") and other valuable consideration the receipt of which is hereby acknowledged, the Parties to this Offer to Purchase Real Estate agree as follows:</p>

      <h3 class="mb-10">Real Property</h3>
      <p class="mb-15">1. The Property is located at: ${safeGet(formData, 'property-address')}. The legal land description is: ${safeGet(formData, 'legal-land-description-text')}. All Property included within this Offer is referred to as the "Property".</p>

      <p class="text-right mb-5">Seller(s) initials: ______________ Date: __________________________</p>
      <p class="text-right mb-5">Buyer(s) initials: ______________ Date: __________________________</p>
      <p class="text-right mb-20">Page 1 of 6</p>

      <h3 class="mb-10">Chattels, Fixtures & Improvements</h3>
      <p class="mb-15">2. The following chattels, fixtures, and improvements are to be included as part of the sale of the Property:</p>
      <p class="mb-15">${safeGet(formData, 'additional-features-text')}</p>

      <h3 class="mb-10">Sales Price</h3>
      <p class="mb-10">3. The total purchase price of $${Number(safeGet(formData, 'purchasePrice', '0')).toLocaleString()} (the "Purchase Price") that is to be paid for the Property by the Buyer is payable as follows:</p>
      <p class="ml-20 mb-10">a. The initial earnest money deposit (the "Deposit") accompanying this offer is $${safeGet(formData, 'depositAmount')}. The Deposit will be paid by ${safeGet(formData, 'depositMethod')} on or before ${safeGet(formData, 'depositDueDate')}. The Deposit will be held in escrow by ${safeGet(formData, 'escrowAgentName')} until the sale is closed, at which time this money will be credited to the Buyer, or until this Offer is otherwise terminated; and</p>
      <p class="ml-20 mb-15">b. The balance of the Purchase Price will be paid in cash or equivalent in financing at closing unless otherwise provided in this Offer. The balance will be subject to adjustments.</p>

      <h3 class="mb-10">Return of Deposit</h3>
      <p class="mb-15">4. ${safeGet(formData, 'escrowAgentName', 'The escrow agent')} will return the Deposit to the Buyer if the Offer is rejected or expires prior to acceptance.</p>

      <h3 class="mb-10">Closing & Possession</h3>
      <p class="mb-15">5. The Closing Date will be on or be prior to ${safeGet(formData, 'closingDate')} or at such other time agreed by the Parties, at which point the Buyer will take possession of the Property. ${safeGet(formData, 'possession') === 'Before funding, under a temporary lease' ? `The Buyer will take possession on ${safeGet(formData, 'possessionDate')} under a temporary lease arrangement.` : ''}</p>

      <h3 class="mb-10">Conditions</h3>
      <p class="mb-10">6. The Buyer's obligation to purchase the Property is contingent upon the following enumerated condition(s):</p>
      ${safeGet(formData, 'conditions', '').split(',').map((condition, index) => `<p class="ml-20 mb-10">${String.fromCharCode(97 + index)}. ${condition.trim()}</p>`).join('')}
      <p class="mb-15">All conditions must be satisfied by ${safeGet(formData, 'completionDate')}.</p>

      <h3 class="mb-10">Additional Clauses</h3>
      <p class="mb-15">7. ${safeGet(formData, 'additionalClauses', 'No additional clauses')}</p>

      <h3 class="mb-10">Notices</h3>
      <p class="mb-10">8. All notices pursuant to this Offer must be written and signed by the respective party or its agent and all such correspondence will be effective upon it being mailed with return receipt requested, hand-delivered, or emailed as follows:</p>
      <p class="mb-5">Buyer</p>
      <p class="ml-20 mb-0">Name: ${safeGet(formData, 'name-buyer-0')}</p>
      <p class="ml-20 mb-0">Address: ${safeGet(formData, 'address-buyer-0')}</p>
      <p class="ml-20 mb-15">Email: ${safeGet(formData, 'email')}</p>
      <p class="mb-5">Seller</p>
      <p class="ml-20 mb-0">Name: ${safeGet(formData, 'name-seller-0')}</p>
      <p class="ml-20 mb-0">Address: ${safeGet(formData, 'address-seller-0')}</p>
      <p class="ml-20 mb-15">Email: ${safeGet(formData, 'seller-email', 'N/A')}</p>

      <h3 class="mb-10">Severability</h3>
      <p class="mb-15">9. If any term or provision of this Offer will, to any extent, be determined to be invalid or unenforceable by a court of competent jurisdiction, the remainder of this Offer will not be affected and each unaffected term and provision of this Offer will remain valid and be enforceable to the fullest extent permitted by law.</p>

      <h3 class="mb-10">Interpretation</h3>
      <p class="mb-15">10. Headings are inserted for the convenience of the Parties only and are not to be considered when interpreting this Offer. Words in the singular mean and include the plural and vice versa. Words in the masculine gender mean and include the feminine gender and vice versa. Words importing persons include firms and corporations and vice versa.</p>

      <h3 class="mb-10">Time of Essence</h3>
      <p class="mb-15">11. Time is of the essence in this Offer. Every calendar day except Saturday, Sunday, or a US national holiday will be deemed a business day and all relevant time periods in this Offer will be calculated in business days. Performance will be due the next business day if any deadline falls on a Saturday, Sunday, or a US national holiday. A business day ends at 5:00 p.m. local time in the time zone in which the Property is situated.</p>

      <h3 class="mb-10">Buyer's Offer</h3>
      <p class="mb-15">This is an offer to purchase the Property on the above terms and conditions. The Seller has the right to continue to offer the Property for sale and to accept any other offer at any time prior to acceptance by the Seller. If the Seller does not accept this offer from the Buyer by ${safeGet(formData, 'acceptanceDeadline')}, this offer will lapse and become of no force or effect.</p>

      <p class="mb-5">Buyer's Signature: __________________________</p>
      <p class="mb-5">Buyer's Name: ${safeGet(formData, 'name-buyer-0')}</p>
      <p class="mb-5">Address: ${safeGet(formData, 'address-buyer-0')}</p>
      <p class="mb-5">Date: ____________________________</p>
      <p class="mb-20">Email: ${safeGet(formData, 'email')}</p>

      <h3 class="mb-10">Seller's Acceptance/ Counteroffer/ Rejection</h3>
      <p class="mb-10">_____Acceptance of offer to purchase: The Seller accepts the foregoing offer on the terms and conditions specified above, and agrees to convey the Property to the Buyer.</p>
      <p class="mb-5">_________________________</p>
      <p class="mb-10">Seller's Signature</p>
      <p class="mb-5">_________________________</p>
      <p class="mb-10">Date</p>
      <p class="mb-5">_________________________</p>
      <p class="mb-15">Time</p>

      <p class="mb-10">_____Counteroffer: The Seller presents for the Buyer's Acceptance the terms of the Buyer's offer subject to the exceptions or modifications as specified in the attached addendum.</p>
      <p class="mb-5">_________________________</p>
      <p class="mb-10">Seller's Signature</p>
      <p class="mb-5">_________________________</p>
      <p class="mb-10">Date</p>
      <p class="mb-5">_________________________</p>
      <p class="mb-15">Time</p>

      <p class="mb-10">_____Rejection: The Seller rejects the foregoing offer.</p>
      <p class="mb-5">_________________________</p>
      <p class="mb-10">Seller's Signature</p>
      <p class="mb-5">_________________________</p>
      <p class="mb-10">Date</p>
      <p class="mb-5">_________________________</p>
      <p class="mb-15">Time</p>

      <p class="mb-5">Seller's Name: ${safeGet(formData, 'name-seller-0')}</p>
      <p class="mb-5">Address: ${safeGet(formData, 'address-seller-0')}</p>
      <p class="mb-5">Date: ____________________________</p>
      <p class="mb-20">Email: ${safeGet(formData, 'seller-email', 'N/A')}</p>

      <p class="text-right mb-5">Seller(s) initials: ______________ Date: __________________________</p>
      <p class="text-right mb-5">Buyer(s) initials: ______________ Date: __________________________</p>
      <p class="text-right mb-5">Page 6 of 6</p>
    </div>
  `;

  // Create the PDF from the HTML content
  const element = document.createElement('div');
  element.innerHTML = content;
  
  // PDF options
  const opt = {
    margin: [20, 20, 20, 20], // top, left, bottom, right
    filename: 'Offer_to_Purchase_Real_Estate.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Use html2pdf to generate the PDF
  html2pdf().from(element).set(opt).save();
};

export default generatePDF;