const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const containerRoutes = require('./routes/containers');
const costRoutes = require('./routes/costs');
const wasteRoutes = require('./routes/waste');
const { startMonitoring } = require('./services/dockerMonitor');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with permissive CORS for development/production
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/containers', containerRoutes);
app.use('/api/costs', costRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/recommendations', wasteRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io connection logging
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Start background Docker telemetry monitoring loop (polls every 2 seconds)
startMonitoring(io, 2000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`FinOps Backend Server running on port ${PORT}`);
  console.log(`Live telemetry streaming via Socket.io active`);
  console.log(`=======================================================`);
});
