/**
 * Main Application Entry Point
 * 
 * This module initializes the Projectile Motion Simulator application.
 * It bootstraps the UI controller and manages authentication and history.
 */

import { UIController } from './ui.js';
import * as api from './api.js';

/**
 * Application State
 */
const app = {
    ui: null,
    initialized: false,
    user: null,
    historyOpen: false
};

/**
 * DOM Elements for auth and history
 */
const authElements = {
    saveBtn: null,
    historyToggleBtn: null,
    userMenu: null,
    userName: null,
    logoutBtn: null,
    loginLink: null,
    historySidebar: null,
    historyList: null,
    historyCloseBtn: null,
    historyOverlay: null,
    toastContainer: null
};

/**
 * Shows a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', or default
 */
function showToast(message, type = 'default') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    
    authElements.toastContainer?.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * Formats a date for display in UTC-5 (Colombia/Peru/Ecuador time)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    
    // Format in UTC-5 timezone (America/Bogota)
    return date.toLocaleDateString('es-CO', {
        timeZone: 'America/Bogota',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

/**
 * Updates UI based on authentication state
 */
function updateAuthUI() {
    const isLoggedIn = api.isAuthenticated() && app.user;
    
    if (authElements.saveBtn) {
        authElements.saveBtn.style.display = isLoggedIn ? 'flex' : 'none';
    }
    if (authElements.historyToggleBtn) {
        authElements.historyToggleBtn.style.display = isLoggedIn ? 'flex' : 'none';
    }
    if (authElements.userMenu) {
        authElements.userMenu.style.display = isLoggedIn ? 'flex' : 'none';
    }
    if (authElements.loginLink) {
        authElements.loginLink.style.display = isLoggedIn ? 'none' : 'flex';
    }
    if (authElements.userName && app.user) {
        const userName = app.user.name || 'User';
        const lastLogin = app.user.lastLogin ? `\nÚltimo acceso: ${formatDate(app.user.lastLogin)}` : '';
        authElements.userName.textContent = userName;
        authElements.userName.title = `${userName}${lastLogin}`;
    }
}

/**
 * Checks if user is logged in and updates UI
 */
async function checkAuthStatus() {
    if (api.isAuthenticated()) {
        try {
            // Use same origin detection as api.js
            const apiBase = (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
                ? '/api'
                : 'http://localhost:3000/api';
            
            const response = await fetch(`${apiBase}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                app.user = data.user;
            } else {
                // Token invalid, clear it
                api.logout();
                app.user = null;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            app.user = null;
        }
    }
    
    updateAuthUI();
}

/**
 * Handles logout
 */
function handleLogout() {
    api.logout();
    app.user = null;
    updateAuthUI();
    closeHistory();
    showToast('Logged out successfully', 'success');
}

/**
 * Saves the current simulation
 */
async function saveSimulation() {
    if (!app.user) {
        showToast('Please log in to save simulations', 'error');
        return;
    }
    
    const params = app.ui.getParams();
    const results = app.ui.renderer.calculateResults();
    
    // Prompt for name
    const name = prompt('Enter a name for this simulation:', `Simulation ${new Date().toLocaleDateString()}`);
    
    if (!name) return; // Cancelled
    
    try {
        await api.saveSimulation({
            name,
            params: {
                initialVelocity: params.initialVelocity,
                launchAngle: params.launchAngle,
                initialHeight: params.initialHeight,
                gravity: params.gravity
            },
            results: {
                maxHeight: results.maxHeight,
                range: results.range,
                flightTime: results.flightTime,
                finalVelocity: results.finalVelocity
            }
        });
        
        showToast('Simulation saved!', 'success');
        
        // Refresh history if open
        if (app.historyOpen) {
            loadHistory();
        }
    } catch (error) {
        console.error('Save failed:', error);
        showToast('Failed to save simulation', 'error');
    }
}

/**
 * Loads simulation history from server
 */
async function loadHistory() {
    if (!app.user) return;
    
    authElements.historyList.innerHTML = '<p class="history-sidebar__empty">Loading...</p>';
    
    try {
        const response = await api.getSimulations({ limit: 50 });
        console.log('History response:', response);
        
        // Server returns 'data' not 'simulations'
        const simulations = response.data || [];
        console.log('Simulations found:', simulations.length);
        
        renderHistory(simulations);
    } catch (error) {
        console.error('Failed to load history:', error);
        authElements.historyList.innerHTML = `<p class="history-sidebar__empty">Failed to load history: ${error.message}</p>`;
    }
}

/**
 * Renders history items
 * @param {Array} simulations - Array of simulations
 */
function renderHistory(simulations) {
    if (!authElements.historyList) return;
    
    if (simulations.length === 0) {
        authElements.historyList.innerHTML = '<p class="history-sidebar__empty">No simulations saved yet.</p>';
        return;
    }
    
    authElements.historyList.innerHTML = simulations.map(sim => `
        <div class="history-item" data-id="${sim._id}">
            <div class="history-item__header">
                <h3 class="history-item__name">${escapeHtml(sim.name || 'Untitled')}</h3>
                <span class="history-item__date">${formatDate(sim.createdAt)}</span>
            </div>
            <div class="history-item__params">
                <span class="history-item__param">v₀: ${sim.params.initialVelocity} m/s</span>
                <span class="history-item__param">θ: ${sim.params.launchAngle}°</span>
                <span class="history-item__param">h: ${sim.params.initialHeight} m</span>
                <span class="history-item__param">g: ${sim.params.gravity} m/s²</span>
            </div>
            <div class="history-item__results">
                <div class="history-item__result">
                    <span class="history-item__result-label">Max Height: </span>
                    <span class="history-item__result-value">${sim.results.maxHeight.toFixed(1)} m</span>
                </div>
                <div class="history-item__result">
                    <span class="history-item__result-label">Distance: </span>
                    <span class="history-item__result-value">${sim.results.range.toFixed(1)} m</span>
                </div>
            </div>
            <div class="history-item__actions">
                <button class="history-item__btn history-item__btn--load" onclick="window.SimulatorApp.loadSimulation('${sim._id}')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="1 4 1 10 7 10"/>
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                    </svg>
                    Load
                </button>
                <button class="history-item__btn history-item__btn--delete" onclick="window.SimulatorApp.deleteSimulation('${sim._id}')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Escapes HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Opens the history sidebar
 */
function openHistory() {
    app.historyOpen = true;
    authElements.historySidebar?.classList.add('history-sidebar--open');
    authElements.historyOverlay?.classList.add('history-overlay--visible');
    loadHistory();
}

/**
 * Closes the history sidebar
 */
function closeHistory() {
    app.historyOpen = false;
    authElements.historySidebar?.classList.remove('history-sidebar--open');
    authElements.historyOverlay?.classList.remove('history-overlay--visible');
}

/**
 * Loads a simulation from history
 * @param {string} id - Simulation ID
 */
async function loadSimulation(id) {
    try {
        const response = await api.getSimulation(id);
        const sim = response.data || response.simulation;
        
        if (!sim) {
            throw new Error('Simulation data not found');
        }
        
        app.ui.setParams({
            initialVelocity: sim.params.initialVelocity,
            launchAngle: sim.params.launchAngle,
            initialHeight: sim.params.initialHeight,
            gravity: sim.params.gravity
        });
        
        closeHistory();
        showToast('Simulation loaded!', 'success');
    } catch (error) {
        console.error('Load failed:', error);
        showToast('Failed to load simulation', 'error');
    }
}

/**
 * Deletes a simulation from history
 * @param {string} id - Simulation ID
 */
async function deleteSimulation(id) {
    if (!confirm('Are you sure you want to delete this simulation?')) return;
    
    try {
        await api.deleteSimulation(id);
        showToast('Simulation deleted', 'success');
        loadHistory();
    } catch (error) {
        console.error('Delete failed:', error);
        showToast('Failed to delete simulation', 'error');
    }
}

/**
 * Initializes authentication-related event listeners
 */
function initAuthListeners() {
    // Cache elements
    authElements.saveBtn = document.getElementById('save-btn');
    authElements.historyToggleBtn = document.getElementById('history-toggle-btn');
    authElements.userMenu = document.getElementById('user-menu');
    authElements.userName = document.getElementById('user-name');
    authElements.logoutBtn = document.getElementById('logout-btn');
    authElements.loginLink = document.getElementById('login-link');
    authElements.historySidebar = document.getElementById('history-sidebar');
    authElements.historyList = document.getElementById('history-list');
    authElements.historyCloseBtn = document.getElementById('history-close-btn');
    authElements.historyOverlay = document.getElementById('history-overlay');
    authElements.toastContainer = document.getElementById('toast-container');
    
    // Add event listeners
    authElements.saveBtn?.addEventListener('click', saveSimulation);
    authElements.historyToggleBtn?.addEventListener('click', openHistory);
    authElements.logoutBtn?.addEventListener('click', handleLogout);
    authElements.historyCloseBtn?.addEventListener('click', closeHistory);
    authElements.historyOverlay?.addEventListener('click', closeHistory);
}

/**
 * Initializes the application
 */
async function initApp() {
    // Prevent double initialization
    if (app.initialized) {
        console.warn('Application already initialized');
        return;
    }
    
    try {
        console.log('🚀 Initializing Projectile Motion Simulator...');
        
        // Initialize UI Controller
        app.ui = new UIController();
        
        // Initialize auth-related features
        initAuthListeners();
        await checkAuthStatus();
        
        // Mark as initialized
        app.initialized = true;
        
        console.log('✅ Application initialized successfully');
        
        // Log instructions for users
        console.log(`
╔════════════════════════════════════════════════════════════╗
║         PROJECTILE MOTION SIMULATOR v1.0                   ║
╠════════════════════════════════════════════════════════════╣
║  Controls:                                                 ║
║  • Adjust sliders or input values to set parameters        ║
║  • Click "Simulate" to launch the projectile               ║
║  • Click "Pause" to pause/resume the animation             ║
║  • Click "Reset" to clear and start over                   ║
║                                                            ║
║  Keyboard Shortcuts:                                       ║
║  • Enter: Start simulation                                 ║
║  • Space: Pause/Resume (during simulation)                 ║
║  • Escape: Reset simulation                                ║
╚════════════════════════════════════════════════════════════╝
        `);
        
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        showErrorMessage('Failed to initialize the simulator. Please refresh the page.');
    }
}

/**
 * Shows an error message to the user
 * @param {string} message - Error message to display
 */
function showErrorMessage(message) {
    const main = document.getElementById('main-content');
    if (main) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-banner';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.innerHTML = `
            <p>⚠️ ${message}</p>
            <button onclick="location.reload()">Refresh Page</button>
        `;
        main.prepend(errorDiv);
    }
}

/**
 * Handles DOMContentLoaded event
 */
function onDOMReady() {
    // Small delay to ensure all resources are loaded
    requestAnimationFrame(() => {
        initApp();
    });
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDOMReady);
} else {
    // DOM already loaded
    onDOMReady();
}

// Export app instance for debugging and global access
window.SimulatorApp = {
    ...app,
    loadSimulation,
    deleteSimulation,
    saveSimulation,
    openHistory,
    closeHistory
};

export { app };
