import { Routes, Route, NavLink} from 'react-router-dom';
import AdminDashboardPage from './AdminDashboardPage';
import AdminUsersPage from './AdminUsersPage';
import AdminBookingsPage from './AdminBookingsPage';

function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-64 mb-6 md:mb-0 md:mr-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <nav>
              <ul className="space-y-2">
                <li>
                  <NavLink
                    to="/admin"
                    end
                    className={({ isActive }) =>
                      `block p-2 rounded-md ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/users"
                    className={({ isActive }) =>
                      `block p-2 rounded-md ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    Users
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/bookings"
                    className={({ isActive }) =>
                      `block p-2 rounded-md ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    Bookings
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<AdminDashboardPage />} />
            <Route path="/users" element={<AdminUsersPage />} />
            <Route path="/bookings" element={<AdminBookingsPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default AdminPage; 