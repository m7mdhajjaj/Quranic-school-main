// ملف رئيسي لتجميع جميع وظائف إدارة المعلمين
const crudController = require("./crud.controller");
const statsController = require("./stats.controller");
const utilsController = require("./utils.controller");
const groupManagementController = require("./groupManagement.controller");

module.exports = {
  // وظائف CRUD (إنشاء، قراءة، تحديث، حذف)
  ...crudController,
  
  // وظائف الإحصائيات
  ...statsController,
  
  // وظائف مساعدة
  ...utilsController,
  
  // وظائف إدارة الحلقات
  ...groupManagementController,
};
