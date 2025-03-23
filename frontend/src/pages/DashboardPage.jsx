import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';

// Register the chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function DashboardPage() {
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Add new state for analytics
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Add new state for the embed code modal
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [selectedCalendarId, setSelectedCalendarId] = useState(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        const res = await api.get('/calendars');
        setCalendars(res.data.data);
        setLoading(false);
        
        // If we have calendars, fetch analytics data
        if (res.data.data.length > 0) {
          fetchAnalytics();
        } else {
          setAnalyticsLoading(false);
        }
      } catch (err) {
        setError('Failed to load calendars');
        setLoading(false);
        setAnalyticsLoading(false);
        console.error('Error fetching calendars:', err);
      }
    };

    fetchCalendars();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      // Fetch booking data for all user's calendars
      console.log('Fetching booking data for analytics...');
      const res = await api.get('/bookings');
      console.log('Booking data received:', res.data);
      
      // Check if we have valid data
      if (res.data && res.data.success && res.data.data && res.data.data.length > 0) {
        console.log(`Processing ${res.data.data.length} bookings for analytics`);
        // Process booking data to create analytics
        const bookings = res.data.data;
        
        // Monthly booking counts (for the last 6 months)
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        const monthlyData = Array(6).fill(0);
        const monthLabels = Array(6).fill('').map((_, i) => {
          const monthIndex = (now.getMonth() - (5 - i) + 12) % 12;
          return monthNames[monthIndex];
        });
        
        // Status distribution
        const statusCounts = {
          confirmed: 0,
          pending: 0,
          cancelled: 0
        };
        
        // Day of week popularity
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayDistribution = Array(7).fill(0);
        
        // Populate the data
        bookings.forEach(booking => {
          try {
            const bookingDate = new Date(booking.date);
            const monthsAgo = (now.getMonth() - bookingDate.getMonth() + 12) % 12;
            
            if (monthsAgo < 6) {
              const index = 5 - monthsAgo;
              monthlyData[index]++;
            }
            
            // Handle pending status which might not be explicitly set in the model
            const status = booking.status || 'confirmed';
            statusCounts[status]++;
            
            const dayOfWeek = bookingDate.getDay();
            dayDistribution[dayOfWeek]++;
          } catch (err) {
            console.error('Error processing booking:', booking, err);
          }
        });
        
        setAnalytics({
          monthly: {
            labels: monthLabels,
            data: monthlyData
          },
          status: {
            labels: ['Confirmed', 'Pending', 'Cancelled'],
            data: [statusCounts.confirmed, statusCounts.pending, statusCounts.cancelled]
          },
          dayOfWeek: {
            labels: dayNames,
            data: dayDistribution
          },
          noData: false
        });
        
        setShowAnalytics(true);
      } else {
        // If no bookings data, initialize with empty data
        console.log('No booking data available, showing default analytics');
        setAnalytics({
          monthly: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [0, 0, 0, 0, 0, 0]
          },
          status: {
            labels: ['Confirmed', 'Pending', 'Cancelled'],
            data: [0, 0, 0]
          },
          dayOfWeek: {
            labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            data: [0, 0, 0, 0, 0, 0, 0]
          },
          noData: true
        });
        
        // Still show the analytics section but with empty data
        setShowAnalytics(true);
      }
      
      setAnalyticsLoading(false);
    } catch (err) {
      console.error('Error generating analytics:', err);
      setAnalyticsLoading(false);
      
      // Show empty analytics section on error
      setAnalytics({
        monthly: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [0, 0, 0, 0, 0, 0]
        },
        status: {
          labels: ['Confirmed', 'Pending', 'Cancelled'],
          data: [0, 0, 0]
        },
        dayOfWeek: {
          labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          data: [0, 0, 0, 0, 0, 0, 0]
        },
        noData: true
      });
      setShowAnalytics(true);
    }
  };

  const handleDeleteCalendar = async (id) => {
    if (!window.confirm('Are you sure you want to delete this calendar?')) {
      return;
    }
    
    try {
      await api.delete(`/calendars/${id}`);
      // Remove the deleted calendar from state
      setCalendars(calendars.filter(calendar => calendar._id !== id));
    } catch (err) {
      setError('Failed to delete calendar');
      console.error('Error deleting calendar:', err);
    }
  };

  const handleShowEmbedCode = (calendarId) => {
    setSelectedCalendarId(calendarId);
    setShowEmbedModal(true);
    setCopiedToClipboard(false);
  };

  const handleCloseModal = () => {
    setShowEmbedModal(false);
    setSelectedCalendarId(null);
  };

  const copyEmbedCodeToClipboard = (codeType) => {
    const calendar = calendars.find(cal => cal._id === selectedCalendarId);
    if (!calendar) return;
    
    let codeToClipboard;
    
    if (codeType === 'iframe') {
      codeToClipboard = `<iframe src="${window.location.origin}/calendar/${calendar.publicId}/embed" width="100%" height="600" frameborder="0" scrolling="no"></iframe>`;
    } else if (codeType === 'javascript') {
      codeToClipboard = `<!-- Schedly Calendar Widget -->
<div id="schedly-calendar-${calendar.publicId.substring(0, 6)}"></div>
<script src="${window.location.origin}/embed.js"></script>
<script>
  SchedlyEmbed.init({
    redirectToBooking: true,
    openInNewTab: false
  }).createCalendar('${calendar.publicId}', 'schedly-calendar-${calendar.publicId.substring(0, 6)}');
</script>`;
    }
    
    navigator.clipboard.writeText(codeToClipboard)
      .then(() => {
        setCopiedToClipboard(codeType);
        setTimeout(() => setCopiedToClipboard(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy embed code:', err);
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Calendars</h1>
        <Link
          to="/calendar"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded transition border border-gray-300"
        >
          Create New Calendar
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Analytics Section */}
      {showAnalytics && (
        <div className="mb-10 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Booking Analytics</h2>
            <div className="text-sm text-gray-500">
              {analytics && analytics.noData 
                ? "No booking data available yet" 
                : "Based on all your calendars"}
            </div>
          </div>
          
          {analyticsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
            </div>
          ) : analytics && analytics.noData ? (
            <div className="text-center py-10">
              <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Booking Data Yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                As your calendars receive bookings, you'll see analytics about booking trends, popular times, and status distributions here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Monthly Booking Chart */}
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <h3 className="text-md font-medium text-gray-700 mb-4">Monthly Bookings</h3>
                <div className="h-64">
                  {analytics && (
                    <Bar
                      data={{
                        labels: analytics.monthly.labels,
                        datasets: [
                          {
                            label: 'Bookings',
                            data: analytics.monthly.data,
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
                          },
                          tooltip: {
                            callbacks: {
                              title: function(tooltipItems) {
                                return tooltipItems[0].label + ' ' + new Date().getFullYear();
                              }
                            }
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
                  )}
                </div>
              </div>
              
              {/* Status Distribution */}
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <h3 className="text-md font-medium text-gray-700 mb-4">Booking Status</h3>
                <div className="h-64 flex items-center justify-center">
                  {analytics && (
                    <Pie
                      data={{
                        labels: analytics.status.labels,
                        datasets: [
                          {
                            data: analytics.status.data,
                            backgroundColor: [
                              'rgba(34, 197, 94, 0.7)', // green
                              'rgba(234, 179, 8, 0.7)',  // yellow
                              'rgba(239, 68, 68, 0.7)',  // red
                            ],
                            borderColor: [
                              'rgb(34, 197, 94)',
                              'rgb(234, 179, 8)',
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
                  )}
                </div>
              </div>
              
              {/* Day of Week Popularity */}
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <h3 className="text-md font-medium text-gray-700 mb-4">Most Popular Days</h3>
                <div className="h-64">
                  {analytics && (
                    <Line
                      data={{
                        labels: analytics.dayOfWeek.labels,
                        datasets: [
                          {
                            label: 'Bookings',
                            data: analytics.dayOfWeek.data,
                            borderColor: 'rgb(79, 70, 229)',
                            backgroundColor: 'rgba(79, 70, 229, 0.1)',
                            tension: 0.3,
                            fill: true,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
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
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {calendars.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No Calendars Yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first calendar to start accepting bookings.
          </p>
          <Link
            to="/calendar"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded transition border border-gray-300 inline-block"
          >
            Create Calendar
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calendar Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Public Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calendars.map((calendar) => (
                  <tr key={calendar._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {calendar.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2 max-w-[300px]">
                        {calendar.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {calendar.duration} minutes
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-blue-500 hover:text-blue-700">
                        <a
                          href={`/calendar/${calendar.publicId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate max-w-[150px] inline-block"
                        >
                          {`${window.location.host}/calendar/${calendar.publicId}`}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/calendar/${calendar._id}/edit`}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs transition border border-gray-300"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleShowEmbedCode(calendar._id)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs transition border border-gray-300"
                        >
                          Embed
                        </button>
                        <Link
                          to={`/calendar/${calendar._id}/bookings`}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs transition border border-blue-200"
                        >
                          Bookings
                        </Link>
                        <button
                          onClick={() => handleDeleteCalendar(calendar._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1 rounded text-xs transition border border-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Embed Code Modal */}
      {showEmbedModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Embed Calendar</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Use this code to embed your calendar on your website</p>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">iFrame Embed</h4>
              <div className="relative">
                <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto mb-2">
                  {`<iframe src="${window.location.origin}/calendar/${calendars.find(cal => cal._id === selectedCalendarId)?.publicId}/embed" width="100%" height="600" frameborder="0" scrolling="no"></iframe>`}
                </pre>
                <button
                  onClick={() => copyEmbedCodeToClipboard('iframe')}
                  className={`text-xs px-3 py-1 rounded absolute top-2 right-2 ${
                    copiedToClipboard === 'iframe' ? 'bg-green-100 text-green-800' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {copiedToClipboard === 'iframe' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">JavaScript Embed (Recommended)</h4>
              <div className="relative">
                <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto mb-2">
                  {`<!-- Schedly Calendar Widget -->
<div id="schedly-calendar-${calendars.find(cal => cal._id === selectedCalendarId)?.publicId.substring(0, 6)}"></div>
<script src="${window.location.origin}/embed.js"></script>
<script>
  SchedlyEmbed.init({
    redirectToBooking: true,
    openInNewTab: false
  }).createCalendar('${calendars.find(cal => cal._id === selectedCalendarId)?.publicId}', 'schedly-calendar-${calendars.find(cal => cal._id === selectedCalendarId)?.publicId.substring(0, 6)}');
</script>`}
                </pre>
                <button
                  onClick={() => copyEmbedCodeToClipboard('javascript')}
                  className={`text-xs px-3 py-1 rounded absolute top-2 right-2 ${
                    copiedToClipboard === 'javascript' ? 'bg-green-100 text-green-800' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {copiedToClipboard === 'javascript' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage; 