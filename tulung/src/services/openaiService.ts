/**
 * OpenAI Service - Receipt OCR with GPT-4o mini
 * Extracts amount, currency, merchant, and category from receipt images
 */

import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import axios from 'axios';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Sanitize API key for logging (hide all but first 3 and last 4 characters)
 */
function sanitizeApiKey(key: string | undefined): string {
  if (!key) return '[NOT SET]';
  if (key.length < 10) return '[INVALID]';
  return `${key.substring(0, 3)}...${key.substring(key.length - 4)}`;
}

export interface ReceiptData {
  amount: number;
  currency: string;
  merchant: string;
  category: string;
}

interface OpenAIError {
  error?: string;
  message?: string;
}

/**
 * Extract receipt data from image using GPT-4o mini vision
 * @param imageUri - Local file URI of the receipt image
 * @returns Extracted receipt data
 * @throws Error if OCR fails or API error occurs
 */
export async function extractReceiptData(imageUri: string): Promise<ReceiptData> {
  // Validate OpenAI is configured before attempting OCR
  if (!isOpenAIConfigured()) {
    throw new Error('OpenAI API key not configured. Please add your API key to continue.');
  }

  try {
    if (__DEV__) console.log('📸 Starting OCR extraction for:', imageUri);

    // 1. Resize and compress image for faster upload (OCR doesn't need high res)
    if (__DEV__) console.log('📦 Optimizing image for OCR...');
    const optimizedImage = await manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }], // 800px is enough for receipt text
      {
        compress: 0.4, // Lower quality for OCR (still readable)
        format: SaveFormat.JPEG,
      }
    );

    // 2. Convert optimized image to base64
    const base64 = await readAsStringAsync(optimizedImage.uri, {
      encoding: EncodingType.Base64,
    });

    if (__DEV__) console.log(`✅ Image optimized (${(base64.length / 1024).toFixed(2)}KB base64)`);

    // 3. Shorter, more direct prompt (faster processing)
    const prompt = `Extract from receipt as JSON: {"amount": number, "currency": "USD/MYR/EUR", "merchant": "name", "category": "Food & Dining/Transportation/Shopping/Entertainment/Bills & Utilities/Healthcare/Other"}. Return {"error": "..."} if unreadable.`;

    if (__DEV__) console.log('🤖 Calling OpenAI API...');

    // 3. Call OpenAI API with vision
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 150, // Reduced - we only need short JSON response
        temperature: 0, // Zero temp for fastest, most consistent results
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout (faster fail if stuck)
      }
    );

    if (__DEV__) console.log('✅ OpenAI API response received');

    // 4. Validate response structure
    if (!response.data || !response.data.choices || response.data.choices.length === 0) {
      throw new Error('Invalid response from OpenAI API');
    }

    const firstChoice = response.data.choices[0];
    if (!firstChoice || !firstChoice.message || !firstChoice.message.content) {
      throw new Error('Malformed response from OpenAI API');
    }

    // 5. Parse response
    const content = firstChoice.message.content;
    if (__DEV__) console.log('📄 Raw response:', content);

    // Extract JSON from response (sometimes GPT wraps it in markdown)
    let jsonStr = content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const data = JSON.parse(jsonStr) as ReceiptData | OpenAIError;

    // 5. Validate response
    if ('error' in data) {
      throw new Error(data.error || 'Could not read receipt');
    }

    // Now TypeScript knows data is ReceiptData, not OpenAIError
    const receiptData = data as ReceiptData;

    // Validate required fields
    if (!receiptData.amount || !receiptData.currency || !receiptData.merchant || !receiptData.category) {
      throw new Error('Incomplete data extracted from receipt');
    }

    // Validate amount is a positive number
    if (typeof receiptData.amount !== 'number' || receiptData.amount <= 0) {
      throw new Error('Invalid amount extracted');
    }

    if (__DEV__) {
      console.log('✅ OCR Success:', {
        amount: receiptData.amount,
        currency: receiptData.currency,
        merchant: receiptData.merchant,
        category: receiptData.category,
      });
    }

    return receiptData;

  } catch (error: any) {
    if (__DEV__) console.error('❌ OCR Error:', error);

    // Handle specific error types
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - please try again');
      }
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded - please wait a moment');
      }
      if (error.response?.status === 401) {
        throw new Error('Invalid API key');
      }
      throw new Error('Network error - please check your connection');
    }

    // JSON parse errors
    if (error instanceof SyntaxError) {
      throw new Error('Could not parse receipt data');
    }

    // Rethrow with original message if it's already a useful error
    throw error;
  }
}

