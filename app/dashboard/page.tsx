"use client"
import React, { useState, useEffect } from 'react';
// Define interfaces for the data
interface Account {
  id: string;
  type: string;
  provider: string;
}

interface Session {
  id: string;
  expires: Date;
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  accounts: Account[];
  sessions: Session[];
}

const Dashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/users')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        return response.json();
      })
      .then(data => setUsers(data))
      .catch(error => setError(error.message));
  }, []);

if (error) return <div className="text-red-500">Error: {error}</div>;
if (!users.length) return <div className="text-blue-500">Loading...</div>;

  return (
    <div>
      
    </div>
  );
};

export default Dashboard;
