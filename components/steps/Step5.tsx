// Step5.tsx
import React from 'react';
import { FormData } from '../types';

interface Step5Props {
  formData: FormData;
}

const PDFPreview: React.FC<Step5Props> = ({ formData }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Offer Summary</h2>
      <div className="space-y-4">
        <PreviewSection title="Property Details">
          <p>Address: {formData.propertyAddress || 'N/A'}</p>
          <p>Type: {formData.propertyType || 'N/A'}</p>
        </PreviewSection>
        <PreviewSection title="Buyer Information">
          <p>Name: {formData.buyerName || 'N/A'}</p>
          <p>Contact: {formData.buyerPhone || 'N/A'}</p>
        </PreviewSection>
        <PreviewSection title="Seller Information">
          <p>Name: {formData.sellerName || 'N/A'}</p>
          <p>Contact: {formData.sellerPhone || 'N/A'}</p>
        </PreviewSection>
        <PreviewSection title="Offer Details">
          <p>Purchase Price: ${formData.purchasePrice || 'N/A'}</p>
          <p>Deposit Amount: ${formData.depositAmount || 'N/A'}</p>
          <p>Closing Date: {formData.closingDate || 'N/A'}</p>
        </PreviewSection>
      </div>
    </div>
  );
};

const PreviewSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <div className="pl-4 border-l-2 border-gray-200">
      {children}
    </div>
  </div>
);

export default PDFPreview;