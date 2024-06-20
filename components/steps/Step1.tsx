const Step1 = ({ currentSubstep }) => {
	return (
		<div className="mx-auto grid grid-cols-2 gap-x-8 gap-y-10">
			{currentSubstep === 1 && (
				<>
					<div className="col-span-2 sm:col-span-2">
						<label htmlFor="first-name" className="block text-xl font-medium leading-6 text-gray-900">First name</label>
						<div className="mt-2">
						<input
							type="text"
							name="first-name"
							id="first-name"
							placeholder="John"
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
