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
import { t } from './i18n.js';

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
            previewBadge: document.getElementById('preview-badge'),
            
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
        const rawValue = event.target.value;
        let value = parseFloat(rawValue);
        const controlGroup = event.target.closest('.control-group');
        
        // Validate input
        let errorKey = null;
        
        if (rawValue !== '' && isNaN(value)) {
            errorKey = 'validationInvalidNumber';
        } else if (value < 0) {
            errorKey = 'validationVelocityNegative';
        } else if (value > 100) {
            errorKey = 'validationVelocityRange';
        }
        
        // Show/hide validation error
        this.setValidationError(controlGroup, errorKey);
        
        // Clamp value to valid range for internal use
        if (isNaN(value)) value = 0;
        value = Math.max(0, Math.min(100, value));
        
        this.params.initialVelocity = value;
        
        // Sync slider (always valid range)
        if (this.elements.velocitySlider && event.target !== this.elements.velocitySlider) {
            this.elements.velocitySlider.value = value;
        }
        // Only sync number input if coming from slider
        if (this.elements.velocityInput && event.target === this.elements.velocitySlider) {
            this.elements.velocityInput.value = value;
            this.clearValidationError(this.elements.velocityInput.closest('.control-group'));
        }
        
        this.updatePreview();
    }
    
    /**
     * Handles angle input changes
     * Synchronizes slider and number input
     * @param {Event} event - Input event
     */
    handleAngleChange(event) {
        const rawValue = event.target.value;
        let value = parseFloat(rawValue);
        const controlGroup = event.target.closest('.control-group');
        
        // Validate input
        let errorKey = null;
        
        if (rawValue !== '' && isNaN(value)) {
            errorKey = 'validationInvalidNumber';
        } else if (value < 0) {
            errorKey = 'validationAngleNegative';
        } else if (value > 90) {
            errorKey = 'validationAngleRange';
        }
        
        // Show/hide validation error
        this.setValidationError(controlGroup, errorKey);
        
        // Clamp value to valid range for internal use
        if (isNaN(value)) value = 45;
        value = Math.max(0, Math.min(90, value));
        
        this.params.launchAngle = value;
        
        // Sync slider (always valid range)
        if (this.elements.angleSlider && event.target !== this.elements.angleSlider) {
            this.elements.angleSlider.value = value;
        }
        // Only sync number input if coming from slider
        if (this.elements.angleInput && event.target === this.elements.angleSlider) {
            this.elements.angleInput.value = value;
            this.clearValidationError(this.elements.angleInput.closest('.control-group'));
        }
        
        this.updatePreview();
    }
    
    /**
     * Handles height input changes
     * @param {Event} event - Input event
     */
    handleHeightChange(event) {
        const rawValue = event.target.value;
        let value = parseFloat(rawValue);
        const controlGroup = event.target.closest('.control-group');
        
        // Validate input
        let errorKey = null;
        
        if (rawValue !== '' && isNaN(value)) {
            errorKey = 'validationInvalidNumber';
        } else if (value < 0) {
            errorKey = 'validationHeightNegative';
        } else if (value > 100) {
            errorKey = 'validationHeightRange';
        }
        
        // Show/hide validation error
        this.setValidationError(controlGroup, errorKey);
        
        // Clamp value to valid range for internal use
        if (isNaN(value)) value = 0;
        value = Math.max(0, Math.min(100, value));
        
        this.params.initialHeight = value;
        
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
        // Check for validation errors in UI
        if (this.hasValidationErrors()) {
            // Focus on first error field
            const firstError = document.querySelector('.control-group.has-error input');
            if (firstError) {
                firstError.focus();
                firstError.closest('.control-group').classList.add('shake');
                setTimeout(() => firstError.closest('.control-group').classList.remove('shake'), 400);
            }
            return;
        }
        
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
        // Only update the canvas preview; do not change result values here.
        // This prevents results from jumping instantly when moving sliders.
        if (this.simulationState === 'idle' || this.simulationState === 'completed') {
            this.renderer.setParams(this.params);
            this.renderer.updatePreview();
        }
    }
    
    /**
     * Displays simulation results in the UI with counting animation
     * @param {Object} results - Calculation results
     */
    displayResults(results) {
        const resultCards = document.querySelectorAll('.result-card');
        
        // Add counting class for visual feedback
        resultCards.forEach(card => card.classList.add('counting'));
        
        // Animate values with counter effect (staggered)
        this.animateValue(this.elements.resultMaxHeight, 0, results.maxHeight, 800, 1, 0);
        this.animateValue(this.elements.resultDistance, 0, results.range, 800, 1, 150);
        this.animateValue(this.elements.resultFlightTime, 0, results.flightTime, 800, 2, 300);
        this.animateValue(this.elements.resultFinalVelocity, 0, results.finalVelocity, 800, 1, 450);
        
        // Remove counting class after animation completes
        setTimeout(() => {
            resultCards.forEach(card => card.classList.remove('counting'));
        }, 1300);
    }
    
    /**
     * Animates a number from start to end value
     * @param {HTMLElement} element - Element to update
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} duration - Animation duration in ms
     * @param {number} decimals - Number of decimal places
     * @param {number} delay - Delay before starting animation
     */
    animateValue(element, start, end, duration, decimals = 0, delay = 0) {
        if (!element) return;
        
        // Set initial value
        element.textContent = start.toFixed(decimals);
        
        setTimeout(() => {
            const startTime = performance.now();
            const diff = end - start;
            
            const step = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function for smooth animation
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                
                const current = start + (diff * easeOutQuart);
                element.textContent = current.toFixed(decimals);
                
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    element.textContent = end.toFixed(decimals);
                }
            };
            
            requestAnimationFrame(step);
        }, delay);
    }
    
    /**
     * Clears the results display
     */
    clearResults() {
        if (this.elements.resultMaxHeight) {
            this.elements.resultMaxHeight.textContent = '0.0';
        }
        if (this.elements.resultDistance) {
            this.elements.resultDistance.textContent = '0.0';
        }
        if (this.elements.resultFlightTime) {
            this.elements.resultFlightTime.textContent = '0.00';
        }
        if (this.elements.resultFinalVelocity) {
            this.elements.resultFinalVelocity.textContent = '0.0';
        }
        if (this.elements.currentTime) {
            this.elements.currentTime.textContent = '0.00';
        }
    }
    
    /**
     * Updates button states based on simulation state
     */
    updateButtonStates() {
        const { simulateBtn, pauseBtn, resetBtn, previewBadge } = this.elements;
        
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
                if (previewBadge) previewBadge.style.display = 'inline-flex';
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
                if (previewBadge) previewBadge.style.display = 'none';
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
                if (previewBadge) previewBadge.style.display = 'none';
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
                if (previewBadge) previewBadge.style.display = 'none';
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
     * Sets a validation error on a control group
     * @param {HTMLElement} controlGroup - The control group element
     * @param {string|null} errorKey - The i18n key for the error message, or null to clear
     */
    setValidationError(controlGroup, errorKey) {
        if (!controlGroup) return;
        
        if (errorKey) {
            controlGroup.classList.add('has-error');
            controlGroup.classList.add('shake');
            
            // Remove shake after animation
            setTimeout(() => controlGroup.classList.remove('shake'), 400);
            
            // Update or create validation message
            let msgEl = controlGroup.querySelector('.validation-message');
            if (!msgEl) {
                msgEl = document.createElement('div');
                msgEl.className = 'validation-message';
                msgEl.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span class="validation-message__text"></span>
                `;
                controlGroup.appendChild(msgEl);
            }
            
            const textEl = msgEl.querySelector('.validation-message__text');
            if (textEl) {
                textEl.textContent = t(errorKey);
            }
        } else {
            this.clearValidationError(controlGroup);
        }
    }
    
    /**
     * Clears validation error from a control group
     * @param {HTMLElement} controlGroup - The control group element
     */
    clearValidationError(controlGroup) {
        if (!controlGroup) return;
        controlGroup.classList.remove('has-error');
        controlGroup.classList.remove('shake');
    }
    
    /**
     * Checks if there are any validation errors
     * @returns {boolean} True if there are errors
     */
    hasValidationErrors() {
        return document.querySelectorAll('.control-group.has-error').length > 0;
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
