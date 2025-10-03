// Test file for Socket.IO student management events
// This is for development testing only

const io = require('socket.io-client');

const socket = io('http://localhost:5005');

socket.on('connect', () => {
  console.log('✅ Connected to server');
  
  // Simulate login
  socket.emit('login', {
    userId: 'test-user-123',
    role: 'admin',
    firstName: 'مختبر'
  });
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});

// Listen for student events
socket.on('studentCreated', (data) => {
  console.log('👥 Student Created:', data);
});

socket.on('studentUpdated', (data) => {
  console.log('✏️ Student Updated:', data);
});

socket.on('studentDeleted', (data) => {
  console.log('🗑️ Student Deleted:', data);
});

socket.on('userStatusChange', (data) => {
  console.log('🔄 User Status Changed:', data);
});

// Keep the connection alive
setInterval(() => {
  console.log('📡 Socket connected:', socket.connected);
}, 10000);

console.log('🔌 Socket tester started. Listening for student events...');