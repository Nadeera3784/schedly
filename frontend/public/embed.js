/**
 * Schedly Embed Integration Script
 * This script allows third-party websites to handle interactions with embedded Schedly calendars.
 */

(function() {
  // Store settings globally
  window.SchedlyEmbed = {
    settings: {},
    init: function(options) {
      this.settings = {
        // Default settings
        redirectToBooking: true,
        openInNewTab: false,
        showName: true,
        showDescription: true,
        calendarWidth: '100%',
        calendarHeight: '500px',
        ...options
      };

      this.setupMessageListener();
      return this;
    },

    setupMessageListener: function() {
      // Listen for messages from the embedded calendar iframe
      window.addEventListener('message', function(event) {
        // Make sure the message is from a Schedly embed
        if (event.data && event.data.type === 'CALENDAR_DATE_SELECTED') {
          const { publicId, date } = event.data;
          
          if (SchedlyEmbed.settings.redirectToBooking) {
            const bookingUrl = `${getSchedlyHost()}/book/${publicId}?date=${date.split('T')[0]}`;
            
            if (SchedlyEmbed.settings.openInNewTab) {
              window.open(bookingUrl, '_blank');
            } else {
              window.location.href = bookingUrl;
            }
          }
          
          // Trigger a custom event for users who want to handle the selection themselves
          const customEvent = new CustomEvent('schedlyDateSelected', { 
            detail: {
              publicId,
              date,
              formattedDate: new Date(date).toLocaleDateString()
            } 
          });
          document.dispatchEvent(customEvent);
        }
      });
    },

    // Create a calendar embed and inject it into the specified element
    createCalendar: function(calendarId, targetElementId) {
      const targetElement = document.getElementById(targetElementId);
      if (!targetElement) {
        console.error(`Target element with ID "${targetElementId}" not found`);
        return;
      }

      const iframe = document.createElement('iframe');
      iframe.src = `${getSchedlyHost()}/calendar/${calendarId}/embed`;
      iframe.width = this.settings.calendarWidth;
      iframe.height = this.settings.calendarHeight;
      iframe.style.border = 'none';
      iframe.scrolling = 'no';
      iframe.frameBorder = '0';
      iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      
      targetElement.innerHTML = '';
      targetElement.appendChild(iframe);
    }
  };

  // Helper to get the Schedly host, either from script src or default
  function getSchedlyHost() {
    // Try to get the script source to determine the host
    const scripts = document.querySelectorAll('script[src*="embed.js"]');
    if (scripts.length > 0) {
      const src = scripts[0].getAttribute('src');
      const url = new URL(src, window.location.origin);
      return url.origin;
    }
    // If we can't determine, use the preset host or default
    return SchedlyEmbed.settings.host || window.location.origin;
  }
})();

// Usage example:
// 
// <div id="schedly-calendar"></div>
// <script src="https://your-schedly-app.com/embed.js"></script>
// <script>
//   SchedlyEmbed.init({
//     redirectToBooking: true,
//     openInNewTab: true
//   }).createCalendar('CALENDAR_PUBLIC_ID', 'schedly-calendar');
//   
//   // Optional: Handle the date selection event yourself
//   document.addEventListener('schedlyDateSelected', function(e) {
//     console.log('Selected date:', e.detail.formattedDate);
//     // Do something with the selection
//   });
// </script> 