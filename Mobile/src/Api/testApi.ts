import api from './api';

// ============================================================================
// Test API - Interactive Quran Quiz System
// ============================================================================

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  surahNumber?: number;
}

export interface Question {
  id: number;
  type: 'hidden-word' | 'next-ayah-start' | 'ayah-ending';
  question: string;
  options: string[];
  correctAnswer: number;
  ayahNumber: number;
  ayah: string;
  context?: string;
}

export interface TestResult {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  correctAnswers: number;
  wrongAnswers: number;
  userAnswers: (number | null)[];
  questions: Question[];
}

// Get all Surahs
export const getAllSurahs = async (): Promise<Surah[]> => {
  try {
    // Try to fetch from our backend first
    const response = await api.get('/quran/surahs');
    return response.data;
  } catch {
    console.log('Fallback to external API for surahs');
    // Fallback to external API
    const response = await fetch('https://api.alquran.cloud/v1/surah');
    const data = await response.json();
    return data.data;
  }
};

// Get Surah with its Ayahs
export const getSurahWithAyahs = async (surahNumber: number): Promise<{
  surah: Surah;
  ayahs: Ayah[];
}> => {
  try {
    // Try to fetch from our backend first
    const response = await api.get(`/quran/surah/${surahNumber}`);
    return response.data;
  } catch {
    console.log('Fallback to external API for surah', surahNumber);
    // Fallback to external API
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
    const data = await response.json();
    return {
      surah: {
        number: data.data.number,
        name: data.data.name,
        englishName: data.data.englishName,
        numberOfAyahs: data.data.numberOfAyahs,
      },
      ayahs: data.data.ayahs.map((ayah: Ayah) => ({
        ...ayah,
        surahNumber: surahNumber,
      }))
    };
  }
};

// Get multiple Surahs with their Ayahs
export const getMultipleSurahsWithAyahs = async (surahNumbers: number[]): Promise<(Ayah & { surahNumber: number })[]> => {
  try {
    const allAyahs: (Ayah & { surahNumber: number })[] = [];

    for (const surahNumber of surahNumbers) {
      const surahData = await getSurahWithAyahs(surahNumber);
      const ayahsWithSurah = surahData.ayahs.map((ayah: Ayah) => ({
        ...ayah,
        surahNumber: surahNumber,
      }));
      allAyahs.push(...ayahsWithSurah);
    }

    return allAyahs;
  } catch (error) {
    console.error('Error fetching multiple surahs:', error);
    throw error;
  }
};

// Generate test questions from ayahs
export const generateTestQuestions = async (
  ayahsData: (Ayah & { surahNumber: number })[],
  numberOfQuestions: number = 10
): Promise<Question[]> => {
  try {
    // Try to generate questions using our backend AI
    const response = await api.post('/test/generate-questions', {
      ayahs: ayahsData.slice(0, numberOfQuestions * 2), // Send more ayahs for better variety
      numberOfQuestions,
    });
    return response.data;
  } catch {
    console.log('Fallback to local question generation');
    // Fallback to local generation
    return generateQuestionsLocally(ayahsData, numberOfQuestions);
  }
};

// Local question generation (fallback)
const generateQuestionsLocally = (
  ayahsData: (Ayah & { surahNumber: number })[],
  numberOfQuestions: number
): Question[] => {
  const questions: Question[] = [];
  const usedAyahs = new Set<number>();
  const questionTypes: Question['type'][] = ['hidden-word', 'next-ayah-start', 'ayah-ending'];

  for (let i = 0; i < numberOfQuestions && i < ayahsData.length; i++) {
    let ayah;
    let attempts = 0;
    
    // Find an unused ayah
    do {
      ayah = ayahsData[Math.floor(Math.random() * ayahsData.length)];
      attempts++;
    } while (usedAyahs.has(ayah.number) && attempts < 50);

    if (attempts >= 50) break; // Prevent infinite loop

    usedAyahs.add(ayah.number);
    
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    const question = generateSingleQuestion(ayah, questionType, i + 1, ayahsData);
    
    if (question) {
      questions.push(question);
    }
  }

  return questions;
};

// Generate a single question
const generateSingleQuestion = (
  ayah: Ayah & { surahNumber: number },
  type: Question['type'],
  id: number,
  allAyahs: (Ayah & { surahNumber: number })[]
): Question | null => {
  const words = ayah.text.split(' ').filter(word => word.length > 2);
  
  if (words.length < 3) return null;

  switch (type) {
    case 'hidden-word':
      return generateHiddenWordQuestion(ayah, words, id);
    case 'next-ayah-start':
      return generateNextAyahQuestion(ayah, allAyahs, id);
    case 'ayah-ending':
      return generateAyahEndingQuestion(ayah, words, id);
    default:
      return null;
  }
};

