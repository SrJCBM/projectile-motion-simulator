/**
 * API Module
 * 
 * This module handles all communication with the backend server.
 * Uses Fetch API for HTTP requests.
 * 
 * Endpoints:
 * - POST /api/simulations - Save a simulation
 * - GET /api/simulations - Get user's simulations history
 * - GET /api/simulations/:id - Get a specific simulation
 * - DELETE /api/simulations/:id - Delete a simulation
 * - POST /api/auth/register - Register a new user
 * - POST /api/auth/login - Login user
 * - POST /api/reports/generate - Generate PDF report
 */

// API Base URL - automatically detects environment
const API_BASE_URL = (() => {
    // In production (Render), API is on same origin
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return '/api';
    }
    // In development, API runs on port 3000
    return 'http://localhost:3000/api';
})();

/**
 * Custom error class for API errors
 */
class APIError extends Error {
    constructor(message, status, data = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

/**
 * Makes an HTTP request to the API
 * 
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} Response data
 * @throws {APIError} If request fails
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Default headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        // Parse response
        const data = await response.json().catch(() => null);
        
        // Check for errors
        if (!response.ok) {
            throw new APIError(
                data?.message || `HTTP Error: ${response.status}`,
                response.status,
                data
            );
        }
        
        return data;
    } catch (error) {
        if (error instanceof APIError) {
            throw error;
        }
        
        // Network error or other issues
        throw new APIError(
            'Network error. Please check your connection.',
            0,
            null
        );
    }
}

/* ========================
   Simulation Endpoints
   ======================== */

/**
 * Saves a simulation to the database
 * 
 * @param {Object} simulation - Simulation data
 * @param {Object} simulation.params - Input parameters
 * @param {Object} simulation.results - Calculation results
 * @param {string} simulation.name - Optional simulation name
 * @returns {Promise<Object>} Saved simulation with ID
 */
async function saveSimulation(simulation) {
    return apiRequest('/simulations', {
        method: 'POST',
        body: JSON.stringify(simulation)
    });
}

/**
 * Gets all simulations for the current user
 * 
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @returns {Promise<Object>} Paginated simulations list
 */
async function getSimulations({ page = 1, limit = 10 } = {}) {
    return apiRequest(`/simulations?page=${page}&limit=${limit}`);
}

/**
 * Gets a specific simulation by ID
 * 
 * @param {string} id - Simulation ID
 * @returns {Promise<Object>} Simulation data
 */
async function getSimulation(id) {
    return apiRequest(`/simulations/${id}`);
}

/**
 * Deletes a simulation
 * 
 * @param {string} id - Simulation ID
 * @returns {Promise<Object>} Deletion confirmation
 */
async function deleteSimulation(id) {
    return apiRequest(`/simulations/${id}`, {
        method: 'DELETE'
    });
}

/* ========================
   Auth Endpoints
   ======================== */

/**
 * Registers a new user
 * 
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.name - User display name
 * @returns {Promise<Object>} User data and auth token
 */
async function register(userData) {
    const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
    
    // Store token if registration successful
    if (response.token) {
        localStorage.setItem('authToken', response.token);
    }
    
    return response;
}

/**
 * Logs in a user
 * 
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} User data and auth token
 */
async function login(credentials) {
    const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    });
    
    // Store token if login successful
    if (response.token) {
        localStorage.setItem('authToken', response.token);
    }
    
    return response;
}

/**
 * Logs out the current user
 */
function logout() {
    localStorage.removeItem('authToken');
}

/**
 * Checks if user is authenticated
 * 
 * @returns {boolean} True if user has auth token
 */
function isAuthenticated() {
    return !!localStorage.getItem('authToken');
}

/* ========================
   Report Endpoints
   ======================== */

/**
 * Generates a PDF report for a simulation
 * 
 * @param {Object} reportData - Report data
 * @param {Object} reportData.params - Simulation parameters
 * @param {Object} reportData.results - Simulation results
 * @param {string} reportData.canvasImage - Base64 encoded canvas image
 * @returns {Promise<Blob>} PDF file blob
 */
async function generateReport(reportData) {
    const url = `${API_BASE_URL}/reports/generate`;
    
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const token = localStorage.getItem('authToken');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(reportData)
    });
    
    if (!response.ok) {
        throw new APIError(
            'Failed to generate report',
            response.status
        );
    }
    
    return response.blob();
}

/**
 * Downloads a generated PDF report
 * 
 * @param {Object} reportData - Report data
 * @param {string} filename - Download filename
 */
async function downloadReport(reportData, filename = 'simulation-report.pdf') {
    try {
        const blob = await generateReport(reportData);
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Failed to download report:', error);
        throw error;
    }
}

// Export API functions
export {
    APIError,
    saveSimulation,
    getSimulations,
    getSimulation,
    deleteSimulation,
    register,
    login,
    logout,
    isAuthenticated,
    generateReport,
    downloadReport
};
