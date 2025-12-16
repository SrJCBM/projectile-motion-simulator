/**
 * Physics Engine Module
 * 
 * This module contains all physics calculations for projectile motion.
 * Separated from UI logic following the Single Responsibility Principle.
 * 
 * Key Equations Used:
 * - Trajectory: y = x·tan(θ) - (g·x²)/(2·v₀²·cos²(θ))
 * - Horizontal position: x(t) = v₀·cos(θ)·t
 * - Vertical position: y(t) = h₀ + v₀·sin(θ)·t - ½·g·t²
 * - Maximum height: y_max = h₀ + (v₀²·sin²(θ))/(2·g)
 * - Time of flight: Calculated using quadratic formula
 * - Horizontal range: x_max = v₀·cos(θ)·t_total
 */

// Gravity constants for different celestial bodies (m/s²)
const GRAVITY_PRESETS = {
    earth: { value: 9.81, label: 'Earth', icon: '🌍' },
    moon: { value: 1.62, label: 'Moon', icon: '🌙' },
    mars: { value: 3.72, label: 'Mars', icon: '🔴' }
};

/**
 * Converts degrees to radians
 * Formula: radians = degrees × (π / 180)
 * 
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Calculates the trajectory y-position for a given x-position
 * 
 * Physics Formula: y = h₀ + x·tan(θ) - (g·x²)/(2·v₀²·cos²(θ))
 * 
 * This is derived from combining:
 * - Horizontal motion: x = v₀·cos(θ)·t → t = x/(v₀·cos(θ))
 * - Vertical motion: y = h₀ + v₀·sin(θ)·t - ½·g·t²
 * Substituting t gives us the trajectory equation.
 * 
 * @param {number} x - Horizontal position (meters)
 * @param {number} initialVelocity - Initial velocity v₀ (m/s)
 * @param {number} launchAngle - Launch angle θ (degrees)
 * @param {number} initialHeight - Initial height h₀ (meters)
 * @param {number} gravity - Gravitational acceleration g (m/s²)
 * @returns {number} Vertical position y (meters)
 */
function calculateTrajectoryY(x, initialVelocity, launchAngle, initialHeight, gravity) {
    const angleRad = degreesToRadians(launchAngle);
    const cosAngle = Math.cos(angleRad);
    const tanAngle = Math.tan(angleRad);
    
    // Prevent division by zero when velocity is 0
    if (initialVelocity === 0) return initialHeight;
    
    // y = h₀ + x·tan(θ) - (g·x²)/(2·v₀²·cos²(θ))
    const y = initialHeight + 
              x * tanAngle - 
              (gravity * x * x) / (2 * initialVelocity * initialVelocity * cosAngle * cosAngle);
    
    return y;
}

/**
 * Calculates the position at a given time t
 * 
 * Physics Formulas:
 * - x(t) = v₀·cos(θ)·t (uniform horizontal motion - no air resistance)
 * - y(t) = h₀ + v₀·sin(θ)·t - ½·g·t² (uniformly accelerated vertical motion)
 * 
 * @param {number} time - Time since launch (seconds)
 * @param {number} initialVelocity - Initial velocity v₀ (m/s)
 * @param {number} launchAngle - Launch angle θ (degrees)
 * @param {number} initialHeight - Initial height h₀ (meters)
 * @param {number} gravity - Gravitational acceleration g (m/s²)
 * @returns {{x: number, y: number}} Position object with x and y coordinates
 */
function calculatePositionAtTime(time, initialVelocity, launchAngle, initialHeight, gravity) {
    const angleRad = degreesToRadians(launchAngle);
    
    // Horizontal component: x = v₀·cos(θ)·t
    const x = initialVelocity * Math.cos(angleRad) * time;
    
    // Vertical component: y = h₀ + v₀·sin(θ)·t - ½·g·t²
    const y = initialHeight + 
              initialVelocity * Math.sin(angleRad) * time - 
              0.5 * gravity * time * time;
    
    return { x, y };
}

/**
 * Calculates the velocity components at a given time
 * 
 * Physics Formulas:
 * - vx(t) = v₀·cos(θ) (constant, no air resistance)
 * - vy(t) = v₀·sin(θ) - g·t (changes due to gravity)
 * - |v| = √(vx² + vy²) (magnitude using Pythagorean theorem)
 * 
 * @param {number} time - Time since launch (seconds)
 * @param {number} initialVelocity - Initial velocity v₀ (m/s)
 * @param {number} launchAngle - Launch angle θ (degrees)
 * @param {number} gravity - Gravitational acceleration g (m/s²)
 * @returns {{vx: number, vy: number, magnitude: number}} Velocity components
 */
