import html2pdf from "html2pdf.js";

const generatePDF = (formData) => {
  console.log("generatePDF function called with formData:", formData);

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (amount == null || amount === "") return "";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  // Helper function to safely access nested properties
  const safelyAccessProp = (obj, path) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj) || "";
  };

  // Create an HTML structure that matches the PDF content with improved styling
  const content = `
    <div style="font-family: Times New Roman, serif; font-size: 12px; line-height: 1.5; padding: 40px 40px 20px 40px;">
      <h2 style="text-align: center; font-size: 16px; margin-bottom: 10px;">Offer to Purchase Real Estate</h2>
      <p style="text-align: center; margin-bottom: 5px;">THIS OFFER TO PURCHASE REAL ESTATE (the "Offer")</p>
      <p style="text-align: center; margin-bottom: 5px;">IS MADE BY:</p>
      <p style="font-weight: bold; margin-bottom: 0;">${safelyAccessProp(
        formData,
        "buyerFirstName",
      )} ${safelyAccessProp(formData, "buyerLastName")}</p>
      <p style="margin-top: 0; margin-bottom: 5px;">of ${safelyAccessProp(
        formData,
        "buyerAddress",
      )}</p>
      <p style="margin-bottom: 10px;">(the "Buyer")</p>
      <p style="text-align: center; margin-bottom: 5px;">OF THE FIRST PART</p>
      <p style="text-align: center; margin-bottom: 5px;">- TO -</p>
      <p style="font-weight: bold; margin-bottom: 0;">${safelyAccessProp(
        formData,
        "sellerFirstName",
      )} ${safelyAccessProp(formData, "sellerLastName")}</p>
      <p style="margin-top: 0; margin-bottom: 5px;">of ${safelyAccessProp(
        formData,
        "sellerAddress",
      )}</p>
      <p style="margin-bottom: 10px;">(the "Seller")</p>
      <p style="text-align: center; margin-bottom: 15px;">OF THE SECOND PART</p>

      <h3 style="font-size: 14px; margin-bottom: 10px;">Background</h3>
      <p style="margin-bottom: 10px;">The Buyer wishes to submit an offer to purchase a certain completed home from the Seller under the terms stated below.</p>
      <p style="margin-bottom: 15px;">IN CONSIDERATION OF and as a condition of the Seller selling the Property and the Buyer purchasing the Property (collectively the "Parties") and other valuable consideration the receipt of which is hereby acknowledged, the Parties to this Offer to Purchase Real Estate agree as follows:</p>

      <h3 style="font-size: 14px; margin-bottom: 10px;">Real Property</h3>
      <p style="margin-bottom: 15px;">1. The Property is located at: ${safelyAccessProp(
        formData,
        "propertyAddress",
      )}. The land description is as follows: ${safelyAccessProp(
    formData,
    "propertyDescription",
  )}. All Property included within this Offer is referred to as the "Property".</p>

      <p style="text-align: right; margin-bottom: 5px;">Seller(s) initials: ______________ Date: __________________________</p>
      <p style="text-align: right; margin-bottom: 5px;">Buyer(s) initials: ______________ Date: __________________________</p>
      <p style="text-align: right; margin-bottom: 20px;">Page 1 of 6</p>

      <h3 style="font-size: 14px; margin-bottom: 10px;">Chattels, Fixtures & Improvements</h3>
      <p style="margin-bottom: 15px;">2. The following chattels, fixtures, and improvements are to be included as part of the sale of the Property:</p>
      <p style="margin-bottom: 15px;">${
        safelyAccessProp(formData, "includedItems") ||
        "_____________________________________________________________________________"
      }</p>

      <h3 style="font-size: 14px; margin-bottom: 10px;">Sales Price</h3>
      <p style="margin-bottom: 10px;">3. The total purchase price of ${formatCurrency(
        safelyAccessProp(formData, "purchasePrice"),
      )} (the "Purchase Price") that is to be paid for the Property by the Buyer is payable as follows:</p>
      <p style="margin-left: 20px; margin-bottom: 10px;">a. The initial earnest money deposit (the "Deposit") accompanying this offer is ${formatCurrency(
        safelyAccessProp(formData, "earnestMoneyDeposit"),
      )}. The Deposit will be paid by cash on or before ${formatDate(
    safelyAccessProp(formData, "depositDate"),
  )}. The Deposit will be held in escrow by ${safelyAccessProp(
    formData,
    "escrowAgent",
  )} until the sale is closed, at which time this money will be credited to the Buyer, or until this Offer is otherwise terminated; and</p>
      <p style="margin-left: 20px; margin-bottom: 15px;">b. The balance of the Purchase Price will be paid in cash or equivalent in financing at closing unless otherwise provided in this Offer. The balance will be subject to adjustments.</p>

      <h3 style="font-size: 14px; margin-bottom: 10px;">Return of Deposit</h3>
      <p style="margin-bottom: 15px;">4. ${safelyAccessProp(
        formData,
        "escrowAgent",
      )} will return the Deposit to the Buyer if the Offer is rejected or expires prior to acceptance.</p>

      <h3 style="font-size: 14px; margin-bottom: 10px;">Closing & Possession</h3>
      <p style="margin-bottom: 15px;">5. The Closing Date will be on or be prior to ${formatDate(
        safelyAccessProp(formData, "closingDate"),
      )} or at such other time agreed by the Parties, at which point the Buyer will take possession of the Property.</p>

      <h3 style="font-size: 14px; margin-bottom: 10px;">Conditions</h3>
      <p style="margin-bottom: 10px;">6. The Buyer's obligation to purchase the Property is contingent upon the following enumerated condition(s):</p>
      ${
        Array.isArray(formData.conditions)
          ? formData.conditions
              .map(
                (condition, index) =>
                  `<p style="margin-left: 20px; margin-bottom: 10px;">${String.fromCharCode(
                    97 + index,
                  )}. ${condition}</p>`,
              )
              .join("")
          : ""
      }

      <h3 style="font-size: 14px; margin-bottom: 10px;">Additional Clauses</h3>
      <p style="margin-bottom: 15px;">7. ${safelyAccessProp(
        formData,
        "additionalClauses",
      )}</p>

      <h3 style="font-size: 14px; margin-bottom: 10px;">Notices</h3>
      <p style="margin-bottom: 10px;">8. All notices pursuant to this Offer must be written and signed by the respective party or its agent and all such correspondence will be effective upon it being mailed with return receipt requested, hand-delivered, or emailed as follows:</p>
      <p style="margin-bottom: 5px;">Buyer</p>
      <p style="margin-left: 20px; margin-bottom: 0;">Name: ${safelyAccessProp(
        formData,
        "buyerFirstName",
      )} ${safelyAccessProp(formData, "buyerLastName")}</p>
      <p style="margin-left: 20px; margin-bottom: 0;">Address: ${safelyAccessProp(
        formData,
        "buyerAddress",
      )}</p>
      <p style="margin-left: 20px; margin-bottom: 0;">Phone: ___________________________</p>
      <p style="margin-left: 20px; margin-bottom: 15px;">Email: ___________________________</p>
      <p style="margin-bottom: 5px;">Seller</p>
      <p style="margin-left: 20px; margin-bottom: 0;">Name: ${safelyAccessProp(
        formData,
        "sellerFirstName",
      )} ${safelyAccessProp(formData, "sellerLastName")}</p>
      <p style="margin-left: 20px; margin-bottom: 0;">Address: ${safelyAccessProp(
        formData,
        "sellerAddress",
      )}</p>
      <p style="margin-left: 20px; margin-bottom: 0;">Phone: ___________________________</p>
      <p style="margin-left: 20px; margin-bottom: 15px;">Email: ___________________________</p>

      <h3 style="font-size: 14px; margin-bottom: 10px;">Severability</h3>
      <p style="margin-bottom: 15px;">9. If any term or provision of this Offer will, to any extent, be determined to be invalid or unenforceable by a court of competent jurisdiction, the remainder of this Offer will not be affected and each unaffected term and provision of this Offer will remain valid and be enforceable to the fullest extent permitted by law.</p>

      <h3 style="font-size: 14px; margin-bottom: 10px;">Interpretation</h3>
      <p style="margin-bottom: 15px;">10. Headings are inserted for the convenience of the Parties only and are not to be considered when interpreting this Offer. Words in the singular mean and include the plural and vice versa. Words in the masculine gender mean and include the feminine gender and vice versa. Words importing persons include firms and corporations and vice versa.</p>

      <h3 style="font-size: 14px; margin-bottom: 10px;">Time of Essence</h3>
      <p style="margin-bottom: 15px;">11. Time is of the essence in this Offer. Every calendar day except Saturday, Sunday, or a US national holiday will be deemed a business day and all relevant time periods in this Offer will be calculated in business days. Performance will be due the next business day if any deadline falls on a Saturday, Sunday, or a US national holiday. A business day ends at 5:00 p.m. local time in the time zone in which the Property is situated.</p>

      <h3 style="font-size: 14px; margin-bottom: 10px;">Buyer's Offer</h3>
      <p style="margin-bottom: 15px;">This is an offer to purchase the Property on the above terms and conditions. The Seller has the right to continue to offer the Property for sale and to accept any other offer at any time prior to acceptance by the Seller. If the Seller does not accept this offer from the Buyer by ${formatDate(
        safelyAccessProp(formData, "offerExpirationDate"),
      )}, this offer will lapse and become of no force or effect.</p>

      <p style="margin-bottom: 5px;">Buyer's Signature: __________________________</p>
      <p style="margin-bottom: 5px;">Buyer's Name: ${safelyAccessProp(
        formData,
        "buyerFirstName",
      )} ${safelyAccessProp(formData, "buyerLastName")}</p>
      <p style="margin-bottom: 5px;">Address: ${safelyAccessProp(
        formData,
        "buyerAddress",
      )}</p>
      <p style="margin-bottom: 5px;">Date: ____________________________</p>
      <p style="margin-bottom: 5px;">Phone: ___________________________</p>
      <p style="margin-bottom: 5px;">Email: ___________________________</p>
      <p style="margin-bottom: 20px;">Social Security #: ____________________</p>

      <h3 style="font-size: 14px; margin-bottom: 10px;">Seller's Acceptance/ Counteroffer/ Rejection</h3>
      <p style="margin-bottom: 10px;">_____Acceptance of offer to purchase: The Seller accepts the foregoing offer on the terms and conditions specified above, and agrees to convey the Property to the Buyer.</p>
      <p style="margin-bottom: 5px;">_________________________</p>
      <p style="margin-bottom: 10px;">Seller's Signature</p>
      <p style="margin-bottom: 5px;">_________________________</p>
      <p style="margin-bottom: 10px;">Date</p>
      <p style="margin-bottom: 5px;">_________________________</p>
      <p style="margin-bottom: 15px;">Time</p>

      <p style="margin-bottom: 10px;">_____Counteroffer: The Seller presents for the Buyer's Acceptance the terms of the Buyer's offer subject to the exceptions or modifications as specified in the attached addendum.</p>
      <p style="margin-bottom: 5px;">_________________________</p>
      <p style="margin-bottom: 10px;">Seller's Signature</p>
      <p style="margin-bottom: 5px;">_________________________</p>
      <p style="margin-bottom: 10px;">Date</p>
      <p style="margin-bottom: 5px;">_________________________</p>
      <p style="margin-bottom: 15px;">Time</p>

      <p style="margin-bottom: 10px;">_____Rejection: The Seller rejects the foregoing offer.</p>
      <p style="margin-bottom: 5px;">_________________________</p>
      <p style="margin-bottom: 10px;">Seller's Signature</p>
      <p style="margin-bottom: 5px;">_________________________</p>
      <p style="margin-bottom: 10px;">Date</p>
      <p style="margin-bottom: 5px;">_________________________</p>
      <p style="margin-bottom: 15px;">Time</p>

      <p style="margin-bottom: 5px;">Seller's Name: ${safelyAccessProp(
        formData,
        "sellerFirstName",
      )} ${safelyAccessProp(formData, "sellerLastName")}</p>
      <p style="margin-bottom: 5px;">Address: ${safelyAccessProp(
        formData,
        "sellerAddress",
      )}</p>
      <p style="margin-bottom: 5px;">Date: ____________________________</p>
      <p style="margin-bottom: 20px;">Phone: ___________________________</p>

      <p style="text-align: right; margin-bottom: 5px;">Seller(s) initials: ______________ Date: __________________________</p>
      <p style="text-align: right; margin-bottom: 5px;">Buyer(s) initials: ______________ Date: __________________________</p>
      <p style="text-align: right; margin-bottom: 5px;">Page 6 of 6</p>
    </div>
  `;

  // Create the PDF from the HTML content
  const element = document.createElement("div");
  element.innerHTML = content;

  // PDF options
  const opt = {
    margin: [20, 20, 20, 20], // top, left, bottom, right
    filename: "Offer_to_Purchase_Real_Estate.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  // Use html2pdf to generate the PDF
  html2pdf().from(element).set(opt).save();
};

export default generatePDF;
