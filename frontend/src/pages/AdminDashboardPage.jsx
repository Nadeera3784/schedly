import { useState, useEffect } from 'react';
import api from '../utils/api';

function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCalendars: 0,
    totalBookings: 0,
    pendingBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load statistics');
      setLoading(false);
      console.error('Error fetching admin stats:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
          <div className="text-indigo-600 text-3xl font-bold mb-2">{stats.totalUsers}</div>
          <div className="text-gray-500">Total Users</div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <div className="text-green-600 text-3xl font-bold mb-2">{stats.totalCalendars}</div>
          <div className="text-gray-500">Total Calendars</div>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <div className="text-blue-600 text-3xl font-bold mb-2">{stats.totalBookings}</div>
          <div className="text-gray-500">Total Bookings</div>
        </div>
        
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100">
          <div className="text-yellow-600 text-3xl font-bold mb-2">{stats.pendingBookings}</div>
          <div className="text-gray-500">Pending Bookings</div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage; 