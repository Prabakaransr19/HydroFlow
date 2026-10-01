/**
 * Utility to format numbers as INR currency (₹)
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0.00';
  }
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

export const formatVolume = (volume) => {
  if (volume === undefined || volume === null || isNaN(volume)) {
    return '0 L';
  }
  const numericVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
  if (numericVolume >= 1000) {
    return `${(numericVolume / 1000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} kL`;
  }
  return `${numericVolume.toLocaleString('en-IN')} L`;
};
