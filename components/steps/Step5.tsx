import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormData } from "../types";
import generatePDF from "../../utils/generatePDF";
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';

// Set the workerSrc to the path of the worker file
if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
}

interface Step5Props {
  formData: FormData;
}

const PDFPreview: React.FC<Step5Props> = ({ formData }) => {
  const router = useRouter();
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdfPreview = async () => {
      try {
        const pdfBlob = await generatePDF(formData);
        const pdfUrl = URL.createObjectURL(pdfBlob);

        const pdf = await getDocument(pdfUrl).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 1 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error("Failed to get 2D context");
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        setPdfPreview(canvas.toDataURL());
      } catch (error) {
        console.error("Error generating PDF preview:", error);
      }
    };

    fetchPdfPreview();
  }, [formData]);

  const saveOfferToDatabase = async (data: FormData) => {
    try {
      console.log("Attempting to save offer:", data);
      const response = await fetch("/api/form/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId: data.id || undefined,
          data: data,
          isPurchased: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save offer: ${response.status} ${errorText}`);
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
      const savedOffer = await saveOfferToDatabase(formData);
      console.log("Offer saved, proceeding to plans page");
      localStorage.setItem("offerFormData", JSON.stringify(savedOffer));
      router.push("/plans");
    } catch (error) {
      console.error("Failed to save offer:", error);
      alert("Failed to save offer. Please try again.");
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-2xl font-bold">PDF Preview</h2>
      {pdfPreview ? (
        <img src={pdfPreview} alt="PDF Preview" className="w-full h-auto" />
      ) : (
        <p>Loading preview...</p>
      )}
      <button
        className="mt-6 rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
        onClick={handlePurchaseOffer}
      >
        Purchase My Offer
      </button>
    </div>
  );
};

export default PDFPreview;
