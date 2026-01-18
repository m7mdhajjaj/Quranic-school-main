// controllers/basicController/teacherAssistantController/index.js
// ملف رئيسي لتجميع جميع وظائف إدارة مساعدي المدرسين

const crudController = require("./crud.controller");
const statsController = require("./stats.controller");
const utilsController = require("./utils.controller");
const selfController = require("./self.controller");

module.exports = {
  // وظائف CRUD (إنشاء، قراءة، تحديث، حذف)
  ...crudController,
  
  // وظائف الإحصائيات
  ...statsController,
  
  // وظائف مساعدة
  ...utilsController,
  
  // وظائف المساعد لنفسه
  ...selfController,
};
