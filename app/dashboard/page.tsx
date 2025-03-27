"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CalendarIcon } from "lucide-react";
import { FormData } from "../../components/types";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";

interface SavedForm {
  id: string;
  data: FormData;
  createdAt: string;
  updatedAt: string;
}

const SkeletonCard = () => (
  <div className="animate-pulse rounded-lg bg-indigo-50 p-4 shadow transition-all hover:shadow-md">
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className="h-6 w-16 rounded-full bg-gray-200"></div>
      </div>
      <div className="h-5 w-24 rounded bg-gray-200"></div>
    </div>

    <div className="mb-4 space-y-2">
      <div className="h-5 w-3/4 rounded bg-gray-200"></div>
      <div className="h-5 w-2/3 rounded bg-gray-200"></div>
    </div>

    <div className="mb-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="h-5 w-24 rounded bg-gray-200"></div>
        <div className="h-5 w-20 rounded bg-gray-200"></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-5 w-16 rounded bg-gray-200"></div>
        <div className="h-5 w-24 rounded bg-gray-200"></div>
      </div>
    </div>

    <div className="border-t border-gray-200 pt-4">
      <div className="mb-4">
        <div className="h-5 w-40 rounded bg-gray-200"></div>
      </div>
      <div className="flex items-center justify-end space-x-3">
        <div className="h-7 w-16 rounded bg-gray-200"></div>
        <div className="h-7 w-16 rounded bg-gray-200"></div>
      </div>
    </div>
  </div>
);

