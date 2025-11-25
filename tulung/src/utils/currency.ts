/**
 * Currency formatting utilities
 */

export const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  MYR: 'RM',
  SGD: 'S$',
  PHP: '₱',
  THB: '฿',
  IDR: 'Rp',
  INR: '₹',
  BRL: 'R$',
  MXN: '$',
};

export const currencyUtils = {
  /**
   * Format amount with currency symbol
   */
  format: (amount: number, currency: string = 'USD'): string => {
    const symbol = currencySymbols[currency] || currency;
    const formatted = amount.toFixed(2);

    // For currencies where symbol goes after
    if (currency === 'EUR') {
      return `${formatted}${symbol}`;
    }

    return `${symbol}${formatted}`;
  },

  /**
   * Format amount without currency symbol
   */
  formatAmount: (amount: number): string => {
    return amount.toFixed(2);
  },

  /**
   * Parse string amount to number
   */
  parse: (value: string): number => {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    return parseFloat(cleaned) || 0;
  },

  /**
   * Get currency symbol
   */
  getSymbol: (currency: string): string => {
    return currencySymbols[currency] || currency;
  },

  /**
   * Format with comma separators for thousands
   */
  formatWithCommas: (amount: number, currency: string = 'USD'): string => {
    const symbol = currencySymbols[currency] || currency;
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (currency === 'EUR') {
      return `${formatted}${symbol}`;
    }

    return `${symbol}${formatted}`;
  },
};

/**
 * Available currencies
 */
export const availableCurrencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
];
