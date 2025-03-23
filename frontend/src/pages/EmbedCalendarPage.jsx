import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import '../styles/embed.css';

function EmbedCalendarPage() {
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
      setLoading(false);
    } catch (err) {
      setError('Failed to load calendar');
      setLoading(false);
      console.error('Error fetching calendar:', err);
    }
  };
  
  // Get days for the current month view
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    // Calendar starts with Monday at index 0 in the display
    // If firstDayOfMonth is 0 (Sunday), we need 6 days from previous month
    // If firstDayOfMonth is 1 (Monday), we need 0 days, etc.
    const prevMonthDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
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
    
    return days;
  };
  
  const isDateAvailable = (date) => {
    // Check if calendar exists
    if (!calendar) {
      return false;
    }
    
    // Check if the date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return false;
    }
    
    // Check if the date is in disabledDates
    if (calendar.disabledDates && Array.isArray(calendar.disabledDates)) {
      const dateString = date.toISOString().split('T')[0];
      const isDisabled = calendar.disabledDates.some(disabledDate => {
        return new Date(disabledDate).toISOString().split('T')[0] === dateString;
      });
      if (isDisabled) {
        return false;
      }
    }
    
    // Check if day is in availableDays (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = date.getDay();
    
    // Check if calendar has availableDays array
    if (!calendar.availableDays || !Array.isArray(calendar.availableDays)) {
      return false;
    }
    
    // Convert calendar.availableDays to numbers to ensure consistent type comparison
    const availableDaysAsNumbers = calendar.availableDays.map(day => Number(day));
    // Check if the day is in the availableDays array (using number comparison)
    return availableDaysAsNumbers.includes(dayOfWeek);
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
      
      // If in an iframe, communicate with parent window
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'CALENDAR_DATE_SELECTED',
          publicId: publicId,
          date: date.toISOString()
        }, '*');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (error || !calendar) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600">Calendar not found</p>
      </div>
    );
  }
  
  const days = getDaysInMonth();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div className="p-4">
      {/* Calendar header */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-1 rounded-md border border-gray-300 hover:bg-gray-100"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1 rounded-md border border-gray-300 hover:bg-gray-100"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 py-1">
            {day}
          </div>
        ))}
        
        {days.map((day, index) => {
          const isAvailable = day.isCurrentMonth && isDateAvailable(day.date);
          const isSelected = selectedDate && 
                            day.date.getDate() === selectedDate.getDate() && 
                            day.date.getMonth() === selectedDate.getMonth() && 
                            day.date.getFullYear() === selectedDate.getFullYear();
          
          return (
            <div
              key={index}
              onClick={() => handleDateClick(day.date)}
              className={`
                calendar-day
                text-center py-1 text-sm rounded-md cursor-pointer
                ${!day.isCurrentMonth ? 'outside-month' : ''}
                ${day.isToday ? 'bg-indigo-100 border border-indigo-300' : ''}
                ${isSelected ? 'selected' : ''}
                ${isAvailable ? 'available' : day.isCurrentMonth ? 'unavailable' : ''}
              `}
            >
              {day.date.getDate()}
            </div>
          );
        })}
      </div>
      
      {/* Calendar information */}
      <div className="calendar-footer mt-4 text-center">
        <p className="text-xs text-gray-600">
          {calendar.name} - {calendar.duration || calendar.slotDuration || 30} min appointments
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {getAvailableDaysString(calendar.availableDays)}
        </p>
        <div className="powered-by">
          Powered by <a href={window.location.origin} target="_blank" rel="noopener noreferrer">Schedly</a>
        </div>
      </div>
    </div>
  );
}

// Helper function to display available days in a user-friendly format
function getAvailableDaysString(availableDays) {
  if (!availableDays || !Array.isArray(availableDays) || availableDays.length === 0) {
    return 'No available days';
  }
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const days = availableDays.map(day => dayNames[Number(day)]).join(', ');
  
  return `Available: ${days}`;
}

export default EmbedCalendarPage; 