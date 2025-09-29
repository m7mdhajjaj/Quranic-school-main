const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// تحديث قيم الجنس من الإنجليزية للعربية
const updateGenderToArabic = async () => {
  try {
    await connectDB();
    
    // قائمة النماذج لتحديثها
    const collections = ['students', 'teachers', 'admins'];
    
    for (const collectionName of collections) {
      console.log(`\n🔄 تحديث ${collectionName}...`);
      
      // تحديث من male إلى ذكر
      const maleResult = await mongoose.connection.db.collection(collectionName).updateMany(
        { gender: 'male' },
        { $set: { gender: 'ذكر' } }
      );
      
      // تحديث من female إلى أنثى
      const femaleResult = await mongoose.connection.db.collection(collectionName).updateMany(
        { gender: 'female' },
        { $set: { gender: 'أنثى' } }
      );
      
      // تحديث من انثى إلى أنثى (توحيد الكتابة)
      const femaleResult2 = await mongoose.connection.db.collection(collectionName).updateMany(
        { gender: 'انثى' },
        { $set: { gender: 'أنثى' } }
      );
      
      console.log(`✅ ${collectionName}:`);
      console.log(`   - محدث ${maleResult.modifiedCount} سجل من 'male' إلى 'ذكر'`);
      console.log(`   - محدث ${femaleResult.modifiedCount} سجل من 'female' إلى 'أنثى'`);
      console.log(`   - محدث ${femaleResult2.modifiedCount} سجل من 'انثى' إلى 'أنثى'`);
    }
    
    console.log('\n🎉 تم تحديث جميع قيم الجنس بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في تحديث البيانات:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال مع قاعدة البيانات');
    process.exit(0);
  }
};

// تشغيل التحديث
updateGenderToArabic();