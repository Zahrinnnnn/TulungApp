/**
 * Validation utilities for form inputs
 */

export const validation = {
  /**
   * Validate email format using regex
   */
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  },

  /**
   * Validate password strength
   * @param password - Password to validate
   * @param minLength - Minimum length (default: 8)
   */
  password: (password: string, minLength: number = 8): boolean => {
    return password.length >= minLength;
  },

  /**
   * Check if passwords match
   */
  passwordsMatch: (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
  },

  /**
   * Validate amount (must be positive number)
   */
  amount: (amount: number): boolean => {
    return !isNaN(amount) && amount > 0;
  },

  /**
   * Validate required field (not empty)
   */
  required: (value: string): boolean => {
    return value.trim().length > 0;
  },

  /**
   * Validate phone number (basic)
   */
  phone: (phone: string): boolean => {
    const phoneRegex = /^[+]?[\d\s-()]+$/;
    return phoneRegex.test(phone.trim()) && phone.replace(/\D/g, '').length >= 10;
  },

  /**
   * Sanitize string input (remove potential XSS)
   */
  sanitize: (input: string): string => {
    return input.trim().replace(/<[^>]*>/g, '');
  },
};

/**
 * Validation error messages
 */
export const validationMessages = {
  email: {
    invalid: 'Please enter a valid email address',
    required: 'Email is required',
  },
  password: {
    tooShort: (min: number) => `Password must be at least ${min} characters`,
    required: 'Password is required',
    mismatch: 'Passwords do not match',
  },
  amount: {
    invalid: 'Please enter a valid amount',
    required: 'Amount is required',
    mustBePositive: 'Amount must be greater than 0',
  },
  required: (field: string) => `${field} is required`,
};
