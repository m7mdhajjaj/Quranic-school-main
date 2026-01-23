
const mongoose = require("mongoose");
// We don't need to import Student because req.user IS the student doc if the role matches.
const Group = require("../../schema/Group");

/**
 * Get AI Chat Suggestion based on Student's Context
 * يسترجع اقتراحاً ذكياً بناءً على حلقة الطالب وما يحفظه حالياً
 * ✅ يُرجع أسماء السور فقط - الطالب يختار السورة ثم يكتب رقم الآية بنفسه
 */
exports.getStudentSuggestion = async (req, res) => {
  try {
    // 1. Check if user is a student
    const role = req.user.role?.toLowerCase();
    
    if (role !== "student") {
      return res.status(200).json({ 
        success: true, 
        suggestions: null,
        message: "Suggestions available for students only" 
      });
    }

    // 2. Get Student's Group Name
    const groupName = req.user.group;

    if (!groupName || groupName === "غير محدد") {
      return res.status(200).json({ 
        success: true, 
        suggestions: null,
        message: "Student has no group"
      });
    }

    // 3. Find the Group active status
    const group = await Group.findOne({ name: groupName });

    if (!group) {
      return res.status(200).json({ 
        success: true, 
        suggestions: null, 
        message: "Group not found"
      });
    }

    let suggestions = [];

    // 4. ✅ إرجاع أسماء السور فقط (بدون رقم الآية)
    // الطالب يختار السورة → تنتقل للشات → يكتب رقم الآية بنفسه
    
    if (group.activeMemorizationSurah && group.activeMemorizationSurah.surahName) {
      suggestions.push({
        type: "memorization",
        surahName: group.activeMemorizationSurah.surahName,
        surahNumber: group.activeMemorizationSurah.surahNumber,
        label: `سورة ${group.activeMemorizationSurah.surahName}`,
        // ✅ نص يُنقل للشات - الطالب يُكمل برقم الآية
        chatText: `تفسير سورة ${group.activeMemorizationSurah.surahName} آية `
      });
    }
    
    if (group.activeReviewSurah && group.activeReviewSurah.surahName) {
      const revSurahName = group.activeReviewSurah.surahName;
      const memSurahName = group.activeMemorizationSurah?.surahName;
      
      // تجنب التكرار
      if (revSurahName !== memSurahName) {
        suggestions.push({
          type: "review",
          surahName: group.activeReviewSurah.surahName,
          surahNumber: group.activeReviewSurah.surahNumber,
          label: `سورة ${group.activeReviewSurah.surahName}`,
          chatText: `تفسير سورة ${group.activeReviewSurah.surahName} آية `
        });
      }
    }

    return res.status(200).json({
      success: true,
      suggestions: suggestions.length > 0 ? suggestions : null,
      message: suggestions.length > 0 ? "Surah suggestions found" : "No active surahs found"
    });

  } catch (error) {
    console.error("Error in getStudentSuggestion:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};
