document.getElementById("registerForm").addEventListener("submit", async function (event) {
	event.preventDefault();

	const name = document.getElementById("name").value.trim();
	const email = document.getElementById("email").value.trim();
	const password = document.getElementById("password").value;
	const confirm = document.getElementById("confirmPassword").value;

	if (password !== confirm) {
		alert("Passwords do not match!");
		return;
	}

	try {
		await EventHubAPI.request("/api/auth/register", {
			method: "POST",
			body: JSON.stringify({ name, email, password })
		});
		alert("Registration Successful!");
		window.location.href = "login.html";
	} catch (error) {
		alert(error.message);
	}
});