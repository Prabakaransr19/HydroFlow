/**
 * Utility to format dates consistently across the app
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    };
    return new Intl.DateTimeFormat('en-IN', defaultOptions).format(date);
  } catch (err) {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  return formatDate(dateString, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatMonthYear = (month, year) => {
  if (!month || !year) return 'N/A';
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthIndex = typeof month === 'number' ? month - 1 : parseInt(month, 10) - 1;
  return `${monthNames[monthIndex] || month} ${year}`;
};
