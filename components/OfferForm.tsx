import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

const OfferForm = () => {
  const [formData, setFormData] = useState({
    // ... your form fields
  });
  const router = useRouter();

  useEffect(() => {
    const storedFormData = localStorage.getItem("offerFormData");
    if (storedFormData) {
      setFormData(JSON.parse(storedFormData));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      localStorage.setItem("offerFormData", JSON.stringify(newData));
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ... submit logic
    localStorage.removeItem("offerFormData"); // Clear form data after submission
    router.push("/next-page");
  };

  // ... rest of the component
};

export default OfferForm;
