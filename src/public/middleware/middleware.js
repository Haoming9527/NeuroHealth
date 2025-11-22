// middleware.js - Client-side authentication middleware

/**
 * Check if user is authenticated
 * @returns {boolean} - True if authenticated, false otherwise
 */
function isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) {
        return false;
    }

    // Optional: Check if token is expired (if you implement JWT expiry)
    try {
        const tokenData = parseJWT(token);
        if (tokenData.exp && Date.now() >= tokenData.exp * 1000) {
            // Token expired
            logout();
            return false;
        }
        return true;
    } catch (error) {
        // Invalid token
        return false;
    }
}

/**
 * Parse JWT token (client-side - for reading only, not for verification)
 * @param {string} token - JWT token
 * @returns {object} - Decoded token payload
 */
function parseJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
    }
}

/**
 * Get stored authentication token
 * @returns {string|null} - Token or null if not found
 */
function getAuthToken() {
    return localStorage.getItem('token');
}

/**
 * Get stored user data
 * @returns {object|null} - User object or null if not found
 */
function getUserData() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        return null;
    }
    try {
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

/**
 * Logout user by clearing storage and redirecting
 */
const AUTH_PAGE = '/html/auth.html';
const DASHBOARD_PAGE = '/html/dashboard.html';

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = AUTH_PAGE;
}

/**
 * Protect a page - redirect to auth if not logged in
 * Call this function at the top of protected pages
 */
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = AUTH_PAGE;
    }
}

/**
 * Redirect to dashboard if already authenticated
 * Call this function on auth page to prevent logged-in users from accessing it
 */
function redirectIfAuthenticated() {
    if (isAuthenticated()) {
        window.location.href = DASHBOARD_PAGE;
    }
}

/**
 * Make authenticated API request
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();
    
    if (!token) {
        throw new Error('No authentication token found');
    }

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, mergedOptions);

        // Handle unauthorized responses
        if (response.status === 401) {
            logout();
            throw new Error('Session expired. Please login again.');
        }

        return response;
    } catch (error) {
        console.error('Authenticated fetch error:', error);
        throw error;
    }
}

/**
 * Display user info in UI
 * @param {string} elementId - ID of element to display user info
 */
function displayUserInfo(elementId) {
    const user = getUserData();
    const element = document.getElementById(elementId);
    
    if (user && element) {
        element.textContent = user.username;
    }
}

/**
 * Setup logout button
 * @param {string} buttonId - ID of logout button
 */
function setupLogoutButton(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isAuthenticated,
        parseJWT,
        getAuthToken,
        getUserData,
        logout,
        requireAuth,
        redirectIfAuthenticated,
        authenticatedFetch,
        displayUserInfo,
        setupLogoutButton
    };
}