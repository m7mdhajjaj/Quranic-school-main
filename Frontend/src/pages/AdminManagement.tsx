import React, { useState, useEffect } from "react";
import AddStudentForm from "../components/AddStudentForm";
import AddTeacherForm from "../components/AddTeacherForm";
import AddGroupForm from "../components/AddGroupForm";

const AdminManagement: React.FC = () => {
  const [activeSection, setActiveSection] = useState<
    "teachers" | "students" | "sections"
  >("teachers");

  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [showAddTeacherForm, setShowAddTeacherForm] = useState(false);
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);

  // Editing states
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [editingGroup, setEditingGroup] = useState<any>(null);

  // Search states
  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");

  // Dummy data for demonstration
  const [teachers, setTeachers] = useState([
    {
      _id: "1",
      firstName: "أحمد",
      lastName: "محمد",
      email: "ahmed@example.com",
      phoneNumber: "0501234567",
      groupName: "حلقة الأطفال",
      yearsOfExperience: 5,
      role: "teacher",
    },
    {
      _id: "2",
      firstName: "فاطمة",
      lastName: "علي",
      email: "fatima@example.com",
      phoneNumber: "0507654321",
      groupName: "حلقة المبتدئين",
      yearsOfExperience: 8,
      role: "teacher",
    },
    {
      _id: "3",
      firstName: "محمد",
      lastName: "حسن",
      email: "mohamed@example.com",
      phoneNumber: "0501122334",
      groupName: "حلقة المتوسطين",
      yearsOfExperience: 3,
      role: "teacher",
    },
  ]);

  const [students, setStudents] = useState([
    {
      _id: "1",
      firstName: "علي",
      lastName: "أحمد",
      studentId: 100001,
      group: "حلقة الأطفال",
      age: 8,
      gender: "ذكر",
      phoneNumber: "0501111111",
    },
    {
      _id: "2",
      firstName: "مريم",
      lastName: "محمد",
      studentId: 100002,
      group: "حلقة الأطفال",
      age: 7,
      gender: "أنثى",
      phoneNumber: "0502222222",
    },
    {
      _id: "3",
      firstName: "حسن",
      lastName: "علي",
      studentId: 100003,
      group: "حلقة المبتدئين",
      age: 10,
      gender: "ذكر",
      phoneNumber: "0503333333",
    },
    {
      _id: "4",
      firstName: "زينب",
      lastName: "حسن",
      studentId: 100004,
      group: "حلقة المبتدئين",
      age: 9,
      gender: "أنثى",
      phoneNumber: "0504444444",
    },
    {
      _id: "5",
      firstName: "عمر",
      lastName: "أحمد",
      studentId: 100005,
      group: "حلقة المتوسطين",
      age: 12,
      gender: "ذكر",
      phoneNumber: "0505555555",
    },
  ]);

  const [allGroups, setAllGroups] = useState([
    {
      _id: "1",
      name: "حلقة الأطفال",
      teacher: "أحمد محمد",
      level: "مبتدئ",
      capacity: 20,
      schedule: "السبت والأحد 9:00-11:00",
    },
    {
      _id: "2",
      name: "حلقة المبتدئين",
      teacher: "فاطمة علي",
      level: "مبتدئ",
      capacity: 15,
      schedule: "الاثنين والأربعاء 4:00-6:00",
    },
    {
      _id: "3",
      name: "حلقة المتوسطين",
      teacher: "محمد حسن",
      level: "متوسط",
      capacity: 12,
      schedule: "الثلاثاء والخميس 5:00-7:00",
    },
    {
      _id: "4",
      name: "حلقة المتقدمين",
      teacher: "سارة عبدالله",
      level: "متقدم",
      capacity: 10,
      schedule: "الجمعة 3:00-6:00",
    },
  ]);

  const handleAddSuccess = () => {
    // يمكن إضافة منطق لإعادة تحميل البيانات هنا
    console.log("تمت إضافة البيانات بنجاح");
  };

  // Edit handlers
  const handleEditTeacher = (teacher: any) => {
    setEditingTeacher(teacher);
    setShowAddTeacherForm(true);
  };

  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
    setShowAddStudentForm(true);
  };

  const handleEditGroup = (group: any) => {
    setEditingGroup(group);
    setShowAddGroupForm(true);
  };

  // Delete handlers
  const handleDeleteTeacher = (teacherId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المعلم؟")) {
      setTeachers(teachers.filter((teacher) => teacher._id !== teacherId));
      console.log("تم حذف المعلم:", teacherId);
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الطالب؟")) {
      setStudents(students.filter((student) => student._id !== studentId));
      console.log("تم حذف الطالب:", studentId);
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الحلقة؟")) {
      setAllGroups(allGroups.filter((group) => group._id !== groupId));
      console.log("تم حذف الحلقة:", groupId);
    }
  };

  // Group filter for students
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("");

  // Filtered data
  const filteredTeachers = teachers.filter(
    (teacher) =>
      `${teacher.firstName} ${teacher.lastName}`
        .toLowerCase()
        .includes(teacherSearch.toLowerCase()) ||
      teacher.email.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      teacher.groupName.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(studentSearch.toLowerCase()) ||
      student.studentId.toString().includes(studentSearch) ||
      student.phoneNumber.includes(studentSearch);
    const matchesGroup =
      selectedGroupFilter === "" ||
      student.group ===
        allGroups.find((g) => g._id === selectedGroupFilter)?.name;
    return matchesSearch && matchesGroup;
  });

  const filteredGroups = allGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
      group.teacher.toLowerCase().includes(groupSearch.toLowerCase()) ||
      group.level.toLowerCase().includes(groupSearch.toLowerCase())
  );

  return (
    <div className="admin-management">
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              إدارة النظام
            </h2>

            {/* Management Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveSection("teachers")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeSection === "teachers"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}>
                  إدارة المعلمين
                </button>
                <button
                  onClick={() => setActiveSection("students")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeSection === "students"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}>
                  إدارة الطلاب
                </button>
                <button
                  onClick={() => setActiveSection("sections")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeSection === "sections"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}>
                  إدارة الحلقات
                </button>
              </nav>
            </div>

            {/* Content based on active section */}
            {activeSection === "teachers" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    قائمة المعلمين
                  </h3>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => setShowAddTeacherForm(true)}>
                    إضافة معلم جديد
                  </button>
                </div>

                {/* Teacher Search */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="البحث في المعلمين..."
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الاسم
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          البريد الإلكتروني
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          رقم الهاتف
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الحلقة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          سنوات الخبرة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTeachers.map((teacher) => (
                        <tr key={teacher._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {teacher.firstName} {teacher.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {teacher.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {teacher.phoneNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {teacher.groupName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {teacher.yearsOfExperience}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              className="text-blue-600 hover:text-blue-900 mr-3"
                              onClick={() => handleEditTeacher(teacher)}>
                              تعديل
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteTeacher(teacher._id)}>
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeSection === "students" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    قائمة الطلاب
                  </h3>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => setShowAddStudentForm(true)}>
                    إضافة طالب جديد
                  </button>
                </div>

                {/* Student Search */}
                <div className="mb-4 space-y-4">
                  <input
                    type="text"
                    placeholder="البحث في الطلاب..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  {/* Group Filter */}
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">
                      فلترة حسب الحلقة:
                    </label>
                    <select
                      value={selectedGroupFilter}
                      onChange={(e) => setSelectedGroupFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">جميع الحلقات</option>
                      {allGroups.map((group) => (
                        <option key={group._id} value={group._id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          رقم الطالب
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الاسم
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          العمر
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الجنس
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الحلقة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          رقم الهاتف
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.map((student) => (
                        <tr key={student._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.studentId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.age}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.gender}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.group}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.phoneNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              className="text-blue-600 hover:text-blue-900 mr-3"
                              onClick={() => handleEditStudent(student)}>
                              تعديل
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteStudent(student._id)}>
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeSection === "sections" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    قائمة الحلقات
                  </h3>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => setShowAddGroupForm(true)}>
                    إضافة حلقة جديدة
                  </button>
                </div>

                {/* Group Search */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="البحث في الحلقات..."
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          اسم الحلقة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المعلم
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المستوى
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          السعة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الجدول الزمني
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredGroups.map((group) => (
                        <tr key={group._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {group.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {group.teacher}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {group.level}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {group.capacity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {group.schedule}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              className="text-blue-600 hover:text-blue-900 mr-3"
                              onClick={() => handleEditGroup(group)}>
                              تعديل
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteGroup(group._id)}>
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* System Settings */}
            {/* <div className="mt-8 border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                إعدادات النظام
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">
                    إدارة الأقسام والحلقات
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    إضافة وتعديل وحذف الأقسام والحلقات
                  </p>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    إدارة الأقسام ←
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">
                    إدارة الاختبارات
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    إنشاء وإدارة الاختبارات والامتحانات
                  </p>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    إدارة الاختبارات ←
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">
                    إدارة الأنشطة
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    إضافة وتعديل الأنشطة والفعاليات
                  </p>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    إدارة الأنشطة ←
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">
                    إدارة الأخبار
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    نشر وإدارة الأخبار والإعلانات
                  </p>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    إدارة الأخبار ←
                  </button>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* النماذج */}
      {showAddStudentForm && (
        <AddStudentForm
          onClose={() => {
            setShowAddStudentForm(false);
            setEditingStudent(null);
          }}
          onSuccess={() => {
            handleAddSuccess();
            setEditingStudent(null);
          }}
          student={editingStudent}
        />
      )}

      {showAddTeacherForm && (
        <AddTeacherForm
          onClose={() => {
            setShowAddTeacherForm(false);
            setEditingTeacher(null);
          }}
          onSuccess={() => {
            handleAddSuccess();
            setEditingTeacher(null);
          }}
          teacher={editingTeacher}
        />
      )}

      {showAddGroupForm && (
        <AddGroupForm
          onClose={() => {
            setShowAddGroupForm(false);
            setEditingGroup(null);
          }}
          onSuccess={() => {
            handleAddSuccess();
            setEditingGroup(null);
          }}
          group={editingGroup}
        />
      )}
    </div>
  );
};

export default AdminManagement;
