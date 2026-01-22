
const mongoose = require("mongoose");
// We don't need to import Student because req.user IS the student doc if the role matches.
const Group = require("../../schema/Group");

/**
 * Get AI Chat Suggestion based on Student's Context
 * يسترجع اقتراحاً ذكياً بناءً على حلقة الطالب وما يحفظه حالياً
 */
exports.getStudentSuggestion = async (req, res) => {
  try {
    // 1. Check if user is a student
    // Note: 'student' role string might vary ("Student" vs "student"). 
    // Usually standardized to lowercase or specific constant. 
    // Checking req.user.role (added by protect middleware)
    
    // In protect middleware: req.user.role = "student"; (for students)
    // But let's be safe with case-insensitive check or check if specific fields exist
    const role = req.user.role?.toLowerCase();
    
    if (role !== "student") {
      return res.status(200).json({ 
        success: true, 
        suggestion: null,
        message: "Suggestions available for students only" 
      });
    }

    // 2. Get Student's Group Name
    const groupName = req.user.group; // from Student schema

    if (!groupName || groupName === "غير محدد") {
      return res.status(200).json({ 
        success: true, 
        suggestion: null,
        message: "Student has no group"
      });
    }

    // 3. Find the Group active status
    const group = await Group.findOne({ name: groupName });

    if (!group) {
      return res.status(200).json({ 
        success: true, 
        suggestion: null, 
        message: "Group not found"
      });
    }

    let suggestions = [];
    let memSurahNum = null;

    // Helper: Select random ayah between 1 and (limit + 1)
    // We add 1 to limit because user might want to study the NEXT ayah (limit + 1)
    // Or review previous ayahs (1 to limit).
    // Let's bias towards the NEXT ayah (60%) and REVIEW (40%)
    const getSmartRandomAyah = (lastEnd) => {
      const next = (lastEnd || 0) + 1;
      if (lastEnd > 0 && Math.random() > 0.6) {
        // Return a random review ayah
        return Math.floor(Math.random() * lastEnd) + 1;
      }
      return next;
    };

    // 4. Determine Suggestions (Include both Memorization and Review)
    if (group.activeMemorizationSurah && group.activeMemorizationSurah.surahName) {
      // Memorization: Usually we want the NEXT ayah strictly.
      // But user requested randomness. Let's strictly suggest NEXT for memorization context
      // to avoid confusion? No, user explicitly asked for randomness.
      // Let's suggest the NEXT one always (Primary Goal) AND maybe a previous one?
      // No, let's keep it simple: Just the NEXT one for memorization (Target).
      const nextAyah = (group.activeMemorizationSurah.lastAyahEnd || 0) + 1;
      suggestions.push(`تفسير سورة ${group.activeMemorizationSurah.surahName} آية ${nextAyah}`);
      memSurahNum = group.activeMemorizationSurah.surahNumber;
    }
    
    if (group.activeReviewSurah && group.activeReviewSurah.surahName) {
      const revSurahNum = group.activeReviewSurah.surahNumber;
      
      // Review: This is where randomness shines.
      // Reviewing implies going over past material.
      // Let's pick a RANDOM ayah from the range [1 ... lastAyahEnd] 
      // OR the next one [lastAyahEnd + 1].
      const lastReviewEnd = group.activeReviewSurah.lastAyahEnd || 0;
      let targetReviewAyah = 1;

      if (lastReviewEnd > 0) {
        // Pick random ayah from 1 to lastReviewEnd + 1
        targetReviewAyah = Math.floor(Math.random() * (lastReviewEnd + 1)) + 1;
      } else {
        targetReviewAyah = 1;
      }
      
      const reviewSuggestion = `تفسير سورة ${group.activeReviewSurah.surahName} آية ${targetReviewAyah}`;

      // Check duplication
      const isDuplicateByNumber = (memSurahNum && revSurahNum && memSurahNum === revSurahNum);
      // Even if surah is same, ayah might be different now due to randomness!
      // Only suppress if the TEXT is identical (same surah AND same ayah)
      const isDuplicateString = suggestions.includes(reviewSuggestion);

      if (!isDuplicateString) {
          suggestions.push(reviewSuggestion);
      }
    }

    // fallback: if no active surah, suggestions remains empty => frontend handles empty

    return res.status(200).json({
      success: true,
      suggestions: suggestions.length > 0 ? suggestions : null,
      message: suggestions.length > 0 ? "Suggestions found" : "No active surahs found"
    });

  } catch (error) {
    console.error("Error in getStudentSuggestion:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};
