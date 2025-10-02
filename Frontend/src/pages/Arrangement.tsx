import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrangementSkeleton } from "../components/LoadingSkeleton";

// Backend API URL
const API_URL = "http://localhost:5005/api";

// Interface for students from the database
interface DbStudent {
  _id: string;
  firstName: string;
  fatherName: string;
  lastName: string;
  group: string;
  // Other student fields can be added as needed
}

// Interface for period selector
interface Period {
  month: number;
  year: number;
  label?: string;
}

// Interface for ranking student
interface RankingStudent {
  studentId: {
    _id: string;
    firstName: string;
    fatherName: string;
    lastName: string;
    group: string;
  };
  score: number;
  rank?: number;
}

// Interface for rankings
interface Ranking {
  _id: string;
  month: number;
  year: number;
  topThree: RankingStudent[];
  topTen: RankingStudent[];
}

// Interface for new ranking entry
interface NewRankingEntry {
  _id: string;
  name: string;
  score: number;
}

// Interface for User
interface User {
  _id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  role: string;
  groups?: string[];
}

const Arrangement = () => {
  const navigate = useNavigate();

  // State for user role
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isTeacherOrAdmin, setIsTeacherOrAdmin] = useState<boolean>(false);

  // State for all students from database
  const [allDbStudents, setAllDbStudents] = useState<DbStudent[]>([]);

  // State for current ranking
  const [currentRanking, setCurrentRanking] = useState<Ranking | null>(null);

  // State for available periods
  const [availablePeriods, setAvailablePeriods] = useState<Period[]>([]);

  // State for selected period
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);

  // State for loading
  const [loading, setLoading] = useState<boolean>(true);

  // State for error messages
  const [error, setError] = useState<string | null>(null);

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // State for modal type (top3 or general or update)
  const [modalType, setModalType] = useState<"top3" | "general" | "update">(
    "general"
  );

  // State for student selection
  const [selectedStudent, setSelectedStudent] = useState<string>("");

  // State for new ranking entry
  const [newRankingEntry, setNewRankingEntry] = useState<NewRankingEntry>({
    _id: "",
    name: "",
    score: 0,
  }); // Fetch all students, available periods, and current ranking
  useEffect(() => {
    // Check user authentication status
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const userData = JSON.parse(userJson) as User;
        setCurrentUser(userData);

        // Check if the user is a teacher or admin
        if (userData.role === "teacher" || userData.role === "admin") {
          setIsTeacherOrAdmin(true);
        } else {
          setIsTeacherOrAdmin(false);
        }
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    } else {
      // Uncomment if you want to redirect unauthenticated users
      // navigate("/login");
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all students
        const studentsResponse = await axios.get(`${API_URL}/students`);
        setAllDbStudents(studentsResponse.data);

        // Fetch available periods
        const periodsResponse = await axios.get(`${API_URL}/rankings/periods`);

        if (
          periodsResponse.data.success &&
          periodsResponse.data.data.length > 0
        ) {
          setAvailablePeriods(periodsResponse.data.data);

          // Set current date as default selected period
          const today = new Date();
          const currentMonth = today.getMonth() + 1;
          const currentYear = today.getFullYear();

          // Find current month/year in available periods
          const currentPeriod = periodsResponse.data.data.find(
            (p: Period) => p.month === currentMonth && p.year === currentYear
          );

          // If current month not found, use the most recent one
          setSelectedPeriod(currentPeriod || periodsResponse.data.data[0]);

          // Fetch current ranking
          const rankingResponse = await axios.get(
            `${API_URL}/rankings/current`
          );
          if (rankingResponse.data.success) {
            setCurrentRanking(rankingResponse.data.data);
          }
        } else {
          // No periods available, use current date
          const today = new Date();
          const currentMonth = today.getMonth() + 1;
          const currentYear = today.getFullYear();

          setSelectedPeriod({
            month: currentMonth,
            year: currentYear,
            label: `${currentMonth}/${currentYear}`,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("حدث خطأ أثناء جلب البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch ranking when selected period changes
  useEffect(() => {
    const fetchRanking = async () => {
      if (!selectedPeriod) return;

      setLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/rankings/${selectedPeriod.month}/${selectedPeriod.year}`
        );

        if (response.data.success) {
          setCurrentRanking(response.data.data);
          setError(null);
        } else {
          setCurrentRanking(null);
        }
      } catch (error) {
        console.error("Error fetching ranking:", error);
        setCurrentRanking(null);
        // Don't show error if 404 (no ranking for this period)
        if (axios.isAxiosError(error) && error.response?.status !== 404) {
          setError("حدث خطأ أثناء جلب التصنيف");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [selectedPeriod]);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      easing: "ease-in-out",
    });
  }, []);

  // Function to handle period change
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;

    const [month, year] = value.split("/");
    setSelectedPeriod({
      month: parseInt(month),
      year: parseInt(year),
      label: value,
    });
  };

  // Function to open the modal for adding a student
  const openAddModal = (
    type: "top3" | "general" | "update" = "general",
    student?: RankingStudent
  ) => {
    setModalType(type);

    if (type === "update" && student) {
      // For updating, pre-fill with the selected student's data
      setSelectedStudent(student.studentId._id);
      setNewRankingEntry({
        _id: student.studentId._id,
        name: getFullName(student),
        score: student.score,
      });
    } else {
      // For adding new, reset the form
      setSelectedStudent("");
      setNewRankingEntry({
        _id: "",
        name: "",
        score: 0,
      });
    }

    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent("");
    setNewRankingEntry({
      _id: "",
      name: "",
      score: 0,
    });
  };

  // Function to handle student selection
  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);

    if (studentId) {
      const student = allDbStudents.find((s) => s._id === studentId);
      if (student) {
        setNewRankingEntry({
          _id: student._id,
          name: `${student.firstName} ${student.fatherName} ${student.lastName}`,
          score: 0,
        });
      }
    } else {
      setNewRankingEntry({
        _id: "",
        name: "",
        score: 0,
      });
    }
  };

  // Function to handle score input change
  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const score = parseInt(e.target.value) || 0;
    setNewRankingEntry((prev) => ({
      ...prev,
      score: score,
    }));
  };

  // Function to add/update ranking
  const saveRanking = async () => {
    if (!selectedPeriod || !newRankingEntry._id || newRankingEntry.score <= 0) {
      alert("يرجى اختيار طالب وتحديد درجة له");
      return;
    }

    setLoading(true);
    try {
      // Get current ranking or create a new one
      let ranking = currentRanking;
      let topThree: any[] =
        ranking?.topThree.map((item) => ({
          studentId: item.studentId._id,
          score: item.score,
        })) || [];

      let topTen: any[] =
        ranking?.topTen.map((item) => ({
          studentId: item.studentId._id,
          score: item.score,
        })) || [];

      // Add new entry to appropriate list
      if (modalType === "top3") {
        // If we already have 3 entries, replace the lowest score
        if (topThree.length >= 3) {
          // Sort by score ascending and remove the lowest
          topThree.sort((a, b) => a.score - b.score);
          if (topThree[0].score < newRankingEntry.score) {
            topThree[0] = {
              studentId: newRankingEntry._id,
              score: newRankingEntry.score,
            };
          }
        } else {
          // Add to topThree
          topThree.push({
            studentId: newRankingEntry._id,
            score: newRankingEntry.score,
          });
        }

        // Also add to topTen if not already there
        if (!topTen.some((item) => item.studentId === newRankingEntry._id)) {
          topTen.push({
            studentId: newRankingEntry._id,
            score: newRankingEntry.score,
          });
        }

        // Sort both arrays by score descending
        topThree.sort((a, b) => b.score - a.score);
        topTen.sort((a, b) => b.score - a.score);

        // Keep only top 10 in topTen
        topTen = topTen.slice(0, 10);
      } else {
        // Add to topTen
        if (topTen.some((item) => item.studentId === newRankingEntry._id)) {
          // Update existing entry
          topTen = topTen.map((item) =>
            item.studentId === newRankingEntry._id
              ? { ...item, score: newRankingEntry.score }
              : item
          );
        } else {
          // Add new entry
          topTen.push({
            studentId: newRankingEntry._id,
            score: newRankingEntry.score,
          });
        }

        // Sort by score descending
        topTen.sort((a, b) => b.score - a.score);

        // Keep only top 10
        topTen = topTen.slice(0, 10);

        // Check if this student should be in top3
        if (
          topThree.length < 3 ||
          topThree.some((item) => item.studentId === newRankingEntry._id) ||
          (topThree.length > 0 &&
            topThree[topThree.length - 1].score < newRankingEntry.score)
        ) {
          // Remove this student from top3 if already exists
          topThree = topThree.filter(
            (item) => item.studentId !== newRankingEntry._id
          );

          // Add to top3
          topThree.push({
            studentId: newRankingEntry._id,
            score: newRankingEntry.score,
          });

          // Sort by score descending
          topThree.sort((a, b) => b.score - a.score);

          // Keep only top 3
          topThree = topThree.slice(0, 3);
        }
      }

      // Save ranking
      const response = await axios.post(`${API_URL}/rankings`, {
        month: selectedPeriod.month,
        year: selectedPeriod.year,
        topThree,
        topTen,
      });

      if (response.data.success) {
        // Refresh ranking data
        const refreshResponse = await axios.get(
          `${API_URL}/rankings/${selectedPeriod.month}/${selectedPeriod.year}`
        );

        if (refreshResponse.data.success) {
          setCurrentRanking(refreshResponse.data.data);
          setError(null);

          // Refresh available periods
          const periodsResponse = await axios.get(
            `${API_URL}/rankings/periods`
          );
          if (periodsResponse.data.success) {
            setAvailablePeriods(periodsResponse.data.data);
          }
        }

        // Close modal
        closeModal();
      }
    } catch (error) {
      console.error("Error saving ranking:", error);
      setError("حدث خطأ أثناء حفظ التصنيف");
    } finally {
      setLoading(false);
    }
  };

  // Get top three students for the podium
  const topThreeStudents = currentRanking?.topThree || [];

  // Order the top three students for display
  const orderedTopThree = [
    topThreeStudents[1], // Second place (left)
    topThreeStudents[0], // First place (center)
    topThreeStudents[2], // Third place (right)
  ];

  // Get top ten students for the table
  const topTenStudents = currentRanking?.topTen || [];

  // Helper function to get student full name
  const getFullName = (student: RankingStudent | undefined) => {
    if (!student || !student.studentId) return "طالب";
    return `${student.studentId.firstName} ${student.studentId.fatherName} ${student.studentId.lastName}`;
  };

  // Convert month number to Arabic name
  const getMonthName = (month: number) => {
    const months = [
      "يناير",
      "فبراير",
      "مارس",
      "إبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];
    return months[month - 1] || "";
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4"
      dir="rtl">
      <div className="container mx-auto">
        <div className="text-center mb-16" data-aos="fade-down">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            ترتيب الطلاب المتميزين
          </h1>
          <div className="w-24 h-1 bg-emerald-600 mx-auto mb-6"></div>
          <p className="text-slate-600 text-lg max-w-3xl mx-auto">
            يعرض هذا الترتيب الطلاب المتفوقين في حفظ القرآن الكريم وتجويده، حيث
            نكرم المتميزين في الحفظ والتلاوة والأداء
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 mt-8">
            {/* Month/Year selector */}
            <div className="relative">
              <select
                value={
                  selectedPeriod
                    ? `${selectedPeriod.month}/${selectedPeriod.year}`
                    : ""
                }
                onChange={handlePeriodChange}
                className="w-40 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">اختر الشهر/السنة</option>
                {availablePeriods.map((period) => (
                  <option
                    key={`${period.month}-${period.year}`}
                    value={`${period.month}/${period.year}`}>
                    {getMonthName(period.month)} {period.year}
                  </option>
                ))}
                {/* Add current month if not already in list */}
                {selectedPeriod &&
                  !availablePeriods.some(
                    (p) =>
                      p.month === selectedPeriod.month &&
                      p.year === selectedPeriod.year
                  ) && (
                    <option
                      value={`${selectedPeriod.month}/${selectedPeriod.year}`}>
                      {getMonthName(selectedPeriod.month)} {selectedPeriod.year}
                    </option>
                  )}
              </select>
            </div>

            {isTeacherOrAdmin && (
              <>
                <button
                  onClick={() => openAddModal("top3")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-md flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  إضافة متميز للمراكز الأولى
                </button>
                <button
                  onClick={() => openAddModal("general")}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition shadow-md flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  إضافة طالب للقائمة
                </button>
              </>
            )}
          </div>
          <br />

          {/* Show current month/year title */}
          {selectedPeriod && (
            <h2 className="text-xl font-semibold mt-4 my-20">
              تصنيف {getMonthName(selectedPeriod.month)} {selectedPeriod.year}
            </h2>
          )}
        </div>

        {/* Loading indicator */}
        {loading && <ArrangementSkeleton />}

        {/* Error message */}
        {!loading && error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8"
            role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Main content when data is loaded */}
        {!loading && !error && (
          <>
            {/* Olympic-style podium for top 3 */}
            <div className="mb-20 relative" data-aos="fade-up">
              <div className="flex justify-center items-end h-96 mb-8">
                {/* Second place - left */}
                <div
                  className="w-1/4 flex flex-col items-center mx-2"
                  data-aos="fade-up"
                  data-aos-delay="200">
                  <div className="relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#e9f5f2] border-4 border-[#a0a0a0] mb-4 flex items-center justify-center">
                      <div className="text-[#1f6357] font-bold text-4xl">2</div>
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#a0a0a0] rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      2
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-lg">
                      {getFullName(orderedTopThree[0])}
                    </h3>
                    <p className="text-emerald-700">
                      {orderedTopThree[0]?.score || 0} درجة
                    </p>
                  </div>
                  <div className="w-full bg-[#a0a0a0] h-40 rounded-t-lg mt-4 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">2</span>
                  </div>
                </div>

                {/* First place - center */}
                <div
                  className="w-1/3 flex flex-col items-center mx-2 -mt-10"
                  data-aos="fade-up"
                  data-aos-delay="100">
                  <div className="relative">
                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-[#e9f5f2] border-4 border-[#FFD700] mb-4 flex items-center justify-center">
                      <div className="text-[#1f6357] font-bold text-5xl">1</div>
                    </div>
                    <div className="absolute -top-5 -right-3 w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center text-white font-bold shadow-lg text-xl">
                      1
                    </div>
                    <div className="absolute top-0 left-0 right-0 -mt-8 flex justify-center">
                      <svg
                        className="w-10 h-10 text-[#FFD700]"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-xl">
                      {getFullName(orderedTopThree[1])}
                    </h3>
                    <p className="text-emerald-700 font-bold">
                      {orderedTopThree[1]?.score || 0} درجة
                    </p>
                  </div>
                  <div className="w-full bg-[#FFD700] h-52 rounded-t-lg mt-4 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">1</span>
                  </div>
                </div>

                {/* Third place - right */}
                <div
                  className="w-1/4 flex flex-col items-center mx-2"
                  data-aos="fade-up"
                  data-aos-delay="300">
                  <div className="relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#e9f5f2] border-4 border-[#CD7F32] mb-4 flex items-center justify-center">
                      <div className="text-[#1f6357] font-bold text-4xl">3</div>
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#CD7F32] rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      3
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-lg">
                      {getFullName(orderedTopThree[2])}
                    </h3>
                    <p className="text-emerald-700">
                      {orderedTopThree[2]?.score || 0} درجة
                    </p>
                  </div>
                  <div className="w-full bg-[#CD7F32] h-32 rounded-t-lg mt-4 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">3</span>
                  </div>
                </div>
              </div>
              <div className="h-6 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-lg shadow-lg"></div>
            </div>

            {/* Top 10 students table */}
            <div
              className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
              data-aos="fade-up"
              data-aos-delay="400">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-4 px-6">
                <h2 className="text-xl font-bold text-white">أفضل 10 طلاب</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr className="text-right">
                      <th className="py-3 px-6 text-sm font-medium text-gray-600">
                        الترتيب
                      </th>
                      <th className="py-3 px-6 text-sm font-medium text-gray-600">
                        الطالب
                      </th>
                      <th className="py-3 px-6 text-sm font-medium text-gray-600">
                        المجموعة
                      </th>
                      <th className="py-3 px-6 text-sm font-medium text-gray-600">
                        الدرجة
                      </th>
                      {isTeacherOrAdmin && (
                        <th className="py-3 px-6 text-sm font-medium text-gray-600">
                          إجراءات
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {topTenStudents.map((student, index) => (
                      <tr
                        key={student.studentId._id}
                        className={`hover:bg-gray-50 ${
                          index < 3 ? "bg-emerald-50/50" : ""
                        }`}>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            {index === 0 && (
                              <span className="font-bold flex items-center justify-center w-8 h-8 rounded-full bg-[#FFD700] text-white mr-2">
                                1
                              </span>
                            )}
                            {index === 1 && (
                              <span className="font-bold flex items-center justify-center w-8 h-8 rounded-full bg-[#a0a0a0] text-white mr-2">
                                2
                              </span>
                            )}
                            {index === 2 && (
                              <span className="font-bold flex items-center justify-center w-8 h-8 rounded-full bg-[#CD7F32] text-white mr-2">
                                3
                              </span>
                            )}
                            {index > 2 && (
                              <span className="font-bold flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 mr-2">
                                {index + 1}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-[#e9f5f2] flex items-center justify-center mr-3">
                              <span className="text-[#1f6357] font-bold">
                                {index + 1}
                              </span>
                            </div>
                            <span className="font-medium">
                              {getFullName(student)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          {student.studentId.group}
                        </td>
                        <td className="py-4 px-6 font-semibold">
                          <span
                            className={`${
                              index < 3 ? "text-emerald-700" : ""
                            }`}>
                            {student.score} درجة
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {isTeacherOrAdmin ? (
                            <button
                              onClick={() => openAddModal("update", student)}
                              className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-1 px-3 rounded transition-colors duration-200 flex items-center text-sm">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                              تعديل
                            </button>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}

                    {/* Show empty rows if less than 10 students */}
                    {topTenStudents.length < 10 &&
                      Array(10 - topTenStudents.length)
                        .fill(0)
                        .map((_, index) => (
                          <tr key={`empty-${index}`}>
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <span className="font-bold flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-500 mr-2">
                                  {topTenStudents.length + index + 1}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-gray-400">-</td>
                            <td className="py-4 px-6 text-gray-400">-</td>
                            <td className="py-4 px-6 text-gray-400">-</td>
                            {isTeacherOrAdmin && (
                              <td className="py-4 px-6 text-gray-400">-</td>
                            )}
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Criteria Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          data-aos="fade-up"
          data-aos-delay="500">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg
                className="w-8 h-8 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-center mb-2">الحفظ</h3>
            <p className="text-gray-600 text-center">
              يتم تقييم الطلاب بناءً على عدد الأجزاء المحفوظة ودقة الحفظ وعدم
              الأخطاء
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg
                className="w-8 h-8 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 010-7.072m12.728 0l-3.536 3.536m-3.536 3.536L7.758 11.828"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-center mb-2">التجويد</h3>
            <p className="text-gray-600 text-center">
              يتم التقييم على أساس إتقان أحكام التجويد وتطبيقها بشكل صحيح أثناء
              التلاوة
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg
                className="w-8 h-8 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-center mb-2">الأداء</h3>
            <p className="text-gray-600 text-center">
              يتم تقييم الأداء الصوتي وجودة التلاوة
            </p>
          </div>
        </div>

        {/* Add Student Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-black opacity-50 absolute inset-0"></div>
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto relative">
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h2 className="text-xl font-bold mb-4 text-center">
                {modalType === "top3"
                  ? "إضافة طالب للمراكز الثلاثة الأولى"
                  : modalType === "update"
                  ? "تعديل درجة الطالب"
                  : "إضافة طالب للقائمة"}
              </h2>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="student">
                  {modalType === "update" ? "الطالب" : "اختر الطالب"}
                </label>
                {modalType === "update" ? (
                  <input
                    type="text"
                    value={newRankingEntry.name}
                    readOnly
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                  />
                ) : (
                  <select
                    id="student"
                    value={selectedStudent}
                    onChange={handleStudentSelect}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required>
                    <option value="">-- اختر الطالب --</option>
                    {allDbStudents.map((student) => (
                      <option key={student._id} value={student._id}>
                        {`${student.firstName} ${student.fatherName} ${student.lastName}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="score">
                  الدرجة
                </label>
                <input
                  type="number"
                  id="score"
                  name="score"
                  min="0"
                  max="100"
                  value={newRankingEntry.score}
                  onChange={handleScoreChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={saveRanking}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
                  disabled={!selectedStudent || newRankingEntry.score <= 0}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H3a1 1 0 110-2h5V3a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {modalType === "update" ? "تحديث" : "حفظ"}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Arrangement;
