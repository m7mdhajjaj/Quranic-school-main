import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export interface Dhikr {
  id: number;
  text: string;
  count: number;
  originalCount: number;
}

export interface AzkarCategory {
  id: string;
  title: string;
  icon: string;
  adhkar: Dhikr[];
}

// البيانات الأصلية للأذكار
const getInitialAdhkarData = (): AzkarCategory[] => [
  {
    id: "morning",
    title: "أذكار الصباح",
    icon: "🌅",
    adhkar: [
      {
        id: 1,
        text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        count: 1,
        originalCount: 1,
      },
      {
        id: 2,
        text: "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
        count: 4,
        originalCount: 4,
      },
      {
        id: 3,
        text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ",
        count: 3,
        originalCount: 3,
      },
      {
        id: 4,
        text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ (آية الكرسي)",
        count: 1,
        originalCount: 1,
      },
      {
        id: 5,
        text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        count: 3,
        originalCount: 3,
      },
      {
        id: 6,
        text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
        count: 3,
        originalCount: 3,
      },
      {
        id: 7,
        text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        count: 10,
        originalCount: 10,
      },
    ],
  },
  {
    id: "evening",
    title: "أذكار المساء",
    icon: "🌙",
    adhkar: [
      {
        id: 1,
        text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        count: 1,
        originalCount: 1,
      },
      {
        id: 2,
        text: "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
        count: 4,
        originalCount: 4,
      },
      {
        id: 3,
        text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ",
        count: 3,
        originalCount: 3,
      },
      {
        id: 4,
        text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ (آية الكرسي)",
        count: 1,
        originalCount: 1,
      },
      {
        id: 5,
        text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        count: 3,
        originalCount: 3,
      },
      {
        id: 6,
        text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
        count: 3,
        originalCount: 3,
      },
      {
        id: 7,
        text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        count: 10,
        originalCount: 10,
      },
    ],
  },
  {
    id: "afterPrayer",
    title: "أذكار بعد الصلاة",
    icon: "🕌",
    adhkar: [
      { id: 1, text: "أَسْتَغْفِرُ اللَّهَ", count: 3, originalCount: 3 },
      {
        id: 2,
        text: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
        count: 1,
        originalCount: 1,
      },
      {
        id: 3,
        text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        count: 1,
        originalCount: 1,
      },
      {
        id: 4,
        text: "اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ وَلَا مُعْطِيَ لِمَا مَنَعْتَ وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ",
        count: 1,
        originalCount: 1,
      },
      { id: 5, text: "سُبْحَانَ اللَّهِ", count: 33, originalCount: 33 },
      { id: 6, text: "الْحَمْدُ لِلَّهِ", count: 33, originalCount: 33 },
      { id: 7, text: "اللَّهُ أَكْبَرُ", count: 33, originalCount: 33 },
      {
        id: 8,
        text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        count: 1,
        originalCount: 1,
      },
    ],
  },
  {
    id: "sleep",
    title: "أذكار النوم",
    icon: "😴",
    adhkar: [
      {
        id: 1,
        text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        count: 1,
        originalCount: 1,
      },
      {
        id: 2,
        text: "اللَّهُمَّ إِنَّكَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ",
        count: 1,
        originalCount: 1,
      },
      {
        id: 3,
        text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
        count: 3,
        originalCount: 3,
      },
      {
        id: 4,
        text: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ",
        count: 1,
        originalCount: 1,
      },
      { id: 5, text: "آية الكرسي", count: 1, originalCount: 1 },
      { id: 6, text: "قراءة المعوذتين", count: 3, originalCount: 3 },
    ],
  },
  {
    id: "wakeup",
    title: "أذكار الاستيقاظ",
    icon: "☀️",
    adhkar: [
      {
        id: 1,
        text: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        count: 1,
        originalCount: 1,
      },
      {
        id: 2,
        text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        count: 1,
        originalCount: 1,
      },
      {
        id: 3,
        text: "سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        count: 1,
        originalCount: 1,
      },
    ],
  },
  {
    id: "bathroom",
    title: "أذكار الخلاء",
    icon: "🚪",
    adhkar: [
      {
        id: 1,
        text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ (عند الدخول)",
        count: 1,
        originalCount: 1,
      },
      { id: 2, text: "غُفْرَانَكَ (عند الخروج)", count: 1, originalCount: 1 },
      {
        id: 3,
        text: "الْحَمْدُ لِلَّهِ الَّذِي أَذْهَبَ عَنِّي الْأَذَى وَعَافَانِي (عند الخروج)",
        count: 1,
        originalCount: 1,
      },
    ],
  },
  {
    id: "home",
    title: "أذكار المنزل",
    icon: "🏠",
    adhkar: [
      {
        id: 1,
        text: "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا (عند الدخول)",
        count: 1,
        originalCount: 1,
      },
      {
        id: 2,
        text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ، بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا (عند الدخول)",
        count: 1,
        originalCount: 1,
      },
      {
        id: 3,
        text: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ (عند الخروج)",
        count: 1,
        originalCount: 1,
      },
    ],
  },
  {
    id: "food",
    title: "أذكار الطعام",
    icon: "🍽️",
    adhkar: [
      {
        id: 1,
        text: "بِسْمِ اللَّهِ (قبل الطعام)",
        count: 1,
        originalCount: 1,
      },
      {
        id: 2,
        text: "بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ (إذا نسيت التسمية في البداية)",
        count: 1,
        originalCount: 1,
      },
      {
        id: 3,
        text: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ (بعد الطعام)",
        count: 1,
        originalCount: 1,
      },
      {
        id: 4,
        text: "الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ، غَيْرَ مَكْفِيٍّ وَلَا مُوَدَّعٍ وَلَا مُسْتَغْنًى عَنْهُ رَبَّنَا (بعد الطعام)",
        count: 1,
        originalCount: 1,
      },
      {
        id: 5,
        text: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ، بِسْمِ اللَّهِ (عند الشرب)",
        count: 1,
        originalCount: 1,
      },
    ],
  },
  {
    id: "travel",
    title: "أذكار السفر",
    icon: "🚗",
    adhkar: [
      {
        id: 1,
        text: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ (عند الخروج من المنزل)",
        count: 1,
        originalCount: 1,
      },
      {
        id: 2,
        text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ أَوْ أُضَلَّ، أَوْ أَزِلَّ أَوْ أُزَلَّ، أَوْ أَظْلِمَ أَوْ أُظْلَمَ، أَوْ أَجْهَلَ أَوْ يُجْهَلَ عَلَيَّ (عند الخروج)",
        count: 1,
        originalCount: 1,
      },
      {
        id: 3,
        text: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ (عند الركوب)",
        count: 1,
        originalCount: 1,
      },
      {
        id: 4,
        text: "الْحَمْدُ لِلَّهِ، الْحَمْدُ لِلَّهِ، الْحَمْدُ لِلَّهِ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ (عند الركوب)",
        count: 1,
        originalCount: 1,
      },
      {
        id: 5,
        text: "سُبْحَانَكَ إِنِّي ظَلَمْتُ نَفْسِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ (عند الركوب)",
        count: 1,
        originalCount: 1,
      },
      {
        id: 6,
        text: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى (دعاء السفر)",
        count: 1,
        originalCount: 1,
      },
      {
        id: 7,
        text: "آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ (عند الرجوع من السفر)",
        count: 1,
        originalCount: 1,
      },
    ],
  },
];

