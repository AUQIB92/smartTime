/**
 * Format a date according to the specified format
 * @param {Date} date - The date to format
 * @param {string} format - The format string (e.g., 'yyyy-MM-dd')
 * @returns {string} The formatted date string
 */
export function formatDate(date, format = 'MMM dd, yyyy') {
  if (!date) return '';
  
  // Ensure date is a Date object
  const d = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesLong = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Replace format tokens with actual values
  return format
    .replace('yyyy', year)
    .replace('MM', (month + 1).toString().padStart(2, '0'))
    .replace('MMMM', monthNamesLong[month])
    .replace('MMM', monthNames[month])
    .replace('dd', day.toString().padStart(2, '0'))
    .replace('d', day);
}

/**
 * Check if a date is between two other dates
 * @param {Date} date - The date to check
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 * @returns {boolean} True if the date is between startDate and endDate
 */
export function isDateBetween(date, startDate, endDate) {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return d >= start && d <= end;
}

/**
 * Check if a semester is the current semester
 * @param {Object} semester - The semester object with startDate and endDate
 * @returns {boolean} True if the current date is within the semester date range
 */
export function isCurrentSemester(semester) {
  if (!semester || !semester.startDate || !semester.endDate) return false;
  
  const now = new Date();
  return isDateBetween(now, semester.startDate, semester.endDate);
} 