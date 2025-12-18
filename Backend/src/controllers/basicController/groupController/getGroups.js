// ============================================
// READ GROUP OPERATIONS
// ============================================

const Group = require("../../../schema/Group");
const Student = require("../../../schema/Student");
const ExamSchedule = require("../../../schema/ExamSchedule");
const TimeTable = require("../../../schema/TimeTable");
const Teacher = require("../../../schema/Teacher");
const { getStudentCountsForAllGroups, getStudentCountsForTeacher } = require("./cache");
const { getTeacherInfo } = require("./helpers");
const { successResponse, notFoundResponse, handleError } = require("./utils");

/**
 * الحصول على جميع الحلقات مع الفلترة والترتيب والـ pagination
 * GET /api/groups?search=&capacity=&status=&sortBy=&sortOrder=&page=&limit=
 */
exports.getAllGroups = async (req, res) => {
  try {
    const startTime = Date.now();

    // استخراج الفلاتر من query parameters
    const {
      search,
      capacity,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 1000,
    } = req.query;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // بناء pipeline للـ aggregation
    const pipeline = [];

    // 1. Join مع Teacher collection للبحث في أسماء المعلمين
    pipeline.push({
      $lookup: {
        from: 'teachers',
        localField: 'teacher',
        foreignField: '_id',
        as: 'teacherData'
      }
    });

    // 2. إضافة حقول متعددة للبحث عن المعلم
    pipeline.push({
      $addFields: {
        teacherFirstName: { $arrayElemAt: ['$teacherData.firstName', 0] },
        teacherFatherName: { $arrayElemAt: ['$teacherData.fatherName', 0] },
        teacherLastName: { $arrayElemAt: ['$teacherData.lastName', 0] },
        teacherFullName: {
          $trim: {
            input: {
              $concat: [
                { $ifNull: [{ $arrayElemAt: ['$teacherData.firstName', 0] }, ''] },
                ' ',
                { $ifNull: [{ $arrayElemAt: ['$teacherData.fatherName', 0] }, ''] },
                ' ',
                { $ifNull: [{ $arrayElemAt: ['$teacherData.lastName', 0] }, ''] }
              ]
            }
          }
        },
        teacherFirstLast: {
          $trim: {
            input: {
              $concat: [
                { $ifNull: [{ $arrayElemAt: ['$teacherData.firstName', 0] }, ''] },
                ' ',
                { $ifNull: [{ $arrayElemAt: ['$teacherData.lastName', 0] }, ''] }
              ]
            }
          }
        }
      }
    });

    // 3. بناء الفلاتر
    const matchStage = {};

    // فلتر البحث النصي (يشمل جميع أشكال اسم المعلم)
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      matchStage.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { schedule: searchRegex },
        { teacherFirstName: searchRegex },      // الاسم الأول فقط
        { teacherFullName: searchRegex },       // الاسم الثلاثي
        { teacherFirstLast: searchRegex },      // الاسم الأول + العائلة
      ];
    }

    // فلتر السعة
    if (capacity && capacity !== 'all') {
      switch (capacity) {
        case 'small':
          matchStage.capacity = { $lte: 15 };
          break;
        case 'medium':
          matchStage.capacity = { $gt: 15, $lte: 25 };
          break;
        case 'large':
          matchStage.capacity = { $gt: 25 };
          break;
      }
    }

    // فلتر الحالة
    if (status && status !== 'all') {
      matchStage.activeStatus = status === 'active';
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // 4. إحصاء الكلي قبل pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Group.aggregate(countPipeline);
    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    // 5. الترتيب
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    pipeline.push({ $sort: sortOptions });

    // 6. Pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    // 7. تنفيذ الـ aggregation
    const [groups, studentCountMap] = await Promise.all([
      Group.aggregate(pipeline),
      getStudentCountsForAllGroups(),
    ]);

    // إضافة عدد الطلاب وحالة السعة ومعلومات المعلم لكل حلقة
    let groupsWithStudentCount = await Promise.all(
      groups.map(async (group) => {
        const currentStudents = studentCountMap[group.name] || 0;
        const capacity = group.capacity || 30;
        const capacityPercentage = Math.round((currentStudents / capacity) * 100);
        const isFull = currentStudents >= capacity;

        // استخدام اسم المعلم الكامل من الـ aggregation
        const teacherName = group.teacherFullName || "غير محدد";
        
        // جلب معلومات المعلم الكاملة إذا كان موجود
        let teacherInfo = null;
        if (group.teacher) {
          const teacherData = await getTeacherInfo(group.teacher);
          teacherInfo = teacherData.info;
        }

        // جلب أوقات الحلقة من TimeTable
        const timetable = await TimeTable.find({ groupId: group._id })
          .select("day startHour endHour")
          .sort({ day: 1, startHour: 1 })
          .lean();

        // ترتيب الأيام بشكل صحيح
        const daysOrder = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
        const sortedTimetable = timetable.sort((a, b) => {
          return daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
        });

        // تحديد حالة الحلقة: فعالة إذا كان لها معلم وفيها طالب واحد على الأقل
        const activeStatus = !!group.teacher && currentStudents > 0;

        // ✅ إرسال بيانات كاملة مع default values من Backend
        // استخدام spread operator مباشرة بدون toObject() لأن النتيجة من aggregation
        return {
          ...group,
          name: group.name || "",
          teacher: teacherName, // استخدام الاسم من aggregation
          teacherInfo,
          teacherData: undefined, // إزالة teacherData من النتيجة النهائية
          teacherName: undefined, // إزالة teacherName الزائد
          description: group.description || "",
          schedule: group.schedule || "غير محدد",
          currentStudents,
          capacity,
          capacityPercentage,
          isFull,
          activeStatus, // حالة الحلقة (فعالة/غير فعالة)
          availableSpots: Math.max(0, capacity - currentStudents),
          capacityStatus: `${currentStudents}/${capacity}`,
          timetable: sortedTimetable, // أوقات الحلقة من TimeTable
        };
      })
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(
      `✓ تم جلب ${groupsWithStudentCount.length} حلقة من ${totalCount} في ${duration}ms`
    );

    res.status(200).json({
      success: true,
      data: groupsWithStudentCount,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum),
        showing: groupsWithStudentCount.length,
      },
    });
  } catch (error) {
    return handleError(res, error, "جلب الحلقات");
  }
};

