import React from "react";
import { useRouter } from "next/navigation";
import { FormData } from "../types";
import { v4 as uuidv4 } from "uuid";

interface Step5Props {
  formData: FormData;
}

const PDFPreview: React.FC<Step5Props> = ({ formData }) => {
  const router = useRouter();

  const saveOfferToDatabase = async (data: FormData) => {
    try {
      console.log("Attempting to save offer:", data);
      const response = await fetch("/api/form/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId: data.id,
          data: data,
          isPurchased: false, // Set to false initially
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to save offer: ${response.status} ${errorText}`,
        );
      }

      const result = await response.json();
      console.log("Offer saved successfully:", result);
      return result;
    } catch (error) {
      console.error("Error in saveOfferToDatabase:", error);
      throw error;
    }
  };

  const handlePurchaseOffer = async () => {
    try {
      console.log("handlePurchaseOffer called");
      let offerToSave = { ...formData };

      if (!offerToSave.id) {
        offerToSave.id = uuidv4(); // Generate a new UUID if id is missing
        console.log("Generated new Form ID:", offerToSave.id);
      }

      const savedOffer = await saveOfferToDatabase(offerToSave);
      console.log("Offer saved, proceeding to plans page");

      // Store the saved offer data in localStorage
      localStorage.setItem("offerFormData", JSON.stringify(savedOffer));

      // Navigate to the plans page
      router.push("/plans");
    } catch (error) {
      console.error("Failed to save offer:", error);
      alert("Failed to save offer. Please try again.");
    }
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
        onClick={handlePurchaseOffer}
      >
        Purchase My Offer
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
