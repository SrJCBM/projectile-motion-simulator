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
import { t } from './i18n.js';

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
        
        // Tooltip state
        this.showTooltip = false;
        this.tooltipData = null;
        
        // Bind methods
        this.animate = this.animate.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        
        // Initialize
        this.setupCanvas();
        this.setupTooltip();
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
     * Sets up tooltip element and mouse events
     */
    setupTooltip() {
        // Create tooltip element
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'canvas-tooltip';
        this.tooltip.innerHTML = `
            <div class="canvas-tooltip__row">
                <span class="canvas-tooltip__label" id="tooltip-label-height">Altura:</span>
                <span class="canvas-tooltip__value" id="tooltip-height">--</span>
            </div>
            <div class="canvas-tooltip__row">
                <span class="canvas-tooltip__label" id="tooltip-label-distance">Distancia:</span>
                <span class="canvas-tooltip__value" id="tooltip-distance">--</span>
            </div>
            <div class="canvas-tooltip__row">
                <span class="canvas-tooltip__label" id="tooltip-label-velocity">Velocidad:</span>
                <span class="canvas-tooltip__value" id="tooltip-velocity">--</span>
            </div>
        `;
        this.canvas.parentElement.appendChild(this.tooltip);
        
        // Add event listeners
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
    }
    
    /**
     * Converts canvas coordinates to physics coordinates
     * @param {number} canvasX - Canvas X coordinate
     * @param {number} canvasY - Canvas Y coordinate
     * @returns {{x: number, y: number}} Physics coordinates in meters
     */
    toPhysicsCoords(canvasX, canvasY) {
        const x = (canvasX - this.padding.left) / this.scale;
        const y = (this.height - this.padding.bottom - canvasY) / this.scale;
        return { x, y };
    }
    
    /**
     * Handles mouse movement over the canvas
     * @param {MouseEvent} event
     */
    handleMouseMove(event) {
        // Only show tooltip when simulation is paused or completed
        if (this.isAnimating && !this.isPaused) return;
        if (this.trajectoryPoints.length === 0) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // Convert to physics coordinates
        const { x: physicsX } = this.toPhysicsCoords(mouseX, mouseY);
        
        // Find the closest point on the trajectory
        let closestPoint = null;
        let closestDistance = Infinity;
        
        for (const point of this.trajectoryPoints) {
            const distance = Math.abs(point.x - physicsX);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestPoint = point;
            }
        }
        
        if (closestPoint && closestDistance < 5) { // Within 5 meters tolerance
            // Calculate velocity at this point
            const { x: px, y: py } = closestPoint;
            const { canvasX, canvasY } = this.toCanvasCoords(px, py);
            
            // Check if mouse is close to the trajectory line
            const mouseToTrajectoryDist = Math.abs(mouseY - canvasY);
            
            if (mouseToTrajectoryDist < 30) { // Within 30 pixels of trajectory
                // Calculate velocity at this point using time
                const time = this.findTimeForX(px);
                const velocity = this.calculateVelocityAtPoint(time);
                
                // Update tooltip
                this.tooltip.querySelector('#tooltip-label-height').textContent = `${t('tooltipHeightLabel')}:`;
                this.tooltip.querySelector('#tooltip-label-distance').textContent = `${t('tooltipDistanceLabel')}:`;
                this.tooltip.querySelector('#tooltip-label-velocity').textContent = `${t('tooltipVelocityLabel')}:`;
                this.tooltip.querySelector('#tooltip-height').textContent = `${py.toFixed(1)} m`;
                this.tooltip.querySelector('#tooltip-distance').textContent = `${px.toFixed(1)} m`;
                this.tooltip.querySelector('#tooltip-velocity').textContent = `${velocity.toFixed(1)} m/s`;
                
                // Position tooltip
                this.tooltip.style.left = `${canvasX + 15}px`;
                this.tooltip.style.top = `${canvasY - 60}px`;
                this.tooltip.classList.add('visible');
                
                // Draw hover indicator
                this.renderWithHoverPoint(px, py);
                return;
            }
        }
        
        // Hide tooltip if not over trajectory
        this.tooltip.classList.remove('visible');
    }
    
    /**
     * Handles mouse leaving the canvas
     */
    handleMouseLeave() {
        this.tooltip.classList.remove('visible');
        // Redraw without hover point
        if (!this.isAnimating || this.isPaused) {
            this.renderFinal();
        }
    }
    
    /**
     * Finds the approximate time for a given X position
     * @param {number} x - X position in meters
     * @returns {number} Time in seconds
     */
    findTimeForX(x) {
        const vx = this.params.initialVelocity * Math.cos(this.params.launchAngle * Math.PI / 180);
        return vx > 0 ? x / vx : 0;
    }
    
    /**
     * Calculates velocity magnitude at a given time
     * @param {number} time - Time in seconds
     * @returns {number} Velocity magnitude in m/s
     */
    calculateVelocityAtPoint(time) {
        const angleRad = this.params.launchAngle * Math.PI / 180;
        const vx = this.params.initialVelocity * Math.cos(angleRad);
        const vy = this.params.initialVelocity * Math.sin(angleRad) - this.params.gravity * time;
        return Math.sqrt(vx * vx + vy * vy);
    }
    
    /**
     * Renders the canvas with a hover point indicator
     * @param {number} hoverX - X position of hover point
     * @param {number} hoverY - Y position of hover point
     */
    renderWithHoverPoint(hoverX, hoverY) {
        this.clear();
        this.drawGrid();
        this.drawGround();
        this.drawTrajectory(this.trajectoryPoints);
        this.drawLauncher(this.params.launchAngle, this.params.initialHeight);
        
        // Draw final projectile position
        const lastPoint = this.trajectoryPoints[this.trajectoryPoints.length - 1];
        this.drawProjectile(lastPoint.x, Math.max(0, lastPoint.y));
        
        // Draw hover point indicator
        const { canvasX, canvasY } = this.toCanvasCoords(hoverX, hoverY);
        const ctx = this.ctx;
        
        // Draw vertical dashed line
        ctx.save();
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(canvasX, canvasY);
        ctx.lineTo(canvasX, this.height - this.padding.bottom);
        ctx.stroke();
        
        // Draw horizontal dashed line
        ctx.beginPath();
        ctx.moveTo(this.padding.left, canvasY);
        ctx.lineTo(canvasX, canvasY);
        ctx.stroke();
        ctx.restore();
        
        // Draw hover point
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner white circle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 4, 0, Math.PI * 2);
        ctx.fill();
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
