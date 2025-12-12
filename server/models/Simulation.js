/**
 * Simulation Model
 * 
 * Schema for storing user simulation results
 */

const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        default: 'Untitled Simulation',
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    // Input Parameters
    params: {
        initialVelocity: {
            type: Number,
            required: true,
            min: [0, 'Velocity cannot be negative'],
            max: [100, 'Velocity cannot exceed 100 m/s']
        },
        launchAngle: {
            type: Number,
            required: true,
            min: [0, 'Angle cannot be negative'],
            max: [90, 'Angle cannot exceed 90 degrees']
        },
        initialHeight: {
            type: Number,
            required: true,
            min: [0, 'Height cannot be negative'],
            default: 0
        },
        gravity: {
            type: Number,
            required: true,
            min: [0.1, 'Gravity must be positive'],
            default: 9.81
        }
    },
    // Calculated Results
    results: {
        maxHeight: {
            type: Number,
            required: true
        },
        range: {
            type: Number,
            required: true
        },
        flightTime: {
            type: Number,
            required: true
        },
        finalVelocity: {
            type: Number,
            required: true
        }
    },
    // Optional: Store trajectory points for replay
    trajectoryPoints: [{
        x: Number,
        y: Number,
        t: Number
    }],
    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries by user and date
simulationSchema.index({ user: 1, createdAt: -1 });

/**
 * Get recent simulations for a user
 */
simulationSchema.statics.getRecentByUser = function(userId, limit = 10) {
    return this.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('-trajectoryPoints'); // Exclude heavy data by default
};

module.exports = mongoose.model('Simulation', simulationSchema);
