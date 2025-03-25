import {
  useState,
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
} from "react";
import { signIn } from "next-auth/react";
import Modal from "@/components/shared/modal";
import { LoadingDots, Google } from "@/components/shared/icons";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SignInModalProps {
  showSignInModal: boolean;
  setShowSignInModal: Dispatch<SetStateAction<boolean>>;
}

const SignInModal = ({
  showSignInModal,
  setShowSignInModal,
}: SignInModalProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuthSignIn = (provider: string) => {
    setIsLoading(true);
    signIn(provider);
  };

  const navigateToAuthPage = () => {
    setShowSignInModal(false);
    router.push("/auth/signin");
  };

  return (
    <Modal showModal={showSignInModal} setShowModal={setShowSignInModal}>
      <div className="w-full overflow-hidden shadow-xl md:max-w-md md:rounded-2xl md:border md:border-gray-200">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center md:px-16">
          <a href="https://www.breezly.co">
            <Image
              src="/applogo.webp"
              alt="Breezly"
              width={30}
              height={30}
              className="mr-2 rounded-sm"
            />
          </a>
          <h3 className="font-display text-2xl font-bold">Sign In</h3>
          <p className="text-sm text-gray-500">
            Choose your preferred sign in method
          </p>
        </div>

        <div className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 md:px-16">
          <button
            type="button"
            onClick={() => handleOAuthSignIn("google")}
            disabled={isLoading}
            className="flex h-10 w-full items-center justify-center space-x-3 rounded-md border border-gray-200 bg-white text-black transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <LoadingDots color="#808080" />
            ) : (
              <>
                <Google className="h-5 w-5" />
                <p>Sign In with Google</p>
              </>
            )}
          </button>

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
            onClick={navigateToAuthPage}
            className="flex h-10 w-full items-center justify-center space-x-3 rounded-md bg-emerald-500 text-white transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <p>Continue with Email</p>
          </button>
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
