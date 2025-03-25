import { useState, Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { signIn } from "next-auth/react";
import Modal from "@/components/shared/modal";
import { LoadingDots, Google } from "@/components/shared/icons";
import Image from "next/image";

interface SignInModalProps {
  showSignInModal: boolean;
  setShowSignInModal: Dispatch<SetStateAction<boolean>>;
}

const SignInModal = ({ showSignInModal, setShowSignInModal }: SignInModalProps) => {
  const [signInClicked, setSignInClicked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (isForgotPassword) {
      // Handle password reset request
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        
        const data = await res.json();
        
        if (res.ok) {
          setResetEmailSent(true);
        } else {
          console.error("Password reset failed:", data.message);
          setError(data.message || "Failed to send reset email");
        }
      } catch (error) {
        console.error("Password reset error:", error);
        setError("An error occurred. Please try again.");
      }
    } else if (isRegistering) {
      // Handle registration
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        
        const data = await res.json();
        
        if (res.ok) {
          // Auto sign in after successful registration
          const result = await signIn("credentials", {
            redirect: false,
            email,
            password,
          });
          
          if (result?.error) {
            console.error("Sign in after registration failed:", result.error);
            setError(result.error);
          } else {
            setShowSignInModal(false);
          }
        } else {
          console.error("Registration failed:", data.message);
          setError(data.message || "Registration failed");
        }
      } catch (error) {
        console.error("Registration error:", error);
        setError("An error occurred during registration");
      }
    } else {
      // Handle sign in
      try {
        if (!email || !password) {
          setError("Email and password are required");
          setIsLoading(false);
          return;
        }
        
        console.log(`Attempting to sign in with email: ${email.substring(0, 3)}...`);
        
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
          callbackUrl: '/'
        });

        console.log("Sign-in result:", { error: result?.error, ok: result?.ok, status: result?.status });

        if (result?.error) {
          console.error("Sign in failed:", result.error);
          // Convert technical error message to user-friendly message
          if (result.error === "CredentialsSignin") {
            setError("Invalid email or password");
          } else {
            setError(result.error);
          }
        } else {
          console.log("Sign-in successful");
          setShowSignInModal(false);
          window.location.reload(); // Force a reload to ensure auth state is updated
        }
      } catch (error) {
        console.error("Sign in error:", error);
        setError("An error occurred. Please try again.");
      }
    }

    setIsLoading(false);
  };

  // Reset form when switching between modes
  const handleModeSwitch = (mode: 'signin' | 'register' | 'forgot') => {
    setError("");
    setEmail("");
    setPassword("");
    setName("");
    
    if (mode === 'signin') {
      setIsRegistering(false);
      setIsForgotPassword(false);
    } else if (mode === 'register') {
      setIsRegistering(true);
      setIsForgotPassword(false);
    } else if (mode === 'forgot') {
      setIsForgotPassword(true);
      setIsRegistering(false);
      setResetEmailSent(false);
    }
  };

  return (
    <Modal showModal={showSignInModal} setShowModal={setShowSignInModal}>
      <div className="w-full overflow-hidden shadow-xl md:max-w-md md:rounded-2xl md:border md:border-gray-200">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center md:px-16">
          <a href="https://www.breezly.co">
            <Image
              src="/breezlylogo-green.svg"
              alt="Breezly"
              width={150}
              height={30}
              className="mr-2 rounded-sm"
            />
          </a>
          <h3 className="font-display text-2xl font-bold">
            {isForgotPassword ? "Reset Password" : (isRegistering ? "Register" : "Sign In")}
          </h3>
          <p className="text-sm text-gray-500">
            {isForgotPassword 
              ? "Enter your email to receive a password reset link" 
              : "This is strictly for demo purposes - only your email and profile picture will be stored."}
          </p>
        </div>

        <div className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 md:px-16">
          {isForgotPassword && resetEmailSent ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-50 rounded-md text-green-800">
                Check your email for a password reset link
              </div>
              <button
                type="button"
                className="text-blue-500 hover:underline"
                onClick={() => handleModeSwitch('signin')}
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              {!isForgotPassword && (
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              )}
              <button
                type="submit"
                disabled={isLoading}
                className={`${
                  isLoading
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-blue-500 hover:bg-blue-600"
                } w-full rounded-md px-3 py-2 text-white focus:outline-none`}
              >
                {isLoading ? (
                  <LoadingDots color="#fff" />
                ) : isForgotPassword ? (
                  "Send Reset Link"
                ) : isRegistering ? (
                  "Register"
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          )}
          
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          
          {!resetEmailSent && (
            <div className="flex flex-col space-y-2">
              {!isForgotPassword && (
                <p className="text-center text-sm">
                  {isRegistering ? "Already have an account? " : "Don't have an account? "}
                  <button
                    type="button"
                    className="text-blue-500 hover:underline"
                    onClick={() => handleModeSwitch(isRegistering ? 'signin' : 'register')}
                  >
                    {isRegistering ? "Sign In" : "Register"}
                  </button>
                </p>
              )}
              
              <p className="text-center text-sm">
                {isForgotPassword ? (
                  <button
                    type="button"
                    className="text-blue-500 hover:underline"
                    onClick={() => handleModeSwitch('signin')}
                  >
                    Back to Sign In
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-blue-500 hover:underline"
                    onClick={() => handleModeSwitch('forgot')}
                  >
                    Forgot your password?
                  </button>
                )}
              </p>
            </div>
          )}
          
          {!isForgotPassword && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-gray-50 px-2 text-gray-500">Or</span>
                </div>
              </div>
              <button
                type="button"
                disabled={signInClicked}
                className={`${
                  signInClicked
                    ? "cursor-not-allowed border-gray-200 bg-gray-100"
                    : "border border-gray-200 bg-white text-black hover:bg-gray-50"
                } flex h-10 w-full items-center justify-center space-x-3 rounded-md border text-sm shadow-sm transition-all duration-75 focus:outline-none`}
                onClick={() => {
                  setSignInClicked(true);
                  signIn("google");
                }}
              >
                {signInClicked ? (
                  <LoadingDots color="#808080" />
                ) : (
                  <>
                    <Google className="h-5 w-5" />
                    <p>Sign In with Google</p>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export function useSignInModal() {
  const [showSignInModal, setShowSignInModal] = useState(false);

  const SignInModalCallback = useCallback(() => {
    return (
      <SignInModal
        showSignInModal={showSignInModal}
        setShowSignInModal={setShowSignInModal}
      />
    );
  }, [showSignInModal, setShowSignInModal]);

  return useMemo(
    () => ({ setShowSignInModal, SignInModal: SignInModalCallback }),
    [setShowSignInModal, SignInModalCallback],
  );
}