const SkeletonTable = () => (
  <div className="animate-pulse overflow-x-auto">
    <div className="w-full table-fixed">
      <div className="bg-gray-50 py-3">
        <div className="grid grid-cols-7 gap-4 px-4">
          <div className="h-4 w-full rounded bg-gray-200"></div>
          <div className="h-4 w-full rounded bg-gray-200"></div>
          <div className="h-4 w-full rounded bg-gray-200"></div>
          <div className="h-4 w-full rounded bg-gray-200"></div>
          <div className="h-4 w-full rounded bg-gray-200"></div>
          <div className="h-4 w-full rounded bg-gray-200"></div>
          <div className="h-4 w-full rounded bg-gray-200"></div>
        </div>
      </div>
      <div className="divide-y divide-gray-200 bg-white">
        {[1, 2, 3].map((i) => (
          <div key={i} className="grid grid-cols-7 gap-4 px-4 py-4">
            <div className="space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-4 w-2/3 rounded bg-gray-200"></div>
            </div>
            <div className="h-4 w-full rounded bg-gray-200"></div>
            <div className="h-4 w-full rounded bg-gray-200"></div>
            <div className="h-4 w-full rounded bg-gray-200"></div>
            <div className="h-4 w-16 rounded bg-gray-200"></div>
            <div className="h-4 w-full rounded bg-gray-200"></div>
            <div className="flex justify-end space-x-3">
              <div className="h-4 w-12 rounded bg-gray-200"></div>
              <div className="h-4 w-12 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const router = useRouter();
  const { status } = useSession();
  const [forms, setForms] = useState<SavedForm[]>([]);
  const [pendingForms, setPendingForms] = useState<SavedForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  const currentDateTime = format(new Date(), "dd MMMM / hh:mm a").toUpperCase();

  useEffect(() => {
    const fetchForms = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/form/list");
          if (response.ok) {
            const data = await response.json();
            console.log("Fetched forms data:", data);

            // Filter forms based on status
            const pending = data.filter(
              (form: SavedForm) =>
                form.data &&
                typeof form.data === "object" &&
                form.data.status === "PENDING",
            );

            const nonPending = data.filter(
              (form: SavedForm) =>
                !(
                  form.data &&
                  typeof form.data === "object" &&
                  form.data.status === "PENDING"
                ),
            );

            setPendingForms(pending);
            setForms(nonPending);
          } else {
            console.error("Failed to fetch forms:", response.statusText);
          }
        } catch (error) {
          console.error("Error fetching forms:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (status === "unauthenticated") {
        router.push("/login");
      }
    };

    fetchForms();
  }, [status, router]);

  const createNewForm = async () => {
    try {
      // Create a new unique form ID
      const newFormId = uuidv4();

      // Create a new form in the database
      const response = await fetch("/api/form/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: newFormId,
          data: { status: "DRAFT" },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create a new form");
      }

      // Clear any previously stored form ID
      localStorage.removeItem("currentFormId");

      // Navigate to the offer form with the new ID
      router.push(`/offerform?id=${newFormId}`);
    } catch (error) {
      console.error("Error creating form:", error);
      toast.error("Failed to create a new form. Please try again.");
    }
  };

  const initiateDeleteForm = (formId: string) => {
    setFormToDelete(formId);
    setShowConfirmDialog(true);
  };

  const confirmDeleteForm = async () => {
    if (formToDelete) {
      try {
        const response = await fetch(`/api/form/delete?id=${formToDelete}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setForms((prevForms) =>
            prevForms.filter((form) => form.id !== formToDelete),
          );
        } else {
          console.error("Failed to delete form:", await response.text());
        }
      } catch (error) {
        console.error("Error deleting form:", error);
      }
    }
    setShowConfirmDialog(false);
    setFormToDelete(null);
  };

  const cancelDeleteForm = () => {
    setShowConfirmDialog(false);
    setFormToDelete(null);
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Please log in to view your dashboard.</div>;
  }

  return (
    <div className="min-h-screen rounded-lg bg-gray-100">
      <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">{currentDateTime}</span>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">My Offers</h2>
            <button
              onClick={createNewForm}
              className="flex items-center rounded-full bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700"
            >
              Create New Offer <span className="ml-2">+</span>
            </button>
          </div>

          {isLoading ? (
            <>
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">
                  Pending Offers
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              </div>

              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                Draft Offers
              </h2>
              <SkeletonTable />
            </>
          ) : (
            <>
              {pendingForms.length > 0 && (
                <div className="mb-8">
                  <h2 className="mb-4 text-xl font-semibold text-gray-800">
                    Pending Offers ({pendingForms.length})
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pendingForms.map((form) => (
                      <div
                        key={form.id}
                        className="rounded-lg bg-indigo-50 p-4 shadow transition-all hover:shadow-md"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-sm font-medium text-orange-800">
                              Pending
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {form.data["emailedAt"]
                              ? format(
                                  new Date(form.data["emailedAt"]),
                                  "dd MMM yyyy",
                                )
                              : "(incomplete)"}
                          </span>
                        </div>

                        <div className="mb-4 space-y-2">
                          <p className="text-sm font-medium text-gray-900">
                            {form.data &&
                            typeof form.data === "object" &&
                            form.data["property-address"]
                              ? form.data["property-address"]
                                  .split(",")
                                  .slice(0, 1)
                                  .join(",")
                              : "(incomplete)"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {form.data &&
                            typeof form.data === "object" &&
                            form.data["property-address"]
                              ? form.data["property-address"]
                                  .split(",")
                                  .slice(1)
                                  .join(",")
                                  .trim()
                              : ""}
                          </p>
                        </div>

                        <div className="mb-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Purchase Price:
                            </span>
                            <span className="text-sm text-gray-900">
                              {form.data["purchasePrice"]
                                ? `$${Number(
                                    form.data["purchasePrice"],
                                  ).toLocaleString()}`
                                : "(incomplete)"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Seller:
                            </span>
                            <span className="text-sm text-gray-900">
                              {form.data["name-seller-0"] || "(incomplete)"}
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <div className="mb-4">
                            <span className="text-sm text-gray-500">
                              {form.data["emailedTo"]
                                ? `Sent to: ${form.data["emailedTo"]}`
                                : "(incomplete)"}
                            </span>
                          </div>
                          <div className="flex items-center justify-end space-x-3">
                            <button
                              onClick={() =>
                                router.push(`/offerform?id=${form.id}`)
                              }
                              className="rounded-md bg-white px-2.5 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                            >
                              View
                            </button>
                            <button
                              onClick={() => initiateDeleteForm(form.id)}
                              className="rounded-md bg-white px-2.5 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                Draft Offers ({forms.length})
              </h2>
              {forms.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-[20%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Property Address
                        </th>
                        <th className="w-[15%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Purchase Price
                        </th>
                        <th className="w-[15%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Buyer Name
                        </th>
                        <th className="w-[15%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Seller Name
                        </th>
                        <th className="w-[10%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Status
                        </th>
                        <th className="w-[15%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Updated Date
                        </th>
                        <th className="w-[10%] px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {forms.map((form) => (
                        <tr key={form.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {form.data &&
                              typeof form.data === "object" &&
                              form.data["property-address"] ? (
                                <>
                                  {/* First line: Street address */}
                                  <div>
                                    {form.data["property-address"]
                                      .split(",")
                                      .slice(0, 2)
                                      .join(",")}
                                  </div>
                                  {/* Second line: State, ZIP, Country */}
                                  <div className="mt-1 text-sm text-gray-900">
                                    {form.data["property-address"]
                                      .split(",")
                                      .slice(2)
                                      .join(",")}
                                  </div>
                                </>
                              ) : (
                                "(incomplete)"
                              )}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4">
                            <div className="text-sm text-gray-500">
                              {form.data["purchasePrice"]
                                ? `$${Number(
                                    form.data["purchasePrice"],
                                  ).toLocaleString()}`
                                : "(incomplete)"}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4">
                            <div className="text-sm text-gray-500">
                              {form.data["name-buyer-0"] || "(incomplete)"}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4">
                            <div className="text-sm text-gray-500">
                              {form.data["name-seller-0"] || "(incomplete)"}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-500">
                              {form.data["paymentStatus"] === "PAID" ? (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                  Purchased
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                  Draft
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4">
                            <div className="text-sm text-gray-500">
                              {form.updatedAt
                                ? format(
                                    new Date(form.updatedAt),
                                    "dd MMM yyyy",
                                  )
                                : "(incomplete)"}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() =>
                                  router.push(`/offerform?id=${form.id}`)
                                }
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => initiateDeleteForm(form.id)}
                                className="text-sm font-medium text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No offers found. Create a new offer to get started!</p>
              )}
            </>
          )}
        </div>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600 bg-opacity-50">
          <div className="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Confirm Deletion
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this form? This action cannot be
                undone.
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={cancelDeleteForm}
                className="mr-2 rounded bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteForm}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
