/* =================================
   ELITE EVENTS - BOOKING SYSTEM
================================= */

// =================================
// CHECK LOGIN
// =================================

if (!EventHubAPI.requireAuth()) {
    throw new Error("User is not logged in.");
}


// =================================
// LOAD LOGGED-IN USER
// =================================

const loggedInUser = EventHubAPI.getUser();

if (loggedInUser) {

    const nameField = document.getElementById("fullName");
    const emailField = document.getElementById("email");

    if (nameField && loggedInUser.name) {
        nameField.value = loggedInUser.name;
    }

    if (emailField && loggedInUser.email) {
        emailField.value = loggedInUser.email;
    }
}


/* =================================
   BOOKING FORM
================================= */

const bookingForm = document.getElementById("bookingForm");
const eventDate = document.getElementById("eventDate");


// =================================
// SET MINIMUM EVENT DATE
// =================================

const today = new Date();

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

const todayDate = `${year}-${month}-${day}`;

if (eventDate) {
    eventDate.min = todayDate;
}


// =================================
// BOOKING FORM SUBMIT
// =================================

bookingForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    // =================================
    // GET SELECTED EVENT
    // =================================

    const selectedEvent = document.querySelector(
        'input[name="eventType"]:checked'
    );

    if (!selectedEvent) {
        alert("Please select an event type.");
        return;
    }


    // =================================
    // GET FORM VALUES
    // =================================

    const fullName = document.getElementById("fullName").value.trim();

    const phone = document.getElementById("phone").value.trim();

    const email = document.getElementById("email").value.trim().toLowerCase();

    const guests = document.getElementById("guests").value;

    const date = document.getElementById("eventDate").value;

    const time = document.getElementById("eventTime").value;

    const venue = document.getElementById("venue").value.trim();

    const requirements =
        document.getElementById("requirements").value.trim();


    // =================================
    // NAME VALIDATION
    // =================================

    if (fullName.length < 3) {
        alert("Please enter a valid full name.");
        return;
    }


    // =================================
    // PHONE VALIDATION
    // =================================

    const phonePattern = /^[6-9]\d{9}$/;

    if (!phonePattern.test(phone)) {
        alert("Please enter a valid 10-digit Indian mobile number.");
        return;
    }


    // =================================
    // EMAIL VALIDATION
    // =================================

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }


    // =================================
    // GUEST VALIDATION
    // =================================

    if (Number(guests) < 1) {
        alert("Number of guests must be at least 1.");
        return;
    }


    // =================================
    // DATE VALIDATION
    // =================================

    if (!date) {
        alert("Please select your event date.");
        return;
    }

    if (date < todayDate) {
        alert("Please select a future event date.");
        return;
    }


    // =================================
    // TIME VALIDATION
    // =================================

    if (!time) {
        alert("Please select your event time.");
        return;
    }


    // =================================
    // VENUE VALIDATION
    // =================================

    if (venue.length < 3) {
        alert("Please enter a valid event venue.");
        return;
    }


    // =================================
    // CREATE BOOKING DATA
    // =================================

    const bookingData = {

        eventType: selectedEvent.value,

        customerName: fullName,

        phone: phone,

        email: email,

        guests: Number(guests),

        eventDate: date,

        eventTime: time,

        venue: venue,

        requirements: requirements
    };


    // =================================
    // SUBMIT TO MONGODB
    // =================================

    try {

        // Disable submit button while saving
        const submitButton = bookingForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";
        }


        // Send booking to Node.js backend
        const result = await EventHubAPI.request(
            "/api/bookings",
            {
                method: "POST",
                body: JSON.stringify(bookingData)
            }
        );


        // =================================
        // GET SAVED BOOKING
        // =================================

        const booking = result.booking;


        // =================================
        // SAVE CURRENT BOOKING
        // =================================

        localStorage.setItem(
            "currentBooking",
            JSON.stringify(booking)
        );


        // =================================
        // SUCCESS MESSAGE
        // =================================

        alert(
            "Booking request submitted successfully!\n\n" +
            "Booking ID: " + booking.id +
            "\nEvent: " + booking.eventType +
            "\nDate: " + booking.eventDate
        );


        // =================================
        // GO TO SUCCESS PAGE
        // =================================

        window.location.href = "bookings-success.html";


    } catch (error) {

        console.error("Booking error:", error);

        alert(
            "Booking could not be submitted.\n\n" +
            error.message
        );


        // Enable button again
        const submitButton = bookingForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Book Now";
        }
    }

});