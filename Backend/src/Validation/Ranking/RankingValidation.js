// Validation/RankingValidation.js

/**
 * Ranking data validation middleware with comprehensive rules
 * Validates and sanitizes ranking/leaderboard data to ensure data integrity
 */

/**
 * Check if a value exists and is not empty
 */
const isRequired = (value) => {
  return value !== undefined && value !== null && value.toString().trim() !== '';
};

/**
 * Validate student ID
 */
const validateStudentId = (studentId) => {
  if (!isRequired(studentId)) {
    return { isValid: false, message: 'معرف الطالب مطلوب' };
  }
  
  const studentIdStr = studentId.toString().trim();
  
  // If it's an ObjectId string (24 hex characters)
  if (/^[0-9a-fA-F]{24}$/.test(studentIdStr)) {
    return { isValid: true, value: studentIdStr };
  }
  
  // If it's a student ID (8 digits)
  if (/^\d{8}$/.test(studentIdStr)) {
    return { isValid: true, value: studentIdStr };
  }
  
  return { isValid: false, message: 'معرف الطالب غير صحيح' };
};

/**
 * Validate group ID
 */
const validateGroupId = (groupId) => {
  if (!groupId || groupId.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
  }
  
  const groupIdStr = groupId.toString().trim();
  
  // If it's an ObjectId string
  if (/^[0-9a-fA-F]{24}$/.test(groupIdStr)) {
    return { isValid: true, value: groupIdStr };
  }
  
  return { isValid: false, message: 'معرف المجموعة غير صحيح' };
};

/**
 * Validate section ID
 */
const validateSectionId = (sectionId) => {
  if (!sectionId || sectionId.toString().trim() === '') {
    return { isValid: true, value: null }; // Optional field
  }
  
  const sectionIdStr = sectionId.toString().trim();
  
  // If it's an ObjectId string
  if (/^[0-9a-fA-F]{24}$/.test(sectionIdStr)) {
    return { isValid: true, value: sectionIdStr };
  }
  
  return { isValid: false, message: 'معرف القسم غير صحيح' };
};

/**
 * Validate ranking type
 */
const validateRankingType = (rankingType) => {
  if (!isRequired(rankingType)) {
    return { isValid: false, message: 'نوع الترتيب مطلوب' };
  }
  
  const typeStr = rankingType.toString().trim().toLowerCase();
  const validTypes = [
    'overall', 'monthly', 'weekly', 'semester', 'yearly',
    'subject', 'exam', 'attendance', 'activity', 'behavior',
    'memorization', 'recitation', 'participation'
  ];
  
  if (!validTypes.includes(typeStr)) {
    return { isValid: false, message: 'نوع الترتيب غير مدعوم' };
  }
  
  return { isValid: true, value: typeStr };
};

/**
 * Validate ranking period
 */
const validateRankingPeriod = (period) => {
  if (!period || period.toString().trim() === '') {
    return { isValid: true, value: 'current' }; // Default period
  }
  
  const periodStr = period.toString().trim();
  
  // Check if it's a specific month/year format (YYYY-MM)
  if (/^\d{4}-\d{2}$/.test(periodStr)) {
    return { isValid: true, value: periodStr };
  }
  
  // Check if it's a year format (YYYY)
  if (/^\d{4}$/.test(periodStr)) {
    return { isValid: true, value: periodStr };
  }
  
  // Check if it's a predefined period
  const validPeriods = ['current', 'previous', 'all-time'];
  if (validPeriods.includes(periodStr)) {
    return { isValid: true, value: periodStr };
  }
  
  return { isValid: false, message: 'فترة الترتيب غير صحيحة' };
};

/**
 * Validate score value
 */
const validateScore = (score) => {
  if (score === null || score === undefined) {
    return { isValid: true, value: 0 }; // Default score
  }
  
  const scoreNum = parseFloat(score);
  if (isNaN(scoreNum)) {
    return { isValid: false, message: 'النقاط يجب أن تكون رقم' };
  }
  
  if (scoreNum < 0) {
    return { isValid: false, message: 'النقاط لا يمكن أن تكون أقل من صفر' };
  }
  
  if (scoreNum > 1000000) {
    return { isValid: false, message: 'النقاط كبيرة جداً' };
  }
  
  // Round to 2 decimal places
  return { isValid: true, value: Math.round(scoreNum * 100) / 100 };
};

/**
 * Validate rank position
 */
