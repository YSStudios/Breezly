import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ms from "ms";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const timeAgo = (timestamp: Date, timeOnly?: boolean): string => {
  if (!timestamp) return "never";
  return `${ms(Date.now() - new Date(timestamp).getTime())}${
    timeOnly ? "" : " ago"
  }`;
};

export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<JSON> {
  const res = await fetch(input, init);

  if (!res.ok) {
    const json = await res.json();
    if (json.error) {
      const error = new Error(json.error) as Error & {
        status: number;
      };
      error.status = res.status;
      throw error;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }

  return res.json();
}

export function nFormatter(num: number, digits?: number) {
  if (!num) return "0";
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item
    ? (num / item.value).toFixed(digits || 1).replace(rx, "$1") + item.symbol
    : "0";
}

export function capitalize(str: string) {
  if (!str || typeof str !== "string") return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const truncate = (str: string, length: number) => {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length)}...`;
};

/**
 * Generates an avatar URL for a user based on their email, name or identifier
 * Uses DiceBear API to create consistent, unique avatars
 */
export function getAvatarUrl(
  identifier: string, 
  userImage?: string | null,
  style: 'initials' | 'pixel-art' | 'lorelei' | 'avataaars' | 'bottts' = 'initials',
  options: Record<string, string> = {}
): string {
  // If user has a custom image, use that
  if (userImage) return userImage;
  
  // Default options for different styles
  const defaultOptions: Record<string, Record<string, string>> = {
    initials: {
      backgroundColor: '4f46e5,7c3aed,1d4ed8,0891b2,0d9488',
      bold: 'true',
      fontSize: '42',
      chars: '1'
    },
    'pixel-art': {
      mood: 'happy,surprised',
    },
    lorelei: {
      backgroundColor: '4f46e5,7c3aed,1d4ed8',
    },
    avataaars: {
      backgroundColor: '4f46e5,7c3aed,1d4ed8,0891b2,0d9488',
    },
    bottts: {
      backgroundColor: 'b6e3f4,c0aede,d1d4f9',
    }
  };
  
  // Combine default options with user-provided options
  const mergedOptions = { ...defaultOptions[style], ...options };
  
  // Convert options to URL parameters
  const optionsString = Object.entries(mergedOptions)
    .map(([key, value]) => `&${key}=${encodeURIComponent(value)}`)
    .join('');
  
  // Generate and return the avatar URL
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(identifier)}${optionsString}`;
}

/**
 * Creates a solid color avatar with user initials
 * @param name Full name or email to extract initials from
 * @param userImage Optional existing user image
 * @returns URL to the avatar
 */
export function getInitialsAvatar(
  name: string,
  userImage?: string | null,
): string {
  // If user has a custom image, use that
  if (userImage) return userImage;
  
  // Extract actual initials from the name
  let initials = '';
  if (name.includes('@')) {
    // For email addresses, just use the first letter before @ sign
    initials = name.split('@')[0].charAt(0).toUpperCase();
  } else {
    // For full names, get first letter of each word (max 2)
    initials = name
      .split(' ')
      .filter(part => part.length > 0)
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
    
    // If we couldn't extract initials or only got one letter, use first letter
    if (initials.length === 0) {
      initials = name.charAt(0).toUpperCase();
    }
  }
  
  // Generate a consistent color based on the name/email
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = ['4f46e5', '7c3aed', '1d4ed8', '0891b2', '0d9488', '0284c7', '059669'];
  const backgroundColor = colors[hash % colors.length];
  
  // Create an inline SVG data URL - this does not require an external domain
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#${backgroundColor}" />
      <text 
        x="50" 
        y="50" 
        font-family="Arial, sans-serif" 
        font-size="40" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle" 
        dominant-baseline="central">
        ${initials}
      </text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
