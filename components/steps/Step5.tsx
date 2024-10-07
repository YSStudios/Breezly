import React, { useState } from "react";
import { FormData } from "../types";

interface Step5Props {
  formData: FormData;
}

const PDFPreview: React.FC<Step5Props> = ({ formData }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = async () => {
    setIsAdding(true);
    setError(null);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `Offer for ${formData.propertyAddress || "Unknown Property"}`,
          description: "PDF Offer Document",
          price: 9.99,
          imageUrl: "/path/to/pdf-icon.png",
        }),
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries()),
      );

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      if (!responseText) {
        throw new Error("Empty response from server");
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Error parsing JSON:", e);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (response.ok) {
        alert(data.message || "Product added to cart successfully");
        window.location.href = "/cart";
      } else {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
      }
    } catch (error) {
      console.error("Error adding PDF to cart:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    } finally {
      setIsAdding(false);
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
      {error && <p className="mt-4 text-red-600">{error}</p>}
      <button
        className="mt-6 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300"
        onClick={handleAddToCart}
        disabled={isAdding}
      >
        {isAdding ? "Adding to Cart..." : "Add PDF to Cart"}
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
