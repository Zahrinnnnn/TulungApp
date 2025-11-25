/**
 * Shared category constants
 * These match the categories table in the database
 */

export interface Category {
  id: number;
  name: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { id: 1, name: 'Food & Dining', icon: '🍔' },
  { id: 2, name: 'Transportation', icon: '🚗' },
  { id: 3, name: 'Shopping', icon: '🛍️' },
  { id: 4, name: 'Entertainment', icon: '🎬' },
  { id: 5, name: 'Bills & Utilities', icon: '💡' },
  { id: 6, name: 'Healthcare', icon: '🏥' },
  { id: 7, name: 'Other', icon: '📦' },
];

/**
 * Get category icon by name
 */
export const getCategoryIcon = (categoryName: string): string => {
  const category = CATEGORIES.find((c) => c.name === categoryName);
  return category?.icon || '📦';
};

/**
 * Get category by name
 */
export const getCategoryByName = (name: string): Category | undefined => {
  return CATEGORIES.find((c) => c.name === name);
};
