const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // Join the main room for broadcasts
    socket.join('planet-calm-map');

    // Handle client requesting current member count
    socket.on('get-member-count', async () => {
      try {
        const Member = require('../models/Member');
        const count = await Member.countDocuments();
        socket.emit('member-count', { count });
      } catch (error) {
        console.error('Error getting member count:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id} - Reason: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
};

// Emit new member to all connected clients
const emitNewMember = (member) => {
  if (io) {
    io.to('planet-calm-map').emit('new-member', {
      id: member._id,
      petName: member.petName,
      petType: member.petType,
      petStatus: member.petStatus || 'with-you',
      location: member.location,
      coordinates: member.coordinates,
      createdAt: member.createdAt
    });
    console.log(`📍 Emitted new member: ${member.petName} to all clients`);
  }
};

// Emit updated member count
const emitMemberCount = async () => {
  if (io) {
    try {
      const Member = require('../models/Member');
      const count = await Member.countDocuments();
      io.to('planet-calm-map').emit('member-count', { count });
      console.log(`📊 Emitted member count: ${count}`);
    } catch (error) {
      console.error('Error emitting member count:', error);
    }
  }
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  emitNewMember,
  emitMemberCount,
  getIO
};