function calculateVelocityAtTime(time, initialVelocity, launchAngle, gravity) {
    const angleRad = degreesToRadians(launchAngle);
    
    // Horizontal velocity remains constant (no air resistance)
    const vx = initialVelocity * Math.cos(angleRad);
    
    // Vertical velocity decreases due to gravity: vy = v₀·sin(θ) - g·t
    const vy = initialVelocity * Math.sin(angleRad) - gravity * time;
    
    // Total velocity magnitude: |v| = √(vx² + vy²)
    const magnitude = Math.sqrt(vx * vx + vy * vy);
    
    return { vx, vy, magnitude };
}

/**
 * Calculates the maximum height reached by the projectile
 * 
 * Physics Formula: y_max = h₀ + (v₀²·sin²(θ))/(2·g)
 * 
 * Derivation: At maximum height, vertical velocity = 0
 * Using vy = v₀·sin(θ) - g·t, we find t_max = v₀·sin(θ)/g
 * Substituting into y(t) gives us the maximum height formula.
 * 
 * @param {number} initialVelocity - Initial velocity v₀ (m/s)
 * @param {number} launchAngle - Launch angle θ (degrees)
 * @param {number} initialHeight - Initial height h₀ (meters)
 * @param {number} gravity - Gravitational acceleration g (m/s²)
 * @returns {number} Maximum height (meters)
 */
function calculateMaxHeight(initialVelocity, launchAngle, initialHeight, gravity) {
    const angleRad = degreesToRadians(launchAngle);
    const sinAngle = Math.sin(angleRad);
    
    // y_max = h₀ + (v₀²·sin²(θ))/(2·g)
    const maxHeight = initialHeight + 
                      (initialVelocity * initialVelocity * sinAngle * sinAngle) / (2 * gravity);
    
    return maxHeight;
}

/**
 * Calculates the total time of flight
 * 
 * Physics: Solve y(t) = 0 for t using quadratic formula
 * h₀ + v₀·sin(θ)·t - ½·g·t² = 0
 * 
 * Quadratic formula: t = (-b ± √(b² - 4ac)) / 2a
 * Where: a = -½g, b = v₀·sin(θ), c = h₀
 * 
 * We take the positive root (+ sign) as it represents the landing time.
 * 
 * @param {number} initialVelocity - Initial velocity v₀ (m/s)
 * @param {number} launchAngle - Launch angle θ (degrees)
 * @param {number} initialHeight - Initial height h₀ (meters)
 * @param {number} gravity - Gravitational acceleration g (m/s²)
 * @returns {number} Total flight time (seconds)
 */
function calculateFlightTime(initialVelocity, launchAngle, initialHeight, gravity) {
    const angleRad = degreesToRadians(launchAngle);
    const sinAngle = Math.sin(angleRad);
    
    // Coefficients for quadratic equation: at² + bt + c = 0
    // -½gt² + v₀·sin(θ)·t + h₀ = 0
    const a = -0.5 * gravity;
    const b = initialVelocity * sinAngle;
    const c = initialHeight;
    
    // Discriminant: Δ = b² - 4ac
    const discriminant = b * b - 4 * a * c;
    
    // Handle edge case where discriminant is negative (shouldn't happen with valid inputs)
    if (discriminant < 0) return 0;
    
    // t = (-b - √Δ) / 2a (we use minus because a is negative)
    const flightTime = (-b - Math.sqrt(discriminant)) / (2 * a);
    
    return Math.max(0, flightTime);
}

/**
 * Calculates the horizontal range (distance traveled)
 * 
 * Physics Formula: x_max = v₀·cos(θ)·t_total
 * 
 * The horizontal distance is simply the horizontal velocity
 * multiplied by the total flight time.
 * 
 * @param {number} initialVelocity - Initial velocity v₀ (m/s)
 * @param {number} launchAngle - Launch angle θ (degrees)
 * @param {number} initialHeight - Initial height h₀ (meters)
 * @param {number} gravity - Gravitational acceleration g (m/s²)
 * @returns {number} Horizontal range (meters)
 */
