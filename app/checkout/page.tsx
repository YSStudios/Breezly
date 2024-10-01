"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LockClosedIcon,
  DocumentTextIcon,
  HomeIcon,
} from "@heroicons/react/24/solid";
import Select from "react-select";
import countryList from "react-select-country-list";
import { FormData } from "../../components/types"; // Adjust the import path as needed
import { format } from "date-fns";
import { usStates } from "./states";

const CheckoutPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<FormData>({});
  const [formId, setFormId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentDateTime = format(new Date(), "dd MMMM / hh:mm a").toUpperCase();
  const countries = countryList().getData();

  useEffect(() => {
    const initForm = async () => {
      if (status === "authenticated") {
        const urlFormId = searchParams?.get("id");
        if (urlFormId) {
          setFormId(urlFormId);
          await fetchFormData(urlFormId);
        } else {
          const storedFormId = localStorage.getItem("currentFormId");
          if (storedFormId) {
            setFormId(storedFormId);
            await fetchFormData(storedFormId);
          } else {
            // Create a new form if no ID is found
            const newFormId = await createNewForm();
            setFormId(newFormId);
            localStorage.setItem("currentFormId", newFormId);
          }
        }
      } else if (status === "unauthenticated") {
        router.push("/login");
      }
    };

    initForm();
  }, [status, searchParams, router]);

  const fetchFormData = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/form/get?id=${id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      } else {
        console.error("Error fetching form data:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching form data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewForm = async () => {
    try {
      const response = await fetch("/api/form/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (response.ok) {
        const data = await response.json();
        return data.id;
      } else {
        console.error("Error creating new form:", await response.text());
      }
    } catch (error) {
      console.error("Error creating new form:", error);
    }
    return null;
  };

  const handleInputChange = (
    name: string,
    value: string | { value: string; label: string },
  ) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: typeof value === "object" ? value.value : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId) return;

    try {
      const response = await fetch("/api/form/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId, data: formData }),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        console.error("Error saving form:", await response.text());
      }
    } catch (error) {
      console.error("Error saving form:", error);
    }
  };

  if (status === "loading" || isLoading) {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Please log in to view this page.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:space-x-8">
        <div className="md:w-2/3">
          <h1 className="mb-4 text-2xl font-bold">Breezly</h1>
          <div className="mb-6 flex items-center justify-between">
            <nav className="text-sm">
              <ol className="inline-flex list-none p-0">
                <li className="flex items-center text-gray-500">
                  <span>Information</span>
                  <svg
                    className="mx-3 h-3 w-3 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                  >
                    <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
                  </svg>
                </li>
                <li className="flex items-center text-gray-500">
                  <span>Review</span>
                </li>
              </ol>
            </nav>
          </div>

          {/* Payment buttons */}
          <div className="mb-6">
            <h2 className="mb-4 text-xl font-semibold">Express checkout</h2>
            <div className="grid grid-cols-4 gap-2">
              <button className="rounded bg-indigo-600 px-4 py-2 text-white">
                Shop Pay
              </button>
              <button className="rounded bg-yellow-500 px-4 py-2 text-white">
                Amazon Pay
              </button>
              <button className="rounded bg-black px-4 py-2 text-white">
                Apple Pay
              </button>
              <button className="rounded bg-blue-500 px-4 py-2 text-white">
                PayPal
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h2 className="mb-4 text-xl font-semibold">
                Contact Information
              </h2>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData["email"] || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              </div>
              <h2 className="mb-4 text-xl font-semibold">Shipping Address</h2>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="first-name"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    First name
                  </label>
                  <input
                    type="text"
                    id="first-name"
                    name="first-name"
                    value={formData["first-name"] || ""}
                    onChange={(e) =>
                      handleInputChange("first-name", e.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="last-name"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Last name
                  </label>
                  <input
                    type="text"
                    id="last-name"
                    name="last-name"
                    value={formData["last-name"] || ""}
                    onChange={(e) =>
                      handleInputChange("last-name", e.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="address"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData["address"] || ""}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="country"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Country
                </label>
                <Select
                  options={countries}
                  value={countries.find(
                    (country) => country.value === formData["country"],
                  )}
                  onChange={(selectedOption) =>
                    handleInputChange(
                      "country",
                      selectedOption || { value: "", label: "" },
                    )
                  }
                  className="rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="state"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    State
                  </label>
                  <Select
                    options={usStates}
                    value={usStates.find(
                      (state) => state.value === formData["state"],
                    )}
                    onChange={(selectedOption) =>
                      handleInputChange(
                        "state",
                        selectedOption || { value: "", label: "" },
                      )
                    }
                    className="rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="zip"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    ZIP code
                  </label>
                  <input
                    type="text"
                    id="zip"
                    name="zip"
                    value={formData["zip"] || ""}
                    onChange={(e) => handleInputChange("zip", e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="phone"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Phone number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData["phone"] || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded bg-indigo-600 px-4 py-2 text-white transition duration-200 hover:bg-indigo-700"
            >
              Continue to review
            </button>
          </form>
        </div>
        <div className="mt-8 md:mt-0 md:w-1/3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center">
              <DocumentTextIcon className="mr-2 h-6 w-6 text-gray-500" />
              <h2 className="text-xl font-semibold">Purchase Summary</h2>
            </div>
            <div className="mb-4 flex items-start">
              <div className="mr-4 rounded-md bg-gray-100 p-2">
                <HomeIcon className="h-12 w-12 text-gray-500" />
              </div>
              <div className="flex-grow">
                <h3 className="text-sm font-medium">
                  {formData["property-address"] || "Property Address"}
                </h3>
                <p className="text-sm text-gray-500">
                  {formData["property-location"] || "Property Location"}
                </p>
              </div>
              <span className="ml-auto text-lg font-semibold">
                ${formData["purchasePrice"] || "0"}
              </span>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-base font-medium">Subtotal</span>
                <span className="text-base font-semibold">
                  ${formData["purchasePrice"] || "0"}
                </span>
              </div>
            </div>
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Gift card"
                  className="w-full rounded-md border border-gray-300 p-2 pr-20"
                />
                <button className="absolute right-1 top-1 rounded bg-gray-200 px-4 py-1 text-sm font-medium text-gray-700">
                  APPLY
                </button>
              </div>
            </div>
            <div className="mb-4 text-sm text-gray-500"></div>
            <div className="mb-4 flex items-center justify-between border-t pt-4">
              <span className="text-base font-medium">Total</span>
              <span className="text-xl font-bold">
                ${formData["purchasePrice"] || "0"}
              </span>
            </div>
            <button
              type="submit"
              className="w-full rounded bg-indigo-600 px-4 py-2 text-white transition duration-200 hover:bg-indigo-700"
            >
              Submit Offer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
