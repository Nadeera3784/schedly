# Schedly - Calendar Booking Application

Schedly is a full-stack web application for managing scheduling and bookings. It allows users to create customizable calendars with availability settings, share public booking links, and manage appointments.

## Features

- **User Authentication**: Secure registration and login system
- **Calendar Management**: Create, edit, and delete calendars
- **Availability Settings**: Configure available days, hours, and time slots
- **Public Booking Links**: Share calendar links with others to book appointments
- **Embed Calendars**: Easily embed your booking calendar on any website
- **Booking Management**: View and manage all bookings in one dashboard
- **Email Notifications**: Automatic emails for booking confirmations
- **Admin Dashboard**: Manage users, calendars, and bookings
- **Responsive Design**: Modern and mobile-friendly interface

## Embedding Calendars

Schedly provides an easy way to embed your booking calendars on any website. This allows your clients to book appointments directly from your website without leaving the page.

### How to Embed

1. Navigate to your Dashboard
2. Find the calendar you want to embed
3. Click the "Embed" button
4. Copy the provided embed code

### Embed Code Example

```html
<iframe 
  src="http://localhost:5173/embed/calendar/[calendar-id]" 
  width="100%" 
  height="700px" 
  frameborder="0"
></iframe>
```

### Customization Options

You can customize the embedded calendar by adding parameters to the URL:

- `theme`: Choose between 'light' and 'dark' themes
- `hideHeader`: Set to 'true' to hide the calendar header
- `lang`: Set the calendar language (default: 'en')

Example with parameters:
```html
<iframe 
  src="http://localhost:5173/embed/calendar/[calendar-id]?theme=dark&hideHeader=true" 
  width="100%" 
  height="700px" 
  frameborder="0"
></iframe>
```

### Responsive Design

The embedded calendar is fully responsive and will adapt to any container size. You can adjust the iframe width and height to match your website's design.

### Security

- Embedded calendars inherit the availability and booking settings from your Schedly account
- No authentication tokens or sensitive data are exposed in the embed code
- Cross-Origin Resource Sharing (CORS) is properly configured for security

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer
- **Containerization**: Docker

## Installation and Setup

### Prerequisites

- Node.js and npm
- Docker and Docker Compose

### Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/schedly.git
   cd schedly
   ```

2. Start MongoDB using Docker Compose:
   ```
   docker-compose up -d
   ```

3. Setup Backend:
   ```
   cd backend
   npm install
   npm run seed  # Create admin user
   npm run dev   # Start development server
   ```

4. Setup Frontend:
   ```
   cd ../frontend
   npm install
   npm run dev
   ```

5. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Default Admin Credentials

- Email: admin@schedly.com
- Password: admin123

## API Documentation

The API endpoints are organized into the following categories:

- **Auth**: `/api/auth` - User registration, login, and profile
- **Calendar**: `/api/calendars` - Calendar CRUD operations
- **Booking**: `/api/bookings` - Booking creation and management
- **Admin**: `/api/admin` - Admin-specific operations

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://admin:password@localhost:27017/schedly?authSource=admin
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
FRONTEND_URL=http://localhost:5173
```

## License

MIT 