const validateRankPosition = (rank) => {
  if (rank === null || rank === undefined) {
    return { isValid: true, value: null }; // Will be calculated
  }
  
  const rankNum = parseInt(rank);
  if (isNaN(rankNum) || rankNum < 1) {
    return { isValid: false, message: 'ترتيب المركز يجب أن يكون رقم أكبر من صفر' };
  }
  
  if (rankNum > 10000) {
    return { isValid: false, message: 'ترتيب المركز كبير جداً' };
  }
  
  return { isValid: true, value: rankNum };
};

/**
 * Validate ranking criteria
 */
const validateRankingCriteria = (criteria) => {
  if (!criteria) {
    return { isValid: true, value: {} }; // Default empty criteria
  }
  
  if (typeof criteria !== 'object') {
    return { isValid: false, message: 'معايير الترتيب يجب أن تكون كائن' };
  }
  
  const validatedCriteria = {};
  const errors = [];
  
  // Validate attendance weight
  if (criteria.attendance !== undefined) {
    const attendanceWeight = parseFloat(criteria.attendance);
    if (isNaN(attendanceWeight) || attendanceWeight < 0 || attendanceWeight > 100) {
      errors.push('وزن الحضور يجب أن يكون رقم بين 0 و 100');
    } else {
      validatedCriteria.attendance = attendanceWeight;
    }
  }
  
  // Validate marks weight
  if (criteria.marks !== undefined) {
    const marksWeight = parseFloat(criteria.marks);
    if (isNaN(marksWeight) || marksWeight < 0 || marksWeight > 100) {
      errors.push('وزن الدرجات يجب أن يكون رقم بين 0 و 100');
    } else {
      validatedCriteria.marks = marksWeight;
    }
  }
  
  // Validate behavior weight
  if (criteria.behavior !== undefined) {
    const behaviorWeight = parseFloat(criteria.behavior);
    if (isNaN(behaviorWeight) || behaviorWeight < 0 || behaviorWeight > 100) {
      errors.push('وزن السلوك يجب أن يكون رقم بين 0 و 100');
    } else {
      validatedCriteria.behavior = behaviorWeight;
    }
  }
  
  // Validate participation weight
  if (criteria.participation !== undefined) {
    const participationWeight = parseFloat(criteria.participation);
    if (isNaN(participationWeight) || participationWeight < 0 || participationWeight > 100) {
      errors.push('وزن المشاركة يجب أن يكون رقم بين 0 و 100');
    } else {
      validatedCriteria.participation = participationWeight;
    }
  }
  
  // Check if total weights don't exceed 100%
  const totalWeight = Object.values(validatedCriteria).reduce((sum, weight) => sum + weight, 0);
  if (totalWeight > 100) {
    errors.push('مجموع أوزان المعايير يجب ألا يزيد عن 100%');
  }
  
  if (errors.length > 0) {
    return { isValid: false, message: 'معايير الترتيب غير صحيحة', errors: errors };
  }
  
  return { isValid: true, value: validatedCriteria };
};

/**
 * Validate achievement level
 */
const validateAchievementLevel = (level) => {
  if (!level || level.toString().trim() === '') {
    return { isValid: true, value: 'bronze' }; // Default level
  }
  
  const levelStr = level.toString().trim().toLowerCase();
  const validLevels = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'];
  
  if (!validLevels.includes(levelStr)) {
    return { isValid: false, message: 'مستوى الإنجاز غير صحيح' };
  }
  
  return { isValid: true, value: levelStr };
};

/**
 * Validate badges array
 */
const validateBadges = (badges) => {
  if (!badges) {
    return { isValid: true, value: [] }; // Default empty array
  }
  
  if (!Array.isArray(badges)) {
    return { isValid: false, message: 'الشارات يجب أن تكون مصفوفة' };
  }
  
  if (badges.length > 50) {
    return { isValid: false, message: 'عدد كبير من الشارات (الحد الأقصى 50)' };
  }
  
  const validatedBadges = [];
  const errors = [];
  
  for (let i = 0; i < badges.length; i++) {
    const badge = badges[i];
    
    if (typeof badge === 'string') {
      const badgeName = badge.trim();
      if (badgeName.length > 0 && badgeName.length <= 100) {
        validatedBadges.push({
          name: badgeName,
          earnedAt: new Date()
        });
      } else {
        errors.push(`الشارة ${i + 1}: اسم الشارة غير صحيح`);
      }
    } else if (typeof badge === 'object' && badge.name) {
      const badgeName = badge.name.toString().trim();
      if (badgeName.length > 0 && badgeName.length <= 100) {
        validatedBadges.push({
          name: badgeName,
          description: badge.description ? badge.description.toString().trim() : '',
          earnedAt: badge.earnedAt ? new Date(badge.earnedAt) : new Date()
        });
      } else {
        errors.push(`الشارة ${i + 1}: اسم الشارة غير صحيح`);
      }
    } else {
      errors.push(`الشارة ${i + 1}: بيانات الشارة غير صحيحة`);
    }
  }
  
  if (errors.length > 0) {
    return { isValid: false, message: 'أخطاء في الشارات', errors: errors };
  }
  
  return { isValid: true, value: validatedBadges };
};

