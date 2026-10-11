/* =================================
   ELITE EVENTS
   BOOKING CONFIRMATION
================================= */

const booking = JSON.parse(
    localStorage.getItem("currentBooking")
);


// =================================
// CHECK BOOKING
// =================================

if (!booking) {

    alert("No booking information found.");

    window.location.href = "booking.html";

}


// =================================
// DISPLAY BOOKING INFORMATION
// =================================

else {

    document.getElementById("bookingId").textContent =
        booking.id;

    document.getElementById("eventType").textContent =
        booking.eventType;

    document.getElementById("customerName").textContent =
        booking.customerName;

    document.getElementById("eventDate").textContent =
        formatDate(booking.eventDate);

    document.getElementById("eventTime").textContent =
        formatTime(booking.eventTime);

    document.getElementById("guests").textContent =
        booking.guests + " Guests";

    document.getElementById("venue").textContent =
        booking.venue;

    document.getElementById("bookingStatus").textContent =
        booking.bookingStatus;

}


// =================================
// FORMAT DATE
// =================================

function formatDate(dateString) {

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

}


// =================================
// FORMAT TIME
// =================================

function formatTime(timeString) {

    const [hours, minutes] = timeString.split(":");

    const date = new Date();

    date.setHours(hours);
    date.setMinutes(minutes);

    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
    });

}