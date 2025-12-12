/**
 * Simulation Controller
 * 
 * Handles CRUD operations for simulations
 */

const { validationResult } = require('express-validator');
const Simulation = require('../models/Simulation');

/**
 * @desc    Create a new simulation
 * @route   POST /api/simulations
 * @access  Private
 */
const createSimulation = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { name, params, results, trajectoryPoints } = req.body;
        
        const simulation = await Simulation.create({
            user: req.user.id,
            name: name || `Simulation ${new Date().toLocaleDateString()}`,
            params,
            results,
            trajectoryPoints: trajectoryPoints || []
        });
        
        res.status(201).json({
            success: true,
            data: simulation
        });
        
    } catch (error) {
        console.error('Create simulation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving simulation'
        });
    }
};

/**
 * @desc    Get all simulations for current user
 * @route   GET /api/simulations
 * @access  Private
 */
const getSimulations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const simulations = await Simulation.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-trajectoryPoints'); // Exclude heavy data
        
        const total = await Simulation.countDocuments({ user: req.user.id });
        
        res.json({
            success: true,
            data: simulations,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Get simulations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching simulations'
        });
    }
};

/**
 * @desc    Get single simulation by ID
 * @route   GET /api/simulations/:id
 * @access  Private
 */
const getSimulation = async (req, res) => {
    try {
        const simulation = await Simulation.findOne({
            _id: req.params.id,
            user: req.user.id
        });
        
        if (!simulation) {
            return res.status(404).json({
                success: false,
                message: 'Simulation not found'
            });
        }
        
        res.json({
            success: true,
            data: simulation
        });
        
    } catch (error) {
        console.error('Get simulation error:', error);
        
        // Handle invalid ObjectId
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Simulation not found'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error fetching simulation'
        });
    }
};

/**
 * @desc    Update simulation
 * @route   PUT /api/simulations/:id
 * @access  Private
 */
const updateSimulation = async (req, res) => {
    try {
        const { name } = req.body;
        
        const simulation = await Simulation.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { name },
            { new: true, runValidators: true }
        );
        
        if (!simulation) {
            return res.status(404).json({
                success: false,
                message: 'Simulation not found'
            });
        }
        
        res.json({
            success: true,
            data: simulation
        });
        
    } catch (error) {
        console.error('Update simulation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating simulation'
        });
    }
};

/**
 * @desc    Delete simulation
 * @route   DELETE /api/simulations/:id
 * @access  Private
 */
const deleteSimulation = async (req, res) => {
    try {
        const simulation = await Simulation.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });
        
        if (!simulation) {
            return res.status(404).json({
                success: false,
                message: 'Simulation not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Simulation deleted'
        });
        
    } catch (error) {
        console.error('Delete simulation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting simulation'
        });
    }
};

module.exports = {
    createSimulation,
    getSimulations,
    getSimulation,
    updateSimulation,
    deleteSimulation
};
