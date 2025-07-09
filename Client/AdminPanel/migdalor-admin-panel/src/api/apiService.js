// /src/api/apiService.js

import { API_BASE_URL } from '../config';

/**
 * A wrapper around the Fetch API to handle common API request logic,
 * including authorization, content type, and error handling.
 */
export const api = {
    /**
     * The core request method that all other methods use.
     * @param {string} endpoint - The API endpoint to call (e.g., '/Users/login').
     * @param {object} options - The options object for the fetch call.
     * @returns {Promise<any>} - A promise that resolves with the response data.
     */
    async request(endpoint, options) {
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, options);

        // Handle unauthorized responses, which might indicate an expired token.
        if (response.status === 401) {
            // In a real app, you might trigger a global logout or token refresh.
            throw new Error("Unauthorized");
        }

        // Handle responses with no content.
        if (response.headers.get("content-length") === "0" || response.status === 204) {
            return null;
        }

        // Determine how to parse the response based on content type.
        const contentType = response.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        // Handle non-successful responses.
        if (!response.ok) {
            // Try to parse a specific error message from the response body,
            // otherwise fall back to the HTTP status text.
            const errorMessage =
                typeof data === "object" && data.message
                    ? data.message
                    : data || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }

        return data;
    },

    /**
     * Performs a GET request.
     * @param {string} endpoint - The API endpoint.
     * @param {string} token - The JWT for authorization.
     * @returns {Promise<any>}
     */
    async get(endpoint, token) {
        return this.request(endpoint, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
    },

    /**
     * Performs a POST request with a JSON body.
     * @param {string} endpoint - The API endpoint.
     * @param {object} body - The JSON payload.
     * @param {string|null} [token=null] - The JWT for authorization (optional).
     * @returns {Promise<any>}
     */
    async post(endpoint, body, token = null) {
        const headers = { "Content-Type": "application/json" };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        return this.request(endpoint, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });
    },

    /**
     * Performs a PUT request with a JSON body.
     * @param {string} endpoint - The API endpoint.
     * @param {object} body - The JSON payload.
     * @param {string} token - The JWT for authorization.
     * @returns {Promise<any>}
     */
    async put(endpoint, body, token) {
        return this.request(endpoint, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
    },

    /**
     * Performs a DELETE request.
     * @param {string} endpoint - The API endpoint.
     * @param {string} token - The JWT for authorization.
     * @returns {Promise<any>}
     */
    async delete(endpoint, token) {
        return this.request(endpoint, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },

    /**
     * Performs a POST request with FormData, typically for file uploads.
     * @param {string} endpoint - The API endpoint.
     * @param {FormData} formData - The form data payload.
     * @param {string} token - The JWT for authorization.
     * @returns {Promise<any>}
     */
    async postForm(endpoint, formData, token) {
        // Note: We don't set the 'Content-Type' header for FormData.
        // The browser sets it automatically with the correct boundary.
        return this.request(endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });
    },
};
