/* =================================
   ELITE EVENTS - MY BOOKINGS
================================= */

// Check login
if (EventHubAPI.requireAuth()) {

    const user = EventHubAPI.getUser();

    if (user) {
        document.getElementById("userName").textContent = user.name;
    }

    loadBookings();
}


// =================================
// LOAD BOOKINGS FROM MONGODB
// =================================

async function loadBookings() {

    const list = document.getElementById("bookingsList");
    const empty = document.getElementById("emptyBookings");

    try {

        // Get bookings from MongoDB through Node.js API
        const result = await EventHubAPI.request("/api/bookings");

        const bookings = result.bookings || [];


        // Clear old booking cards
        list.innerHTML = "";


        // =================================
        // UPDATE SUMMARY
        // =================================

        document.getElementById("totalBookings").textContent =
            bookings.length;

        document.getElementById("pendingBookings").textContent =
            bookings.filter(
                (booking) =>
                    booking.bookingStatus === "Pending"
            ).length;


        // =================================
        // NO BOOKINGS
        // =================================

        if (bookings.length === 0) {

            empty.style.display = "block";

            return;
        }

        empty.style.display = "none";


        // =================================
        // CREATE BOOKING CARDS
        // =================================

        bookings.forEach((booking) => {

            const card = document.createElement("article");

            card.className = "booking-card";


            // =================================
            // TOP SECTION
            // =================================

            const top = document.createElement("div");

            top.className = "booking-card-top";


            const event = document.createElement("div");

            event.className = "booking-event";


            // Icon
            const icon = document.createElement("div");

            icon.className = "event-icon";

            icon.innerHTML =
                '<i class="fa-solid fa-calendar-check" aria-hidden="true"></i>';


            // Title section
            const title = document.createElement("div");


            const eventName = document.createElement("h3");

            eventName.textContent = booking.eventType;


            const id = document.createElement("p");

            id.className = "booking-id";

            id.textContent = booking.id;


            title.append(eventName, id);

            event.append(icon, title);


            // Status
            const status = document.createElement("span");

            status.className = "status";

            status.textContent = booking.bookingStatus;


            top.append(event, status);


            // =================================
            // BOOKING DETAILS
            // =================================

            const details = document.createElement("div");

            details.className = "booking-details";


            const bookingDetails = [

                [
                    "Event Date",
                    new Date(
                        `${booking.eventDate}T00:00:00`
                    ).toLocaleDateString("en-IN")
                ],

                [
                    "Time",
                    booking.eventTime
                ],

                [
                    "Guests",
                    String(booking.guests)
                ],

                [
                    "Venue",
                    booking.venue
                ],

                [
                    "Contact",
                    booking.email
                ]

            ];


            bookingDetails.forEach(([label, value]) => {

                const detail = document.createElement("div");

                detail.className = "booking-detail";


                const caption = document.createElement("span");

                caption.textContent = label;


                const content = document.createElement("strong");

                content.textContent = value;


                detail.append(caption, content);

                details.append(detail);

            });


            // Add everything to card
            card.append(top, details);

            list.append(card);

        });


    } catch (error) {

        console.error("My bookings error:", error);

        list.innerHTML = "";

        const errorMessage = document.createElement("p");

        errorMessage.textContent =
            "Unable to load your bookings: " + error.message;

        list.append(errorMessage);


        // If login expired
        if (!localStorage.getItem("authToken")) {

            window.location.href = "login.html";

        }

    }

}