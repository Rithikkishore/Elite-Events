window.EventHubAPI = {
    getUser() {
        try {
            return JSON.parse(localStorage.getItem("loggedInUser"));
        } catch {
            return null;
        }
    },

    setSession(token, user) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("loggedInUser", JSON.stringify(user));
    },

    clearSession() {
        localStorage.removeItem("authToken");
        localStorage.removeItem("loggedInUser");
    },

    requireAuth() {
        if (!localStorage.getItem("authToken")) {
            window.location.href = "login.html";
            return false;
        }
        return true;
    },

    async request(path, options = {}) {
        const headers = { ...(options.headers || {}) };
        const token = localStorage.getItem("authToken");
        if (options.body) headers["Content-Type"] = "application/json";
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(path, { ...options, headers });
        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401) this.clearSession();
            throw new Error(data.error || "Request failed. Please try again.");
        }
        return data;
    }
};