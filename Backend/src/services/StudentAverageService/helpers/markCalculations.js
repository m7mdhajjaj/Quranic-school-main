// ============================================================================
// helpers/markCalculations.js - Mark Calculation Helper Functions
// ============================================================================

/**
 * Calculate review mark average
 * @param {Array} marks - Array of mark objects
 * @returns {Number|null} - Average or null
 */
exports.calculateReviewAverage = (marks) => {
  try {
    if (!marks || marks.length === 0) return null;

    let total = 0;
    let count = 0;

    marks.forEach((mark) => {
      if (mark.reviewMark !== null && mark.reviewMark !== undefined) {
        total += mark.reviewMark;
        count++;
      }
    });

    if (count === 0) return null;

    const average = parseFloat(((total / count) * 10).toFixed(2));
    console.log(`📊 Review Average: ${average} (from ${count} marks)`);
    return average;
  } catch (error) {
    console.error("❌ Error in calculateReviewAverage:", error);
    return null;
  }
};

/**
 * Calculate memorization mark average
 * @param {Array} marks - Array of mark objects
 * @returns {Number|null} - Average or null
 */
exports.calculateMemorizationAverage = (marks) => {
  try {
    if (!marks || marks.length === 0) return null;

    let total = 0;
    let count = 0;

    marks.forEach((mark) => {
      if (
        mark.memorizationMark !== null &&
        mark.memorizationMark !== undefined
      ) {
        total += mark.memorizationMark;
        count++;
      }
    });

    if (count === 0) return null;

    const average = parseFloat(((total / count) * 10).toFixed(2));
    console.log(`📊 Memorization Average: ${average} (from ${count} marks)`);
    return average;
  } catch (error) {
    console.error("❌ Error in calculateMemorizationAverage:", error);
    return null;
  }
};

/**
 * Calculate overall mark average from review and memorization
 * @param {Number} reviewAverage - Review average (0-100)
 * @param {Number} memorizationAverage - Memorization average (0-100)
 * @returns {Number|null} - Overall average or null
 */
exports.calculateOverallMarkAverage = (reviewAverage, memorizationAverage) => {
  try {
    if (reviewAverage === null && memorizationAverage === null) {
      return null;
    }

    if (reviewAverage !== null && memorizationAverage !== null) {
      const overall = parseFloat(
        ((reviewAverage + memorizationAverage) / 2).toFixed(2)
      );
      console.log(`📊 Overall Average: ${overall}`);
      return overall;
    }

    // If only one is available, use it as overall
    const overall = reviewAverage || memorizationAverage;
    console.log(`📊 Overall Average: ${overall} (single mark type)`);
    return overall;
  } catch (error) {
    console.error("❌ Error in calculateOverallMarkAverage:", error);
    return null;
  }
};

/**
 * Count valid marks by type
 * @param {Array} marks - Array of mark objects
 * @returns {Object} - { reviewCount, memorizationCount, totalCount }
 */
exports.countMarksByType = (marks) => {
  try {
    let reviewCount = 0;
    let memorizationCount = 0;

    marks.forEach((mark) => {
      if (mark.reviewMark !== null && mark.reviewMark !== undefined) {
        reviewCount++;
      }
      if (
        mark.memorizationMark !== null &&
        mark.memorizationMark !== undefined
      ) {
        memorizationCount++;
      }
    });

    return {
      reviewCount,
      memorizationCount,
      totalCount: marks.length,
    };
  } catch (error) {
    console.error("❌ Error in countMarksByType:", error);
    return { reviewCount: 0, memorizationCount: 0, totalCount: 0 };
  }
};

/**
 * Validate mark value
 * @param {Number} mark - Mark value
 * @param {Number} maxMark - Maximum mark value (default: 10)
 * @returns {Boolean}
 */
exports.isValidMark = (mark, maxMark = 10) => {
  try {
    if (mark === null || mark === undefined) return true;
    const num = parseFloat(mark);
    return !isNaN(num) && num >= 0 && num <= maxMark;
  } catch (error) {
    console.error("❌ Error in isValidMark:", error);
    return false;
  }
};
