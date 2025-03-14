/**
 * Form storage utilities to save and load form data
 */

// Interface for form data
export interface FormData {
  [key: string]: any;
}

/**
 * Loads form data from storage (localStorage for client-side or API for server persistence)
 * @param formId The unique identifier for the form
 * @returns Promise with form data or null if not found
 */
export async function loadFormData(formId: string): Promise<FormData | null> {
  // First try to load from localStorage for quick access
  if (typeof window !== 'undefined') {
    const localData = localStorage.getItem(`form_${formId}`);
    if (localData) {
      try {
        return JSON.parse(localData);
      } catch (error) {
        console.error('Error parsing local form data:', error);
      }
    }
  }

  // If not in localStorage or we're on the server, try to fetch from API
  try {
    const response = await fetch(`/api/forms/${formId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Form not found
      }
      throw new Error(`Failed to load form: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache in localStorage for faster access next time
    if (typeof window !== 'undefined') {
      localStorage.setItem(`form_${formId}`, JSON.stringify(data));
    }
    
    return data;
  } catch (error) {
    console.error('Error loading form data:', error);
    // Fall back to an empty form if we can't load
    return {};
  }
}

/**
 * Saves form data to storage
 * @param formId The unique identifier for the form
 * @param data The form data to save
 * @returns Promise resolving to success status
 */
export async function saveFormData(formId: string, data: FormData): Promise<boolean> {
  // Save to localStorage for immediate persistence and offline support
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`form_${formId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Also save to server API for long-term persistence
  try {
    const response = await fetch(`/api/forms/${formId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save form: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving form data to server:', error);
    return false;
  }
}

/**
 * Creates a new form with initial data
 * @param initialData Optional initial data for the form
 * @returns Promise with the new form ID
 */
export async function createForm(initialData: FormData = {}): Promise<string> {
  try {
    const response = await fetch('/api/forms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(initialData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create form: ${response.statusText}`);
    }
    
    const { formId } = await response.json();
    return formId;
  } catch (error) {
    console.error('Error creating form:', error);
    throw error;
  }
}

/**
 * Deletes a form
 * @param formId The unique identifier for the form to delete
 * @returns Promise resolving to success status
 */
export async function deleteForm(formId: string): Promise<boolean> {
  // Remove from localStorage if present
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`form_${formId}`);
  }
  
  // Delete from server
  try {
    const response = await fetch(`/api/forms/${formId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete form: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting form:', error);
    return false;
  }
}

/**
 * Checks if a form exists
 * @param formId The unique identifier for the form
 * @returns Promise resolving to boolean indicating existence
 */
export async function formExists(formId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/forms/${formId}/exists`);
    if (!response.ok) {
      return false;
    }
    
    const { exists } = await response.json();
    return exists;
  } catch (error) {
    console.error('Error checking if form exists:', error);
    return false;
  }
} 