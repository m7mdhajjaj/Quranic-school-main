require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const NotificationManager = require('../src/Notifications/Core/NotificationManager');
const Notification = require('../src/schema/Notification');

async function testNotification() {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a dummy teacher ID (or find one)
    const teacherId = new mongoose.Types.ObjectId();
    console.log('Using dummy teacher ID:', teacherId);

    const notificationManager = new NotificationManager(null); // No socket.io for this test

    console.log('Testing createNotification directly...');
    const notificationData = {
      recipient: teacherId,
      recipientModel: 'Teacher',
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'system',
      data: { test: true }
    };

    const savedNotification = await notificationManager.createNotification(notificationData);
    console.log('Notification saved:', savedNotification._id);

    // Verify in DB
    const found = await Notification.findById(savedNotification._id);
    if (found) {
      console.log('✅ Notification found in DB:', found);
    } else {
      console.error('❌ Notification NOT found in DB');
    }

    // Test notifyAdminAddedStudent
    console.log('Testing notifyAdminAddedStudent...');
    const student = { firstName: 'Test', lastName: 'Student', _id: new mongoose.Types.ObjectId() };
    const groupName = 'Test Group';
    const adminName = 'Test Admin';

    const result = await notificationManager.notifyAdminAddedStudent(teacherId, student, groupName, adminName);
    console.log('notifyAdminAddedStudent result:', result._id);

    const found2 = await Notification.findById(result._id);
    if (found2) {
      console.log('✅ Admin Notification found in DB:', found2);
    } else {
      console.error('❌ Admin Notification NOT found in DB');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testNotification();
