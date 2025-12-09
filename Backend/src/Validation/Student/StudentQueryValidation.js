/**
 * Student Query Parameters Validation
 * التحقق من صحة معاملات البحث والفلترة للطلاب
 */

const validateStudentSearchQuery = (req, res, next) => {
  const { search, gender, minAge, maxAge, group, sortBy, sortOrder, page, limit, teacher, groupId } = req.query;

  try {
    // Validate search term
    if (search !== undefined) {
      if (typeof search !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'معامل البحث يجب أن يكون نصاً'
        });
      }
      
      // Trim search term
      req.query.search = search.trim();
      
      // Limit search term length
      if (req.query.search.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'معامل البحث طويل جداً (الحد الأقصى 100 حرف)'
        });
      }
    }

    // Validate gender
    if (gender !== undefined && gender !== 'all') {
      const validGenders = ['ذكر', 'أنثى', 'male', 'female'];
      if (!validGenders.includes(gender)) {
        return res.status(400).json({
          success: false,
          message: 'قيمة الجنس غير صالحة'
        });
      }
    }

    // Validate age range
    if (minAge !== undefined) {
      const min = parseInt(minAge);
      if (isNaN(min) || min < 0 || min > 150) {
        return res.status(400).json({
          success: false,
          message: 'الحد الأدنى للعمر غير صالح'
        });
      }
      req.query.minAge = min;
    }

    if (maxAge !== undefined) {
      const max = parseInt(maxAge);
      if (isNaN(max) || max < 0 || max > 150) {
        return res.status(400).json({
          success: false,
          message: 'الحد الأقصى للعمر غير صالح'
        });
      }
      req.query.maxAge = max;
    }

    // Validate sort parameters
    if (sortBy !== undefined) {
      const validSortFields = ['studentId', 'firstName', 'lastName', 'age', 'gender', 'group', 'teacher', 'createdAt'];
      if (!validSortFields.includes(sortBy)) {
        return res.status(400).json({
          success: false,
          message: 'حقل الترتيب غير صالح'
        });
      }
    }

    if (sortOrder !== undefined) {
      const validSortOrders = ['asc', 'desc'];
      if (!validSortOrders.includes(sortOrder)) {
        return res.status(400).json({
          success: false,
          message: 'اتجاه الترتيب غير صالح'
        });
      }
    }

    // Validate pagination
    if (page !== undefined) {
      const pageNum = parseInt(page);
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          success: false,
          message: 'رقم الصفحة غير صالح'
        });
      }
      req.query.page = pageNum;
    }

    if (limit !== undefined) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 10000) {
        return res.status(400).json({
          success: false,
          message: 'حد العناصر غير صالح (1-10000)'
        });
      }
      req.query.limit = limitNum;
    }

    // Validate group and teacher filters
    if (group !== undefined && typeof group !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'معامل الحلقة غير صالح'
      });
    }

    if (teacher !== undefined && typeof teacher !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'معامل المعلم غير صالح'
      });
    }

    if (groupId !== undefined && typeof groupId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'معرف الحلقة غير صالح'
      });
    }

    next();
  } catch (error) {
    console.error('خطأ في التحقق من معاملات البحث:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في التحقق من المعاملات'
    });
  }
};

module.exports = {
  validateStudentSearchQuery
};
