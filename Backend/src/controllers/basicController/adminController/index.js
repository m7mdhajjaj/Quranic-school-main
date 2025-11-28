// ملف رئيسي لتجميع جميع وظائف إدارة الإداريين
const crudController = require("./crud.controller");
const statsController = require("./stats.controller");
const utilsController = require("./utils.controller");

module.exports = {
  // وظائف CRUD (إنشاء، قراءة، تحديث، حذف)
  ...crudController,
  
  // وظائف الإحصائيات
  ...statsController,
  
  // وظائف مساعدة
  ...utilsController,
};
