// scripts/seedTeacherAssistant.js
// Script لإنشاء حساب مساعد مدرس للاختبار

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const TeacherAssistant = require('../schema/TeacherAssistant');

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI or MONGO_URI not found in environment variables');
    }
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const createTeacherAssistant = async () => {
  try {
    // التحقق من وجود مساعد مدرس بنفس الـ ID
    const existingAssistant = await TeacherAssistant.findOne({ assistantId: 601 });
    
    if (existingAssistant) {
      console.log('⚠️ مساعد المدرس موجود بالفعل!');
      console.log('📋 بيانات الحساب:');
      console.log('   - رقم المساعد: 601');
      console.log('   - الاسم:', existingAssistant.firstName, existingAssistant.lastName);
      console.log('   - البريد:', existingAssistant.email);
      console.log('\n🔐 لتسجيل الدخول:');
      console.log('   - رقم المستخدم: 601');
      console.log('   - كلمة المرور: 123456');
      return;
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash('123456', 10);

    // إنشاء مساعد مدرس جديد
    const assistant = await TeacherAssistant.create({
      assistantId: 601,
      password: hashedPassword,
      firstName: 'أحمد',
      lastName: 'المساعد',
      fatherName: 'محمد',
      grandFatherName: 'علي',
      motherName: 'فاطمة',
      idNumber: '123456789',
      email: 'assistant@example.com',
      phoneNumber: '0512345678',
      birthDate: '2000-01-01',
      age: 24,
      gender: 'male',
      residence: 'الرياض',
      avatar: {
        url: '',
        publicId: '',
      },
    });

    console.log('✅ تم إنشاء حساب مساعد مدرس بنجاح!');
    console.log('\n📋 بيانات الحساب:');
    console.log('   - رقم المساعد:', assistant.assistantId);
    console.log('   - الاسم:', assistant.firstName, assistant.lastName);
    console.log('   - البريد:', assistant.email);
    console.log('   - رقم الهاتف:', assistant.phoneNumber);
    console.log('\n🔐 لتسجيل الدخول:');
    console.log('   - رقم المستخدم: 601');
    console.log('   - كلمة المرور: 123456');
    console.log('\n💡 استخدم هذه البيانات للدخول من تطبيق الموبايل أو الويب');

  } catch (error) {
    console.error('❌ خطأ في إنشاء مساعد المدرس:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      console.log(`⚠️ ${field} مستخدم بالفعل`);
    }
  }
};

const run = async () => {
  await connectDB();
  await createTeacherAssistant();
  
  // إغلاق الاتصال
  setTimeout(() => {
    mongoose.connection.close();
    console.log('\n✅ تم إغلاق الاتصال بقاعدة البيانات');
    process.exit(0);
  }, 1000);
};

run();
