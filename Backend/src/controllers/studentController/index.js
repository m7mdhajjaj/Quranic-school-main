// ملف رئيسي لتجميع جميع وظائف إدارة الطلاب
const crudController = require("./crud.controller");
const averageController = require("./average.controller");
const absenceController = require("./absence.controller");
const queryController = require("./query.controller");

module.exports = {
  // وظائف CRUD (إنشاء، قراءة، تحديث، حذف)
  ...crudController,
  
  // وظائف المعدلات الشهرية
  ...averageController,
  
  // وظائف إحصائيات الغياب
  ...absenceController,
  
  // وظائف الاستعلام والتصفية
  ...queryController,
};
