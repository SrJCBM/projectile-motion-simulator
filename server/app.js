/**
 * Express Application - Entry Point
 * 
 * Projectile Motion Simulator Backend API
 * 
 * Features:
 * - User authentication (JWT)
 * - Simulation CRUD operations
 * - PDF report generation
 * - MongoDB persistence
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
process.env.TZ = 'America/Bogota';

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const simulationRoutes = require('./routes/simulations');
const reportRoutes = require('./routes/reports');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// ========================
// Middleware
// ========================

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// ========================
// API Routes
// ========================

app.use('/api/auth', authRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ========================
// Static Files (Production)
// ========================

if (process.env.NODE_ENV === 'production') {
    // Serve static files from client folder
    app.use(express.static(path.join(__dirname, '../client')));
    
    // Handle SPA routing - serve index.html for all non-API routes
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/index.html'));
    });
}

// ========================
// Error Handling
// ========================

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ========================
// Server Startup
// ========================

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║     PROJECTILE MOTION SIMULATOR - API SERVER               ║
╠════════════════════════════════════════════════════════════╣
║  🚀 Server running on port ${PORT}                            ║
║  📦 Environment: ${process.env.NODE_ENV || 'development'}                          ║
║  🔗 API URL: http://localhost:${PORT}/api                     ║
╚════════════════════════════════════════════════════════════╝
    `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});

module.exports = app;
