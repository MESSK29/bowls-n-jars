/**
 * Indian Rupee (INR) currency formatting utilities.
 * Formats numbers using the Indian numbering system:
 * - Numbers below 1,000 are displayed as-is (e.g., ₹299)
 * - Thousands separator at 1,000 (e.g., ₹1,299)
 * - Lakh-style grouping for larger numbers (e.g., ₹1,00,000)
 */

/**
 * Format a number as Indian Rupee using Intl.NumberFormat
 * with the en-IN locale for proper lakh-style grouping.
 */
export function formatINR(amount: number, showPaise = false): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showPaise ? 2 : 0,
    maximumFractionDigits: showPaise ? 2 : 0,
  }).format(amount);
  return formatted;
}

/**
 * Format a price for display — standard store price formatting.
 * e.g., 1299 → "₹1,299"   |   100000 → "₹1,00,000"
 */
export function price(amount: number): string {
  return formatINR(amount, false);
}

/**
 * Format a price showing paise (decimal).
 * e.g., 1299.50 → "₹1,299.50"
 */
export function priceWithPaise(amount: number): string {
  return formatINR(amount, true);
}

/**
 * Format savings badge text.
 * e.g., savings(78, 68) → "Save ₹10"
 */
export function savings(compareAt: number, current: number): string {
  return `Save ${formatINR(compareAt - current, false)}`;
}

/**
 * Free shipping threshold in INR.
 * (Equivalent of ~$60 → ₹4,999)
 */
export const FREE_SHIPPING_THRESHOLD = 4999;

/**
 * Standard shipping fee in INR.
 * (Equivalent of ~$6.50 → ₹99)
 */
export const SHIPPING_FEE = 99;

/**
 * GST rate (18% standard rate for ceramic goods in India)
 */
export const GST_RATE = 0.18;
