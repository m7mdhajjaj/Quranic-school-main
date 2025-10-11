const Group = require("../schema/Group");

// إنشاء حلقة جديدة
exports.createGroup = async (req, res) => {
  try {
    console.log("🚀 طلب إنشاء حلقة جديدة");
    console.log("📋 البيانات المستلمة:", req.body);

    const { name, teacher, description, capacity, schedule } = req.body;

    // التحقق من وجود الحلقة بنفس الاسم
    console.log("🔍 التحقق من تفرد اسم الحلقة:", name);
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      console.log("❌ اسم الحلقة موجود بالفعل");
      return res.status(400).json({
        success: false,
        message: "يوجد حلقة بنفس الاسم بالفعل",
      });
    }
    console.log("✅ اسم الحلقة متاح");

    // التحقق من وجود المعلم
    const Teacher = require("../schema/Teacher");

    console.log("🔍 البحث عن المعلم:", teacher);

    let teacherExists = null;

    try {
      // محاولة البحث بالـ ObjectId أولاً
      if (teacher.match(/^[0-9a-fA-F]{24}$/)) {
        console.log("🆔 البحث بالـ ObjectId");
        teacherExists = await Teacher.findById(teacher);
      }

      // إذا لم نجد بالـ ObjectId، نبحث بالاسم
      if (!teacherExists) {
        console.log("👤 البحث بالاسم الكامل");
        const nameParts = teacher.trim().split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        console.log("📝 أجزاء الاسم:", { firstName, lastName });

        const searchQuery = {
          // إزالة شرط النشاط - السماح بجميع المعلمين
        };

        if (firstName && lastName) {
          // البحث بالاسم الأول واللقب
          searchQuery.$and = [
            { firstName: { $regex: `^${firstName}$`, $options: "i" } },
            { lastName: { $regex: `^${lastName}$`, $options: "i" } },
          ];
        } else if (firstName) {
          // البحث بالاسم الأول فقط
          searchQuery.firstName = { $regex: `^${firstName}$`, $options: "i" };
        }

        console.log("🔎 استعلام البحث:", JSON.stringify(searchQuery, null, 2));
        teacherExists = await Teacher.findOne(searchQuery);
      }

      console.log(
        "✅ نتيجة البحث عن المعلم:",
        teacherExists ? "موجود" : "غير موجود"
      );
    } catch (searchError) {
      console.error("❌ خطأ في البحث عن المعلم:", searchError);
      return res.status(400).json({
        success: false,
        message: "حدث خطأ في البحث عن المعلم",
      });
    }

    if (!teacherExists) {
      return res.status(400).json({
        success: false,
        message: "المعلم المحدد غير موجود في النظام",
      });
    }

    // التحقق من أن المعلم ليس لديه حلقة أخرى بنفس الاسم
    console.log("🔍 التحقق من تفرد المعلم للحلقة");
    const teacherFullName = `${teacherExists.firstName} ${teacherExists.lastName}`;
    const existingGroupByTeacher = await Group.findOne({
      name: name,
      $or: [
        { teacher: teacher },
        { teacher: teacherExists._id },
        { teacher: teacherExists._id.toString() },
      ],
    });

    if (existingGroupByTeacher) {
      return res.status(400).json({
        success: false,
        message: `الحلقة "${name}" مرتبطة بالفعل بهذا المعلم. لا يمكن للحلقة الواحدة أن يكون لها أكثر من معلم.`,
      });
    }

    // التحقق من أن الحلقة ليس لها معلم آخر
    const existingGroupWithDifferentTeacher = await Group.findOne({
      name: name,
      $and: [
        { teacher: { $ne: teacher } },
        { teacher: { $ne: teacherExists._id } },
        { teacher: { $ne: teacherExists._id.toString() } },
        { teacher: { $exists: true, $ne: null, $ne: "" } },
      ],
    });

    if (existingGroupWithDifferentTeacher) {
      return res.status(400).json({
        success: false,
        message: `الحلقة "${name}" مرتبطة بالفعل بمعلم آخر. لا يمكن للحلقة الواحدة أن يكون لها أكثر من معلم.`,
      });
    }

    // إنشاء حلقة جديدة
    console.log("📝 إنشاء الحلقة في قاعدة البيانات...");

    const group = await Group.create({
      name,
      teacher: teacherExists._id, // حفظ ID المعلم بدلاً من الاسم لتجنب التداخل
      teacherName: teacherFullName, // الاحتفاظ بالاسم للعرض
      description,
      capacity,
      schedule,
    });

    console.log("✨ تم إنشاء الحلقة بنجاح:", group._id);

    // تحديث المعلم لإضافة الحلقة إلى قائمة حلقاته
    if (teacherExists) {
      const teacherGroups = teacherExists.groups || [];

      // التحقق من عدم وجود الحلقة مسبقاً
      const groupExists = teacherGroups.some(
        (g) => g.id && g.id.toString() === group._id.toString()
      );

      if (!groupExists) {
        teacherGroups.push({
          id: group._id,
          name: group.name,
          number: teacherGroups.length + 1,
        });

        await Teacher.findByIdAndUpdate(teacherExists._id, {
          groups: teacherGroups,
        });

        console.log(`✅ تم إضافة الحلقة إلى المعلم ${teacherFullName}`);
      }
    }

    res.status(201).json({
      success: true,
      message: "تم إنشاء الحلقة بنجاح",
      data: group,
    });
  } catch (error) {
    console.error("❌ خطأ في إنشاء الحلقة:", error);
    console.error("📋 تفاصيل الخطأ:", error.message);
    console.error("📚 Stack trace:", error.stack);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء الحلقة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Cache بسيط للنتائج (يمكن استبداله بـ Redis في الإنتاج)
let studentCountsCache = {
  data: {},
  timestamp: 0,
  ttl: 60000, // مهلة انتهاء الصلاحية: دقيقة واحدة
};

// دالة محسّنة لحساب عدد الطلاب لجميع الحلقات في استعلام واحد مع caching
const getStudentCountsForAllGroups = async () => {
  const Student = require("../schema/Student");

  try {
    // فحص الـ cache أولاً
    const now = Date.now();
    if (studentCountsCache.timestamp + studentCountsCache.ttl > now) {
      console.log("📋 استخدام البيانات المحفوظة (cache) لعدد الطلاب");
      return studentCountsCache.data;
    }

    console.log("🔄 تحديث إحصائيات الطلاب من قاعدة البيانات...");

    // استخدام aggregation pipeline للحصول على عدد الطلاب لكل حلقة في استعلام واحد
    const studentCounts = await Student.aggregate([
      {
        $match: {
          group: { $exists: true, $ne: null, $ne: "" },
          // يمكن إضافة شروط إضافية مثل: isActive: { $ne: false }
        },
      },
      {
        $group: {
          _id: "$group", // تجميع حسب اسم الحلقة
          count: { $sum: 1 }, // عد الطلاب
        },
      },
    ]);

    // تحويل النتيجة إلى object للبحث السريع
    const countMap = {};
    studentCounts.forEach((item) => {
      countMap[item._id] = item.count;
    });

    // حفظ في الـ cache
    studentCountsCache = {
      data: countMap,
      timestamp: now,
      ttl: 60000,
    };

    console.log(`✅ تم تحديث إحصائيات ${studentCounts.length} حلقة`);
    return countMap;
  } catch (error) {
    console.error("خطأ في حساب عدد الطلاب:", error);
    return {};
  }
};

// دالة لإبطال cache عدد الطلاب (يتم استدعاؤها عند تعديل بيانات الطلاب)
const invalidateStudentCountsCache = () => {
  console.log("🗑️ إبطال cache عدد الطلاب");
  studentCountsCache.timestamp = 0;
};

// تصدير الدالة للاستخدام في controllers أخرى
exports.invalidateStudentCountsCache = invalidateStudentCountsCache;

// الحصول على جميع الحلقات
exports.getAllGroups = async (req, res) => {
  try {
    const startTime = Date.now();
    const Teacher = require("../schema/Teacher");

    // جلب جميع الحلقات و عدد الطلاب بشكل متوازي للسرعة
    const [groups, studentCountMap] = await Promise.all([
      Group.find().sort({ createdAt: -1 }),
      getStudentCountsForAllGroups(),
    ]);

    // إضافة عدد الطلاب وحالة السعة ومعلومات المعلم لكل حلقة
    const groupsWithStudentCount = await Promise.all(
      groups.map(async (group) => {
        const currentStudents = studentCountMap[group.name] || 0;
        const capacity = group.capacity || 30;
        const isFull = currentStudents >= capacity;

        // جلب معلومات المعلم إذا كان موجود
        let teacherName = group.teacher || "";
        let teacherInfo = null;

        if (group.teacher) {
          try {
            const teacherStr = String(group.teacher);

            // إذا كان teacher هو ObjectId
            if (/^[0-9a-fA-F]{24}$/.test(teacherStr)) {
              teacherInfo = await Teacher.findById(teacherStr);
              if (teacherInfo) {
                teacherName = `${teacherInfo.firstName} ${teacherInfo.lastName}`;
              }
            }
            // إذا كان teacher هو اسم المعلم بالفعل
            else {
              teacherName = teacherStr;
            }
          } catch (err) {
            console.error("خطأ في معالجة معلومات المعلم:", err);
            teacherName = String(group.teacher);
          }
        }

        return {
          ...group.toObject(),
          teacher: teacherName, // تأكد من أن teacher يحتوي على اسم المعلم
          teacherInfo: teacherInfo
            ? {
                _id: teacherInfo._id,
                firstName: teacherInfo.firstName,
                lastName: teacherInfo.lastName,
                email: teacherInfo.email,
              }
            : null,
          currentStudents,
          capacity,
          isFull,
          availableSpots: Math.max(0, capacity - currentStudents),
          capacityStatus: `${currentStudents}/${capacity}`,
          capacityPercentage: Math.round((currentStudents / capacity) * 100),
        };
      })
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(
      `✓ تم جلب ${groupsWithStudentCount.length} حلقة مع عدد الطلاب في ${duration}ms`
    );

    res.status(200).json({
      success: true,
      data: groupsWithStudentCount,
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الحلقات",
    });
  }
};

// الحصول على حلقة بالمعرف
exports.getGroupById = async (req, res) => {
  try {
    const Student = require("../schema/Student");
    const { id } = req.params;
    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "الحلقة غير موجودة",
      });
    }

    // إضافة عدد الطلاب المشتركين في الحلقة
    const currentStudents = await Student.countDocuments({
      group: group.name,
    });

    res.status(200).json({
      success: true,
      data: {
        ...group.toObject(),
        currentStudents,
      },
    });
  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الحلقة",
    });
  }
};

