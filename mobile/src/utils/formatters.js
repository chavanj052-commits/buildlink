// Formatting utilities for BuildLink Mobile

/**
 * Format number to Indian Rupee (INR) currency style
 * e.g., 1500000 -> ₹15,00,000
 */
export const formatINR = (amount) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₹0';
  }

  const num = Number(amount);
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const parts = absNum.toString().split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] ? `.${parts[1].slice(0, 2)}` : '';

  if (integerPart.length > 3) {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }

  return `${isNegative ? '-' : ''}₹${integerPart}${decimalPart}`;
};

/**
 * Format ISO or SQL date string to readable display
 * e.g., "2026-03-15" -> "15 Mar 2026"
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Get status badge style configs
 */
export const getStatusMeta = (status) => {
  const norm = (status || '').toLowerCase().trim();
  switch (norm) {
    case 'completed':
    case 'delivered':
    case 'approved':
    case 'paid':
      return {
        label: status ? status.toUpperCase() : 'COMPLETED',
        color: '#22c55e',
        backgroundColor: '#dcfce7',
        icon: 'checkmark-circle',
      };
    case 'in_progress':
    case 'in progress':
    case 'active':
    case 'ordered':
      return {
        label: 'IN PROGRESS',
        color: '#3b82f6',
        backgroundColor: '#dbeafe',
        icon: 'time',
      };
    case 'pending':
    case 'requested':
    case 'in_review':
    case 'in review':
      return {
        label: status ? status.toUpperCase() : 'PENDING',
        color: '#f59e0b',
        backgroundColor: '#fef3c7',
        icon: 'hourglass',
      };
    case 'rejected':
    case 'cancelled':
    case 'delayed':
      return {
        label: status ? status.toUpperCase() : 'DELAYED',
        color: '#ef4444',
        backgroundColor: '#fee2e2',
        icon: 'close-circle',
      };
    case 'planning':
    default:
      return {
        label: status ? status.toUpperCase() : 'PLANNING',
        color: '#6366f1',
        backgroundColor: '#e0e7ff',
        icon: 'construct',
      };
  }
};
