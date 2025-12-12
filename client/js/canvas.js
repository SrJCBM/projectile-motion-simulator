/**
 * Canvas Renderer Module
 * 
 * This module handles all visual rendering and animation for the projectile simulator.
 * It's responsible for drawing the trajectory, projectile, grid, and managing animations.
 * 
 * Separated from physics logic to maintain clean architecture.
 */

import { 
    calculatePositionAtTime, 
    calculateFlightTime, 
    generateTrajectoryPoints,
    calculateSimulationResults 
} from './physics.js';

/**
 * Canvas Renderer Class
 * Manages all drawing operations and animations
 */
class CanvasRenderer {
    /**
     * @param {HTMLCanvasElement} canvas - The canvas element to render on
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Animation state
        this.animationId = null;
        this.isAnimating = false;
        this.isPaused = false;
        this.currentTime = 0;
        this.startTimestamp = null;
        
        // Simulation parameters (will be set before animation)
        this.params = {
            initialVelocity: 25,
            launchAngle: 45,
            initialHeight: 0,
            gravity: 9.81
        };
        
        // Visual settings
        this.colors = {
            background: '#f8fdff',
            grid: '#e0e0e0',
            gridMajor: '#c0c0c0',
            trajectory: '#2d9cdb',
            trajectoryPreview: 'rgba(45, 156, 219, 0.3)',
            projectile: '#1a5f7a',
            ground: '#8bc34a',
            text: '#333333'
        };
        
        // Scale settings (pixels per meter)
        this.scale = 10;
        this.padding = { top: 40, right: 40, bottom: 60, left: 60 };
        
        // Trajectory points cache
        this.trajectoryPoints = [];
        this.previewPoints = [];
        
        // Bind methods
        this.animate = this.animate.bind(this);
        
        // Initialize
        this.setupCanvas();
    }
    
    /**
     * Sets up canvas dimensions and handles high-DPI displays
     */
    setupCanvas() {
        // Handle high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        
        // Store logical dimensions
        this.width = rect.width;
        this.height = rect.height;
        
        // Calculate drawable area
        this.drawableWidth = this.width - this.padding.left - this.padding.right;
        this.drawableHeight = this.height - this.padding.top - this.padding.bottom;
    }
    
    /**
     * Converts physics coordinates to canvas coordinates
     * Physics: origin at bottom-left, y increases upward
     * Canvas: origin at top-left, y increases downward
     * 
     * @param {number} x - X position in meters
     * @param {number} y - Y position in meters
     * @returns {{canvasX: number, canvasY: number}} Canvas coordinates
     */
    toCanvasCoords(x, y) {
        const canvasX = this.padding.left + (x * this.scale);
        const canvasY = this.height - this.padding.bottom - (y * this.scale);
        return { canvasX, canvasY };
    }
    
    /**
     * Calculates optimal scale to fit the trajectory in the canvas
     * @param {number} maxX - Maximum X value (range)
     * @param {number} maxY - Maximum Y value (height)
     */
    calculateOptimalScale(maxX, maxY) {
        // Add 10% padding to the max values
        const paddedMaxX = maxX * 1.1 || 10;
        const paddedMaxY = maxY * 1.1 || 10;
        
        const scaleX = this.drawableWidth / paddedMaxX;
        const scaleY = this.drawableHeight / paddedMaxY;
        
        // Use the smaller scale to ensure everything fits
        this.scale = Math.min(scaleX, scaleY, 20); // Max scale of 20
        this.scale = Math.max(this.scale, 2); // Min scale of 2
    }
    
