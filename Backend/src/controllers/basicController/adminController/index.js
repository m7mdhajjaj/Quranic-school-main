// ملف رئيسي لتجميع جميع وظائف إدارة الإداريين
const crudController = require("./crud.controller");
const statsController = require("./stats.controller");
const utilsController = require("./utils.controller");

module.exports = {
  // CRUD operations
  ...crudController,
  // Statistics
  ...statsController,
  // وظائف مساعدة
  ...utilsController,
};
