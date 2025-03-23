/**
 * Format a date string or Date object to a human-readable format
 * @param {string|Date} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return dateObj.toLocaleDateString(undefined, defaultOptions);
};

/**
 * Format a time string or Date object to a human-readable format
 * @param {string|Date} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted time string
 */
export const formatTime = (date, options = {}) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    ...options
  };
  
  return dateObj.toLocaleTimeString(undefined, defaultOptions);
};

/**
 * Format a date and time string or Date object to a human-readable format
 * @param {string|Date} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date, options = {}) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    ...options
  };
  
  return dateObj.toLocaleString(undefined, defaultOptions);
};

/**
 * Check if a date is in the past
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if the date is in the past
 */
export const isPastDate = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
};

/**
 * Get an array of time slots for a given day
 * @param {Date} date - The date to get time slots for
 * @param {number} interval - The interval in minutes between slots (default: 30)
 * @param {number|string} startTime - The start time (either hour number or "HH:MM" string)
 * @param {number|string} endTime - The end time (either hour number or "HH:MM" string)
 * @returns {Array} Array of time slot objects with date and formatted time
 */
export const getTimeSlots = (
  date, 
  interval = 30, 
  startTime = 9, 
  endTime = 17
) => {
  console.group('getTimeSlots - Generating time slots');
  console.log('Input parameters:', { 
    date: date?.toISOString(),
    interval, 
    startTime: startTime === 0 ? '0 (12:00 AM)' : startTime, 
    endTime 
  });
  
  // Check for invalid inputs
  if (!date || !(date instanceof Date)) {
    console.error('Invalid date provided to getTimeSlots', date);
    console.groupEnd();
    return [];
  }
  
  // Ensure interval is valid
  if (!interval || interval <= 0 || isNaN(interval)) {
    console.warn('Invalid interval provided to getTimeSlots, using default 30 minutes', interval);
    interval = 30;
  }
  
  const slots = [];
  
  let startHour, startMinute, endHour, endMinute;
  
  // Handle both number and string formats with better error handling
  // CRITICAL FIX: Use strict equality checking for 0
  if (typeof startTime === 'number' || startTime === 0) {
    // Handle numeric time including 0 (12:00 AM)
    startHour = parseInt(startTime); // Convert to integer
    startMinute = 0;
    console.log(`Using numeric start time: ${startHour} (${startHour === 0 ? '12:00 AM' : startHour + ':00'})`);
  } else if (typeof startTime === 'string' && startTime.includes(':')) {
    [startHour, startMinute] = startTime.split(':').map(Number);
    console.log(`Using string start time: ${startTime} -> ${startHour}:${startMinute}`);
  } else {
    // Default if the format is unexpected
    startHour = 9;
    startMinute = 0;
    console.warn('Invalid startTime format, using default 9:00', startTime);
  }
  
  if (typeof endTime === 'number' || endTime === 0) {
    endHour = parseInt(endTime); // Convert to integer
    endMinute = 0;
    console.log(`Using numeric end time: ${endHour} (${endHour === 0 ? '12:00 AM' : endHour + ':00'})`);
  } else if (typeof endTime === 'string' && endTime.includes(':')) {
    [endHour, endMinute] = endTime.split(':').map(Number);
    console.log(`Using string end time: ${endTime} -> ${endHour}:${endMinute}`);
  } else {
    // Default if the format is unexpected
    endHour = 17;
    endMinute = 0;
    console.warn('Invalid endTime format, using default 17:00', endTime);
  }
  
  // Log the intermediate values for debugging
  console.log('Parsed time values:', {
    startHour, startMinute,
    endHour, endMinute,
    interval
  });
  
  // Ensure we have valid start and end times
  if (isNaN(startHour) || startHour < 0 || startHour > 23 || isNaN(startMinute) || startMinute < 0 || startMinute > 59) {
    console.warn(`Invalid start time values (${startHour}:${startMinute}), using default 9:00`);
    startHour = 9;
    startMinute = 0;
  }
  
  if (isNaN(endHour) || endHour < 0 || endHour > 23 || isNaN(endMinute) || endMinute < 0 || endMinute > 59) {
    console.warn(`Invalid end time values (${endHour}:${endMinute}), using default 17:00`);
    endHour = 17;
    endMinute = 0;
  }
  
  // Check if start time is after end time (invalid range)
  if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
    console.warn('Start time is after or equal to end time, switching them');
    [startHour, startMinute, endHour, endMinute] = [endHour, endMinute, startHour, startMinute];
  }
  
  console.log('Time slot parameters after validation:', { 
    startHour, startMinute, endHour, endMinute, interval, date: date.toISOString() 
  });
  
  const startDate = new Date(date);
  startDate.setHours(startHour, startMinute, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(endHour, endMinute, 0, 0);
  
  console.log(`Time range: ${formatTime(startDate)} to ${formatTime(endDate)}`);
  
  // Check if start date is same or after end date (invalid range)
  if (startDate >= endDate) {
    console.error('Start date is after or equal to end date after setting hours:', 
      { start: startDate.toISOString(), end: endDate.toISOString() });
    console.groupEnd();
    return [];
  }
  
  let currentSlot = new Date(startDate);
  
  // Safety check to avoid infinite loops (max 100 slots per day)
  let safetyCounter = 0;
  const MAX_SLOTS = 100;
  
  while (currentSlot < endDate && safetyCounter < MAX_SLOTS) {
    slots.push({
      date: new Date(currentSlot),
      time: formatTime(currentSlot),
      value: currentSlot.toISOString()
    });
    
    currentSlot.setMinutes(currentSlot.getMinutes() + interval);
    safetyCounter++;
  }
  
  if (safetyCounter >= MAX_SLOTS) {
    console.warn('Reached maximum number of slots - check for invalid time interval');
  }
  
  console.log(`Generated ${slots.length} time slots from ${formatTime(startDate)} to ${formatTime(endDate)}`);
  
  // Log the first few and last few slots for debugging
  if (slots.length > 0) {
    console.log('First 3 slots:', slots.slice(0, 3));
    if (slots.length > 6) {
      console.log('Last 3 slots:', slots.slice(-3));
    }
  } else {
    console.error('❌ NO TIME SLOTS WERE GENERATED!');
  }
  
  console.groupEnd();
  return slots;
}; 