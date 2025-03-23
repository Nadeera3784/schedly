import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { formatDate, formatTime, getTimeSlots } from '../utils/dateUtils';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function BookingPage() {
  const [calendar, setCalendar] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [calendarId, setCalendarId] = useState(null);
  const [availableDaysMessage, setAvailableDaysMessage] = useState(null);
  
  const { publicId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const dateParam = queryParams.get('date');
    
    if (dateParam) {
      setSelectedDate(new Date(dateParam));
    }
    
    fetchCalendar();
  }, [publicId, location.search]);
  
  useEffect(() => {
    if (calendar && selectedDate) {
      generateTimeSlots();
    }
  }, [calendar, selectedDate]);
  
  useEffect(() => {
    if (calendar && calendar.availableDays && Array.isArray(calendar.availableDays)) {
      // Map day indices to names
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const availableDayNames = calendar.availableDays.map(day => dayNames[Number(day)]).join(', ');
      
      // Display message about available days in the component state
      setAvailableDaysMessage(`Available days: ${availableDayNames}`);
    }
  }, [calendar]);
  
  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/calendars/public/${publicId}`);
      const calendarData = res.data.data;
      
      console.log('Raw calendar data from backend:', calendarData);
      console.log('Available days:', calendarData.availableDays);
      console.log('Available hours:', calendarData.availableHours);
      console.log('Calendar ID:', calendarData._id);
      
      // Save the calendar's internal ID
      setCalendarId(calendarData._id);
      
      // Check if the duration properties are missing or invalid
      if (!calendarData.duration && !calendarData.slotDuration) {
        console.warn('⚠️ Both duration and slotDuration are missing, defaulting to 30 minutes');
        calendarData.duration = 30;
      }
      
      setCalendar(calendarData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load calendar');
      setLoading(false);
      console.error('Error fetching calendar:', err);
    }
  };
  
  const generateTimeSlots = async () => {
    if (!calendar || !selectedDate || !calendarId) return;
    
    try {
      // Get day of week (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = selectedDate.getDay();
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
      
      console.group('Time Slot Generation');
      console.log(`Generating time slots for ${selectedDate.toLocaleDateString()} - ${dayName} (index: ${dayOfWeek})`);
      console.log(`Calendar available days: [${calendar.availableDays.join(', ')}]`);
      console.log(`Calendar raw data:`, calendar);
      console.log(`Day types - dayOfWeek: ${typeof dayOfWeek}, availableDays[0]: ${typeof calendar.availableDays[0]}`);
      
      // Check if calendar data is valid
      if (!calendar.availableDays || !Array.isArray(calendar.availableDays) || calendar.availableDays.length === 0) {
        console.error('⚠️ Calendar has no available days or invalid data', calendar);
        console.log('Calendar object:', JSON.stringify(calendar, null, 2));
        setTimeSlots([]);
        console.groupEnd();
        return;
      }
      
      // IMPORTANT FIX: Explicitly convert available days to numbers to ensure consistent type comparison
      const availableDaysAsNumbers = calendar.availableDays.map(day => Number(day));
      console.log(`Available days as numbers: [${availableDaysAsNumbers.join(', ')}]`);
      
      // Check if day is available - ensure we're comparing numbers to numbers
      if (!availableDaysAsNumbers.includes(dayOfWeek)) {
        console.log(`⚠️ Day ${dayName} (${dayOfWeek}) is not in available days [${availableDaysAsNumbers.join(', ')}]`);
        
        // Create a user-friendly message about which days are available
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const availableDayNames = availableDaysAsNumbers.map(dayIndex => dayNames[dayIndex]).join(', ');
        
        setError(`${dayName} is not an available day. Available days are: ${availableDayNames}`);
        setTimeSlots([]);
        console.groupEnd();
        return;
      }
      
      // Check if the date is in disabledDates
      if (calendar.disabledDates && Array.isArray(calendar.disabledDates)) {
        const dateString = selectedDate.toISOString().split('T')[0];
        const isDisabled = calendar.disabledDates.some(disabledDate => {
          return new Date(disabledDate).toISOString().split('T')[0] === dateString;
        });
        
        if (isDisabled) {
          console.log('Date is in disabled dates');
          setTimeSlots([]);
          console.groupEnd();
          return;
        }
      }
      
      // Get start and end times from availableHours - with special handling for 0 (12:00 AM)
      // Use strict comparison against undefined to handle 0 properly
      const start = calendar.availableHours?.start !== undefined ? calendar.availableHours.start : 9;
      const end = calendar.availableHours?.end !== undefined ? calendar.availableHours.end : 17;
      
      // Ensure we have a valid duration
      const duration = calendar.slotDuration || calendar.duration || 30;
      console.log('Calendar duration:', calendar.duration);
      console.log('Calendar slotDuration:', calendar.slotDuration);
      console.log('Using duration:', duration);
      
      console.log('Available hours from backend:', calendar.availableHours);
      console.log('Using time range:', {
        start: `${start}:00 (${start === 0 ? '12:00 AM' : start + ':00'})`,
        end: `${end}:00`,
        duration,
      });
      
      // Get time slots - note that we're using the slotDuration or falling back to duration
      const slots = getTimeSlots(
        selectedDate,
        duration,
        start,
        end
      );
      
      console.log(`Generated ${slots.length} initial time slots`, slots);
      
      if (slots.length === 0) {
        console.warn('⚠️ No time slots were generated. Check time range and duration.');
        console.log('Time range:', start, 'to', end);
        console.log('Duration:', duration);
        setTimeSlots([]);
        console.groupEnd();
        return;
      }
      
      // Check availability of slots - use the calendar's internal ID
      const res = await api.get(`/calendars/${calendarId}/available-slots`, {
        params: {
          date: selectedDate.toISOString().split('T')[0]
        }
      });
      
      const bookedSlots = res.data.data || [];
      console.log('Booked slots from API:', bookedSlots);
      
      // Filter out booked slots
      const availableSlots = slots.filter(slot => {
        const slotTime = slot.date.toISOString();
        const isBooked = bookedSlots.some(bookedSlot => bookedSlot === slotTime);
        if (isBooked) {
          console.log(`Slot ${slot.time} is booked`);
        }
        return !isBooked;
      });
      
      console.log(`Final available slots: ${availableSlots.length} out of ${slots.length} initial slots`);
      console.groupEnd();
      
      setTimeSlots(availableSlots);
    } catch (err) {
      console.error('Error generating time slots:', err);
      setTimeSlots([]);
    }
  };
  
  const handleTimeSelect = (slot) => {
    setSelectedTimeSlot(slot);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTimeSlot) {
      setError('Please select a time slot');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Validate the slot value and make sure it's a proper date
      const startDate = new Date(selectedTimeSlot.value);
      
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid start time selected');
      }
      
      // Ensure we have a valid duration
      const duration = calendar.duration || calendar.slotDuration || 30;
      console.log(`Using duration for end time calculation: ${duration} minutes`);
      
      // Calculate end time safely
      const endTime = new Date(startDate.getTime() + (duration * 60000));
      
      if (isNaN(endTime.getTime())) {
        throw new Error('Failed to calculate end time');
      }
      
      // Format date as YYYY-MM-DD for API
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      // Get day of week and log it for debugging
      const bookingDayOfWeek = selectedDate.getDay();
      console.log(`Booking day of week: ${bookingDayOfWeek} (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][bookingDayOfWeek]})`);
      console.log(`Calendar available days:`, calendar.availableDays);
      console.log(`Calendar available days (as numbers):`, calendar.availableDays.map(day => Number(day)));
      console.log(`Is day available:`, calendar.availableDays.map(day => Number(day)).includes(bookingDayOfWeek));
      
      // Extract the hour values for startTime and endTime
      // Adding startDate.getMinutes() / 60 to represent partial hours
      const startHour = startDate.getHours() + (startDate.getMinutes() / 60);
      const endHour = endTime.getHours() + (endTime.getMinutes() / 60);
      
      console.log(`Start hour: ${startHour}, End hour: ${endHour}`);
      
      // Create booking data in the format expected by the API
      const bookingData = {
        ...formData,
        calendar: calendar._id, // The calendar ID
        date: formattedDate,    // ISO date string YYYY-MM-DD
        startTime: startHour,   // Hour as decimal (e.g., 9.5 for 9:30 AM)
        endTime: endHour        // Hour as decimal (e.g., 10.5 for 10:30 AM)
      };
      
      console.log('Submitting booking with data:', bookingData);
      
      const res = await api.post('/bookings', bookingData);
      
      setSuccess(true);
      setBookingDetails(res.data.data);
      setSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create booking');
      setSubmitting(false);
      console.error('Error creating booking:', err);
      
      // Display validation errors from the API response
      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        console.error('Validation errors:', validationErrors);
        
        // Create a more user-friendly error message
        const errorMessages = validationErrors.map(e => e.msg).join(', ');
        setError(`Validation failed: ${errorMessages}`);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (error && !calendar) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Calendar Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">The calendar you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
        >
          Go Home
        </button>
      </div>
    );
  }
  
  if (success && bookingDetails) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-8">Your appointment has been successfully booked. A confirmation email has been sent to your email address.</p>
          
          <div className="bg-gray-50 rounded-md p-6 mb-6 text-left">
            <h2 className="font-semibold text-lg text-gray-800 mb-4">Booking Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500">Calendar:</span>
                <span className="ml-2 font-medium">{calendar.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Date:</span>
                <span className="ml-2 font-medium">{formatDate(new Date(bookingDetails.startTime))}</span>
              </div>
              <div>
                <span className="text-gray-500">Time:</span>
                <span className="ml-2 font-medium">{formatTime(new Date(bookingDetails.startTime))} - {formatTime(new Date(bookingDetails.endTime))}</span>
              </div>
              <div>
                <span className="text-gray-500">Name:</span>
                <span className="ml-2 font-medium">{bookingDetails.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="ml-2 font-medium">{bookingDetails.email}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{calendar.name}</h1>
          <p className="text-gray-600 mb-4">{calendar.description}</p>
          <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500">
            <span className="mr-4">Duration: {calendar.duration || calendar.slotDuration || 30} minutes</span>
            {availableDaysMessage && (
              <div className="mt-2 sm:mt-0 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full inline-flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {availableDaysMessage}
              </div>
            )}
          </div>
        </div>
        
        {!selectedDate ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">No Date Selected</h2>
            <p className="text-gray-600 mb-6">
              Please select a date to see available time slots.
            </p>
            <button
              onClick={() => navigate(`/calendar/${publicId}`)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              Select a Date
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Book an appointment for {formatDate(selectedDate)}
            </h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Select a Time</h3>
                
                {timeSlots.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-md">
                    <p className="text-gray-500">
                      {error ? (
                        <>
                          <span className="font-medium text-red-600">{error}</span>
                        </>
                      ) : (
                        <>No available time slots for this date.</>
                      )}
                    </p>
                    
                    {availableDaysMessage && (
                      <p className="mt-2 text-gray-600">{availableDaysMessage}</p>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => navigate(`/calendar/${publicId}`)}
                      className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700"
                    >
                      Select Another Date
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {timeSlots.map((slot, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleTimeSelect(slot)}
                        className={`p-3 rounded-md text-center ${
                          selectedTimeSlot === slot
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {timeSlots.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Your Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="phone">
                        Phone Number (optional)
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="notes">
                        Notes (optional)
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-8">
                    <button
                      type="button"
                      onClick={() => navigate(`/calendar/${publicId}`)}
                      className="px-4 py-2 mr-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedTimeSlot || submitting}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                    >
                      {submitting ? 'Booking...' : 'Book Appointment'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingPage; 