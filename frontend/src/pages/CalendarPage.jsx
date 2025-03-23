import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import '../styles/calendar.css';

function CalendarPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    timeSlots: {
      monday: { start: '09:00', end: '17:00', isAvailable: true },
      tuesday: { start: '09:00', end: '17:00', isAvailable: true },
      wednesday: { start: '09:00', end: '17:00', isAvailable: true },
      thursday: { start: '09:00', end: '17:00', isAvailable: true },
      friday: { start: '09:00', end: '17:00', isAvailable: true },
      saturday: { start: '10:00', end: '15:00', isAvailable: false },
      sunday: { start: '10:00', end: '15:00', isAvailable: false },
    },
    bufferTime: 0,
    color: '#4f46e5',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [publicLink, setPublicLink] = useState('');
  
  const navigate = useNavigate();
  const { id } = useParams();
  
  useEffect(() => {
    if (id) {
      setIsEdit(true);
      fetchCalendar();
    }
  }, [id]);
  
  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/calendars/${id}`);
      const calendar = res.data.data;
      
      // Create default timeSlots structure
      const defaultTimeSlots = {
        monday: { start: '09:00', end: '17:00', isAvailable: true },
        tuesday: { start: '09:00', end: '17:00', isAvailable: true },
        wednesday: { start: '09:00', end: '17:00', isAvailable: true },
        thursday: { start: '09:00', end: '17:00', isAvailable: true },
        friday: { start: '09:00', end: '17:00', isAvailable: true },
        saturday: { start: '10:00', end: '15:00', isAvailable: false },
        sunday: { start: '10:00', end: '15:00', isAvailable: false },
      };
      
      // Convert the backend model to the format expected by the form
      let timeSlots = { ...defaultTimeSlots };
      
      // If calendar has availableDays array, use it to set isAvailable for each day
      if (calendar.availableDays && Array.isArray(calendar.availableDays)) {
        // Map day numbers to day names (0 = Sunday, 1 = Monday, etc.)
        const dayMapping = {
          0: 'sunday',
          1: 'monday',
          2: 'tuesday',
          3: 'wednesday',
          4: 'thursday',
          5: 'friday',
          6: 'saturday',
        };
        
        // Set all days to unavailable first
        Object.keys(timeSlots).forEach(day => {
          timeSlots[day].isAvailable = false;
        });
        
        // Set available days based on the array
        calendar.availableDays.forEach(dayNum => {
          const dayName = dayMapping[dayNum];
          if (dayName && timeSlots[dayName]) {
            timeSlots[dayName].isAvailable = true;
          }
        });
      }
      
      // If calendar has availableHours, use it to set start and end times
      if (calendar.availableHours) {
        const startHour = calendar.availableHours.start;
        const endHour = calendar.availableHours.end;
        
        if (typeof startHour === 'number') {
          // Convert hour numbers to "HH:00" format
          const startTime = startHour.toString().padStart(2, '0') + ':00';
          const endTime = endHour.toString().padStart(2, '0') + ':00';
          
          Object.keys(timeSlots).forEach(day => {
            timeSlots[day].start = startTime;
            timeSlots[day].end = endTime;
          });
        }
      }
      
      console.log('Converted timeSlots:', timeSlots);
      
      setFormData({
        name: calendar.name || '',
        description: calendar.description || '',
        duration: calendar.slotDuration || calendar.duration || 30,
        timeSlots: timeSlots,
        bufferTime: calendar.bufferTime || 0,
        color: calendar.color || '#4f46e5',
        timezone: calendar.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      
      setPublicLink(`${window.location.origin}/calendar/${calendar.publicId}`);
      setLoading(false);
    } catch (err) {
      setError('Failed to load calendar');
      setLoading(false);
      console.error('Error fetching calendar:', err);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleTimeSlotChange = (day, field, value) => {
    setFormData({
      ...formData,
      timeSlots: {
        ...formData.timeSlots,
        [day]: {
          ...formData.timeSlots[day],
          [field]: field === 'isAvailable' ? !formData.timeSlots[day].isAvailable : value
        }
      }
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Convert the form data structure to the backend model structure
      // JavaScript's Date object uses 0 = Sunday, 1 = Monday, etc.
      const dayMapping = {
        'sunday': 0,
        'monday': 1,
        'tuesday': 2,
        'wednesday': 3,
        'thursday': 4,
        'friday': 5,
        'saturday': 6,
      };
      
      // Log the current timeSlot settings for clarity
      console.group('Calendar Availability Submission');
      console.log('Day settings before conversion:');
      Object.entries(formData.timeSlots).forEach(([day, settings]) => {
        console.log(`${day}: available=${settings.isAvailable}, hours=${settings.start}-${settings.end}`);
      });
      
      // Convert timeSlots to availableDays array - only include days marked as available
      const availableDays = Object.entries(formData.timeSlots)
        .filter(([_, value]) => value.isAvailable)
        .map(([day, _]) => Number(dayMapping[day]));
      
      console.log('Days selected in form:', Object.entries(formData.timeSlots)
        .filter(([_, value]) => value.isAvailable)
        .map(([day, _]) => day));
      
      console.log('Available days (indices) to save:', availableDays);
      
      // Verify day indices are numbers, not strings
      console.log('Day indices types:', availableDays.map(day => typeof day));
      
      // Find earliest start time and latest end time across all available days
      let startHour = 24; // Initialize to maximum possible hour
      let endHour = 0;    // Initialize to minimum possible hour
      
      Object.entries(formData.timeSlots)
        .filter(([_, value]) => value.isAvailable)
        .forEach(([day, timeSlot]) => {
          // Parse start time - "00:00" format
          const startParts = timeSlot.start.split(':').map(Number);
          const startHourValue = startParts[0];
          
          // Parse end time - "22:00" format
          const endParts = timeSlot.end.split(':').map(Number);
          // Convert end hour and add 1 if minutes > 0 (e.g., 22:30 becomes 23)
          const endHourValue = endParts[0] + (endParts[1] > 0 ? 1 : 0);
          
          console.log(`${day}: start=${startHourValue}:${startParts[1]}, end=${endParts[0]}:${endParts[1]}`);
          
          // Update the earliest start time
          if (startHourValue < startHour) {
            startHour = startHourValue;
          }
          
          // Update the latest end time
          if (endHourValue > endHour) {
            endHour = endHourValue;
          }
        });
      
      // Handle the special case of 12:00 AM (00:00)
      if (startHour === 0) {
        console.log('Setting start hour to 0 (12:00 AM)');
      }
      
      // If no days are available, set default hours
      if (availableDays.length === 0) {
        startHour = 9;
        endHour = 17;
      }
      
      console.log('Final hours: Start hour =', startHour, ', End hour =', endHour);
      
      // Prepare the data to send to the backend
      const calendarData = {
        name: formData.name,
        description: formData.description,
        availableDays,
        availableHours: {
          start: startHour,
          end: endHour
        },
        slotDuration: parseInt(formData.duration),
        duration: parseInt(formData.duration),
        bufferTime: parseInt(formData.bufferTime),
        color: formData.color,
        timezone: formData.timezone
      };
      
      console.log('Saving calendar data:', JSON.stringify(calendarData, null, 2));
      console.groupEnd();
      
      let response;
      if (isEdit) {
        response = await api.put(`/calendars/${id}`, calendarData);
      } else {
        response = await api.post('/calendars', calendarData);
      }
      
      console.log('API response:', response.data);
      
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save calendar');
      setLoading(false);
      console.error('Error saving calendar:', err);
    }
  };
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  if (loading && isEdit) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {isEdit ? 'Edit Calendar' : 'Create New Calendar'}
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {publicLink && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-3 rounded mb-6">
          <p>Public Link: <a href={publicLink} target="_blank" rel="noopener noreferrer" className="font-medium underline">{publicLink}</a></p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
              Calendar Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="My Appointment Calendar"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="duration">
              Appointment Duration (minutes)
            </label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Details about this calendar"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="bufferTime">
              Buffer Time Between Appointments (minutes)
            </label>
            <select
              id="bufferTime"
              name="bufferTime"
              value={formData.bufferTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={0}>No buffer</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="color">
              Calendar Color
            </label>
            <div className="flex items-center">
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-12 h-10 border border-gray-300 rounded-md mr-2"
              />
              <input
                type="text"
                value={formData.color}
                onChange={handleChange}
                name="color"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Availability</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {days.map((day) => (
              <div key={day} className="border border-gray-200 rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-lg text-gray-800">
                    {day === 'monday' ? 'Monday' :
                     day === 'tuesday' ? 'Tuesday' :
                     day === 'wednesday' ? 'Wednesday' :
                     day === 'thursday' ? 'Thursday' :
                     day === 'friday' ? 'Friday' :
                     day === 'saturday' ? 'Saturday' :
                     'Sunday'}
                  </span>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.timeSlots[day].isAvailable}
                      onChange={() => handleTimeSlotChange(day, 'isAvailable')}
                      className="form-checkbox h-5 w-5 text-indigo-600"
                    />
                    <span className="ml-2 text-sm">Available</span>
                  </label>
                </div>
                <div className={`grid grid-cols-2 gap-2 ${!formData.timeSlots[day].isAvailable ? 'opacity-50' : ''}`}>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={formData.timeSlots[day].start}
                      onChange={(e) => handleTimeSlotChange(day, 'start', e.target.value)}
                      disabled={!formData.timeSlots[day].isAvailable}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">End Time</label>
                    <input
                      type="time"
                      value={formData.timeSlots[day].end}
                      onChange={(e) => handleTimeSlotChange(day, 'end', e.target.value)}
                      disabled={!formData.timeSlots[day].isAvailable}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 mr-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Calendar' : 'Create Calendar')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CalendarPage; 