// دالة للتحقق من تاريخ اليوم
const getTodayDate = () => {
  const now = new Date();
  return now.toISOString().split("T")[0]; // YYYY-MM-DD
};

// دالة لتحميل البيانات من AsyncStorage
const loadAdhkarData = async (): Promise<AzkarCategory[]> => {
  try {
    const savedDate = await AsyncStorage.getItem("azkar_date");
    const todayDate = getTodayDate();

    // إذا كان التاريخ مختلف أو غير موجود، نرجع البيانات الأصلية
    if (savedDate !== todayDate) {
      await AsyncStorage.setItem("azkar_date", todayDate);
      const initialData = getInitialAdhkarData();
      await AsyncStorage.setItem("azkar_data", JSON.stringify(initialData));
      return initialData;
    }

    // تحميل البيانات المحفوظة
    const savedData = await AsyncStorage.getItem("azkar_data");
    if (savedData) {
      return JSON.parse(savedData);
    }

    // إذا لم توجد بيانات محفوظة، نرجع البيانات الأصلية
    const initialData = getInitialAdhkarData();
    await AsyncStorage.setItem("azkar_data", JSON.stringify(initialData));
    return initialData;
  } catch (error) {
    console.error("Error loading azkar data:", error);
    return getInitialAdhkarData();
  }
};

