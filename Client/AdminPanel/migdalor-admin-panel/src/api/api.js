// API Service for all HTTP requests
const API_BASE_URL = "http://192.168.0.160:44315/api";

const api = {
    async get(endpoint, token) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (response.status === 401) {
            throw new Error("Unauthorized");
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        if (
            response.headers.get("content-length") === "0" ||
            response.status === 204
        ) {
            return null;
        }
        return response.json();
    },

    async post(endpoint, body, token = null) {
        const headers = { "Content-Type": "application/json" };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || `HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        } else {
            return response.text();
        }
    },

    async put(endpoint, body, token) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        if (
            response.headers.get("content-length") === "0" ||
            response.status === 204
        ) {
            return null;
        }
        return response.json();
    },

    async delete(endpoint, token) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        if (
            response.headers.get("content-length") === "0" ||
            response.status === 204
        ) {
            return null;
        }
        return response.json();
    },
};

export default api;