/**
 * الحصول على حلقة بالمعرف
 */
exports.getGroupById = async (req, res) => {
  try {
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

    return successResponse(res, { ...group.toObject(), currentStudents });
  } catch (error) {
    return handleError(res, error, "جلب الحلقة");
  }
};

/**
 * الحصول على الحلقات حسب المعلم
 */
exports.getGroupsByTeacher = async (req, res) => {
  try {
    const { teacher } = req.params;
    const startTime = Date.now();

    // جلب الحلقات وعدد الطلاب بشكل متوازي
    const [groups, studentCountMap] = await Promise.all([
      Group.find({
        teacher,
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

/**
 * الحصول على إحصائيات الحلقات الشهرية
 */
exports.getGroupsMonthlyStats = async (req, res) => {
  try {
    console.log("📊 طلب الحصول على إحصائيات الحلقات الشهرية");

    // جلب جميع الحلقات مع إحصائياتها
    const groups = await Group.find({})
      .select("name teacher currentMonthStats")
      .sort({ name: 1 });

    // تنسيق البيانات
    const stats = groups.map((group) => ({
      _id: group._id,
      name: group.name,
      teacher: group.teacher,
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

/**
 * 🆕 جلب طلاب حلقة معينة بكامل معلوماتهم
 * GET /api/groups/:id/students
 */
exports.getGroupStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeDetails = 'true', search, gender } = req.query;
    
    console.log(`👥 جلب طلاب الحلقة - ID: ${id}, مع التفاصيل: ${includeDetails}, بحث: ${search}, جنس: ${gender}`);
    const startTime = Date.now();

    // 1. جلب الحلقة
    const group = await Group.findById(id).lean();
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "الحلقة غير موجودة",
      });
    }

    // 2. بناء query للطلاب
    const query = { group: group.name };
    
    // فلتر الجنس
    if (gender && (gender === 'ذكر' || gender === 'أنثى' || gender === 'male' || gender === 'female')) {
      const normalizedGender = gender === 'male' ? 'ذكر' : gender === 'female' ? 'أنثى' : gender;
      query.gender = normalizedGender;
    }

    // 3. جلب الطلاب
    let students;
    
    if (includeDetails === 'true') {
      // جلب الطلاب مع كامل معلوماتهم
      students = await Student.find(query)
        .select('-password') // استبعاد الحقول الحساسة
        .lean()
        .sort({ firstName: 1, lastName: 1 });
    } else {
      // جلب الطلاب بمعلومات مختصرة فقط
      students = await Student.find(query)
        .select('studentId firstName lastName')
        .lean()
        .sort({ firstName: 1, lastName: 1 });
    }

    // 4. تطبيق البحث على النتائج (البحث في الاسم الكامل ورقم الهوية)
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      students = students.filter((student) => {
        // البحث في الاسم الكامل (أول، أب، جد، عائلة)
        const fullName = [
          student.firstName,
          student.fatherName,
          student.grandFatherName,
          student.lastName
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        
        // البحث في رقم الهوية
        const idNumber = student.idNumber ? student.idNumber.toLowerCase() : '';
        
        // البحث في رقم الطالب
        const studentId = student.studentId ? student.studentId.toString() : '';
        
        return (
          fullName.includes(searchTerm) ||
          idNumber.includes(searchTerm) ||
          studentId.includes(searchTerm)
        );
      });
    }

    const duration = Date.now() - startTime;
    console.log(`✅ تم جلب ${students.length} طالب من الحلقة "${group.name}" في ${duration}ms`);

    res.json({
      success: true,
      data: {
        group: {
          _id: group._id,
          name: group.name,
          teacher: group.teacher,
          capacity: group.capacity || 30,
        },
        students: students,
        totalStudents: students.length,
      },
    });
  } catch (error) {
    console.error("❌ خطأ في جلب طلاب الحلقة:", error);
    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء جلب طلاب الحلقة",
    });
  }
};

/**
 * 🆕 الحصول على حلقات المعلم بفلاتر مرنة
 * Query params:
 * - teacherId: ID المعلم (required)
 * - filter: 'all' | 'withStudents' | 'withoutStudents' | 'active' (default: 'all')
 * - includeStudents: true | false (default: false) - هل نجلب بيانات الطلاب مع الحلقات
 */
exports.getGroupsByTeacherIdWithFilters = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { filter = 'all', includeStudents = 'false' } = req.query;

    console.log(`⚡ جلب حلقات المعلم - ID: ${teacherId}, فلتر: ${filter}, مع الطلاب: ${includeStudents}`);
    const startTime = Date.now();

    // 1. جلب المعلم
    const Teacher = require("../../../schema/Teacher");
    const teacher = await Teacher.findById(teacherId).select("firstName lastName");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "المعلم غير موجود",
      });
    }

    const teacherFullName = `${teacher.firstName} ${teacher.lastName}`;

    // 2. جلب حلقات المعلم
    const groups = await Group.find({
      teacher: teacherId
    })
      .select("name _id capacity description schedule activeStatus")
      .lean()
      .sort({ name: 1 });

    console.log(`📚 تم جلب ${groups.length} حلقة للمعلم`);

    // 3. جلب عدد الطلاب وعدد الامتحانات لكل حلقة
    const groupNames = groups.map((g) => g.name);
    
    const [studentCounts, examCounts] = await Promise.all([
      Student.aggregate([
        { $match: { group: { $in: groupNames } } },
        { $group: { _id: "$group", count: { $sum: 1 } } },
      ]),
      ExamSchedule.aggregate([
        { $match: { group: { $in: groupNames } } },
        { $group: { _id: "$group", count: { $sum: 1 } } },
      ])
    ]);

    const studentCountMap = new Map(
      studentCounts.map((item) => [item._id, item.count])
    );
    
    const examCountMap = new Map(
      examCounts.map((item) => [item._id, item.count])
    );

    // 4. إضافة معلومات الطلاب والامتحانات لكل حلقة
    let groupsWithInfo = groups.map((group) => {
      const currentStudents = studentCountMap.get(group.name) || 0;
      const examCount = examCountMap.get(group.name) || 0;
      // ✅ حساب حالة النشاط بشكل ديناميكي: الحلقة نشطة إذا فيها طالب واحد على الأقل
      const isActive = currentStudents > 0;
      
      return {
        ...group,
        currentStudents,
        totalStudents: currentStudents, // إجمالي عدد الطلاب (نفس currentStudents)
        examCount, // عدد الامتحانات
        capacity: group.capacity || 30,
        hasStudents: currentStudents > 0,
        isEmpty: currentStudents === 0,
        activeStatus: isActive, // ✅ حالة الحلقة حسب عدد الطلاب الفعلي
      };
    });

    // 5. تطبيق الفلتر
    if (filter === 'withStudents') {
      groupsWithInfo = groupsWithInfo.filter((g) => g.hasStudents);
      console.log(`🔍 فلترة: ${groupsWithInfo.length} حلقة فيها طلاب`);
    } else if (filter === 'withoutStudents') {
      groupsWithInfo = groupsWithInfo.filter((g) => g.isEmpty);
      console.log(`🔍 فلترة: ${groupsWithInfo.length} حلقة فارغة`);
    } else if (filter === 'active') {
      // ✅ فلترة الحلقات النشطة (التي فيها طلاب فعلياً)
      groupsWithInfo = groupsWithInfo.filter((g) => g.currentStudents > 0);
      console.log(`🔍 فلترة: ${groupsWithInfo.length} حلقة نشطة (فيها طلاب)`);
    }

    // 6. جلب الطلاب إذا كان مطلوباً
    if (includeStudents === 'true') {
      console.log('👥 جلب بيانات الطلاب...');
      
      const groupsWithStudents = await Promise.all(
        groupsWithInfo.map(async (group) => {
          const students = await Student.find({ group: group.name })
            .select("studentId firstName lastName group")
            .lean()
            .sort({ firstName: 1 });

          return {
            ...group,
            students: students.map(s => ({
              _id: s._id,
              studentId: s.studentId,
              name: `${s.firstName} ${s.lastName}`,
            })),
            totalStudents: students.length, // تحديث العدد الفعلي من الطلاب المجلوبين
          };
        })
      );

      groupsWithInfo = groupsWithStudents;
    }

    const duration = Date.now() - startTime;
    console.log(`✅ تم جلب ${groupsWithInfo.length} حلقة في ${duration}ms`);

    res.json({
      success: true,
      data: {
        teacher: {
          _id: teacher._id,
          name: teacherFullName,
        },
        groups: groupsWithInfo,
        summary: {
          totalGroups: groups.length,
          groupsWithStudents: groups.filter(g => studentCountMap.get(g.name) > 0).length,
          emptyGroups: groups.filter(g => (studentCountMap.get(g.name) || 0) === 0).length,
          totalStudents: Array.from(studentCountMap.values()).reduce((sum, count) => sum + count, 0),
        },
      },
    });
  } catch (error) {
    console.error("❌ خطأ في جلب حلقات المعلم:", error);
    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء جلب الحلقات",
    });
  }
};