    /**
     * Clears the canvas
     */
    clear() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    /**
     * Draws the coordinate grid with axis labels
     */
    drawGrid() {
        const ctx = this.ctx;
        
        // Calculate grid spacing based on scale
        let gridSpacing = 5; // meters
        if (this.scale < 5) gridSpacing = 10;
        if (this.scale < 3) gridSpacing = 20;
        if (this.scale > 15) gridSpacing = 2;
        
        const gridPixels = gridSpacing * this.scale;
        
        ctx.strokeStyle = this.colors.grid;
        ctx.lineWidth = 0.5;
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = this.colors.text;
        
        // Vertical lines (X axis)
        let x = this.padding.left;
        let meterValue = 0;
        while (x <= this.width - this.padding.right) {
            ctx.beginPath();
            ctx.moveTo(x, this.padding.top);
            ctx.lineTo(x, this.height - this.padding.bottom);
            ctx.stroke();
            
            // Label every other grid line
            if (meterValue % (gridSpacing * 2) === 0 || gridSpacing >= 10) {
                ctx.fillText(`${meterValue}m`, x - 10, this.height - this.padding.bottom + 20);
            }
            
            x += gridPixels;
            meterValue += gridSpacing;
        }
        
        // Horizontal lines (Y axis)
        let y = this.height - this.padding.bottom;
        meterValue = 0;
        while (y >= this.padding.top) {
            ctx.beginPath();
            ctx.moveTo(this.padding.left, y);
            ctx.lineTo(this.width - this.padding.right, y);
            ctx.stroke();
            
            // Label
            if (meterValue % (gridSpacing * 2) === 0 || gridSpacing >= 10) {
                ctx.fillText(`${meterValue}m`, this.padding.left - 30, y + 4);
            }
            
            y -= gridPixels;
            meterValue += gridSpacing;
        }
        
        // Draw axes
        ctx.strokeStyle = this.colors.gridMajor;
        ctx.lineWidth = 2;
        
        // X axis (ground level)
        ctx.beginPath();
        ctx.moveTo(this.padding.left, this.height - this.padding.bottom);
        ctx.lineTo(this.width - this.padding.right, this.height - this.padding.bottom);
        ctx.stroke();
        
        // Y axis
        ctx.beginPath();
        ctx.moveTo(this.padding.left, this.padding.top);
        ctx.lineTo(this.padding.left, this.height - this.padding.bottom);
        ctx.stroke();
        
        // Axis labels
        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = this.colors.text;
        ctx.fillText('Distance (m)', this.width / 2, this.height - 10);
        
        ctx.save();
        ctx.translate(15, this.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Height (m)', 0, 0);
        ctx.restore();
    }
    
    /**
     * Draws the ground/floor
     */
    drawGround() {
        const ctx = this.ctx;
        const groundY = this.height - this.padding.bottom;
        
        ctx.fillStyle = this.colors.ground;
        ctx.fillRect(
            this.padding.left, 
            groundY, 
            this.drawableWidth, 
            5
        );
    }
    
    /**
     * Draws the trajectory preview (ghost line before simulation)
     * @param {Array} points - Array of trajectory points
     */
    drawTrajectoryPreview(points) {
        if (points.length < 2) return;
        
        const ctx = this.ctx;
        ctx.strokeStyle = this.colors.trajectoryPreview;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]); // Dashed line for preview
        
        ctx.beginPath();
        const start = this.toCanvasCoords(points[0].x, points[0].y);
        ctx.moveTo(start.canvasX, start.canvasY);
        
        for (let i = 1; i < points.length; i++) {
            const point = this.toCanvasCoords(points[i].x, points[i].y);
            ctx.lineTo(point.canvasX, point.canvasY);
        }
        