/**
 * Validate ranking statistics
 */
const validateRankingStats = (stats) => {
  if (!stats) {
    return { isValid: true, value: {} }; // Default empty stats
  }
  
  if (typeof stats !== 'object') {
    return { isValid: false, message: 'إحصائيات الترتيب يجب أن تكون كائن' };
  }
  
  const validatedStats = {};
  const errors = [];
  
  // Validate total students
  if (stats.totalStudents !== undefined) {
    const total = parseInt(stats.totalStudents);
    if (isNaN(total) || total < 0) {
      errors.push('إجمالي الطلاب يجب أن يكون رقم أكبر من أو يساوي صفر');
    } else {
      validatedStats.totalStudents = total;
    }
  }
  
  // Validate improvement from last period
  if (stats.improvement !== undefined) {
    const improvement = parseFloat(stats.improvement);
    if (isNaN(improvement)) {
      errors.push('التحسن يجب أن يكون رقم');
    } else {
      validatedStats.improvement = Math.round(improvement * 100) / 100;
    }
  }
  
  // Validate streak (consecutive achievements)
  if (stats.streak !== undefined) {
    const streak = parseInt(stats.streak);
    if (isNaN(streak) || streak < 0) {
      errors.push('السلسلة المتتالية يجب أن تكون رقم أكبر من أو تساوي صفر');
    } else {
      validatedStats.streak = streak;
    }
  }
  
  // Validate best rank achieved
  if (stats.bestRank !== undefined) {
    const bestRank = parseInt(stats.bestRank);
    if (isNaN(bestRank) || bestRank < 1) {
      errors.push('أفضل ترتيب يجب أن يكون رقم أكبر من صفر');
    } else {
      validatedStats.bestRank = bestRank;
    }
  }
  
  if (errors.length > 0) {
    return { isValid: false, message: 'إحصائيات الترتيب غير صحيحة', errors: errors };
  }
  
  return { isValid: true, value: validatedStats };
};

/**
 * Validate date range for ranking periods
 */
const validateDateRange = (startDate, endDate) => {
  const errors = [];
  let validatedStart = null;
  let validatedEnd = null;
  
  if (startDate) {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      errors.push('تاريخ البداية غير صحيح');
    } else {
      validatedStart = start;
    }
  }
  
  if (endDate) {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      errors.push('تاريخ النهاية غير صحيح');
    } else {
      validatedEnd = end;
    }
  }
  
  // Check if start date is before end date
  if (validatedStart && validatedEnd && validatedStart >= validatedEnd) {
    errors.push('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
  }
  
  // Check if dates are not in the future (for completed rankings)
  const now = new Date();
  if (validatedEnd && validatedEnd > now) {
    errors.push('تاريخ النهاية لا يمكن أن يكون في المستقبل للترتيبات المكتملة');
  }
  
  if (errors.length > 0) {
    return { isValid: false, message: 'نطاق التاريخ غير صحيح', errors: errors };
  }
  
  return { 
    isValid: true, 
    value: { 
      startDate: validatedStart, 
      endDate: validatedEnd 
    } 
  };
};

/**
 * Sanitize ranking data
 */
const sanitizeRankingData = (data) => {
  const sanitized = {};
  
  // Remove potential XSS and clean up data
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      sanitized[key] = data[key].trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, ''); // Remove javascript: protocols
    } else {
      sanitized[key] = data[key];
    }
  });
  
  return sanitized;
};

/**
 * Main validation middleware for ranking data
 */
