/**
 * الحصول على جميع السكرتيرين مع البحث والفلترة والترتيب
 * @access Admin only
 * @query search - نص البحث (يدعم: ID، الهوية، الأسماء، الهاتف، البريد)
 * @query gender - فلتر الجنس (all, ذكر, أنثى, male, female)
 * @query minAge - الحد الأدنى للعمر
 * @query maxAge - الحد الأقصى للعمر
 * @query sortBy - حقل الترتيب (secretaryId, firstName, age, email, createdAt)
 * @query sortOrder - اتجاه الترتيب (asc, desc)
 */
const Secretary = require("../../../schema/Secretary");

/**
 * بناء query للبحث والفلترة
 */
const buildSecretaryQuery = (filters) => {
  const query = {};
  const { gender, minAge, maxAge, search } = filters;

  // Gender filter
  if (gender && gender !== 'all') {
    // تحويل القيم العربية للإنجليزية والعكس
    if (gender === 'ذكر' || gender === 'male') {
      query.$or = [{ gender: 'ذكر' }, { gender: 'male' }];
    } else if (gender === 'أنثى' || gender === 'female') {
      query.$or = [{ gender: 'أنثى' }, { gender: 'female' }];
    }
  }

  // Search filter
  if (search && search.trim()) {
    const searchTerm = search.trim();
    const searchWords = searchTerm.split(/\s+/);

    const searchConditions = [
      { idNumber: { $regex: searchTerm, $options: "i" } },
      { phoneNumber: { $regex: searchTerm.replace(/\s/g, ""), $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
      { firstName: { $regex: searchTerm, $options: "i" } },
      { fatherName: { $regex: searchTerm, $options: "i" } },
      { grandFatherName: { $regex: searchTerm, $options: "i" } },
      { lastName: { $regex: searchTerm, $options: "i" } },
    ];

    if (!isNaN(searchTerm)) {
      searchConditions.push({ secretaryId: parseInt(searchTerm) });
    }

    if (searchWords.length >= 2) {
      if (searchWords.length === 2) {
        searchConditions.push({
          $and: [
            { firstName: { $regex: searchWords[0], $options: "i" } },
            { fatherName: { $regex: searchWords[1], $options: "i" } },
          ],
        });
      }
      
      if (searchWords.length === 3) {
        searchConditions.push(
          {
            $and: [
              { firstName: { $regex: searchWords[0], $options: "i" } },
              { fatherName: { $regex: searchWords[1], $options: "i" } },
              { grandFatherName: { $regex: searchWords[2], $options: "i" } },
            ],
          },
          {
            $and: [
              { firstName: { $regex: searchWords[0], $options: "i" } },
              { fatherName: { $regex: searchWords[1], $options: "i" } },
              { lastName: { $regex: searchWords[2], $options: "i" } },
            ],
          }
        );
      }
      
      if (searchWords.length === 4) {
        searchConditions.push({
          $and: [
            { firstName: { $regex: searchWords[0], $options: "i" } },
            { fatherName: { $regex: searchWords[1], $options: "i" } },
            { grandFatherName: { $regex: searchWords[2], $options: "i" } },
            { lastName: { $regex: searchWords[3], $options: "i" } },
          ],
        });
      }
    }

    // دمج شروط البحث مع شروط الجنس إن وجدت
    if (query.$or) {
      // إذا كان هناك فلتر جنس، ندمجه مع البحث
      const genderCondition = query.$or;
      delete query.$or;
      query.$and = [
        { $or: genderCondition },
        { $or: searchConditions }
      ];
    } else {
      query.$or = searchConditions;
    }
  }

  return query;
};

const getAllSecretaries = async (req, res) => {
  try {
    const { search, gender, minAge, maxAge, sortBy, sortOrder } = req.query;

    // بناء query الفلترة
    const query = buildSecretaryQuery({ search, gender });

    // إعداد الترتيب
    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1; // Default: الأحدث أولاً
    }

    // الحصول على السكرتيرين
    const secretaries = await Secretary.find(query)
      .select("-password")
      .sort(sortOptions)
      .lean();

    // حساب العمر لكل سكرتير بناءً على تاريخ الميلاد
    const currentYear = new Date().getFullYear();
    let secretariesWithAge = secretaries.map((sec) => {
      if (sec.birthDate) {
        const birthYear = new Date(sec.birthDate).getFullYear();
        sec.age = currentYear - birthYear;
      }
      return sec;
    });

    // فلترة العمر (بعد حساب العمر)
    if (minAge || maxAge) {
      const min = parseInt(minAge) || 0;
      const max = parseInt(maxAge) || 100;
      secretariesWithAge = secretariesWithAge.filter((sec) => {
        const age = sec.age || 0;
        return age >= min && age <= max;
      });
    }

    // إذا كان الترتيب بالعمر، نرتب بعد حساب العمر
    if (sortBy === 'age') {
      secretariesWithAge.sort((a, b) => {
        const aAge = a.age || 0;
        const bAge = b.age || 0;
        return sortOrder === 'desc' ? bAge - aAge : aAge - bAge;
      });
    }

    res.status(200).json({
      success: true,
      count: secretariesWithAge.length,
      data: secretariesWithAge,
    });
  } catch (error) {
    console.error("Get all secretaries error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب بيانات السكرتيرين",
      error: error.message,
    });
  }
};

module.exports = getAllSecretaries;
