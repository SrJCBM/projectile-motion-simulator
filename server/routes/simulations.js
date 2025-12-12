/**
 * Simulation Routes
 * 
 * Routes for CRUD operations on simulations
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
    createSimulation,
    getSimulations,
    getSimulation,
    updateSimulation,
    deleteSimulation
} = require('../controllers/simulationController');
const { protect } = require('../middleware/auth');

// Validation rules
const simulationValidation = [
    body('params.initialVelocity')
        .isNumeric().withMessage('Initial velocity must be a number')
        .isFloat({ min: 0, max: 100 }).withMessage('Initial velocity must be between 0 and 100'),
    body('params.launchAngle')
        .isNumeric().withMessage('Launch angle must be a number')
        .isFloat({ min: 0, max: 90 }).withMessage('Launch angle must be between 0 and 90'),
    body('params.initialHeight')
        .isNumeric().withMessage('Initial height must be a number')
        .isFloat({ min: 0 }).withMessage('Initial height cannot be negative'),
    body('params.gravity')
        .isNumeric().withMessage('Gravity must be a number')
        .isFloat({ min: 0.1 }).withMessage('Gravity must be positive'),
    body('results.maxHeight')
        .isNumeric().withMessage('Max height must be a number'),
    body('results.range')
        .isNumeric().withMessage('Range must be a number'),
    body('results.flightTime')
        .isNumeric().withMessage('Flight time must be a number'),
    body('results.finalVelocity')
        .isNumeric().withMessage('Final velocity must be a number')
];

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
    .get(getSimulations)
    .post(simulationValidation, createSimulation);

router.route('/:id')
    .get(getSimulation)
    .put(updateSimulation)
    .delete(deleteSimulation);

module.exports = router;
