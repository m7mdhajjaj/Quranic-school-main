import React from "react";
import {
  FaTimes,
  FaUser,
  FaMapMarkerAlt,
  FaBookReader,
  FaGraduationCap,
  FaClock,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";

interface UserInfoModalProps {
  user: {
    _id: string;
    firstName: string;
    lastName?: string;
    group?: string;
    imageUrl?: string;
    residence?: string;
    progress?: string;
  };
  userRole: string;
  onClose: () => void;
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({
  user,
  userRole,
  onClose,
}) => {
  // Teacher specific info
  const teacherInfo = {
    id: "1001",
    specialization: "حفظ القرآن الكريم وتفسيره",
    experience: "12 سنة",
    officeHours: "الأحد - الخميس: 9 ص - 3 م",
    education: "بكالوريوس في الدراسات الإسلامية",
    email: "example@school.com",
    phone: "+970 59 123 4567",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full relative overflow-hidden animate-fade-in"
        data-aos="zoom-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 z-10">
          <FaTimes size={24} />
        </button>

        {/* User avatar - centered */}
        <div className="flex flex-col items-center justify-center pt-8 pb-4 bg-gradient-to-r from-emerald-600 to-teal-500">
          <div className="relative mb-2">
            <div className="w-24 h-24 rounded-full bg-white p-1">
              <img
                src={user.imageUrl || "https://via.placeholder.com/150"}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
          <h2 className="text-white text-xl font-bold text-center">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-white/80 mb-2">
            {userRole === "teacher" ? "معلم" : "طالب"}
          </p>
        </div>

        {/* User information */}
        <div className="p-6">
          <div className="space-y-4">
            {userRole === "teacher" ? (
              <>
                {/* Teacher Information */}
                <div className="flex items-center text-gray-700">
                  <FaUser className="text-emerald-600 ml-3" />
                  <div>
                    <p className="text-sm text-gray-500">رقم التسجيل</p>
                    <p>{teacherInfo.id}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <FaBookReader className="text-emerald-600 ml-3" />
                  <div>
                    <p className="text-sm text-gray-500">التخصص</p>
                    <p>{teacherInfo.specialization}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <FaGraduationCap className="text-emerald-600 ml-3" />
                  <div>
                    <p className="text-sm text-gray-500">الخبرة</p>
                    <p>{teacherInfo.experience}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <FaClock className="text-emerald-600 ml-3" />
                  <div>
                    <p className="text-sm text-gray-500">ساعات العمل</p>
                    <p>{teacherInfo.officeHours}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <FaGraduationCap className="text-emerald-600 ml-3" />
                  <div>
                    <p className="text-sm text-gray-500">المؤهل العلمي</p>
                    <p>{teacherInfo.education}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center text-gray-700 mb-2">
                    <FaEnvelope className="text-emerald-600 ml-3" />
                    <p>{teacherInfo.email}</p>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <FaPhone className="text-emerald-600 ml-3" />
                    <p>{teacherInfo.phone}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Student Information */}
                <div className="flex items-center text-gray-700">
                  <FaUser className="text-emerald-600 ml-3" />
                  <div>
                    <p className="text-sm text-gray-500">رقم الطالب</p>
                    <p>{user._id}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <FaBookReader className="text-emerald-600 ml-3" />
                  <div>
                    <p className="text-sm text-gray-500">المجموعة</p>
                    <p>{user.group || "غير محدد"}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <FaMapMarkerAlt className="text-emerald-600 ml-3" />
                  <div>
                    <p className="text-sm text-gray-500">مكان السكن</p>
                    <p>{user.residence || "غير محدد"}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <FaGraduationCap className="text-emerald-600 ml-3" />
                  <div>
                    <p className="text-sm text-gray-500">مستوى التقدم</p>
                    <p>{user.progress || "قيد التقييم"}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 flex justify-center border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfoModal;
