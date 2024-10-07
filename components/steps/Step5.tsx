import React from "react";
import { useRouter } from "next/navigation";
import { FormData } from "../types";

interface Step5Props {
  formData: FormData;
}

const PDFPreview: React.FC<Step5Props> = ({ formData }) => {
  const router = useRouter();

  const handleViewPlans = () => {
    // Store the current form data in localStorage
    localStorage.setItem("offerFormData", JSON.stringify(formData));
    // Redirect to the plans page
    router.push("/plans");
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-2xl font-bold">Offer Summary</h2>
      <div className="space-y-4">
        <PreviewSection title="Property Details">
          <p>Address: {formData.propertyAddress || "N/A"}</p>
          <p>Type: {formData.propertyType || "N/A"}</p>
        </PreviewSection>
        <PreviewSection title="Buyer Information">
          <p>Name: {formData.buyerName || "N/A"}</p>
          <p>Contact: {formData.buyerPhone || "N/A"}</p>
        </PreviewSection>
        <PreviewSection title="Seller Information">
          <p>Name: {formData.sellerName || "N/A"}</p>
          <p>Contact: {formData.sellerPhone || "N/A"}</p>
        </PreviewSection>
        <PreviewSection title="Offer Details">
          <p>Purchase Price: ${formData.purchasePrice || "N/A"}</p>
          <p>Deposit Amount: ${formData.depositAmount || "N/A"}</p>
          <p>Closing Date: {formData.closingDate || "N/A"}</p>
        </PreviewSection>
      </div>
      <button
        className="mt-6 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        onClick={handleViewPlans}
      >
        purchase my offer
      </button>
    </div>
  );
};

const PreviewSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div>
    <h3 className="mb-2 text-lg font-semibold">{title}</h3>
    <div className="border-l-2 border-gray-200 pl-4">{children}</div>
  </div>
);

export default PDFPreview;