function calculateRange(initialVelocity, launchAngle, initialHeight, gravity) {
    const flightTime = calculateFlightTime(initialVelocity, launchAngle, initialHeight, gravity);
    const angleRad = degreesToRadians(launchAngle);
    
    // x_max = v₀·cos(θ)·t_total
    const range = initialVelocity * Math.cos(angleRad) * flightTime;
    
    return range;
}

/**
 * Calculates the final horizontal velocity component (vx) when the projectile lands.
 *
 * Rationale: In our UI, users expect the "final velocity" to change
 * with the angle, instead of equaling v₀ when h₀ = 0 (energy conservation).
 * Since air resistance is neglected, the horizontal velocity remains constant
 * throughout the motion: vx = v₀·cos(θ).
 *
 * @param {number} initialVelocity - Initial velocity v₀ (m/s)
 * @param {number} launchAngle - Launch angle θ (degrees)
 * @returns {number} Final horizontal velocity (m/s)
 */
function calculateFinalVelocity(initialVelocity, launchAngle) {
    const angleRad = degreesToRadians(launchAngle);
    const vx = initialVelocity * Math.cos(angleRad);
    return vx;
}

/**
 * Generates an array of trajectory points for rendering
 * 
 * Creates a series of {x, y, t} points that describe the complete
 * trajectory from launch to landing.
 * 
 * @param {number} initialVelocity - Initial velocity v₀ (m/s)
 * @param {number} launchAngle - Launch angle θ (degrees)
 * @param {number} initialHeight - Initial height h₀ (meters)
 * @param {number} gravity - Gravitational acceleration g (m/s²)
 * @param {number} numPoints - Number of points to generate (default: 100)
 * @returns {Array<{x: number, y: number, t: number}>} Array of trajectory points
 */
function generateTrajectoryPoints(initialVelocity, launchAngle, initialHeight, gravity, numPoints = 100) {
    const flightTime = calculateFlightTime(initialVelocity, launchAngle, initialHeight, gravity);
    const points = [];
    
    for (let i = 0; i <= numPoints; i++) {
        const t = (i / numPoints) * flightTime;
        const position = calculatePositionAtTime(t, initialVelocity, launchAngle, initialHeight, gravity);
        
        points.push({
            x: position.x,
            y: Math.max(0, position.y), // Ensure y doesn't go below ground
            t: t
        });
    }
    
    return points;
}

/**
 * Calculates all simulation results in one call
 * 
 * @param {Object} params - Simulation parameters
 * @param {number} params.initialVelocity - Initial velocity v₀ (m/s)
 * @param {number} params.launchAngle - Launch angle θ (degrees)
 * @param {number} params.initialHeight - Initial height h₀ (meters)
 * @param {number} params.gravity - Gravitational acceleration g (m/s²)
 * @returns {Object} All calculated results
 */
function calculateSimulationResults({ initialVelocity, launchAngle, initialHeight, gravity }) {
    return {
        maxHeight: calculateMaxHeight(initialVelocity, launchAngle, initialHeight, gravity),
        range: calculateRange(initialVelocity, launchAngle, initialHeight, gravity),
        flightTime: calculateFlightTime(initialVelocity, launchAngle, initialHeight, gravity),
        finalVelocity: calculateFinalVelocity(initialVelocity, launchAngle)
    };
}

/**
 * Validates simulation parameters
 * 
 * @param {Object} params - Parameters to validate
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
function validateParameters({ initialVelocity, launchAngle, initialHeight, gravity }) {
    const errors = [];
    
    if (initialVelocity < 0 || initialVelocity > 200) {
        errors.push('Initial velocity must be between 0 and 200 m/s');
    }
    
    if (launchAngle < 0 || launchAngle > 90) {
        errors.push('Launch angle must be between 0° and 90°');
    }
    
    if (initialHeight < 0) {
        errors.push('Initial height cannot be negative');
    }
    
    if (gravity <= 0) {
        errors.push('Gravity must be a positive value');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

// Export for use in other modules (works in browser with type="module")
export {
    GRAVITY_PRESETS,
    degreesToRadians,
    calculateTrajectoryY,
    calculatePositionAtTime,
    calculateVelocityAtTime,
    calculateMaxHeight,
    calculateFlightTime,
    calculateRange,
    calculateFinalVelocity,
    generateTrajectoryPoints,
    calculateSimulationResults,
    validateParameters
};