// تحديث حلقة
exports.updateGroup = async (req, res) => {
  try {
    console.log("🔄 طلب تحديث حلقة");
    console.log("📋 معرف الحلقة:", req.params.id);
    console.log("📝 البيانات المرسلة:", req.body);

    const { id } = req.params;
    const updates = req.body;

    // التأكد من تحويل capacity إلى رقم إذا كان موجود
    if (updates.capacity) {
      updates.capacity = parseInt(updates.capacity);
      console.log("🔢 تحويل السعة إلى رقم:", updates.capacity);
    }

    // إذا كان التحديث يشمل المعلم أو اسم الحلقة، نحتاج للتحقق من القيود
    if (updates.teacher || updates.name) {
      const currentGroup = await Group.findById(id);
      if (!currentGroup) {
        return res.status(404).json({
          success: false,
          message: "الحلقة غير موجودة",
        });
      }

      const groupName = updates.name || currentGroup.name;
      const teacherToCheck = updates.teacher || currentGroup.teacher;

      if (teacherToCheck) {
        // التحقق من أن الحلقة لن تكون لها أكثر من معلم واحد
        const Teacher = require("../schema/Teacher");
        let teacherExists = null;

        // البحث عن المعلم
        if (teacherToCheck.match(/^[0-9a-fA-F]{24}$/)) {
          teacherExists = await Teacher.findById(teacherToCheck);
        } else {
          const nameParts = teacherToCheck.trim().split(/\s+/);
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          if (firstName && lastName) {
            teacherExists = await Teacher.findOne({
              $and: [
                { firstName: { $regex: `^${firstName}$`, $options: "i" } },
                { lastName: { $regex: `^${lastName}$`, $options: "i" } },
              ],
            });
          } else if (firstName) {
            teacherExists = await Teacher.findOne({
              firstName: { $regex: `^${firstName}$`, $options: "i" },
            });
          }
        }

        if (teacherExists) {
          const teacherFullName = `${teacherExists.firstName} ${teacherExists.lastName}`;

          // التحقق من عدم وجود حلقة بنفس الاسم مع معلم مختلف
          const conflictingGroup = await Group.findOne({
            name: groupName,
            _id: { $ne: id }, // استثناء الحلقة الحالية
            $and: [
              { teacher: { $ne: teacherToCheck } },
              { teacher: { $ne: teacherExists._id.toString() } },
              { teacher: { $ne: teacherFullName } },
              { teacher: { $exists: true, $ne: null, $ne: "" } },
            ],
          });

          if (conflictingGroup) {
            return res.status(400).json({
              success: false,
              message: `الحلقة "${groupName}" مرتبطة بالفعل بمعلم آخر. لا يمكن للحلقة الواحدة أن يكون لها أكثر من معلم.`,
            });
          }
        }
      }
    }

    const group = await Group.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!group) {
      console.log("❌ الحلقة غير موجودة");
      return res.status(404).json({
        success: false,
        message: "الحلقة غير موجودة",
      });
    }

    console.log("✅ تم تحديث الحلقة بنجاح:", group);
    res.status(200).json({
      success: true,
      message: "تم تحديث الحلقة بنجاح",
      data: group,
    });
  } catch (error) {
    console.error("❌ خطأ في تحديث الحلقة:", error);
    console.error("📋 تفاصيل الخطأ:", error.message);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث الحلقة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// حذف حلقة (حذف فعلي من قاعدة البيانات)
exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "الحلقة غير موجودة",
      });
    }

    // التحقق من وجود طلاب في الحلقة وإزالتها منهم
    const Student = require("../schema/Student");
    const relatedStudents = await Student.find({
      group: group.name,
    });

    if (relatedStudents.length > 0) {
      console.log(
        `📝 يوجد ${relatedStudents.length} طالب في الحلقة "${group.name}"، سيتم إزالة الحلقة منهم...`
      );

      // إزالة الحلقة من جميع الطلاب المرتبطين بها
      await Student.updateMany(
        { group: group.name },
        { $unset: { group: "" } }
      );

      console.log(`✅ تم إزالة الحلقة من ${relatedStudents.length} طالب`);
    }

    // إزالة الحلقة من المعلمين المرتبطين بها
    const Teacher = require("../schema/Teacher");
    await Teacher.updateMany(
      { "groups.id": id },
      { $pull: { groups: { id: id } } }
    );
    console.log(`✅ تم إزالة الحلقة من المعلمين المرتبطين`);

    // حذف فعلي للحلقة من قاعدة البيانات
    await Group.findByIdAndDelete(id);

    console.log(`🗑️ تم حذف الحلقة "${group.name}" نهائياً من قاعدة البيانات`);

    // إبطال cache عدد الطلاب
    invalidateStudentCountsCache();

    // Emit socket event for real-time updates
    if (global.io) {
      global.io.emit("groupDeleted", { groupId: id, groupName: group.name });
      console.log("📡 Group deleted event emitted via socket");
    }

    res.status(200).json({
      success: true,
      message: "تم حذف الحلقة بنجاح",
      deletedStudentsCount: relatedStudents.length,
    });
  } catch (error) {
    console.error("❌ خطأ في حذف الحلقة:", error);
    console.error("📋 تفاصيل الخطأ:", error.message);
    console.error("📚 Stack trace:", error.stack);

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف الحلقة",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// دالة محسّنة لحساب عدد الطلاب لمعلم محدد
const getStudentCountsForTeacher = async (teacherName) => {
  const Student = require("../schema/Student");

  try {
    const studentCounts = await Student.aggregate([
      {
        $match: {
          teacher: teacherName,
          group: { $exists: true, $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$group",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    studentCounts.forEach((item) => {
      countMap[item._id] = item.count;
    });

    return countMap;
  } catch (error) {
    console.error("خطأ في حساب عدد طلاب المعلم:", error);
    return {};
  }
};

// الحصول على الحلقات حسب المعلم
exports.getGroupsByTeacher = async (req, res) => {
  try {
    const { teacher } = req.params;
    const startTime = Date.now();

    // جلب الحلقات وعدد الطلاب بشكل متوازي
    const [groups, studentCountMap] = await Promise.all([
      Group.find({
        teacher,
        isActive: true,
      }).sort({ createdAt: -1 }),
      getStudentCountsForTeacher(teacher),
    ]);

    // إضافة عدد الطلاب باستخدام البحث السريع
    const groupsWithStudentCount = groups.map((group) => ({
      ...group.toObject(),
      currentStudents: studentCountMap[group.name] || 0,
    }));

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(
      `✓ تم جلب ${groupsWithStudentCount.length} حلقة للمعلم "${teacher}" مع عدد الطلاب في ${duration}ms`
    );

    res.status(200).json({
      success: true,
      data: groupsWithStudentCount,
    });
  } catch (error) {
    console.error("Error fetching groups by teacher:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب حلقات المعلم",
    });
  }
};

// دالة لإعادة تسمية مجموعة وتحديث جميع الطلاب المرتبطين بها
exports.renameGroup = async (req, res) => {
  try {
    const { oldName, newName } = req.body;

    if (!oldName || !newName) {
      return res.status(400).json({
        success: false,
        message: "الاسم القديم والجديد مطلوبان",
      });
    }

    // العثور على المجموعة
    const group = await Group.findOne({ name: oldName });
    if (!group) {
      return res.status(404).json({
        success: false,
        message: `المجموعة "${oldName}" غير موجودة`,
      });
    }

    // التحقق من عدم وجود مجموعة أخرى بالاسم الجديد
    const existingGroup = await Group.findOne({ name: newName });
    if (
      existingGroup &&
      existingGroup._id.toString() !== group._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: `يوجد مجموعة أخرى بالاسم "${newName}" بالفعل`,
      });
    }

    // تحديث اسم المجموعة
    await Group.findByIdAndUpdate(group._id, { name: newName });

    // تحديث جميع الطلاب الذين ينتمون للمجموعة القديمة
    const Student = require("../schema/Student");
    const updateResult = await Student.updateMany(
      { group: oldName },
      { group: newName }
    );

    console.log(`✅ تم تحديث اسم المجموعة من "${oldName}" إلى "${newName}"`);
    console.log(`✅ تم تحديث ${updateResult.modifiedCount} طالب`);

    // إبطال cache عدد الطلاب
    invalidateStudentCountsCache();

    res.status(200).json({
      success: true,
      message: `تم تحديث اسم المجموعة بنجاح من "${oldName}" إلى "${newName}"`,
      updatedStudents: updateResult.modifiedCount,
    });
  } catch (error) {
    console.error("Error renaming group:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إعادة تسمية المجموعة",
    });
  }
};

// الحصول على إحصائيات الحلقات الشهرية
exports.getGroupsMonthlyStats = async (req, res) => {
  try {
    console.log("📊 طلب الحصول على إحصائيات الحلقات الشهرية");

    // جلب جميع الحلقات مع إحصائياتها
    const groups = await Group.find({})
      .select("name teacher teacherName currentMonthStats")
      .sort({ name: 1 });

    // تنسيق البيانات
    const stats = groups.map((group) => ({
      _id: group._id,
      name: group.name,
      teacher: group.teacherName || group.teacher,
      currentMonthStats: group.currentMonthStats || {
        month: null,
        absenceRate: 0,
        attendanceRate: 0,
        totalDays: 0,
        totalAbsences: 0,
        totalPresences: 0,
      },
    }));

    console.log(`✅ تم جلب إحصائيات ${stats.length} حلقة`);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting groups monthly stats:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب إحصائيات الحلقات",
    });
  }
};
