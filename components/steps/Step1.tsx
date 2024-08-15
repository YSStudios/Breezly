import React, { useEffect } from 'react';
import { StepProps } from '../types';

const Step1: React.FC<StepProps> = ({ currentSubstep, onInputChange, formData }) => {
	useEffect(() => {
		console.log('Step1 rendered with formData:', formData);
	}, [formData]);

	return (
		<div className="mx-auto grid grid-cols-2 gap-x-8 gap-y-10">
			<h1 className="col-span-2 sm:col-span-2 text-3xl font-bold text-gray-900">Offer to Purchase Real Estate</h1>
			{currentSubstep === 1 && (
				<>
					<div className="col-span-2 sm:col-span-2">
						<label htmlFor="first-name" className="block text-xl font-medium leading-6 text-gray-900">First name</label>
						<div className="mt-2">
						<input
							type="text"
							name="first-name"
							id="first-name"
							// placeholder="John"
							value={formData['first-name'] || ''}
							onChange={(e) => {
								console.log('First name changed:', e.target.value);
								onInputChange('first-name', e.target.value);
							}}
							className="block w-full rounded-md border-0 py-3 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:outline-none focus:ring-inset focus:ring-indigo-600 text-xl leading-8"
						/>
						</div>
					</div>
					<div className="col-span-2 sm:col-span-2">
						<label htmlFor="last-name" className="block text-xl font-medium leading-6 text-gray-900">Last name</label>
						<div className="mt-2">
							<input
								type="text"
								name="last-name"
								id="last-name"
								placeholder="Doe"
								value={formData['last-name'] || ''}
								onChange={(e) => {
									console.log('Last name changed:', e.target.value);
									onInputChange('last-name', e.target.value);
								}}
								className="block w-full rounded-md border-0 py-3 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:outline-none focus:ring-inset focus:ring-indigo-600 text-xl leading-8"
							/>
						</div>
					</div>
					<div className="col-span-2 sm:col-span-2">
						<label htmlFor="email" className="block text-xl font-medium leading-6 text-gray-900">E-mail address</label>
						<div className="mt-2">
							<input
								type="text"
								name="email"
								id="email"
								placeholder="john@youremail.com"
								value={formData['email'] || ''}
								onChange={(e) => {
									console.log('Email changed:', e.target.value);
									onInputChange('email', e.target.value);
								}}
								className="block w-full rounded-md border-0 py-3 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:outline-none focus:ring-inset focus:ring-indigo-600 text-xl leading-8"
							/>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default Step1;