// Generate hidden word question
const generateHiddenWordQuestion = (
  ayah: Ayah & { surahNumber: number },
  words: string[],
  id: number
): Question => {
  const randomIndex = Math.floor(Math.random() * words.length);
  const hiddenWord = words[randomIndex];
  const questionText = ayah.text.replace(hiddenWord, '___');
  
  // Generate wrong options
  const wrongOptions = generateWrongWordOptions(hiddenWord, words);
  
  // Mix options
  const allOptions = [hiddenWord, ...wrongOptions].sort(() => Math.random() - 0.5);
  const correctAnswer = allOptions.indexOf(hiddenWord);

  return {
    id,
    type: 'hidden-word',
    question: `أكمل الآية التالية:\n"${questionText}"`,
    options: allOptions,
    correctAnswer,
    ayahNumber: ayah.numberInSurah,
    ayah: ayah.text,
    context: `سورة رقم ${ayah.surahNumber}، الآية ${ayah.numberInSurah}`
  };
};

// Generate next ayah question
const generateNextAyahQuestion = (
  ayah: Ayah & { surahNumber: number },
  allAyahs: (Ayah & { surahNumber: number })[],
  id: number
): Question => {
  const words = ayah.text.split(' ');
  const halfLength = Math.floor(words.length / 2);
  const firstHalf = words.slice(0, halfLength).join(' ');
  const secondHalf = words.slice(halfLength).join(' ');
  
  // Generate wrong options from other ayahs
  const wrongOptions = allAyahs
    .filter(a => a.number !== ayah.number)
    .map(a => a.text.split(' ').slice(Math.floor(a.text.split(' ').length / 2)).join(' '))
    .filter(text => text !== secondHalf)
    .slice(0, 3);
  
  const allOptions = [secondHalf, ...wrongOptions].sort(() => Math.random() - 0.5);
  const correctAnswer = allOptions.indexOf(secondHalf);

  return {
    id,
    type: 'next-ayah-start',
    question: `ما هو تكملة هذه الآية؟\n"${firstHalf}..."`,
    options: allOptions,
    correctAnswer,
    ayahNumber: ayah.numberInSurah,
    ayah: ayah.text,
    context: `سورة رقم ${ayah.surahNumber}، الآية ${ayah.numberInSurah}`
  };
};

// Generate ayah ending question
const generateAyahEndingQuestion = (
  ayah: Ayah & { surahNumber: number },
  words: string[],
  id: number
): Question => {
  const lastWords = words.slice(-3).join(' ');
  const beforeLast = words.slice(0, -3).join(' ');
  
  // Generate wrong endings
  const wrongOptions = [
    'والله عليم حكيم',
    'والله غفور رحيم', 
    'إن الله عزيز حكيم'
  ].filter(ending => ending !== lastWords);
  
  const allOptions = [lastWords, ...wrongOptions.slice(0, 3)].sort(() => Math.random() - 0.5);
  const correctAnswer = allOptions.indexOf(lastWords);

  return {
    id,
    type: 'ayah-ending',
    question: `كيف تنتهي هذه الآية؟\n"${beforeLast}..."`,
    options: allOptions,
    correctAnswer,
    ayahNumber: ayah.numberInSurah,
    ayah: ayah.text,
    context: `سورة رقم ${ayah.surahNumber}، الآية ${ayah.numberInSurah}`
  };
};

// Generate wrong word options
const generateWrongWordOptions = (correctWord: string, availableWords: string[]): string[] => {
  const wrongOptions = availableWords
    .filter(word => word !== correctWord && word.length >= 2)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  
  // If not enough words, add common Arabic words
  const commonWords = ['الذي', 'التي', 'الذين', 'اللواتي', 'هذا', 'هذه', 'ذلك', 'تلك'];
  while (wrongOptions.length < 3) {
    const word = commonWords[Math.floor(Math.random() * commonWords.length)];
    if (!wrongOptions.includes(word) && word !== correctWord) {
      wrongOptions.push(word);
    }
  }
  
  return wrongOptions.slice(0, 3);
};

// Save test result
export const saveTestResult = async (result: TestResult): Promise<void> => {
  try {
    await api.post('/test/results', result);
  } catch (saveError) {
    console.log('Could not save test result:', saveError);
    // Store locally as fallback
    const results = JSON.parse(localStorage.getItem('testResults') || '[]');
    results.push({
      ...result,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('testResults', JSON.stringify(results));
  }
};

// Get user test history
export const getUserTestHistory = async (): Promise<TestResult[]> => {
  try {
    const response = await api.get('/test/history');
    return response.data;
  } catch {
    console.log('Fallback to local test history');
    return JSON.parse(localStorage.getItem('testResults') || '[]');
  }
};

// Get test statistics
export const getTestStatistics = async (): Promise<{
  averageScore: number;
  totalTests: number;
  bestScore: number;
  improvementTrend: number;
}> => {
  try {
    const response = await api.get('/test/statistics');
    return response.data;
  } catch {
    console.log('Fallback to local statistics calculation');
    const results = JSON.parse(localStorage.getItem('testResults') || '[]');
    
    if (results.length === 0) {
      return {
        averageScore: 0,
        totalTests: 0,
        bestScore: 0,
        improvementTrend: 0,
      };
    }
    
    const scores = results.map((r: TestResult) => (r.score / r.totalQuestions) * 100);
    const averageScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
    const bestScore = Math.max(...scores);
    
    return {
      averageScore,
      totalTests: results.length,
      bestScore,
      improvementTrend: results.length > 1 ? scores[scores.length - 1] - scores[0] : 0,
    };
  }
};