"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from "next-auth/react";

interface FormData {
  id: string;
  data: Record<string, any>;
  updatedAt: string;
}

const Dashboard = () => {
  const router = useRouter();
  const { status } = useSession();
  const [savedForms, setSavedForms] = useState<FormData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);

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
        console.log('Sending delete request for form:', formToDelete);
        const response = await fetch(`/api/form/delete?id=${formToDelete}`, {
          method: 'DELETE',
        });
        console.log('Response received:', response);
        console.log('Response status:', response.status);
        
        const responseData = await response.json();
        console.log('Response data:', responseData);
        
        if (response.ok) {
          console.log('Form deleted successfully:', formToDelete);
          setSavedForms(prevForms => prevForms.filter(form => form.id !== formToDelete));
        } else {
          console.error('Failed to delete form:', responseData.message);
        }
      } catch (error) {
        console.error('Error deleting form:', error);
      }
    }
    setShowConfirmDialog(false);
    setFormToDelete(null);
  };

  const cancelDeleteForm = () => {
    console.log('Form deletion cancelled by user');
    setShowConfirmDialog(false);
    setFormToDelete(null);
  };

  const formatFieldLabel = (field: string) => {
    return field
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderFormCard = (form: FormData, index: number) => {
    return (
      <div key={form.id} className={`bg-white shadow overflow-hidden sm:rounded-lg mb-8 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Form ID: {form.id}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Last updated: {new Date(form.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            {Object.entries(form.data).map(([key, value], fieldIndex) => (
              <div key={key} className={`px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ${fieldIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <dt className="text-sm font-medium text-gray-500">{formatFieldLabel(key)}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <Link
            href={`/offerform?id=${form.id}`}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
          >
            Edit
          </Link>
          <button
            onClick={() => initiateDeleteForm(form.id)}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Please log in to view your dashboard.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Forms</h1>
      <button
        onClick={createNewForm}
        className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Create New Form
      </button>
      {isLoading ? (
        <div>Loading your forms...</div>
      ) : savedForms.length > 0 ? (
        <div className="space-y-8">
          {savedForms.map(renderFormCard)}
        </div>
      ) : (
        <div>You haven&apos;t created any forms yet.</div>
      )}
      
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