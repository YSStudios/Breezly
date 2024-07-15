"use client";
// Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface SavedForm {
  id: string;
  address: string;
  updatedAt: string;
  price: number;
  status: string;
}

const Dashboard = () => {
  const { data: session } = useSession();
  const [savedForms, setSavedForms] = useState<SavedForm[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      if (session) {
        const address = session.user.address || "default-address"; // Ensure a valid address is used
        try {
          console.log('Fetching data for address:', address);
          const response = await fetch(`/api/form/get?address=${encodeURIComponent(address)}`);
          if (response.ok) {
            const data = await response.json();
            setSavedForms(data);
          } else {
            console.error('Failed to fetch form data:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching form data:', error);
        }
      }
    };

    fetchData();
  }, [session]);

  if (!session) {
    return <div>Please log in to view your dashboard.</div>;
  }

  return (
    <div>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
              {/* Your content */}
              <div className="px-4 py-6 sm:px-0">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Address
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Price
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                        >
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {savedForms.map((form) => (
                        <tr key={form.id}>
                          <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {form.address}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">{form.price}</td>
                          <td className="px-3 py-4 text-sm text-gray-500">{form.status}</td>
                          <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <Link href={`/form/${form.id}`} className="text-indigo-600 hover:text-indigo-900">
                              Edit<span className="sr-only">, {form.address}</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* End content */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
