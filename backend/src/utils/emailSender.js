const nodemailer = require('nodemailer');

// Email transporter configuration
const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "",
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || ""
  }
});

/**
 * Send a new booking confirmation email to the calendar owner
 * @param {Object} booking - The booking object
 * @param {Object} calendar - The calendar object
 * @param {Object} owner - The calendar owner
 * @returns {Promise} - The email send result
 */
const sendBookingNotification = async (booking, calendar, owner) => {
  // Format date and time for email
  const bookingDate = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: calendar.timezone
  });
  
  const startTime = `${booking.startTime}:00`;
  const endTime = `${booking.endTime}:00`;
  
  const message = {
    from: '"Schedly App" <noreply@schedly.com>',
    to: owner.email,
    subject: `New Booking: ${calendar.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">New Booking Notification</h2>
        <p>Hello ${owner.name},</p>
        <p>You have a new booking for your calendar "${calendar.name}":</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Date:</strong> ${bookingDate}</p>
          <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
          <p><strong>Booked by:</strong> ${booking.name}</p>
          <p><strong>Email:</strong> ${booking.email}</p>
          ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
        </div>
        
        <p>You can manage this booking from your dashboard.</p>
        <p>Thank you for using Schedly!</p>
      </div>
    `
  };
  
  return transport.sendMail(message);
};

/**
 * Send a booking confirmation email to the person who booked
 * @param {Object} booking - The booking object
 * @param {Object} calendar - The calendar object
 * @returns {Promise} - The email send result
 */
const sendBookingConfirmation = async (booking, calendar) => {
  // Format date and time for email
  const bookingDate = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: calendar.timezone
  });
  
  const startTime = `${booking.startTime}:00`;
  const endTime = `${booking.endTime}:00`;
  
  const message = {
    from: '"Schedly App" <noreply@schedly.com>',
    to: booking.email,
    subject: `Booking Confirmation: ${calendar.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Booking Confirmation</h2>
        <p>Hello ${booking.name},</p>
        <p>Your booking has been confirmed:</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Calendar:</strong> ${calendar.name}</p>
          <p><strong>Date:</strong> ${bookingDate}</p>
          <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
          ${booking.notes ? `<p><strong>Your Notes:</strong> ${booking.notes}</p>` : ''}
        </div>
        
        <p>If you need to cancel or reschedule, please contact the calendar owner.</p>
        <p>Thank you for using Schedly!</p>
      </div>
    `
  };
  
  return transport.sendMail(message);
};

module.exports = {
  sendBookingNotification,
  sendBookingConfirmation
}; 