/**
 * الحصول على إحصائيات الحلقات
 * GET /api/groups/stats
 */
exports.getGroupsStats = async (req, res) => {
  try {
    console.log("📊 حساب إحصائيات الحلقات...");
    const startTime = Date.now();

    // جلب جميع الحلقات وعدد الطلاب
    const [groups, studentCountMap] = await Promise.all([
      Group.find().lean(),
      getStudentCountsForAllGroups(),
    ]);

    // حساب الإحصائيات
    const totalGroups = groups.length;
    
    let totalStudents = 0;
    let fullGroups = 0;
    let emptyGroups = 0;
    let totalCapacity = 0;
    const teacherStats = {};

    groups.forEach(group => {
      const capacity = group.capacity || 30;
      const currentStudents = studentCountMap[group.name] || 0;
      
      totalCapacity += capacity;
      totalStudents += currentStudents;
      
      // تحديد الحلقات الممتلئة والفارغة
      if (currentStudents >= capacity) {
        fullGroups++;
      }
      if (currentStudents === 0) {
        emptyGroups++;
      }

      // إحصائيات حسب المعلم
      const teacherName = group.teacher || 'غير محدد';
      if (!teacherStats[teacherName]) {
        teacherStats[teacherName] = {
          teacher: teacherName,
          groupsCount: 0,
          studentsCount: 0,
        };
      }
      teacherStats[teacherName].groupsCount++;
      teacherStats[teacherName].studentsCount += currentStudents;
    });

    const availableSeats = Math.max(0, totalCapacity - totalStudents);
    const occupancyRate = totalCapacity > 0 
      ? Math.round((totalStudents / totalCapacity) * 100) 
      : 0;

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ تم حساب إحصائيات ${totalGroups} حلقة في ${duration}ms`);

    res.status(200).json({
      success: true,
      data: {
        totalGroups,
        totalStudents,
        fullGroups,
        emptyGroups,
        totalCapacity,
        availableSeats,
        occupancyRate,
        activeGroups: totalGroups - emptyGroups,
        byTeacher: Object.values(teacherStats).sort((a, b) => b.groupsCount - a.groupsCount),
      },
    });
  } catch (error) {
    return handleError(res, error, "حساب إحصائيات الحلقات");
  }
};
