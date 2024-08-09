"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from "next-auth/react";

interface FormData {
	id: string;
	data: {
	  address?: string;
	  price?: string | number;
	  status?: string;
	};
	updatedAt: string;
  }

const Dashboard = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [savedForms, setSavedForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {savedForms.map((form) => (
                <tr key={form.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{form.data.address || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{form.data.price || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{form.data.status || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/offerform?id=${form.id}`} className="text-indigo-600 hover:text-indigo-900">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>You haven't created any forms yet.</div>
      )}
    </div>
  );
};

export default Dashboard;