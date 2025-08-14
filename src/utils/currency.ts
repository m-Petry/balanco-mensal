// Currency formatting utilities for Brazilian Real

/**
 * Formats a number as Brazilian currency (R$ 1.234,56)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formats a number as Brazilian number format (1.234,56)
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Parses a Brazilian formatted currency string to number
 */
export const parseCurrency = (value: string): number => {
  const cleanValue = value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};

/**
 * Formats input value as user types (bank-style input)
 * Automatically adds decimal places and thousands separators
 */
export const formatCurrencyInput = (value: string): string => {
  // Remove all non-numeric characters
  const numericValue = value.replace(/\D/g, '');
  
  if (!numericValue) return '';
  
  // Convert to number and divide by 100 to get decimal places
  const numValue = parseInt(numericValue) / 100;
  
  // Format with Brazilian locale
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};

/**
 * Gets the raw value from formatted input for database storage
 */
export const getCurrencyInputValue = (formattedValue: string): number => {
  if (!formattedValue) return 0;
  
  const cleanValue = formattedValue.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};