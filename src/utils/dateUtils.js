/**
 * Format a date string (YYYY-MM-DD) to a human-readable format
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  
  // Fix timezone issue by ensuring the date is interpreted in local time
  // Add 'T12:00:00' to ensure it's noon in local time, avoiding any date shift
  const localDateStr = dateStr + 'T12:00:00';
  const date = new Date(localDateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Check if a date is overdue (before today)
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {boolean} True if the date is overdue
 */
export function isDateOverdue(dateStr) {
  if (!dateStr) return false;
  
  // Use the same approach as formatDate for consistent date handling
  const localDateStr = dateStr + 'T12:00:00';
  return new Date(localDateStr) < new Date();
}

/**
 * Validate a date string in YYYY-MM-DD format
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} True if the date is valid
 */
export function isValidDateFormat(dateStr) {
  if (!dateStr) return false;
  
  // Validate the date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return false;
  }
  
  // Create a date object to validate the date is real
  const localDateStr = dateStr + 'T12:00:00';
  const date = new Date(localDateStr);
  return !isNaN(date.getTime());
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}