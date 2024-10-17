"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CalendarIcon } from "lucide-react";
import { FormData } from "../../components/types";
import { format } from "date-fns";

interface SavedForm {
  id: string;
  data: FormData;
  createdAt: string;
  updatedAt: string;
}

const Dashboard = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [savedForms, setSavedForms] = useState<SavedForm[]>([]);
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
            setSavedForms(data);
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

  const createNewForm = () => {
    localStorage.removeItem("currentFormId");
    router.push("/offerform");
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
          setSavedForms((prevForms) =>
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
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Offers</h1>
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">{currentDateTime}</span>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Pending Offers (10)
            </h2>
            <button
              onClick={createNewForm}
              className="flex items-center rounded-full bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700"
            >
              Create New Offer <span className="ml-2">+</span>
            </button>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[25, 27, 28, 2].map((day, index) => (
              <div key={index} className="rounded-lg bg-gray-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-2xl font-bold">{day}</span>
                  <span className="text-sm text-gray-500">
                    {index === 3 ? "October" : "September"}
                  </span>
                </div>
                <p className="mb-2 text-sm text-gray-600">
                  Lorem ipsum dolor sit amet
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">232K</span>
                  <div
                    className={`flex h-6 w-12 items-center rounded-full bg-gray-300 p-1 duration-300 ease-in-out ${
                      index % 2 === 0 ? "bg-green-400" : ""
                    }`}
                  >
                    <div
                      className={`h-4 w-4 transform rounded-full bg-white shadow-md duration-300 ease-in-out ${
                        index % 2 === 0 ? "translate-x-6" : ""
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Current Offers ({savedForms.length})
          </h2>
          {isLoading ? (
            <p>Loading offers...</p>
          ) : savedForms.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Property Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Purchase Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Seller&apos;s Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Updated Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {savedForms.map((form) => (
                    <tr key={form.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {form.data["property-address"] || "N/A"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {form.data["property-location"] || "N/A"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {form.data["purchasePrice"]
                            ? `$${Number(
                                form.data["purchasePrice"],
                              ).toLocaleString()}`
                            : "N/A"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {form.data["email"] || "N/A"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {form.updatedAt
                            ? format(new Date(form.updatedAt), "dd MMM yyyy")
                            : "N/A"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            router.push(`/offerform?id=${form.id}`)
                          }
                          className="mr-4 text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => initiateDeleteForm(form.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No offers found. Create a new offer to get started!</p>
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
