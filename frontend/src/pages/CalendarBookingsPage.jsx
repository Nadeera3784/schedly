import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { Bar, Pie } from 'react-chartjs-2';

function CalendarBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get calendar details
        const calendarRes = await api.get(`/calendars/${id}`);
        setCalendar(calendarRes.data.data);
        
        // Get bookings
        const bookingsRes = await api.get(`/bookings/calendar/${id}`);
        setBookings(bookingsRes.data.data);

        // Process data for analytics
        if (bookingsRes.data.data.length > 0) {
          processAnalyticsData(bookingsRes.data.data);
        } else {
          setAnalytics({ noData: true });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const processAnalyticsData = (bookingsData) => {
    // Initialize analytics data
    const statusCounts = {
      confirmed: 0,
      cancelled: 0
    };

    // Last 7 days data
    const last7Days = [];
    const dayLabels = [];
    const today = new Date();
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dayLabels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      last7Days.push({
        date: date.toISOString().split('T')[0],
        count: 0
      });
    }

    // Process bookings
    bookingsData.forEach(booking => {
      // Count by status
      const status = booking.status || 'confirmed';
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }

      // Check if booking is in last 7 days
      const bookingDate = new Date(booking.date).toISOString().split('T')[0];
      last7Days.forEach(day => {
        if (day.date === bookingDate) {
          day.count++;
        }
      });
    });

    setAnalytics({
      status: {
        labels: ['Confirmed', 'Cancelled'],
        data: [statusCounts.confirmed, statusCounts.cancelled]
      },
      recentBookings: {
        labels: dayLabels,
        data: last7Days.map(day => day.count)
      },
      noData: false
    });
  };

  const formatTime = (time) => {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
      {loading ? (
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-800 mb-2 inline-block">
                  &larr; Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">{calendar?.name} Bookings</h1>
                <p className="text-gray-600 mt-1">{calendar?.description}</p>
              </div>
            </div>

            {/* Calendar Analytics */}
            {analytics && !analytics.noData && (
              <div className="mb-8 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Calendar Analytics</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent Bookings Chart */}
                  <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <h3 className="text-md font-medium text-gray-700 mb-4">Recent Bookings (Last 7 Days)</h3>
                    <div className="h-64">
                      <Bar
                        data={{
                          labels: analytics.recentBookings.labels,
                          datasets: [
                            {
                              label: 'Bookings',
                              data: analytics.recentBookings.data,
                              backgroundColor: 'rgba(99, 102, 241, 0.5)',
                              borderColor: 'rgb(99, 102, 241)',
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false,
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                precision: 0,
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Status Distribution */}
                  <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <h3 className="text-md font-medium text-gray-700 mb-4">Booking Status</h3>
                    <div className="h-64 flex items-center justify-center">
                      <Pie
                        data={{
                          labels: analytics.status.labels,
                          datasets: [
                            {
                              data: analytics.status.data,
                              backgroundColor: [
                                'rgba(34, 197, 94, 0.7)', // green
                                'rgba(239, 68, 68, 0.7)',  // red
                              ],
                              borderColor: [
                                'rgb(34, 197, 94)',
                                'rgb(239, 68, 68)',
                              ],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {bookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 className="text-xl font-semibold mb-4">No Bookings Yet</h2>
                <p className="text-gray-600 mb-6">
                  When customers book appointments for this calendar, they will appear here.
                </p>
                <Link
                  to="/dashboard"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded transition border border-gray-300 inline-block"
                >
                  Back to Dashboard
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{booking.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{booking.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{booking.phone || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(booking.date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              booking.status === 'cancelled' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {booking.status === 'cancelled' ? 'Cancelled' : 'Confirmed'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {booking.notes || 'None'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CalendarBookingsPage;