// routes/teacherAssistantRoutes/index.js
const express = require("express");
const router = express.Router();

// Import sub-routes
const selfRoutes = require("./self.routes");
const statsRoutes = require("./stats.routes");
const avatarRoutes = require("./avatar.routes");
const crudRoutes = require("./crud.routes");

/**
 * Teacher Assistant Routes
 * 
 * البنية:
 * - self.routes.js    : مسارات المساعد لنفسه (my-groups, my-students, me)
 * - stats.routes.js   : مسارات الإحصائيات
 * - avatar.routes.js  : مسارات الصور
 * - crud.routes.js    : مسارات CRUD (create, read, update, delete)
 * 
 * ترتيب الأهمية:
 * 1. selfRoutes أولاً (لأن my-groups, my-students يجب أن تكون قبل /:id)
 * 2. statsRoutes (stats قبل /:id)
 * 3. avatarRoutes (/:id/avatar قبل /:id المفرد)
 * 4. crudRoutes أخيراً (تحتوي على /:id)
 */

// Use sub-routes in correct order
router.use("/", selfRoutes);   // /my-groups, /my-students, /me
router.use("/", statsRoutes);  // /stats
router.use("/", avatarRoutes); // /:id/avatar
router.use("/", crudRoutes);   // /, /:id, etc.

module.exports = router;
