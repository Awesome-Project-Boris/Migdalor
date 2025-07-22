import { API_BASE_URL } from "../config";

/**
 * A centralized handler for processing standard API responses (JSON or files).
 * It should be used for all API calls except for login.
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

    // Otherwise, handle as JSON for all other standard API calls
    return response.json();
};

/**
 * A specific handler for the login response, which is expected to be plain text (the JWT).
 * @param {Response} response - The raw response from the login fetch call.
 * @returns {Promise<string>} A promise that resolves to the token string.
 */
const handleLoginResponse = async (response) => {
    if (!response.ok) {
        // For login, the error message might be plain text
        const errorText = await response.text();
        throw new Error(errorText || `Login failed with status: ${response.status}`);
    }
    // The successful login response is the raw token string
    return response.text();
};


/**
 * A centralized API service for making requests to the backend.
 */
export const api = {
    API_BASE_URL,

    /**
     * NEW: Performs a login request and returns the raw token.
     * This function is specifically for user authentication.
     * @param {string} phoneNumber
     * @param {string} password
     * @returns {Promise<string>} The JWT token string.
     */
    async postLogin(phoneNumber, password) {
        const response = await fetch(`${API_BASE_URL}/People/login`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ PhoneNumber: phoneNumber, Password: password }),
        });
        // Use the new, specific handler for the login response
        return handleLoginResponse(response);
    },

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
     * Performs a POST request with a JSON body.
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
     * FIX: Added a new method specifically for file uploads using FormData.
     * This method correctly sends multipart/form-data requests.
     * @param {string} endpoint - The API endpoint to call.
     * @param {FormData} formData - The FormData object containing the file(s).
     * @param {string} [token] - The user's authentication token (optional).
     * @returns {Promise<any>} The response data.
     */
    async postFormData(endpoint, formData, token) {
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        // Note: We do NOT set 'Content-Type'. The browser automatically sets it
        // to 'multipart/form-data' with the correct boundary when the body is a FormData object.
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            headers,
            body: formData,
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