        ctx.stroke();
        ctx.setLineDash([]); // Reset to solid line
    }
    
    /**
     * Draws the trajectory path (solid line during/after simulation)
     * @param {Array} points - Array of trajectory points
     * @param {number} upToIndex - Draw only up to this index (for animation)
     */
    drawTrajectory(points, upToIndex = points.length - 1) {
        if (points.length < 2) return;
        
        const ctx = this.ctx;
        ctx.strokeStyle = this.colors.trajectory;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        const start = this.toCanvasCoords(points[0].x, points[0].y);
        ctx.moveTo(start.canvasX, start.canvasY);
        
        const maxIndex = Math.min(upToIndex, points.length - 1);
        for (let i = 1; i <= maxIndex; i++) {
            const point = this.toCanvasCoords(points[i].x, points[i].y);
            ctx.lineTo(point.canvasX, point.canvasY);
        }
        
        ctx.stroke();
    }
    
    /**
     * Draws the projectile at a given position
     * @param {number} x - X position in meters
     * @param {number} y - Y position in meters
     */
    drawProjectile(x, y) {
        const ctx = this.ctx;
        const { canvasX, canvasY } = this.toCanvasCoords(x, y);
        
        // Projectile shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(canvasX + 2, canvasY + 2, 10, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Projectile body
        const gradient = ctx.createRadialGradient(canvasX - 3, canvasY - 3, 0, canvasX, canvasY, 12);
        gradient.addColorStop(0, '#4fc3f7');
        gradient.addColorStop(1, this.colors.projectile);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Projectile highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(canvasX - 3, canvasY - 3, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Draws the launch indicator (cannon/arrow)
     * @param {number} angle - Launch angle in degrees
     * @param {number} height - Initial height in meters
     */
    drawLauncher(angle, height) {
        const ctx = this.ctx;
        const { canvasX, canvasY } = this.toCanvasCoords(0, height);
        
        const angleRad = (angle * Math.PI) / 180;
        const launcherLength = 40;
        
        const endX = canvasX + Math.cos(angleRad) * launcherLength;
        const endY = canvasY - Math.sin(angleRad) * launcherLength;
        
        // Launcher body
        ctx.strokeStyle = '#455a64';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(canvasX, canvasY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Arrow head
        ctx.fillStyle = '#455a64';
        ctx.beginPath();
        const arrowSize = 12;
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowSize * Math.cos(angleRad - 0.4),
            endY + arrowSize * Math.sin(angleRad - 0.4)
        );
        ctx.lineTo(
            endX - arrowSize * Math.cos(angleRad + 0.4),
            endY + arrowSize * Math.sin(angleRad + 0.4)
        );
        ctx.closePath();
        ctx.fill();
        
        // Base
        ctx.fillStyle = '#607d8b';
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 12, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Updates the preview trajectory based on current parameters
     * Called when user adjusts sliders
     */
    updatePreview() {
        const { initialVelocity, launchAngle, initialHeight, gravity } = this.params;
        
        // Calculate results for scaling
        const results = calculateSimulationResults(this.params);
        this.calculateOptimalScale(results.range, results.maxHeight);
        
        // Generate preview points
        this.previewPoints = generateTrajectoryPoints(
            initialVelocity, 
            launchAngle, 
            initialHeight, 
            gravity, 
            100
        );
        
        // Redraw
        this.renderPreview();
        
        return results;
    }
    
    /**
     * Renders the preview state (before simulation starts)
     */
    renderPreview() {
        this.clear();
        this.drawGrid();
        this.drawGround();
        this.drawTrajectoryPreview(this.previewPoints);
        this.drawLauncher(this.params.launchAngle, this.params.initialHeight);
        this.drawProjectile(0, this.params.initialHeight);
    }
    
    /**
     * Sets simulation parameters
     * @param {Object} params - Simulation parameters
     */
    setParams(params) {
        this.params = { ...this.params, ...params };
    }
    
    /**
     * Starts the simulation animation
     * @param {Function} onComplete - Callback when animation completes
     * @param {Function} onUpdate - Callback on each frame with current time
     */
    startSimulation(onComplete, onUpdate) {
        // Reset state
        this.isAnimating = true;
        this.isPaused = false;
        this.currentTime = 0;
        this.startTimestamp = null;
        
        // Calculate results and trajectory
        const results = calculateSimulationResults(this.params);
        this.calculateOptimalScale(results.range, results.maxHeight);
        
        this.trajectoryPoints = generateTrajectoryPoints(
            this.params.initialVelocity,
            this.params.launchAngle,
            this.params.initialHeight,
            this.params.gravity,
            200
        );
        
        this.flightTime = results.flightTime;
        this.onComplete = onComplete;
        this.onUpdate = onUpdate;
        
        // Start animation loop
        this.animationId = requestAnimationFrame(this.animate);
    }
    
    /**
     * Animation loop
     * @param {number} timestamp - Current timestamp from requestAnimationFrame
     */
    animate(timestamp) {
        if (!this.isAnimating) return;
        
        if (this.isPaused) {
            this.animationId = requestAnimationFrame(this.animate);
            return;
        }
        
        if (!this.startTimestamp) {
            this.startTimestamp = timestamp;
        }
        
        // Calculate elapsed time (real-time animation)
        const elapsed = (timestamp - this.startTimestamp) / 1000; // Convert to seconds
        this.currentTime = Math.min(elapsed, this.flightTime);
        
        // Get current position
        const position = calculatePositionAtTime(
            this.currentTime,
            this.params.initialVelocity,
            this.params.launchAngle,
            this.params.initialHeight,
            this.params.gravity
        );
        
        // Calculate which trajectory point we're at
        const progress = this.currentTime / this.flightTime;
        const currentIndex = Math.floor(progress * (this.trajectoryPoints.length - 1));
        
        // Render frame
        this.clear();
        this.drawGrid();
        this.drawGround();
        this.drawTrajectory(this.trajectoryPoints, currentIndex);
        this.drawLauncher(this.params.launchAngle, this.params.initialHeight);
        this.drawProjectile(position.x, Math.max(0, position.y));
        
        // Update callback
        if (this.onUpdate) {
            this.onUpdate(this.currentTime, position);
        }
        
        // Check if animation is complete
        if (this.currentTime >= this.flightTime) {
            this.isAnimating = false;
            if (this.onComplete) {
                this.onComplete();
            }
            return;
        }
        
        // Continue animation
        this.animationId = requestAnimationFrame(this.animate);
    }
    
    /**
     * Pauses the animation
     */
    pause() {
        this.isPaused = true;
        this.pauseTimestamp = performance.now();
    }
    
    /**
     * Resumes the animation
     */
    resume() {
        if (this.isPaused) {
            // Adjust start timestamp to account for pause duration
            const pauseDuration = performance.now() - this.pauseTimestamp;
            this.startTimestamp += pauseDuration;
            this.isPaused = false;
        }
    }
    
    /**
     * Stops and resets the animation
     */
    reset() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.isAnimating = false;
        this.isPaused = false;
        this.currentTime = 0;
        this.startTimestamp = null;
        
        // Render initial state
        this.updatePreview();
    }
    
    /**
     * Renders the final state (after simulation completes)
     */
    renderFinal() {
        this.clear();
        this.drawGrid();
        this.drawGround();
        this.drawTrajectory(this.trajectoryPoints);
        this.drawLauncher(this.params.launchAngle, this.params.initialHeight);
        
        // Draw projectile at final position
        const lastPoint = this.trajectoryPoints[this.trajectoryPoints.length - 1];
        this.drawProjectile(lastPoint.x, Math.max(0, lastPoint.y));
    }
    
    /**
     * Handles window resize
     */
    handleResize() {
        this.setupCanvas();
        if (this.isAnimating) {
            // Recalculate scale and continue
            const results = calculateSimulationResults(this.params);
            this.calculateOptimalScale(results.range, results.maxHeight);
        } else {
            this.updatePreview();
        }
    }
    
    /**
     * Calculates and returns current simulation results
     * @returns {Object} Simulation results (maxHeight, range, flightTime, finalVelocity)
     */
    calculateResults() {
        return calculateSimulationResults(this.params);
    }
}

export { CanvasRenderer };
