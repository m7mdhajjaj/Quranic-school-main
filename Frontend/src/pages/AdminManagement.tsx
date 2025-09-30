import React, { useState } from "react";
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
  const [studentGroupFilter, setStudentGroupFilter] = useState(""); // ✅ فلتر الحلقة

  // Dummy data
  const [teachers, setTeachers] = useState([
    {
      _id: "1",
      firstName: "أحمد",
      lastName: "محمد",
      idNumber: "123456789",
      gender: "ذكر",
      phoneNumber: "0501234567",
      residence: "نابلس",
      email: "ahmed@example.com",
    },
    {
      _id: "2",
      firstName: "فاطمة",
      lastName: "علي",
      idNumber: "987654321",
      gender: "أنثى",
      phoneNumber: "0507654321",
      residence: "جنين",
      email: "fatima@example.com",
    },
  ]);

  const [students, setStudents] = useState([
    {
      _id: "1",
      studentId: 1001,
      firstName: "علي",
      lastName: "أحمد",
      idNumber: "111222333",
      gender: "ذكر",
      teacher: "أحمد محمد",
      group: "حلقة الأطفال",
      phoneNumber: "0501111111",
    },
    {
      _id: "2",
      studentId: 1002,
      firstName: "مريم",
      lastName: "محمد",
      idNumber: "444555666",
      gender: "أنثى",
      teacher: "فاطمة علي",
      group: "حلقة البنات",
      phoneNumber: "0502222222",
    },
  ]);

  const [allGroups, setAllGroups] = useState([
    {
      _id: "1",
      name: "حلقة الأطفال",
      teacher: "أحمد محمد",
      capacity: 20,
    },
    {
      _id: "2",
      name: "حلقة البنات",
      teacher: "فاطمة علي",
      capacity: 15,
    },
  ]);

  const handleAddSuccess = () => {
    console.log("تمت العملية بنجاح ✅");
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
      setTeachers(teachers.filter((t) => t._id !== teacherId));
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الطالب؟")) {
      setStudents(students.filter((s) => s._id !== studentId));
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الحلقة؟")) {
      setAllGroups(allGroups.filter((g) => g._id !== groupId));
    }
  };

  // Filters
  const filteredTeachers = teachers.filter((t) =>
    `${t.firstName} ${t.lastName}`
      .toLowerCase()
      .includes(teacherSearch.toLowerCase())
  );

  const filteredStudents = students.filter((s) => {
    const matchesName = `${s.firstName} ${s.lastName}`
      .toLowerCase()
      .includes(studentSearch.toLowerCase());
    const matchesGroup =
      studentGroupFilter === "" || s.group === studentGroupFilter;
    return matchesName && matchesGroup;
  });

  const filteredGroups = allGroups.filter((g) =>
    g.name.toLowerCase().includes(groupSearch.toLowerCase())
  );

  return (
    <div className="admin-management">
      <div className="bg-[#F5F8FA] min-h-screen">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-[#009C5C] mb-6 text-center">
              إدارة النظام
            </h2>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8 justify-center">
                <TabButton
                  active={activeSection === "teachers"}
                  onClick={() => setActiveSection("teachers")}
                  label="إدارة المعلمين"
                />
                <TabButton
                  active={activeSection === "students"}
                  onClick={() => setActiveSection("students")}
                  label="إدارة الطلاب"
                />
                <TabButton
                  active={activeSection === "sections"}
                  onClick={() => setActiveSection("sections")}
                  label="إدارة الحلقات"
                />
              </nav>
            </div>

            {/* المعلمين */}
            {activeSection === "teachers" && (
              <Section
                title="قائمة المعلمين"
                buttonLabel="إضافة معلم جديد"
                onAdd={() => setShowAddTeacherForm(true)}
                searchValue={teacherSearch}
                onSearchChange={setTeacherSearch}>
                <Table
                  headers={[
                    "الاسم",
                    "رقم الهوية",
                    "الجنس",
                    "مكان السكن",
                    "رقم الهاتف",
                    "البريد الإلكتروني",
                    "الإجراءات",
                  ]}
                  rows={filteredTeachers.map((t) => [
                    `${t.firstName} ${t.lastName}`,
                    t.idNumber,
                    t.gender,
                    t.residence,
                    t.phoneNumber,
                    t.email || "-",
                    <Actions
                      onEdit={() => handleEditTeacher(t)}
                      onDelete={() => handleDeleteTeacher(t._id)}
                    />,
                  ])}
                />
              </Section>
            )}

            {/* الطلاب */}
            {activeSection === "students" && (
              <Section
                title="قائمة الطلاب"
                buttonLabel="إضافة طالب جديد"
                onAdd={() => setShowAddStudentForm(true)}
                searchValue={studentSearch}
                onSearchChange={setStudentSearch}>
                {/* ✅ فلتر الحلقة */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    فلترة حسب الحلقة:
                  </label>
                  <select
                    value={studentGroupFilter}
                    onChange={(e) => setStudentGroupFilter(e.target.value)}
                    className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009C5C] focus:border-transparent">
                    <option value="">كل الحلقات</option>
                    {allGroups.map((g) => (
                      <option key={g._id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Table
                  headers={[
                    "رقم الطالب",
                    "الاسم",
                    "رقم الهوية",
                    "الجنس",
                    "المعلم",
                    "الحلقة",
                    "رقم الهاتف",
                    "الإجراءات",
                  ]}
                  rows={filteredStudents.map((s) => [
                    s.studentId,
                    `${s.firstName} ${s.lastName}`,
                    s.idNumber,
                    s.gender,
                    s.teacher,
                    s.group,
                    s.phoneNumber,
                    <Actions
                      onEdit={() => handleEditStudent(s)}
                      onDelete={() => handleDeleteStudent(s._id)}
                    />,
                  ])}
                />
              </Section>
            )}

            {/* الحلقات */}
            {activeSection === "sections" && (
              <Section
                title="قائمة الحلقات"
                buttonLabel="إضافة حلقة جديدة"
                onAdd={() => setShowAddGroupForm(true)}
                searchValue={groupSearch}
                onSearchChange={setGroupSearch}>
                <Table
                  headers={[
                    "اسم الحلقة",
                    "اسم المعلم",
                    "السعة القصوى",
                    "الإجراءات",
                  ]}
                  rows={filteredGroups.map((g) => [
                    g.name,
                    g.teacher,
                    g.capacity || "-",
                    <Actions
                      onEdit={() => handleEditGroup(g)}
                      onDelete={() => handleDeleteGroup(g._id)}
                    />,
                  ])}
                />
              </Section>
            )}
          </div>
        </div>
      </div>

      {/* Forms */}
      {showAddTeacherForm && (
        <AddTeacherForm
          onClose={() => {
            setShowAddTeacherForm(false);
            setEditingTeacher(null);
          }}
          onSuccess={handleAddSuccess}
          teacher={editingTeacher}
        />
      )}

      {showAddStudentForm && (
        <AddStudentForm
          onClose={() => {
            setShowAddStudentForm(false);
            setEditingStudent(null);
          }}
          onSuccess={handleAddSuccess}
          student={editingStudent}
        />
      )}

      {showAddGroupForm && (
        <AddGroupForm
          onClose={() => {
            setShowAddGroupForm(false);
            setEditingGroup(null);
          }}
          onSuccess={handleAddSuccess}
          group={editingGroup}
        />
      )}
    </div>
  );
};

/* 🔹 مكونات فرعية */

const TabButton = ({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`py-2 px-4 border-b-2 font-medium text-sm ${
      active
        ? "border-[#009C5C] text-[#009C5C]"
        : "border-transparent text-gray-500 hover:text-[#009C5C] hover:border-[#00B26F]"
    }`}>
    {label}
  </button>
);

const Section = ({
  title,
  buttonLabel,
  onAdd,
  searchValue,
  onSearchChange,
  children,
}: any) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-semibold text-[#009C5C]">{title}</h3>
      <button
        className="bg-[#009C5C] text-white px-4 py-2 rounded-lg hover:bg-[#00B26F] transition-colors"
        onClick={onAdd}>
        {buttonLabel}
      </button>
    </div>
    <div className="mb-4">
      <input
        type="text"
        placeholder="ابحث هنا..."
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009C5C] focus:border-transparent"
      />
    </div>
    {children}
  </div>
);

const Table = ({ headers, rows }: any) => (
  <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
    <table className="min-w-full text-right">
      <thead className="bg-[#E6F4EF]">
        <tr>
          {headers.map((h: string, i: number) => (
            <th
              key={i}
              className="px-6 py-3 text-xs font-semibold text-[#009C5C] uppercase tracking-wider border-b border-gray-200">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row: any[], i: number) => (
          <tr
            key={i}
            className={`transition-colors ${
              i % 2 === 0 ? "bg-white" : "bg-[#F9FBFA]"
            } hover:bg-[#F3F9F6]`}>
            {row.map((cell: any, j: number) => (
              <td
                key={j}
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-b border-gray-100">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Actions = ({ onEdit, onDelete }: any) => (
  <div>
    <button
      onClick={onEdit}
      className="text-[#009C5C] hover:text-[#00B26F] mr-3">
      تعديل
    </button>
    <button onClick={onDelete} className="text-red-600 hover:text-red-900">
      حذف
    </button>
  </div>
);

export default AdminManagement;
