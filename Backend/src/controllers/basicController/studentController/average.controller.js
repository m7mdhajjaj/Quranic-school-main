const {
  calculateAndUpdateMonthlyAverage,
  getMonthlyAverage,
  getAllMonthlyAverages,
  calculateOverallAverage,
} = require("../../../services/StudentAverageService");

/**
 * جلب المعدل الشهري لطالب
 */
exports.getStudentMonthlyAverage = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "الشهر والسنة مطلوبان",
      });
    }

    const average = await getMonthlyAverage(
      studentId,
      parseInt(month),
      parseInt(year)
    );

    if (!average) {
      return res.status(404).json({
        success: false,
        message: "لا توجد معدلات لهذا الشهر",
      });
    }

    res.json({
      success: true,
      data: average,
    });
  } catch (error) {
    console.error("خطأ في الحصول على المعدل الشهري:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء الحصول على المعدل الشهري",
      error: error.message,
    });
  }
};

/**
 * جلب جميع المعدلات الشهرية لطالب
 */
exports.getAllStudentMonthlyAverages = async (req, res) => {
  try {
    const { studentId } = req.params;

    const averages = await getAllMonthlyAverages(studentId);

    res.json({
      success: true,
      data: averages,
    });
  } catch (error) {
    console.error("خطأ في الحصول على جميع المعدلات الشهرية:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء الحصول على المعدلات الشهرية",
      error: error.message,
    });
  }
};

/**
 * حساب وتحديث المعدل الشهري لطالب
 */
exports.calculateStudentMonthlyAverage = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "الشهر والسنة مطلوبان",
      });
    }

    const average = await calculateAndUpdateMonthlyAverage(
      studentId,
      month,
      year
    );

    if (!average) {
      return res.status(404).json({
        success: false,
        message: "لا توجد علامات لهذا الشهر",
      });
    }

    res.json({
      success: true,
      data: average,
      message: "تم حساب المعدل الشهري بنجاح",
    });
  } catch (error) {
    console.error("خطأ في حساب المعدل الشهري:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حساب المعدل الشهري",
      error: error.message,
    });
  }
};

/**
 * جلب المعدل الإجمالي لطالب
 */
exports.getStudentOverallAverage = async (req, res) => {
  try {
    const { studentId } = req.params;

    const average = await calculateOverallAverage(studentId);

    if (!average) {
      return res.status(404).json({
        success: false,
        message: "لا توجد معدلات للطالب",
      });
    }

    res.json({
      success: true,
      data: average,
    });
  } catch (error) {
    console.error("خطأ في حساب المعدل الإجمالي:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حساب المعدل الإجمالي",
      error: error.message,
    });
  }
};
