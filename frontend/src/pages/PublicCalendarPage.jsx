import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { formatDate } from '../utils/dateUtils';

function PublicCalendarPage() {
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  
  const { publicId } = useParams();
  
  useEffect(() => {
    fetchCalendar();
  }, [publicId]);
  
  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/calendars/public/${publicId}`);
      setCalendar(res.data.data);
      console.log('Calendar data:', res.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load calendar');
      setLoading(false);
      console.error('Error fetching calendar:', err);
    }
  };
  
  // Get days for the current month view
  const getDaysInMonth = () => {
    console.group('Calendar Month View Generation');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    console.log(`First day of ${year}-${month+1} is ${firstDayOfMonth} (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][firstDayOfMonth]})`);
    
    // IMPORTANT FIX: Calendar starts with Monday at index 0 in the display
    // If firstDayOfMonth is 0 (Sunday), we need 6 days from previous month
    // If firstDayOfMonth is 1 (Monday), we need 0 days, etc.
    const prevMonthDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    console.log(`Need ${prevMonthDays} days from previous month to fill calendar (starts with Monday)`);
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    console.log(`${year}-${month+1} has ${daysInMonth} days total`);
    
    // Calculate previous month details
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();
    
    const days = [];
    
    // Add days from previous month
    for (let i = daysInPrevMonth - prevMonthDays + 1; i <= daysInPrevMonth; i++) {
      days.push({
        date: new Date(prevMonthYear, prevMonth, i),
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    // Add days from current month
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getDate() === today.getDate() && 
                 date.getMonth() === today.getMonth() && 
                 date.getFullYear() === today.getFullYear()
      });
    }
    
    // Add days from next month to complete the grid (always showing 6 rows = 42 days)
    const remainingDays = 42 - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(nextMonthYear, nextMonth, i),
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    console.log(`Generated ${days.length} days total for calendar (${days.filter(d => d.isCurrentMonth).length} in current month)`);
    console.groupEnd();
    return days;
  };
  
  const isDateAvailable = (date) => {
    // Check if calendar exists
    if (!calendar) {
      console.log('No calendar data available yet');
      return false;
    }
    
    // Check if the date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      // Don't log past dates to reduce console spam
      return false;
    }
    
    // Check if the date is in disabledDates
    if (calendar.disabledDates && Array.isArray(calendar.disabledDates)) {
      const dateString = date.toISOString().split('T')[0];
      const isDisabled = calendar.disabledDates.some(disabledDate => {
        return new Date(disabledDate).toISOString().split('T')[0] === dateString;
      });
      if (isDisabled) {
        console.log(`Date ${date.toLocaleDateString()} is in disabled dates`);
        return false;
      }
    }
    
    // Check if day is in availableDays (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = date.getDay();
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    
    // Check if calendar has availableDays array
    if (!calendar.availableDays || !Array.isArray(calendar.availableDays)) {
      console.log(`Calendar has no availableDays array:`, calendar);
      return false;
    }
    
    // Convert calendar.availableDays to numbers to ensure consistent type comparison
    const availableDaysAsNumbers = calendar.availableDays.map(day => Number(day));
    // Check if the day is in the availableDays array (using number comparison)
    const isAvailable = availableDaysAsNumbers.includes(dayOfWeek);
    
    // ENHANCED DEBUGGING - always log for more clarity during debugging
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 14);  // Extend to 2 weeks for more visibility
    
    // More detailed debugging for ALL dates to help diagnose the issue
    if (date >= today && date <= nextWeek) {
      console.log(`%cAvailability check for ${date.toLocaleDateString()} (${dayName}, index ${dayOfWeek})`, 
                  'background: #f0f0f0; padding: 2px 5px;');
      console.log(`Available days in calendar: [${calendar.availableDays.join(', ')}]`);
      console.log(`Available days as numbers: [${availableDaysAsNumbers.join(', ')}]`);
      console.log(`Is ${dayName} (${dayOfWeek}) available? ${isAvailable ? 'YES ✅' : 'NO ❌'}`);
      
      if (!isAvailable) {
        // Check the raw values to help diagnose type issues
        console.log('Types:', {
          'dayOfWeek': typeof dayOfWeek,
          'firstAvailableDay': typeof calendar.availableDays[0],
          'availableDays': calendar.availableDays.map(day => typeof day)
        });
      }
    }
    
    return isAvailable;
  };
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };
  
  const handleDateClick = (date) => {
    if (isDateAvailable(date)) {
      setSelectedDate(date);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (error || !calendar) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Calendar Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">The calendar you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700">
          Go Home
        </Link>
      </div>
    );
  }
  
  const days = getDaysInMonth();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{calendar.name}</h1>
          <p className="text-gray-600 mb-4">{calendar.description}</p>
          <div className="flex items-center text-sm text-gray-500">
            <span className="mr-4">Duration: {calendar.duration || calendar.slotDuration || 30} minutes</span>
            {calendar.bufferTime > 0 && (
              <span>Buffer Time: {calendar.bufferTime} minutes</span>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={goToPreviousMonth}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-100"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-100"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
            
            {days.map((day, index) => (
              <div
                key={index}
                onClick={() => handleDateClick(day.date)}
                className={`
                  h-14 p-1 border text-center cursor-pointer transition
                  ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                  ${day.isToday ? 'border-indigo-400' : 'border-gray-200'}
                  ${isDateAvailable(day.date) && day.isCurrentMonth ? 'hover:bg-indigo-50' : 'cursor-default'}
                  ${selectedDate && day.date.toDateString() === selectedDate.toDateString() ? 'bg-indigo-100 border-indigo-500' : ''}
                `}
              >
                <div className="h-full flex flex-col justify-between">
                  <span className={`text-sm ${day.isToday ? 'font-bold' : ''}`}>
                    {day.date.getDate()}
                  </span>
                  {isDateAvailable(day.date) && day.isCurrentMonth && (
                    <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-1"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {selectedDate && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {formatDate(selectedDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <div className="flex justify-center">
                <Link
                  to={`/book/${publicId}?date=${selectedDate.toISOString()}`}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  See Available Time Slots
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PublicCalendarPage; 