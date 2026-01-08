import { NavLink, useLocation } from "react-router-dom";
import { User, LogOut, X, ChevronDown } from "lucide-react";
import { useState } from "react";

// Components
import { Button } from "@/components/UI";
import Avatar from "@/components/Avatar/Avatar";

// Utils
import { checkIsActive } from '../../utils/navigation.utils';

// Types
import type { MobileMenuProps, NavigationItem } from "../../types/navigation.types";

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  user,
  primaryItems,
  secondaryItems,
  onLogout,
  onProfileClick,
}) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  if (!isOpen) return null;

  const allItems = [...primaryItems, ...secondaryItems];

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label] // Allow multiple expanded
    );
  };

  const renderMenuItem = (item: NavigationItem) => {
    const IconComponent = item.icon;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    
    // Check if any subitem is active
    const isActive = hasSubItems 
      ? item.subItems?.some(sub => checkIsActive(sub.to, location.pathname))
      : checkIsActive(item.to, location.pathname);

    if (hasSubItems) {
      return (
        <div key={item.label} className="bg-white/40 rounded-xl overflow-hidden border border-gray-100">
          <button
            onClick={() => toggleExpand(item.label)}
            className={`w-full flex items-center justify-between p-3 transition-colors ${
              isActive ? "bg-emerald-50/80 text-emerald-700" : "text-gray-700 hover:bg-white/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isActive ? "bg-emerald-100/50" : "bg-gray-100"}`}>
                <IconComponent size={20} className={isActive ? "text-emerald-600" : "text-gray-500"} />
              </div>
              <span className="font-bold text-sm">{item.label}</span>
            </div>
            <ChevronDown 
              size={18} 
              className={`text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
          
          <div className={`transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="bg-white/30 p-2 space-y-1">
              {item.subItems?.map((subItem) => {
                const SubIcon = subItem.icon;
                const isSubActive = checkIsActive(subItem.to, location.pathname);
                return (
                  <NavLink
                    key={subItem.to}
                    to={subItem.to}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      isSubActive 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md font-semibold" 
                        : "text-gray-600 hover:bg-white/50"
                    }`}
                  >
                   <SubIcon size={16} />
                   <span>{subItem.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onClose}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 border border-transparent ${
          isActive
            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 font-bold"
            : "bg-white/60 text-gray-700 hover:bg-white hover:shadow-md font-semibold border-gray-200/50"
        }`}
      >
        <div className={`p-2 rounded-lg ${isActive ? "bg-white/20" : "bg-gray-100"}`}>
          <IconComponent size={22} className={isActive ? "text-white" : "text-emerald-600"} />
        </div>
        <span className="flex-1">{item.label}</span>
        {isActive && <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-sm" />}
      </NavLink>
    );
  };

  return (
    <div className="xl:hidden fixed inset-0 z-40 animate-fade-in">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Menu Content */}
      <div className="fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-gradient-to-br from-white via-gray-50 to-emerald-50 shadow-2xl overflow-y-auto animate-slide-in-right">
        <div className="p-6 flex flex-col justify-end text-right">
          {/* ==================== Header ==================== */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200">
            <h2 className="text-xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              القائمة الرئيسية
            </h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="p-2.5 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 border border-red-200 hover:border-red-300 transition-all duration-300"
              title="إغلاق القائمة"
              leftIcon={<X size={20} />}
            />
          </div>

          {/* ==================== User Card ==================== */}
          {/* ==================== User Card ==================== */}
          {user && (
            <div className="mb-6">
              <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl shadow-lg">
                <div className="relative flex-shrink-0">
                  <Avatar 
                    user={user} 
                    size="lg" 
                    border="thick" 
                    showStatus={true}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-lg truncate drop-shadow-md">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.firstName || "المستخدم"}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1.5">
                    <span className="text-emerald-50 text-sm font-semibold px-2.5 py-1 bg-white/20 rounded-lg backdrop-blur-sm">
                      {user.role === "teacher"
                        ? "معلم"
                        : user.role === "admin"
                        ? "مدير"
                        : "طالب"}
                    </span>
                    <span className="flex items-center gap-1.5 text-green-300 text-xs font-bold flex-shrink-0">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm" />
                      متصل الآن
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== Navigation Items ==================== */}
          <div className="space-y-2">
            {allItems.map(renderMenuItem)}
          </div>

          {/* ==================== Footer Actions ==================== */}

          <div className="space-y-3 border-t-2 border-gray-200 pt-5 mt-6">
            <Button
              onClick={() => {
                onClose();
                onProfileClick();
              }}
              variant="ghost"
              size="md"
              className="w-full justify-start gap-3 px-4 py-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 rounded-xl font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
              leftIcon={<User size={22} className="text-blue-600" />}
            >
              الملف الشخصي
            </Button>
            <Button
              onClick={() => {
                onClose();
                onLogout();
              }}
              variant="ghost"
              size="md"
              className="w-full justify-start gap-3 px-4 py-3.5 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 hover:from-red-100 hover:to-pink-100 border border-red-200 hover:border-red-300 rounded-xl font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
              leftIcon={<LogOut size={22} className="text-red-600" />}
            >
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;