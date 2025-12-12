/**
 * UI Module
 * 
 * This module handles all DOM manipulation, event listeners, and user interactions.
 * Separated from physics and rendering logic for clean architecture.
 * 
 * Responsibilities:
 * - Input handling (sliders, number inputs, selectors)
 * - Synchronization between slider and numeric inputs
 * - Button event handlers (Start, Pause, Reset)
 * - Results display updates
 * - Accessibility features (WCAG AA compliance)
 */

import { GRAVITY_PRESETS, validateParameters, calculateSimulationResults } from './physics.js';
import { CanvasRenderer } from './canvas.js';

/**
 * UI Controller Class
 * Manages all user interface interactions
 */
class UIController {
    constructor() {
        // DOM Element References
        this.elements = {
            // Inputs
            velocitySlider: document.getElementById('velocity-slider'),
            velocityInput: document.getElementById('velocity-input'),
            angleSlider: document.getElementById('angle-slider'),
            angleInput: document.getElementById('angle-input'),
            heightInput: document.getElementById('height-input'),
            gravitySelect: document.getElementById('gravity-select'),
            
            // Buttons
            simulateBtn: document.getElementById('simulate-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            resetBtn: document.getElementById('reset-btn'),
            
            // Results Display
            resultMaxHeight: document.getElementById('result-max-height'),
            resultDistance: document.getElementById('result-distance'),
            resultFlightTime: document.getElementById('result-flight-time'),
            resultFinalVelocity: document.getElementById('result-final-velocity'),
            
            // Canvas
            canvas: document.getElementById('simulation-canvas'),
            
            // Current time display (optional)
            currentTime: document.getElementById('current-time')
        };
        
        // Current parameters state
        this.params = {
            initialVelocity: 25,
            launchAngle: 45,
            initialHeight: 0,
            gravity: 9.81
        };
        
        // Simulation state
        this.simulationState = 'idle'; // 'idle', 'running', 'paused', 'completed'
        
        // Initialize Canvas Renderer
        this.renderer = new CanvasRenderer(this.elements.canvas);
        
        // Bind methods
        this.handleVelocityChange = this.handleVelocityChange.bind(this);
        this.handleAngleChange = this.handleAngleChange.bind(this);
        this.handleHeightChange = this.handleHeightChange.bind(this);
        this.handleGravityChange = this.handleGravityChange.bind(this);
        this.handleSimulate = this.handleSimulate.bind(this);
        this.handlePause = this.handlePause.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.handleResize = this.handleResize.bind(this);
        
        // Initialize
        this.init();
    }
    
    /**
     * Initializes the UI controller
     */
    init() {
        this.setupEventListeners();
        this.populateGravitySelect();
        this.syncInputsFromParams();
        this.updatePreview();
        this.updateButtonStates();
    }
    
    /**
     * Sets up all event listeners
     */
    setupEventListeners() {
        // Velocity input synchronization
        this.elements.velocitySlider?.addEventListener('input', this.handleVelocityChange);
        this.elements.velocityInput?.addEventListener('input', this.handleVelocityChange);
        this.elements.velocityInput?.addEventListener('change', this.handleVelocityChange);
        
        // Angle input synchronization
        this.elements.angleSlider?.addEventListener('input', this.handleAngleChange);
        this.elements.angleInput?.addEventListener('input', this.handleAngleChange);
        this.elements.angleInput?.addEventListener('change', this.handleAngleChange);
        
        // Height input
        this.elements.heightInput?.addEventListener('input', this.handleHeightChange);
        this.elements.heightInput?.addEventListener('change', this.handleHeightChange);
        
        // Gravity select
        this.elements.gravitySelect?.addEventListener('change', this.handleGravityChange);
        
        // Control buttons
        this.elements.simulateBtn?.addEventListener('click', this.handleSimulate);
        this.elements.pauseBtn?.addEventListener('click', this.handlePause);
        this.elements.resetBtn?.addEventListener('click', this.handleReset);
        
        // Window resize
        window.addEventListener('resize', this.debounce(this.handleResize, 250));
        
        // Keyboard shortcuts for accessibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
                this.handleSimulate();
            }
            if (e.key === 'Escape') {
                this.handleReset();
            }
            if (e.key === ' ' && this.simulationState === 'running') {
                e.preventDefault();
                this.handlePause();
            }
        });
    }
    
    /**
     * Populates the gravity select dropdown with presets
     */
    populateGravitySelect() {
        const select = this.elements.gravitySelect;
        if (!select) return;
        
        select.innerHTML = '';
        
        Object.entries(GRAVITY_PRESETS).forEach(([key, preset]) => {
            const option = document.createElement('option');
            option.value = preset.value;
            option.textContent = `${preset.icon} ${preset.label} (${preset.value} m/s²)`;
            option.dataset.key = key;
            select.appendChild(option);
        });
    }
    
    /**
     * Synchronizes input elements with current params
     */
    syncInputsFromParams() {
        if (this.elements.velocitySlider) {
            this.elements.velocitySlider.value = this.params.initialVelocity;
        }
        if (this.elements.velocityInput) {
            this.elements.velocityInput.value = this.params.initialVelocity;
        }
        if (this.elements.angleSlider) {
            this.elements.angleSlider.value = this.params.launchAngle;
        }
        if (this.elements.angleInput) {
            this.elements.angleInput.value = this.params.launchAngle;
        }
        if (this.elements.heightInput) {
            this.elements.heightInput.value = this.params.initialHeight;
        }
        if (this.elements.gravitySelect) {
            this.elements.gravitySelect.value = this.params.gravity;
        }
    }
    
    /**
     * Handles velocity input changes
     * Synchronizes slider and number input
     * @param {Event} event - Input event
     */
    handleVelocityChange(event) {
        let value = parseFloat(event.target.value);
        
        // Clamp value to valid range
        value = Math.max(0, Math.min(100, value));
        
        // Handle NaN
        if (isNaN(value)) value = 0;
        
        this.params.initialVelocity = value;
        
        // Sync both inputs
        if (this.elements.velocitySlider && event.target !== this.elements.velocitySlider) {
            this.elements.velocitySlider.value = value;
        }
        if (this.elements.velocityInput && event.target !== this.elements.velocityInput) {
            this.elements.velocityInput.value = value;
        }
        
        this.updatePreview();
    }
    
    /**
     * Handles angle input changes
     * Synchronizes slider and number input
     * @param {Event} event - Input event
     */
    handleAngleChange(event) {
        let value = parseFloat(event.target.value);
        
        // Clamp value to valid range (0-90 degrees)
        value = Math.max(0, Math.min(90, value));
        
        // Handle NaN
        if (isNaN(value)) value = 45;
        
        this.params.launchAngle = value;
        
        // Sync both inputs
        if (this.elements.angleSlider && event.target !== this.elements.angleSlider) {
            this.elements.angleSlider.value = value;
        }
        if (this.elements.angleInput && event.target !== this.elements.angleInput) {
            this.elements.angleInput.value = value;
        }
        
        this.updatePreview();
    }
    
    /**
     * Handles height input changes
     * @param {Event} event - Input event
     */
    handleHeightChange(event) {
        let value = parseFloat(event.target.value);
        
        // Ensure non-negative
        value = Math.max(0, value);
        
        // Handle NaN
        if (isNaN(value)) value = 0;
        
        this.params.initialHeight = value;
        this.elements.heightInput.value = value;
        
        this.updatePreview();
    }
    
    /**
     * Handles gravity selection changes
     * @param {Event} event - Change event
     */
    handleGravityChange(event) {
        const value = parseFloat(event.target.value);
        this.params.gravity = value;
        
        this.updatePreview();
    }
    
    /**
     * Handles simulate button click
     */
    handleSimulate() {
        // Validate parameters
        const validation = validateParameters(this.params);
        if (!validation.valid) {
            this.showErrors(validation.errors);
            return;
        }
        
        // Update simulation state
        this.simulationState = 'running';
        this.updateButtonStates();
        
        // Update renderer params
        this.renderer.setParams(this.params);
        
        // Start simulation
        this.renderer.startSimulation(
            () => this.handleSimulationComplete(),
            (time, position) => this.handleSimulationUpdate(time, position)
        );
    }
    
    /**
     * Handles pause/resume button click
     */
    handlePause() {
        if (this.simulationState === 'running') {
            this.renderer.pause();
            this.simulationState = 'paused';
        } else if (this.simulationState === 'paused') {
            this.renderer.resume();
            this.simulationState = 'running';
        }
        
        this.updateButtonStates();
    }
    
    /**
     * Handles reset button click
     */
    handleReset() {
        this.renderer.reset();
        this.simulationState = 'idle';
        this.clearResults();
        this.updateButtonStates();
        this.updatePreview();
    }
    
    /**
     * Called when simulation completes
     */
    handleSimulationComplete() {
        this.simulationState = 'completed';
        this.updateButtonStates();
        
        // Update final results
        const results = calculateSimulationResults(this.params);
        this.displayResults(results);
    }
    
    /**
     * Called on each animation frame during simulation
     * @param {number} time - Current simulation time
     * @param {Object} position - Current position {x, y}
     */
    handleSimulationUpdate(time, position) {
        if (this.elements.currentTime) {
            this.elements.currentTime.textContent = time.toFixed(2);
        }
    }
    
    /**
     * Handles window resize
     */
    handleResize() {
        this.renderer.handleResize();
    }
    
    /**
     * Updates the trajectory preview
     */
    updatePreview() {
        // Only update preview if not currently simulating
        if (this.simulationState === 'idle' || this.simulationState === 'completed') {
            this.renderer.setParams(this.params);
            const results = this.renderer.updatePreview();
            this.displayResults(results);
        }
    }
    
    /**
     * Displays simulation results in the UI
     * @param {Object} results - Calculation results
     */
    displayResults(results) {
        if (this.elements.resultMaxHeight) {
            this.elements.resultMaxHeight.textContent = results.maxHeight.toFixed(1);
        }
        if (this.elements.resultDistance) {
            this.elements.resultDistance.textContent = results.range.toFixed(1);
        }
        if (this.elements.resultFlightTime) {
            this.elements.resultFlightTime.textContent = results.flightTime.toFixed(2);
        }
        if (this.elements.resultFinalVelocity) {
            this.elements.resultFinalVelocity.textContent = results.finalVelocity.toFixed(1);
        }
    }
    
    /**
     * Clears the results display
     */
    clearResults() {
        if (this.elements.resultMaxHeight) {
            this.elements.resultMaxHeight.textContent = '--';
        }
        if (this.elements.resultDistance) {
            this.elements.resultDistance.textContent = '--';
        }
        if (this.elements.resultFlightTime) {
            this.elements.resultFlightTime.textContent = '--';
        }
        if (this.elements.resultFinalVelocity) {
            this.elements.resultFinalVelocity.textContent = '--';
        }
        if (this.elements.currentTime) {
            this.elements.currentTime.textContent = '0.00';
        }
    }
    
    /**
     * Updates button states based on simulation state
     */
    updateButtonStates() {
        const { simulateBtn, pauseBtn, resetBtn } = this.elements;
        
        switch (this.simulationState) {
            case 'idle':
                if (simulateBtn) {
                    simulateBtn.disabled = false;
                    simulateBtn.textContent = 'Simulate';
                }
                if (pauseBtn) {
                    pauseBtn.disabled = true;
                    pauseBtn.textContent = 'Pause';
                }
                if (resetBtn) {
                    resetBtn.disabled = true;
                }
                break;
                
            case 'running':
                if (simulateBtn) {
                    simulateBtn.disabled = true;
                }
                if (pauseBtn) {
                    pauseBtn.disabled = false;
                    pauseBtn.textContent = 'Pause';
                }
                if (resetBtn) {
                    resetBtn.disabled = false;
                }
                break;
                
            case 'paused':
                if (simulateBtn) {
                    simulateBtn.disabled = true;
                }
                if (pauseBtn) {
                    pauseBtn.disabled = false;
                    pauseBtn.textContent = 'Resume';
                }
                if (resetBtn) {
                    resetBtn.disabled = false;
                }
                break;
                
            case 'completed':
                if (simulateBtn) {
                    simulateBtn.disabled = false;
                    simulateBtn.textContent = 'Simulate Again';
                }
                if (pauseBtn) {
                    pauseBtn.disabled = true;
                    pauseBtn.textContent = 'Pause';
                }
                if (resetBtn) {
                    resetBtn.disabled = false;
                }
                break;
        }
    }
    
    /**
     * Shows error messages to the user
     * @param {string[]} errors - Array of error messages
     */
    showErrors(errors) {
        // Simple alert for now - can be enhanced with toast notifications
        alert('Validation Errors:\n' + errors.join('\n'));
    }
    
    /**
     * Debounce utility function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Gets current parameters
     * @returns {Object} Current simulation parameters
     */
    getParams() {
        return { ...this.params };
    }
    
    /**
     * Sets parameters programmatically
     * @param {Object} params - Parameters to set
     */
    setParams(params) {
        this.params = { ...this.params, ...params };
        this.syncInputsFromParams();
        this.updatePreview();
    }
}

// Export for use in main.js
export { UIController };
