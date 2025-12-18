const TestResult = require('../../schema/TestResult');

const generateQuestions = async (req, res) => {
  try {
    const { ayahs, numberOfQuestions } = req.body;

    if (!ayahs || !Array.isArray(ayahs) || ayahs.length === 0) {
      return res.status(400).json({ message: 'No ayahs provided' });
    }

    const questions = [];
    const usedIndices = new Set();

    for (let i = 0; i < Math.min(numberOfQuestions, ayahs.length); i++) {
      // Pick a random ayah
      let randomIndex;
      let attempts = 0;
      do {
        randomIndex = Math.floor(Math.random() * ayahs.length);
        attempts++;
      } while (usedIndices.has(randomIndex) && usedIndices.size < ayahs.length && attempts < 100);
      
      usedIndices.add(randomIndex);
      const ayah = ayahs[randomIndex];
      
      // Simple question type: Complete the Ayah
      const words = ayah.text.split(' ');
      
      // Skip very short ayahs or create a simple question
      if (words.length < 3) {
         // Maybe skip or handle differently
         continue;
      }

      const splitPoint = Math.floor(words.length * 0.6); // Show 60% of the ayah
      const questionText = words.slice(0, splitPoint).join(' ') + ' ...';
      const correctAnswerText = words.slice(splitPoint).join(' ');

      // Generate options
      const options = [correctAnswerText];
      
      // Add 3 fake options from other ayahs
      let distractorAttempts = 0;
      while (options.length < 4 && distractorAttempts < 20) {
          const randomDistractorIndex = Math.floor(Math.random() * ayahs.length);
          if (randomDistractorIndex === randomIndex) {
            distractorAttempts++;
            continue;
          }
          
          const distractorAyah = ayahs[randomDistractorIndex];
          const dWords = distractorAyah.text.split(' ');
          if (dWords.length < 3) {
             distractorAttempts++;
             continue;
          }
          
          const dSplit = Math.floor(dWords.length * 0.6);
          const distractorText = dWords.slice(dSplit).join(' ');
          
          if (!options.includes(distractorText)) {
            options.push(distractorText);
          }
          distractorAttempts++;
      }
      
      // Fill with generic options if we couldn't find enough unique ones (rare case)
      while (options.length < 4) {
        options.push("... " + Math.random().toString(36).substring(7));
      }
      
      // Shuffle options
      const shuffledOptions = options.sort(() => Math.random() - 0.5);
      const correctIndex = shuffledOptions.indexOf(correctAnswerText);

      questions.push({
        id: i,
        type: 'ayah-ending',
        question: `أكمل الآية الكريمة: ${questionText}`,
        options: shuffledOptions,
        correctAnswer: correctIndex,
        ayahNumber: ayah.numberInSurah,
        ayah: ayah.text,
        context: `سورة رقم ${ayah.surahNumber || '?'}`
      });
    }

    res.json(questions);
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ message: 'Server error generating questions' });
  }
};

const saveTestResult = async (req, res) => {
  try {
    const { score, totalQuestions, timeSpent, correctAnswers, wrongAnswers } = req.body;
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    const newResult = new TestResult({
      student: req.user.id,
      score,
      totalQuestions,
      percentage,
      timeSpent,
      correctAnswers,
      wrongAnswers
    });

    await newResult.save();

    res.status(201).json({ message: 'Test result saved successfully', result: newResult });
  } catch (error) {
    console.error('Error saving test result:', error);
    res.status(500).json({ message: 'Server error saving test result' });
  }
};

module.exports = { generateQuestions, saveTestResult };
