import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import BookingPage from './pages/BookingPage';
import PublicCalendarPage from './pages/PublicCalendarPage';
import EmbedCalendarPage from './pages/EmbedCalendarPage';
import CalendarBookingsPage from './pages/CalendarBookingsPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Auth Context
import { useAuth } from './context/AuthContext';

// Layout component with Navbar and Footer
const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Simple layout for embedded views (no navbar/footer)
const EmbedLayout = () => {
  return (
    <div className="embed-layout">
      <Outlet />
    </div>
  );
};

function App() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return (
    <Router>
      <Routes>
        {/* Embedded routes without Navbar/Footer */}
        <Route element={<EmbedLayout />}>
          <Route path="/calendar/:publicId/embed" element={<EmbedCalendarPage />} />
        </Route>
        
        {/* Main routes with Navbar/Footer */}
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
          <Route path="/calendar/:publicId" element={<PublicCalendarPage />} />
          <Route path="/book/:publicId" element={<BookingPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/calendar" element={user ? <CalendarPage /> : <Navigate to="/login" />} />
          <Route path="/calendar/edit/:id" element={user ? <CalendarPage /> : <Navigate to="/login" />} />
          <Route path="/calendar/:id/bookings" element={user ? <CalendarBookingsPage /> : <Navigate to="/login" />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/*" 
            element={user && user.role === 'admin' ? <AdminPage /> : <Navigate to="/login" />} 
          />
          
          {/* Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
