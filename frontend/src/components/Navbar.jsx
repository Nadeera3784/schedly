import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div>
            <Link to="/" className="text-2xl font-bold text-white hover:text-indigo-100 transition duration-200">
              Schedly
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-white hover:text-indigo-100 transition duration-200">
              Home
            </Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="text-white hover:text-indigo-100 transition duration-200">
                  Dashboard
                </Link>
                
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-white hover:text-indigo-100 transition duration-200">
                    Admin
                  </Link>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md transition duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-indigo-100 transition duration-200">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md transition duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-4 md:hidden flex flex-col space-y-4 pb-4">
            <Link 
              to="/" 
              className="text-white hover:text-indigo-100 transition duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-white hover:text-indigo-100 transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                
                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-white hover:text-indigo-100 transition duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md transition duration-200 text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-white hover:text-indigo-100 transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 