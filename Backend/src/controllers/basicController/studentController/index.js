// ملف رئيسي لتجميع جميع وظائف إدارة الطلاب
const crudController = require("./crud.controller");
const averageController = require("./average.controller");
const absenceController = require("./absence.controller");
const exportOperation = require("./ExportOperation");
const queryController = require("./query.controller");
const historyController = require("./history");

module.exports = {
  // وظائف CRUD (إنشاء، قراءة، تحديث، حذف)
  ...crudController,
  
  // وظائف المعدلات الشهرية
  ...averageController,
  
  // وظائف إحصائيات الغياب
  ...absenceController,
  
  // وظائف الاستعلام والتصفية
  ...exportOperation,
  
  // وظائف الاستعلام (البحث، التصفية)
  ...queryController,
  
  // وظائف التاريخ والأحداث
  ...historyController,
};
