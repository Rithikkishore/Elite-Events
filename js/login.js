document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    try {
        const result = await EventHubAPI.request("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });
        EventHubAPI.setSession(result.token, result.user);
        window.location.href = "dashboard.html";
    } catch (error) {
        alert(error.message);
    }
});