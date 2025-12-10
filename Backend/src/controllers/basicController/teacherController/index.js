// ملف رئيسي لتجميع جميع وظائف إدارة المعلمين
const crudController = require("./crud.controller");
const statsController = require("./stats.controller");
const utilsController = require("./utils.controller");
const exportOperation = require("./ExportOperation");

module.exports = {
  // وظائف CRUD (إنشاء، قراءة، تحديث، حذف)
  ...crudController,
  
  // وظائف الإحصائيات
  ...statsController,
  
  // وظائف مساعدة
  ...utilsController,
  
  // وظائف التصدير
  ...exportOperation,
};
