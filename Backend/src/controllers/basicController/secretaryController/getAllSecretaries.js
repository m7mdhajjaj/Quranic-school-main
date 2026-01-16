/**
 * الحصول على جميع السكرتيرين مع البحث المتقدم
 * @access Admin only
 * @query search - نص البحث (يدعم: ID، الهوية، الأسماء، الهاتف، البريد)
 */
const Secretary = require("../../../schema/Secretary");

const getAllSecretaries = async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};

    // إذا كان هناك بحث
    if (search && search.trim()) {
      const searchTerm = search.trim();
      
      // تقسيم البحث إلى كلمات منفصلة
      const searchWords = searchTerm.split(/\s+/);

      // بناء شروط البحث المتعددة
      const searchConditions = [
        // البحث برقم الهوية الوطنية
        { idNumber: { $regex: searchTerm, $options: "i" } },
        
        // البحث برقم الهاتف (مع إزالة المسافات)
        { phoneNumber: { $regex: searchTerm.replace(/\s/g, ""), $options: "i" } },
        
        // البحث بالبريد الإلكتروني
        { email: { $regex: searchTerm, $options: "i" } },
        
        // البحث بالاسم الكامل (نص واحد في أي حقل)
        { firstName: { $regex: searchTerm, $options: "i" } },
        { fatherName: { $regex: searchTerm, $options: "i" } },
        { grandFatherName: { $regex: searchTerm, $options: "i" } },
        { lastName: { $regex: searchTerm, $options: "i" } },
      ];

      // البحث برقم السكرتير (إذا كان رقماً)
      if (!isNaN(searchTerm)) {
        searchConditions.push({ secretaryId: parseInt(searchTerm) });
      }

      // إذا كان البحث متعدد الكلمات (اسم ثنائي أو ثلاثي أو رباعي)
      if (searchWords.length >= 2) {
        // البحث بالاسم الثنائي (firstName + fatherName)
        if (searchWords.length === 2) {
          searchConditions.push({
            $and: [
              { firstName: { $regex: searchWords[0], $options: "i" } },
              { fatherName: { $regex: searchWords[1], $options: "i" } },
            ],
          });
        }
        
        // البحث بالاسم الثلاثي (firstName + fatherName + grandFatherName)
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
        
        // البحث بالاسم الرباعي (firstName + fatherName + grandFatherName + lastName)
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

      query = { $or: searchConditions };
    }

    // الحصول على جميع السكرتيرين (بدون pagination)
    const secretaries = await Secretary.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // حساب العمر لكل سكرتير بناءً على تاريخ الميلاد
    const currentYear = new Date().getFullYear();
    const secretariesWithAge = secretaries.map((sec) => {
      if (sec.birthDate) {
        const birthYear = new Date(sec.birthDate).getFullYear();
        sec.age = currentYear - birthYear;
      }
      return sec;
    });

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
