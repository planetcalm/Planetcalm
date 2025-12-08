require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/database');
const { initializeSocket } = require('./config/socket');

// Route imports
const memberRoutes = require('./routes/memberRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');

// Initialize Express
const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Initialize Socket.io
initializeSocket(server);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false // Disable for map embeds
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:5173', // Vite default
      // Add your GoHighLevel domain
      /\.gohighlevel\.com$/,
      /\.highlevel\.io$/,
      // Add your production domain
      /\.planetcalm\./
    ];

    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow for development - tighten in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Webhook-Secret']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Planet Calm API',
    version: '1.0.0',
    endpoints: {
      members: '/api/members',
      memberCount: '/api/members/count',
      webhook: '/api/members/webhook',
      webhookTest: '/api/members/webhook/test',
      subscribers: '/api/subscribers',
      health: '/health'
    }
  });
});

// API Routes
app.use('/api/members', memberRoutes);
app.use('/api/subscribers', subscriberRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🌍  Planet Calm Backend Server                           ║
║                                                            ║
║   Server:     http://localhost:${PORT}                       ║
║   API:        http://localhost:${PORT}/api                   ║
║   Health:     http://localhost:${PORT}/health                ║
║   Webhook:    http://localhost:${PORT}/api/members/webhook   ║
║                                                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, server };