const validateRankingData = async (req, res, next) => {
  try {
    console.log('🔍 بدء التحقق من بيانات الترتيب...');
    
    const rawData = req.body;
    
    // Sanitize input data
    const data = sanitizeRankingData(rawData);
    
    const errors = [];
    const validatedData = {};
    
    // Validate student ID
    if (data.studentId !== undefined) {
      const studentValidation = validateStudentId(data.studentId);
      if (!studentValidation.isValid) {
        errors.push(studentValidation.message);
      } else {
        validatedData.studentId = studentValidation.value;
      }
    }
    
    // Validate group ID
    if (data.groupId !== undefined) {
      const groupValidation = validateGroupId(data.groupId);
      if (!groupValidation.isValid) {
        errors.push(groupValidation.message);
      } else {
        validatedData.groupId = groupValidation.value;
      }
    }
    
    // Validate section ID
    if (data.sectionId !== undefined) {
      const sectionValidation = validateSectionId(data.sectionId);
      if (!sectionValidation.isValid) {
        errors.push(sectionValidation.message);
      } else {
        validatedData.sectionId = sectionValidation.value;
      }
    }
    
    // Validate ranking type
    if (data.rankingType !== undefined) {
      const typeValidation = validateRankingType(data.rankingType);
      if (!typeValidation.isValid) {
        errors.push(typeValidation.message);
      } else {
        validatedData.rankingType = typeValidation.value;
      }
    }
    
    // Validate ranking period
    if (data.period !== undefined) {
      const periodValidation = validateRankingPeriod(data.period);
      if (!periodValidation.isValid) {
        errors.push(periodValidation.message);
      } else {
        validatedData.period = periodValidation.value;
      }
    }
    
    // Validate score
    if (data.score !== undefined) {
      const scoreValidation = validateScore(data.score);
      if (!scoreValidation.isValid) {
        errors.push(scoreValidation.message);
      } else {
        validatedData.score = scoreValidation.value;
      }
    }
    
    // Validate rank position
    if (data.rank !== undefined) {
      const rankValidation = validateRankPosition(data.rank);
      if (!rankValidation.isValid) {
        errors.push(rankValidation.message);
      } else {
        validatedData.rank = rankValidation.value;
      }
    }
    
    // Validate ranking criteria
    if (data.criteria !== undefined) {
      const criteriaValidation = validateRankingCriteria(data.criteria);
      if (!criteriaValidation.isValid) {
        errors.push(criteriaValidation.message);
        if (criteriaValidation.errors) {
          errors.push(...criteriaValidation.errors);
        }
      } else {
        validatedData.criteria = criteriaValidation.value;
      }
    }
    
    // Validate achievement level
    if (data.achievementLevel !== undefined) {
      const levelValidation = validateAchievementLevel(data.achievementLevel);
      if (!levelValidation.isValid) {
        errors.push(levelValidation.message);
      } else {
        validatedData.achievementLevel = levelValidation.value;
      }
    }
    
    // Validate badges
    if (data.badges !== undefined) {
      const badgesValidation = validateBadges(data.badges);
      if (!badgesValidation.isValid) {
        errors.push(badgesValidation.message);
        if (badgesValidation.errors) {
          errors.push(...badgesValidation.errors);
        }
      } else {
        validatedData.badges = badgesValidation.value;
      }
    }
    
    // Validate ranking statistics
    if (data.stats !== undefined) {
      const statsValidation = validateRankingStats(data.stats);
      if (!statsValidation.isValid) {
        errors.push(statsValidation.message);
        if (statsValidation.errors) {
          errors.push(...statsValidation.errors);
        }
      } else {
        validatedData.stats = statsValidation.value;
      }
    }
    
    // Validate date range if provided
    if (data.startDate !== undefined || data.endDate !== undefined) {
      const dateValidation = validateDateRange(data.startDate, data.endDate);
      if (!dateValidation.isValid) {
        errors.push(dateValidation.message);
        if (dateValidation.errors) {
          errors.push(...dateValidation.errors);
        }
      } else {
        if (dateValidation.value.startDate) {
          validatedData.startDate = dateValidation.value.startDate;
        }
        if (dateValidation.value.endDate) {
          validatedData.endDate = dateValidation.value.endDate;
        }
      }
    }
    
    // Auto-set timestamp
    validatedData.calculatedAt = new Date();
    
    // Check for validation errors
    if (errors.length > 0) {
      console.log('❌ أخطاء في التحقق من بيانات الترتيب:', errors);
      return res.status(400).json({
        success: false,
        message: 'بيانات الترتيب غير صحيحة',
        errors: errors
      });
    }
    
    // Add validated data to request
    req.validatedData = validatedData;
    
    console.log('✅ تم التحقق من بيانات الترتيب بنجاح');
    next();
    
  } catch (error) {
    console.error('❌ خطأ في التحقق من بيانات الترتيب:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في خادم التحقق من البيانات',
      error: error.message
    });
  }
};

module.exports = {
  validateRankingData,
  sanitizeRankingData,
  validateStudentId,
  validateGroupId,
  validateSectionId,
  validateRankingType,
  validateRankingPeriod,
  validateScore,
  validateRankPosition,
  validateRankingCriteria,
  validateAchievementLevel,
  validateBadges,
  validateRankingStats,
  validateDateRange
};