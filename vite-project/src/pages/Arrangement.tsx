import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

interface Student {
  id: number;
  name: string;
  grade?: string; // Made optional
  score: number;
  image: string;
  quranParts?: number; // Made optional
}

const Arrangement = () => {
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // State for modal type (top3 or general)
  const [modalType, setModalType] = useState<"top3" | "general">("general");
  
  // State for new student form
  const [newStudent, setNewStudent] = useState<Omit<Student, "id">>({
    name: "",
    score: 0,
    image: "https://placehold.co/200x200/e9f5f2/1f6357?text=طالب",
  });
  
  // بيانات وهمية للطلاب المتفوقين
  const [topStudents, setTopStudents] = useState<Student[]>([
    {
      id: 2,
      name: "أحمد محمد",
      grade: "المستوى المتوسط",
      score: 96,
      image: "https://placehold.co/200x200/e9f5f2/1f6357?text=أحمد",
      quranParts: 25,
    },
    {
      id: 1,
      name: "عبدالله خالد",
      grade: "المستوى المتقدم",
      score: 98,
      image: "https://placehold.co/200x200/e9f5f2/1f6357?text=عبدالله",
      quranParts: 30,
    },
    {
      id: 3,
      name: "محمد عمر",
      grade: "المستوى المبتدئ",
      score: 94,
      image: "https://placehold.co/200x200/e9f5f2/1f6357?text=محمد",
      quranParts: 20,
    },
  ]);
  
  // All students list (includes top students plus others)
  const [allStudents, setAllStudents] = useState<Student[]>([
    ...topStudents,
    {
      id: 4,
      name: "يوسف سامي",
      grade: "المستوى المتوسط",
      score: 91,
      image: "https://placehold.co/200x200/e9f5f2/1f6357?text=يوسف",
      quranParts: 18,
    },
    {
      id: 5,
      name: "إبراهيم علي",
      grade: "المستوى المبتدئ",
      score: 89,
      image: "https://placehold.co/200x200/e9f5f2/1f6357?text=إبراهيم",
      quranParts: 15,
    },
    {
      id: 6,
      name: "عمر أحمد",
      grade: "المستوى المتقدم",
      score: 88,
      image: "https://placehold.co/200x200/e9f5f2/1f6357?text=عمر",
      quranParts: 22,
    },
    {
      id: 7,
      name: "زياد محمود",
      grade: "المستوى المتوسط",
      score: 86,
      image: "https://placehold.co/200x200/e9f5f2/1f6357?text=زياد",
      quranParts: 17,
    },
    {
      id: 8,
      name: "خالد سعيد",
      grade: "المستوى المبتدئ",
      score: 85,
      image: "https://placehold.co/200x200/e9f5f2/1f6357?text=خالد",
      quranParts: 14,
    }
  ].sort((a, b) => b.score - a.score));

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      easing: "ease-in-out",
    });
  }, []);
    // Function to open the modal for adding a student
  const openAddModal = (type: "top3" | "general" = "general") => {
    setModalType(type);
    setIsModalOpen(true);
  };
  
  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setNewStudent({
      name: "",
      score: 0,
      image: "https://placehold.co/200x200/e9f5f2/1f6357?text=طالب"
    });
  };
  
  // Function to handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({
      ...prev,
      [name]: name === "score" ? Number(value) : value
    }));
  };
    // Function to add a new student
  const addNewStudent = () => {
    if (!newStudent.name) return; // Only name is required now
    
    // Get next ID
    const nextId = Math.max(...[...topStudents, ...allStudents].map(s => s.id)) + 1;
    const studentToAdd = { id: nextId, ...newStudent };
    
    if (modalType === "top3") {
      // For top3, replace the lowest score in top3 and resort
      const updatedTopStudents = [...topStudents];
      const lowestScoreIndex = updatedTopStudents
        .map((s, index) => ({ score: s.score, index }))
        .sort((a, b) => a.score - b.score)[0].index;
        
      updatedTopStudents[lowestScoreIndex] = studentToAdd;
      setTopStudents(updatedTopStudents.sort((a, b) => b.score - a.score));
      
      // Also add to allStudents array for top10 table
      setAllStudents(prev => [...prev, studentToAdd].sort((a, b) => b.score - a.score));
    } else {
      // For general case, just add to allStudents array
      setAllStudents(prev => [...prev, studentToAdd].sort((a, b) => b.score - a.score));
    }
    
    closeModal();
  };
  
  // Order top three students for podium display
  const orderedTopThree = [
    topStudents.find(s => s.id === 2), 
    topStudents.find(s => s.id === 1), 
    topStudents.find(s => s.id === 3)
  ];  
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
          </p>          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => openAddModal("top3")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              إضافة متميز للمراكز الأولى
            </button>
            <button
              onClick={() => openAddModal("general")}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition shadow-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              إضافة طالب للقائمة
            </button>
          </div>
          <br />
        </div>
        
        {/* Olympic-style podium for top 3 */}
        <div className="mb-20 relative" data-aos="fade-up">
          <div className="flex justify-center items-end h-96 mb-8">
            <div
              className="w-1/4 flex flex-col items-center mx-2"
              data-aos="fade-up"
              data-aos-delay="200">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-[#a0a0a0] mb-4">
                  <img
                    src={orderedTopThree[0]?.image}
                    alt={orderedTopThree[0]?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#a0a0a0] rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  2
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg">
                  {orderedTopThree[0]?.name}
                </h3>
                <p className="text-emerald-700">
                  {orderedTopThree[0]?.score} درجة
                </p>
              </div>
              <div className="w-full bg-[#a0a0a0] h-40 rounded-t-lg mt-4 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
            </div>

            <div
              className="w-1/3 flex flex-col items-center mx-2 -mt-10"
              data-aos="fade-up"
              data-aos-delay="100">
              <div className="relative">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-[#FFD700] mb-4">
                  <img
                    src={orderedTopThree[1]?.image}
                    alt={orderedTopThree[1]?.name}
                    className="w-full h-full object-cover"
                  />
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
                  {orderedTopThree[1]?.name}
                </h3>
                <p className="text-emerald-700 font-bold">
                  {orderedTopThree[1]?.score} درجة
                </p>
              </div>
              <div className="w-full bg-[#FFD700] h-52 rounded-t-lg mt-4 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">1</span>
              </div>
            </div>

            <div
              className="w-1/4 flex flex-col items-center mx-2"
              data-aos="fade-up"
              data-aos-delay="300">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-[#CD7F32] mb-4">
                  <img
                    src={orderedTopThree[2]?.image}
                    alt={orderedTopThree[2]?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#CD7F32] rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  3
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg">
                  {orderedTopThree[2]?.name}
                </h3>
                <p className="text-emerald-700">
                  {orderedTopThree[2]?.score} درجة
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
            <h2 className="text-xl font-bold text-white">
              أفضل 10 طلاب
            </h2>
          </div><div className="overflow-x-auto">
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
                      الدرجة
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allStudents.slice(0, 10).map((student, index) => (
                    <tr
                      key={student.id}
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
                          <img
                            src={student.image}
                            alt={student.name}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        <span
                          className={`${index < 3 ? "text-emerald-700" : ""}`}>
                          {student.score} درجة
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>        {/* Removed the "Your Rank" section as requested */}

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
              يتم تقييم الأداء الصوتي وجودة التلاوة ومراعاة المقامات الصوتية
              المناسبة
            </p>
          </div>
        </div>

        {/* Add Student Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-black opacity-50 absolute inset-0"></div>
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>                <h2 className="text-xl font-bold mb-4 text-center">
                إضافة طالب جديد إلى {modalType === "top3" ? "أفضل 3 طلاب" : "أفضل 10 طلاب"}
              </h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  الاسم
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newStudent.name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="اسم الطالب"
                />
              </div>
                {/* Grade field removed as requested */}
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="score">
                  الدرجة
                </label>
                <input
                  type="number"
                  id="score"
                  name="score"
                  value={newStudent.score}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="درجة الطالب"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
                  رابط الصورة
                </label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={newStudent.image}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="رابط صورة الطالب"
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={addNewStudent}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H3a1 1 0 110-2h6V3a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  إضافة الطالب
                </button>                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>    </div>
  );
};

export default Arrangement;