export const useAzkar = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [adhkarData, setAdhkarData] = useState<AzkarCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // تحميل البيانات
  useEffect(() => {
    const loadData = async () => {
      const data = await loadAdhkarData();
      setAdhkarData(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // حفظ البيانات عند كل تحديث
  useEffect(() => {
    if (adhkarData.length > 0) {
      AsyncStorage.setItem("azkar_data", JSON.stringify(adhkarData)).catch(
        (error) => console.error("Error saving azkar data:", error)
      );
    }
  }, [adhkarData]);

  // التحقق من تغيير التاريخ
  useEffect(() => {
    const checkDateChange = async () => {
      const savedDate = await AsyncStorage.getItem("azkar_date");
      const todayDate = getTodayDate();

      if (savedDate !== todayDate) {
        // إعادة تعيين البيانات
        const initialData = getInitialAdhkarData();
        setAdhkarData(initialData);
        await AsyncStorage.setItem("azkar_date", todayDate);
        await AsyncStorage.setItem("azkar_data", JSON.stringify(initialData));
      }
    };

    // التحقق عند تحميل الصفحة
    checkDateChange();

    // التحقق كل دقيقة
    const interval = setInterval(checkDateChange, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleDhikrClick = (categoryId: string, dhikrId: number) => {
    setAdhkarData((prevData) => {
      return prevData.map((category) => {
        if (category.id === categoryId) {
          const updatedAdhkar = category.adhkar.map((dhikr) => {
            if (dhikr.id === dhikrId && dhikr.count > 0) {
              return { ...dhikr, count: dhikr.count - 1 };
            }
            return dhikr;
          });

          // Check if all adhkar in this category are completed
          const allCompleted = updatedAdhkar.every(
            (dhikr) => dhikr.count === 0
          );
          if (
            allCompleted &&
            !category.adhkar.every((dhikr) => dhikr.count === 0)
          ) {
            setTimeout(() => {
              Alert.alert(
                "مبارك! 🎉",
                `تم إكمال ${category.title} بنجاح\nالحمد لله`,
                [
                  {
                    text: "رائع",
                    onPress: () => setSelectedCategory(null),
                  },
                ]
              );
            }, 300);
          }

          return { ...category, adhkar: updatedAdhkar };
        }
        return category;
      });
    });
  };

  const resetCategory = (categoryId: string) => {
    setAdhkarData((prevData) => {
      return prevData.map((category) => {
        if (category.id === categoryId) {
          const resetAdhkar = category.adhkar.map((dhikr) => ({
            ...dhikr,
            count: dhikr.originalCount,
          }));
          return { ...category, adhkar: resetAdhkar };
        }
        return category;
      });
    });
  };

  const getSelectedCategoryData = () => {
    return adhkarData.find((cat) => cat.id === selectedCategory);
  };

  return {
    selectedCategory,
    setSelectedCategory,
    adhkarData,
    handleDhikrClick,
    resetCategory,
    getSelectedCategoryData,
    isLoading,
  };
};
