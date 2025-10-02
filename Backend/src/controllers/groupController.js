const Group = require("../models/Group");

// إنشاء حلقة جديدة
exports.createGroup = async (req, res) => {
  try {
    const { name, teacher, description, capacity, schedule } = req.body;

    // التحقق من وجود الحلقة بنفس الاسم
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({
        success: false,
        message: "يوجد حلقة بنفس الاسم بالفعل",
      });
    }

    // إنشاء حلقة جديدة
    const group = await Group.create({
      name,
      teacher,
      description,
      capacity,
      schedule,
    });

    res.status(201).json({
      success: true,
      message: "تم إنشاء الحلقة بنجاح",
      data: group,
    });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء الحلقة",
    });
  }
};

// الحصول على جميع الحلقات
exports.getAllGroups = async (req, res) => {
  try {
    // جلب جميع الحلقات (حتى غير النشطة) لعرضها في لوحة التحكم
    const groups = await Group.find().sort({ createdAt: -1 });

    console.log(`✓ تم جلب ${groups.length} حلقة من قاعدة البيانات`);

    res.status(200).json({
      success: true,
      data: groups,
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
    const { id } = req.params;
    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "الحلقة غير موجودة",
      });
    }

    res.status(200).json({
      success: true,
      data: group,
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
    const { id } = req.params;
    const updates = req.body;

    const group = await Group.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "الحلقة غير موجودة",
      });
    }

    res.status(200).json({
      success: true,
      message: "تم تحديث الحلقة بنجاح",
      data: group,
    });
  } catch (error) {
    console.error("Error updating group:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث الحلقة",
    });
  }
};

// حذف حلقة (تعطيلها بدلاً من الحذف)
exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "الحلقة غير موجودة",
      });
    }

    res.status(200).json({
      success: true,
      message: "تم حذف الحلقة بنجاح",
    });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حذف الحلقة",
    });
  }
};

// الحصول على الحلقات حسب المعلم
exports.getGroupsByTeacher = async (req, res) => {
  try {
    const { teacher } = req.params;
    const groups = await Group.find({
      teacher,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    console.error("Error fetching groups by teacher:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب حلقات المعلم",
    });
  }
};
