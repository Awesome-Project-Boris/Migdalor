import { API_BASE_URL } from "../config";

/**
 * A specific function to handle user login.
 * It does not use the generic 'request' function to have more control over the response.
 * @param {string} phoneNumber - The user's phone number.
 * @param {string} password - The user's password.
 * @returns {Promise<string>} - A promise that resolves with the JWT token as a string.
 * @throws {Error} - Throws an error for network issues or non-successful responses.
 */
async function handleLogin(phoneNumber, password) {
    const url = `${API_BASE_URL}/People/login`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ phoneNumber, password }),
        });

        const responseText = await response.text();

        if (!response.ok) {
            // Use the text from the response as the error message, or provide a fallback.
            throw new Error(responseText || `Login failed with status ${response.status}`);
        }

        // On success, the body is the token string itself.
        return responseText;

    } catch (error) {
        console.error("Login API Error:", error.message);
        throw error;
    }
}


/**
 * A generic request function to handle API calls with JSON data.
 *
 * @param {string} method - The HTTP method (e.g., 'GET', 'POST').
 * @param {string} endpoint - The API endpoint to call.
 * @param {object|null} body - The request body for methods like POST or PUT.
 * @param {string|null} token - The JWT for authorization.
 * @returns {Promise<any>} - A promise that resolves with the JSON response or null.
 * @throws {Error} - Throws an error for network issues or non-successful responses.
 */
async function request(method, endpoint, body = null, token = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const responseText = await response.text();

        if (!response.ok) {
            let errorData;
            try {
                // Try to parse the error response as JSON, as it might contain structured error details.
                errorData = JSON.parse(responseText);
            } catch (e) {
                // If parsing fails, use the raw text. Fallback to a generic status message.
                errorData = { message: responseText || `Request failed with status ${response.status}` };
            }
            throw new Error(errorData.message || 'An unknown API error occurred.');
        }

        // If the successful response has content, parse it as JSON.
        // Otherwise (e.g., for a DELETE request), return null.
        return responseText ? JSON.parse(responseText) : null;

    } catch (error) {
        console.error("API Service Error:", error.message);
        throw error; // Re-throw the error so the calling component can handle it.
    }
}

/**
 * A specific function to handle multipart/form-data uploads (e.g., images).
 *
 * @param {string} endpoint - The API endpoint to call.
 * @param {FormData} formData - The FormData object to be sent.
 * @param {string|null} token - The JWT for authorization.
 * @returns {Promise<any>} - A promise that resolves with the JSON response.
 * @throws {Error} - Throws an error for network issues or non-successful responses.
 */
async function postFormData(endpoint, formData, token = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {};

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // IMPORTANT: Do NOT set the 'Content-Type' header for FormData.
    // The browser automatically sets it to 'multipart/form-data' with the correct boundary.
    const options = {
        method: 'POST',
        headers,
        body: formData,
    };

    try {
        const response = await fetch(url, options);
        const responseText = await response.text();

        if (!response.ok) {
            let errorData;
            try {
                errorData = JSON.parse(responseText);
            } catch (e) {
                errorData = { message: responseText || `Request failed with status ${response.status}` };
            }
            throw new Error(errorData.message || 'An unknown API error occurred.');
        }

        return responseText ? JSON.parse(responseText) : null;

    } catch (error) {
        console.error("API FormData Error:", error.message);
        throw error;
    }
}

/**
 * A specific function to handle file downloads.
 *
 * @param {string} endpoint - The API endpoint to call for the file.
 * @param {string|null} token - The JWT for authorization.
 * @returns {Promise<Blob>} - A promise that resolves with the file as a Blob.
 * @throws {Error} - Throws an error for network issues or non-successful responses.
 */
async function downloadFile(endpoint, token = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {};

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
        method: 'GET',
        headers,
    };

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `File download failed with status ${response.status}`);
        }

        // Return the response as a blob, which can be used to create a download link.
        return response.blob();

    } catch (error) {
        console.error("API File Download Error:", error.message);
        throw error;
    }
}

export const api = {
    login: handleLogin,
    get: (endpoint, token) => request('GET', endpoint, null, token),
    post: (endpoint, body, token) => request('POST', endpoint, body, token),
    put: (endpoint, body, token) => request('PUT', endpoint, body, token),
    delete: (endpoint, token) => request('DELETE', endpoint, null, token),
    postFormData: (endpoint, formData, token) => postFormData(endpoint, formData, token),
    downloadFile: (endpoint, token) => downloadFile(endpoint, token),
};