// Date utility functions that handle timezone correctly

/**
 * Get today's date in local timezone as YYYY-MM-DD format
 */
export const getTodayLocalDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get a date object representing local date (without timezone issues)
 */
export const getLocalDate = (daysFromToday: number = 0): Date => {
  const today = new Date();
  const targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysFromToday);
  return targetDate;
};

/**
 * Convert a local date to YYYY-MM-DD format
 */
export const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get week dates starting from today (local timezone)
 */
export const getWeekDatesLocal = (numberOfDays: number = 7) => {
  const dates = [];
  
  for (let i = 0; i < numberOfDays; i++) {
    const date = getLocalDate(i);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayOfWeek = date.getDay();

    dates.push({
      day: dayNames[dayOfWeek],
      date: date.getDate(),
      fullDate: formatDateToISO(date),
      isToday: i === 0,
    });
  }
  
  return dates;
};

/**
 * Get week dates for selector (Vietnamese day names)
 */
export const getWeekDatesForSelector = (numberOfDays: number = 7) => {
  const dates = [];
  
  for (let i = 0; i < numberOfDays; i++) {
    const date = getLocalDate(i);
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const dayOfWeek = date.getDay();

    dates.push({
      key: i.toString(),
      day: dayNames[dayOfWeek],
      date: date.getDate().toString(),
      month: `Tháng ${date.getMonth() + 1}`,
      fullDate: formatDateToISO(date),
    });
  }
  
  return dates;
}; 