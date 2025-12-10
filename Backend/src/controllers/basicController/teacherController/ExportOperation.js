const Teacher = require("../../../schema/Teacher");

/**
 * تصدير بيانات المعلمين إلى CSV
 */
exports.exportTeachersToCSV = async (req, res) => {
  try {
    console.log("📥 تصدير بيانات المعلمين إلى CSV...");
    
    // Build query from filters
    const { gender, minAge, maxAge, search, sortBy, sortOrder } = req.query;
    const query = {};

    // Gender filter
    if (gender && gender !== 'all') {
      query.gender = gender;
    }

    // Age filters
    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = parseInt(minAge);
      if (maxAge) query.age.$lte = parseInt(maxAge);
    }

    // Search filter (firstName, lastName, fatherName, email, phoneNumber)
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { fatherName: searchRegex },
        { email: searchRegex },
        { phoneNumber: searchRegex },
      ];
    }

    // Sorting
    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.teacherId = 1; // Default sort
    }
    
    // Fetch all teachers matching the query
    const teachers = await Teacher.find(query)
      .select("-password -avatar -__v")
      .lean()
      .sort(sortOptions);

    if (!teachers || teachers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "لا توجد بيانات للتصدير",
      });
    }

    // CSV Headers
    const headers = [
      "رقم المعلم",
      "الاسم الأول",
      "اسم العائلة",
      "اسم الأب",
      "اسم الجد",
      "اسم الأم",
      "رقم الهوية",
      "البريد الإلكتروني",
      "رقم الهاتف",
      "تاريخ الميلاد",
      "العمر",
      "الجنس",
      "مكان السكن",
      "الدور",
      "الحالة",
    ];

    // Helper to escape CSV fields
    const escapeCSV = (field) => {
      if (field == null || field === undefined) return "";
      const str = String(field);
      // If contains semicolon, newline, or quote, wrap and escape
      if (str.includes(";") || str.includes("\n") || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Helper to format numbers as text for Excel (prevents scientific notation)
    const formatAsText = (value) => {
      if (value == null || value === undefined || value === "") return "";
      // Use Excel formula to force text format
      return `="${value}"`;
    };

    // Format date helper
    const formatDate = (date) => {
      if (!date) return "";
      const d = new Date(date);
      return d.toLocaleDateString("ar-EG");
    };

    // Build CSV rows
    const rows = teachers.map((teacher) => [
      teacher.teacherId || "",
      teacher.firstName || "",
      teacher.lastName || "",
      teacher.fatherName || "",
      teacher.grandFatherName || "",
      teacher.motherName || "",
      formatAsText(teacher.idNumber), // Format as text to prevent scientific notation
      teacher.email || "",
      formatAsText(teacher.phoneNumber), // Format as text
      formatDate(teacher.birthDate),
      teacher.age || "",
      teacher.gender || "",
      teacher.residence || "",
      teacher.role || "",
      teacher.isActive ? "نشط" : "غير نشط",
    ]);

    // Generate CSV content
    const delimiter = ";";
    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(delimiter))
      .join("\r\n");

    // Send CSV with UTF-8 BOM for Excel compatibility
    const filename = `teachers_${new Date().toISOString().split("T")[0]}.csv`;
    
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send("\ufeff" + csvContent);

    console.log(`✅ تم تصدير ${teachers.length} معلم بنجاح`);
  } catch (error) {
    console.error("❌ خطأ في تصدير البيانات:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تصدير البيانات",
      error: error.message,
    });
  }
};
