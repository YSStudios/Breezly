"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { CalendarIcon } from 'lucide-react';
import { FormData } from '../../components/types';
import { format } from 'date-fns';

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
          const response = await fetch('/api/form/list');
          if (response.ok) {
            const data = await response.json();
            setSavedForms(data);
          } else {
            console.error('Failed to fetch forms:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching forms:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (status === "unauthenticated") {
        router.push('/login');
      }
    };

    fetchForms();
  }, [status, router]);

  const createNewForm = () => {
    localStorage.removeItem('currentFormId');
    router.push('/offerform');
  };

  const initiateDeleteForm = (formId: string) => {
    setFormToDelete(formId);
    setShowConfirmDialog(true);
  };

  const confirmDeleteForm = async () => {
    if (formToDelete) {
      try {
        const response = await fetch(`/api/form/delete?id=${formToDelete}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setSavedForms(prevForms => prevForms.filter(form => form.id !== formToDelete));
        } else {
          console.error('Failed to delete form:', await response.text());
        }
      } catch (error) {
        console.error('Error deleting form:', error);
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
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Offers</h1>
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-500">{currentDateTime}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Pending Offers (10)</h2>
            <button
              onClick={createNewForm}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full flex items-center"
            >
              Create New Offer <span className="ml-2">+</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[25, 27, 28, 2].map((day, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl font-bold">{day}</span>
                  <span className="text-sm text-gray-500">{index === 3 ? 'October' : 'September'}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Lorem ipsum dolor sit amet</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">232K</span>
                  <div className={`w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 duration-300 ease-in-out ${index % 2 === 0 ? 'bg-green-400' : ''}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${index % 2 === 0 ? 'translate-x-6' : ''}`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>


          <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Offers ({savedForms.length})</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller&apos;s Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {savedForms.map((form) => (
              <tr key={form.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{form.data['property-address'] || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{form.data['property-location'] || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {form.data['purchasePrice'] 
                      ? `$${Number(form.data['purchasePrice']).toLocaleString()}` 
                      : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{form.data['email'] || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">
                {form.updatedAt 
                  ? format(new Date(form.updatedAt), "dd MMM yyyy")
                  : 'N/A'}
                </div>
              </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => router.push(`/offerform?id=${form.id}`)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button onClick={() => initiateDeleteForm(form.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </div>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Confirm Deletion</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">Are you sure you want to delete this form? This action cannot be undone.</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={cancelDeleteForm}
                className="mr-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteForm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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