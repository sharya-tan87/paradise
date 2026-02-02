require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

// Import routes
const appointmentRoutes = require('./routes/appointmentRoutes');
const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// ==================== CORS (MUST BE FIRST) ====================

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ==================== BODY PARSING ====================

// Body parsing with size limits (security)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ==================== SECURITY MIDDLEWARE ====================

// Helmet: Set security HTTP headers with proper CSP
app.use(helmet({
    contentSecurityPolicy: isProduction ? {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],  // Allow inline styles for UI frameworks
            imgSrc: ["'self'", "data:", "blob:"],
            fontSrc: ["'self'"],
            connectSrc: ["'self'", process.env.FRONTEND_URL].filter(Boolean),
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    } : false,  // Disable CSP in development for easier debugging
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting: Prevent brute-force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProduction ? 100 : 1000, // Limit requests per window
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProduction ? 10 : 100, // Max 10 login attempts in production
    message: { error: 'Too many login attempts, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/refresh', authLimiter);

// ==================== PERFORMANCE MIDDLEWARE ====================

// Compression: GZIP responses
app.use(compression({
    level: 6,
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    }
}));

// Static files with cache headers
app.use('/uploads', express.static('uploads', {
    maxAge: isProduction ? '1d' : 0,
    etag: true,
    lastModified: true
}));

// ==================== LOGGING ====================

if (!isProduction) {
    app.use((req, res, next) => {
        logger.info(`${req.method} ${req.path}`, {
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });
        next();
    });
}

// ==================== HEALTH CHECK ====================

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Paradise Dental API', status: 'healthy' });
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'API connection successful' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== API ROUTES ====================

app.use('/api/appointments', appointmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/treatments', require('./routes/treatmentRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/reports', require('./routes/reportsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/dentist-profiles', require('./routes/dentistProfileRoutes'));
app.use('/api/test', testRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', { error: err.message, stack: err.stack });
    res.status(err.status || 500).json({
        error: isProduction ? 'Internal server error' : err.message
    });
});

// ==================== SERVER START ====================

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        // In production, use migrations only. In dev, sync with alter.
        if (!isProduction) {
            await sequelize.sync({ alter: true });
            console.log('📦 Database models synchronized.');
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT} [${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
        });
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
        // In production, exit on DB failure. In dev, continue for testing.
        if (isProduction) {
            process.exit(1);
        } else {
            app.listen(PORT, () => {
                console.log(`⚠️ Server running on port ${PORT} (DB Connection Failed)`);
            });
        }
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', { error: err.message, stack: err.stack });
    if (isProduction) process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', { reason: reason?.message || reason });
});

startServer();
