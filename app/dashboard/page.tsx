// "use client"
// import React, { useState, useEffect } from 'react';
// import 'tailwindcss/tailwind.css';

// // Define interfaces for the data
// interface Account {
// 	id: string;
// 	type: string;
// 	provider: string;
// }

// interface Session {
// 	id: string;
// 	expires: Date;
// }

// interface Offer {
// 	id: string;
// 	address: string;
// 	price: number;
// 	status: string;
// }

// interface User {
// 	id: string;
// 	name: string | null;
// 	email: string | null;
// 	password: string | null;
// 	address: string | null;
// 	accounts: Account[];
// 	sessions: Session[];
// 	pendingOffers: Offer[];
// 	pastOffers: Offer[];
// }

// const Dashboard = () => {
// 	// Mock data for demonstration
// 	const mockUsers: User[] = [
// 		{
// 			id: '1',
// 			name: 'John Doe',
// 			email: 'john.doe@example.com',
// 			password: '********',
// 			address: '123 Main St, Anytown, USA',
// 			accounts: [],
// 			sessions: [],
// 			pendingOffers: [
// 				{ id: '1', address: '456 Elm St', price: 250000, status: 'Pending' },
// 				{ id: '2', address: '789 Oak St', price: 300000, status: 'Pending' },
// 			],
// 			pastOffers: [
// 				{ id: '3', address: '101 Pine St', price: 200000, status: 'Accepted' },
// 				{ id: '4', address: '202 Maple St', price: 150000, status: 'Rejected' },
// 			],
// 		},
// 	];

// 	const [users, setUsers] = useState<User[]>(mockUsers);
// 	const [error, setError] = useState<string | null>(null);
// 	const [loading, setLoading] = useState<boolean>(false);

// 	return (
// 		<div className="min-h-screen bg-gray-100 p-6">
// 			<h1 className="text-2xl font-bold mb-6">User Dashboard</h1>

// 			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
// 				<div className="bg-white shadow-md rounded-lg p-4">
// 					<div className="text-gray-500">Active Offers</div>
// 					<div className="text-2xl font-bold">18</div>
// 					<div className="text-gray-500">2 Completed</div>
// 				</div>
// 				<div className="bg-white shadow-md rounded-lg p-4">
// 					<div className="text-gray-500">Pending Offers</div>
// 					<div className="text-2xl font-bold">132</div>
// 					<div className="text-gray-500">28 Completed</div>
// 				</div>
// 				<div className="bg-white shadow-md rounded-lg p-4">
// 					<div className="text-gray-500">Completed Offers</div>
// 					<div className="text-2xl font-bold">12</div>
// 					<div className="text-gray-500">1 Completed</div>
// 				</div>
// 				<div className="bg-white shadow-md rounded-lg p-4">
// 					<div className="text-gray-500">Productivity</div>
// 					<div className="text-2xl font-bold">76%</div>
// 					<div className="text-gray-500">5% Completed</div>
// 				</div>
// 			</div>

// 			{error ? (
// 				<div className="text-red-500">Error: {error}</div>
// 			) : loading ? (
// 				<div className="text-blue-500">Loading...</div>
// 			) : (
// 				<div>
// 					<div className="bg-white shadow-md rounded-lg p-4 mb-6">
// 						<h2 className="text-xl font-bold mb-4">User Information</h2>
// 						<div className="mb-2"><strong>Name:</strong> {users[0].name}</div>
// 						<div className="mb-2"><strong>Email:</strong> {users[0].email}</div>
// 						<div className="mb-2"><strong>Password:</strong> {users[0].password}</div>
// 						<div className="mb-2"><strong>Address:</strong> {users[0].address}</div>
// 					</div>

// 					{users.map(user => (
// 						<div key={user.id} className="bg-white shadow-md rounded-lg p-6 mb-6">
// 							<h2 className="text-xl font-bold mb-4">{user.name}&apos;s Offers</h2>

// 							<div className="mb-6">
// 								<h3 className="text-lg font-semibold mb-2">Pending Offers</h3>
// 								<div className="overflow-x-auto">
// 									<table className="min-w-full divide-y divide-gray-200">
// 										<thead>
// 											<tr>
// 												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
// 												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
// 												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
// 											</tr>
// 										</thead>
// 										<tbody className="bg-white divide-y divide-gray-200">
// 											{user.pendingOffers.length > 0 ? (
// 												user.pendingOffers.map(offer => (
// 													<tr key={offer.id}>
// 														<td className="px-6 py-4 whitespace-nowrap">{offer.address}</td>
// 														<td className="px-6 py-4 whitespace-nowrap">{`$${offer.price.toLocaleString()}`}</td>
// 														<td className="px-6 py-4 whitespace-nowrap text-yellow-500">{offer.status}</td>
// 													</tr>
// 												))
// 											) : (
// 												<tr>
// 													<td className="px-6 py-4 whitespace-nowrap text-center" colSpan={3}>No pending offers</td>
// 												</tr>
// 											)}
// 										</tbody>
// 									</table>
// 								</div>
// 							</div>

// 							<div>
// 								<h3 className="text-lg font-semibold mb-2">Past Offers</h3>
// 								<div className="overflow-x-auto">
// 									<table className="min-w-full divide-y divide-gray-200">
// 										<thead>
// 											<tr>
// 												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
// 												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
// 												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
// 											</tr>
// 										</thead>
// 										<tbody className="bg-white divide-y divide-gray-200">
// 											{user.pastOffers.length > 0 ? (
// 												user.pastOffers.map(offer => (
// 													<tr key={offer.id}>
// 														<td className="px-6 py-4 whitespace-nowrap">{offer.address}</td>
// 														<td className="px-6 py-4 whitespace-nowrap">{`$${offer.price.toLocaleString()}`}</td>
// 														<td className={`px-6 py-4 whitespace-nowrap ${offer.status === 'Accepted' ? 'text-green-500' : 'text-red-500'}`}>{offer.status}</td>
// 													</tr>
// 												))
// 											) : (
// 												<tr>
// 													<td className="px-6 py-4 whitespace-nowrap text-center" colSpan={3}>No past offers</td>
// 												</tr>
// 											)}
// 										</tbody>
// 									</table>
// 								</div>
// 							</div>
// 						</div>
// 					))}
// 				</div>
// 			)}
// 		</div>
// 	);
// };

// export default Dashboard;