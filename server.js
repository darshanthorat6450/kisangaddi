const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connect
mongoose.connect('mongodb://localhost:27017/kisangaadi')
  .then(() => console.log('MongoDB Connected ✅'))
  .catch(err => console.log(err));

// Routes
app.use('/api/farmers', require('./routes/farmers'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));

// Test route
app.get('/', (req, res) => {
  res.send('KisanGaadi Backend is Running! 🚜');
});

// 🔴 LIVE TRACKING
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('driverLocation', (data) => {
    console.log('Driver location:', data);
    io.emit('updateLocation', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});