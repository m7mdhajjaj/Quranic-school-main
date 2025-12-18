const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
require('../schema/Teacher'); // Register Teacher model
const Student = require('../schema/Student');
const Group = require('../schema/Group');
const Warning = require('../schema/Warning');
const WarningJob = require('../Notifications/Jobs/WarningJob');

async function runTest() {
  try {
    console.log('🔌 Connecting to Database...');
    await connectDB();

    console.log('\n🧪 --- Starting Warning Job Test ---');

    // 1. Create Dummy Data
    console.log('📝 Creating test data...');
    
    const Teacher = require('../schema/Teacher');
    const randomPhone = '05' + Math.floor(10000000 + Math.random() * 90000000);
    const randomId = Math.floor(100000000 + Math.random() * 900000000).toString();
    
    const teacher = await Teacher.create({
        firstName: 'Test',
        lastName: 'Teacher',
        email: 'test' + Date.now() + '@test.com',
        password: 'password',
        phoneNumber: randomPhone,
        teacherId: Math.floor(Math.random() * 10000),
        gender: 'male',
        role: 'teacher',
        birthDate: '1990-01-01',
        idNumber: randomId
    });

    const group = await Group.create({
      name: 'Test Group ' + Date.now(),
      teacher: teacher._id, 
      students: []
    });

    const student = await Student.create({
      firstName: 'Test',
      lastName: 'Student',
      studentId: Math.floor(Math.random() * 10000),
      group: group._id,
      gender: 'male',
      password: 'password',
      phoneNumber: '05' + Math.floor(10000000 + Math.random() * 90000000),
      fatherName: 'Father',
      grandFatherName: 'Grand',
      motherName: 'Mother',
      idNumber: Math.floor(100000000 + Math.random() * 900000000).toString(),
      residence: 'Test',
      birthDate: new Date(),
      isActive: true
    });

    // Add student to group
    if (!group.students) group.students = [];
    group.students.push(student._id);
    await group.save();

    console.log(`✅ Created Student: ${student.firstName} (ID: ${student._id})`);
    console.log(`✅ Created Group: ${group.name} (ID: ${group._id})`);
    console.log(`ℹ️  Student is currently in group: ${group.name}`);

    // 2. Create a "Third" Warning (Expulsion)
    console.log('\n⚠️  Creating a "third" warning for the student...');
    await Warning.create({
      studentId: student._id,
      teacherId: group.teacher,
      groupId: group._id,
      type: 'third',
      reason: 'Test Expulsion Logic',
      isActive: true
    });

    // 3. Run the Job
    console.log('\n🚀 Running WarningJob.enforcePermanentSuspensions()...');
    await WarningJob.enforcePermanentSuspensions();

    // 4. Verify Result
    const updatedStudent = await Student.findById(student._id);
    const updatedGroup = await Group.findById(group._id);

    console.log('\n🔍 Verifying Results...');
    if (!updatedStudent.group) {
      console.log('✅ SUCCESS: Student group is now NULL (Suspended).');
    } else {
      console.log('❌ FAILED: Student is still in group:', updatedStudent.group);
    }

    if (!updatedStudent.teacher) {
      console.log('✅ SUCCESS: Student teacher is now NULL.');
    } else {
      console.log('❌ FAILED: Student still has teacher:', updatedStudent.teacher);
    }

    const isInGroupArray = updatedGroup.students ? updatedGroup.students.includes(student._id) : false;
    if (!isInGroupArray) {
      console.log('✅ SUCCESS: Student removed from Group students array.');
    } else {
      console.log('❌ FAILED: Student still in Group students array.');
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await Student.findByIdAndDelete(student._id);
    await Group.findByIdAndDelete(group._id);
    await Teacher.findByIdAndDelete(teacher._id);
    await Warning.deleteMany({ reason: 'Test Expulsion Logic' });

  } catch (error) {
    console.error('❌ Test Failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
}

runTest();
