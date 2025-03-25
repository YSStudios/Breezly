"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage({ text: 'Invalid reset link', type: 'error' });
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    
    if (password.length < 8) {
      setMessage({ text: 'Password must be at least 8 characters long', type: 'error' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      console.log('Submitting password reset with token', token?.substring(0, 10) + '...');
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await response.json();
      console.log('Password reset response:', response.status, data.message);
      
      if (response.ok) {
        setMessage({ text: 'Password reset successful. You can now sign in with your new password.', type: 'success' });
        // Redirect to home page after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setMessage({ text: data.message || 'Failed to reset password', type: 'error' });
      }
    } catch (error) {
      console.error('Error during password reset:', error);
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full overflow-hidden shadow-xl md:max-w-md md:rounded-2xl md:border md:border-gray-200">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center md:px-16">
          {/* <Link href="/">
            <Image
              src="/breezlylogo-green.svg"
              alt="Breezly"
              width={150}
              height={1}
              className="mr-2 rounded-sm"
            />
          </Link> */}
          <h3 className="font-display text-2xl font-bold">
            Reset Your Password
          </h3>
          <p className="text-sm text-gray-500">
            Create a new password for your Breezly account
          </p>
        </div>
        
        <div className="flex flex-col space-y-4 bg-white px-4 py-8 md:px-16">
          {message && (
            <div className={`rounded-md p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <p className="text-sm">{message.text}</p>
            </div>
          )}
          
          {!token ? (
            <div className="text-center">
              <p className="text-gray-500 mt-2">The reset link is invalid or has expired.</p>
              <Link href="/" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500">
                Return to Home Page
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              <button
                type="submit"
                disabled={!!(isLoading || (confirmPassword && password !== confirmPassword))}
                className={`${
                  isLoading || (confirmPassword && password !== confirmPassword)
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-blue-500 hover:bg-blue-600"
                } w-full rounded-md px-3 py-2 text-white focus:outline-none`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
              
              <div className="text-center">
                <Link href="/" className="text-sm text-blue-500 hover:underline">
                  Back to Home
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 