/**
 * Check if OpenAI service is configured correctly
 */
export function isOpenAIConfigured(): boolean {
  if (!OPENAI_API_KEY) {
    if (__DEV__) console.warn('⚠️ OpenAI API key is not set');
    return false;
  }

  // Check if it's a placeholder
  if (OPENAI_API_KEY === 'your_openai_key_here' || OPENAI_API_KEY === 'sk-xxx') {
    if (__DEV__) console.warn('⚠️ OpenAI API key is a placeholder');
    return false;
  }

  // Check if it looks like a valid OpenAI key (starts with 'sk-')
  if (!OPENAI_API_KEY.startsWith('sk-')) {
    if (__DEV__) console.warn('⚠️ OpenAI API key format invalid (should start with "sk-")');
    return false;
  }

  // Check minimum length (OpenAI keys are typically 51+ chars)
  if (OPENAI_API_KEY.length < 20) {
    if (__DEV__) console.warn('⚠️ OpenAI API key too short');
    return false;
  }

  if (__DEV__) console.log(`✅ OpenAI configured: ${sanitizeApiKey(OPENAI_API_KEY)}`);
  return true;
}

/**
 * Normalize and validate currency code
 */
export function normalizeCurrency(currency: string): string {
  // Supported currencies
  const supportedCurrencies = ['USD', 'MYR', 'EUR', 'GBP', 'SGD', 'JPY', 'AUD', 'CAD'];

  // Map common variations to standard codes
  const currencyMap: Record<string, string> = {
    '$': 'USD',
    'usd': 'USD',
    'dollar': 'USD',
    'dollars': 'USD',
    'us dollar': 'USD',
    'RM': 'MYR',
    'rm': 'MYR',
    'myr': 'MYR',
    'ringgit': 'MYR',
    '€': 'EUR',
    'eur': 'EUR',
    'euro': 'EUR',
    'euros': 'EUR',
    '£': 'GBP',
    'gbp': 'GBP',
    'pound': 'GBP',
    'pounds': 'GBP',
    'S$': 'SGD',
    'sgd': 'SGD',
    '¥': 'JPY',
    'jpy': 'JPY',
    'yen': 'JPY',
    'AU$': 'AUD',
    'aud': 'AUD',
    'CA$': 'CAD',
    'cad': 'CAD',
  };

  const normalized = currency.trim().toUpperCase();

  // Check if already a valid currency code
  if (supportedCurrencies.includes(normalized)) {
    return normalized;
  }

  // Check mapped variations (case-insensitive)
  const lowerCurrency = currency.trim().toLowerCase();
  if (currencyMap[lowerCurrency]) {
    return currencyMap[lowerCurrency];
  }

  // Default to USD if unrecognized
  if (__DEV__) console.warn(`⚠️ Unrecognized currency "${currency}", defaulting to USD`);
  return 'USD';
}

/**
 * Validate category matches our predefined list
 */
export function normalizeCategory(category: string): string {
  const validCategories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Other',
  ];

  // Find exact match
  const exactMatch = validCategories.find(
    (c) => c.toLowerCase() === category.toLowerCase()
  );
  if (exactMatch) return exactMatch;

  // Find partial match
  const partialMatch = validCategories.find((c) =>
    c.toLowerCase().includes(category.toLowerCase()) ||
    category.toLowerCase().includes(c.toLowerCase())
  );
  if (partialMatch) return partialMatch;

  // Default to "Other" if no match
  return 'Other';
}
