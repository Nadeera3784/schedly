import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-indigo-600 text-white mt-auto py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div>
            <Link to="/" className="text-2xl font-bold text-white hover:text-indigo-100 transition duration-200">Schedly</Link>
            <p className="mt-2 text-indigo-100">
              A simple and elegant solution for managing your calendar bookings and appointments.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white hover:text-indigo-100 transition duration-200">Home</Link>
              </li>
              <li>
                <Link to="/login" className="text-white hover:text-indigo-100 transition duration-200">Login</Link>
              </li>
              <li>
                <Link to="/register" className="text-white hover:text-indigo-100 transition duration-200">Register</Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">Contact</h3>
            <ul className="space-y-2 text-indigo-100">
              <li>Email: info@schedly.com</li>
              <li>Phone: +1 (123) 456-7890</li>
              <li>Address: 123 Calendar St, Booking City</li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-indigo-500 mt-8 pt-6 text-center text-indigo-100">
          &copy; {currentYear} Schedly. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer; 