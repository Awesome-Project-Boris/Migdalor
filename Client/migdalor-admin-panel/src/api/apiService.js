import { API_BASE_URL } from "../config";

/**
 * A centralized handler for processing API responses.
 * It checks the content type to decide whether to return a file blob or JSON.
 * @param {Response} response - The raw response from the fetch call.
 * @returns {Promise<Blob|any>} A promise that resolves to a file blob or parsed JSON.
 */
const handleResponse = async (response) => {
    if (!response.ok) {
        // Attempt to parse error response as JSON for a more detailed message
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `Request failed with status: ${response.status}`;
        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return null; // Handle No Content responses
    }

    const contentType = response.headers.get("content-type");

    // If the response is an Excel file, return it as a blob for download
    if (contentType && contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
        return response.blob();
    }

    // Otherwise, handle as JSON for all other API calls
    return response.json();
};

/**
 * A centralized API service for making requests to the backend.
 */
export const api = {
    API_BASE_URL,

    /**
     * Performs a GET request.
     * @param {string} endpoint - The API endpoint to call.
     * @param {string} token - The user's authentication token.
     * @returns {Promise<any>} The response data (JSON or blob).
     */
    async get(endpoint, token) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    },

    /**
     * Performs a POST request.
     * @param {string} endpoint - The API endpoint to call.
     * @param {object} body - The request payload.
     * @param {string} [token] - The user's authentication token (optional).
     * @returns {Promise<any>} The response data.
     */
    async post(endpoint, body, token) {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });
        return handleResponse(response);
    },

    /**
   * Performs a PUT request.
   * @param {string} endpoint - The API endpoint to call.
   * @param {object} body - The request payload.
   * @param {string} token - The user's authentication token.
   * @returns {Promise<any>} The response data.
   */
    async put(endpoint, body, token) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });
        return handleResponse(response);
    },

    /**
   * Performs a DELETE request.
   * @param {string} endpoint - The API endpoint to call.
   * @param {string} token - The user's authentication token.
   * @returns {Promise<any>} The response data.
   */
    async delete(endpoint, token) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return handleResponse(response);
    },
};