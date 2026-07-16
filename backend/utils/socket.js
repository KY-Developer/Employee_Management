import Notification from '../models/Notification.js';

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected');

    // Join admin room
    socket.on('join-admin', (adminId) => {
      socket.join(`admin_${adminId}`);
      console.log(`Admin ${adminId} joined room`);
    });

    // Join company room
    socket.on('join-company', (companyId) => {
      socket.join(`company_${companyId}`);
      console.log(`Company ${companyId} joined room`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};

export default setupSocket;