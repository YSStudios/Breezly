"use client"

import React, { useState } from 'react';

const PricingPage = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: 'FREE',
      price: 0,
      features: [
        '1 user',
        '2 Active Projects',
      ],
      buttonText: 'TRY IT',
    },
    {
      name: 'PRO',
      price: 10,
      features: [
        '1 user',
        'Unlimited Projects',
        'Download Prototypes',
        'Remove Boxx Branding',
        'Password Protection',
      ],
      buttonText: 'BUY IT',
    },
    {
      name: 'TEAM',
      price: 30,
      features: [
        'Unlimited users',
        'Unlimited Projects',
        'Download Prototypes',
        'User roles and groups',
        'Password Protection',
      ],
      buttonText: 'BUY IT',
    },
  ];

  return (
      <div className="bg-indigo-700 rounded-lg shadow-xl p-8 max-w-4xl w-full">
        <h2 className="text-2xl font-bold text-center text-white mb-2">
          FIND THE PERFECT PLAN FOR YOUR BUSINESS
        </h2>
        <p className="text-center text-indigo-200 mb-8">
          Select the perfect plan for your needs.
        </p>

        <div className="flex items-center justify-center mb-8">
          <span className={`text-white mr-3 ${!isYearly ? 'font-bold' : ''}`}>MONTHLY BILLING</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isYearly}
              onChange={() => setIsYearly(!isYearly)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
          <span className={`text-white ml-3 ${isYearly ? 'font-bold' : ''}`}>YEARLY BILLING</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className="bg-white rounded-lg p-6 flex flex-col">
              <h3 className="text-indigo-600 font-bold text-xl mb-4">{plan.name}</h3>
              <div className="text-4xl font-bold mb-4">
                <span className="text-gray-900">${isYearly ? plan.price * 10 : plan.price}</span>
                <span className="text-gray-500 text-base font-normal">/ {isYearly ? "year" : "month"}</span>
              </div>
              <ul className="mb-8 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center mb-2">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded">
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
  );
};

export default PricingPage;