import { NavLink } from "react-router-dom";
import { User, LogOut, X, ChevronDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Components
import Avatar from "@/components/Avatar/Avatar";

// Hooks
import { useMobileMenu } from '../../hooks/useMobileMenu';

// Types
import type { MobileMenuProps, NavigationItem } from "../../types/navigation.types";

// ============================================================================
// Animation Variants
// ============================================================================
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const menuVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: "spring" as const, 
      stiffness: 300, 
      damping: 30,
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  },
  exit: { 
    x: "100%", 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const itemVariants = {
  hidden: { x: 20, opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

// ============================================================================
// Mobile Menu Component
// ============================================================================
const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  user,
  primaryItems,
  secondaryItems,
  onLogout,
  onProfileClick,
}) => {
  // Use custom hook for all logic
  const {
    allItems,
    toggleExpand,
    handleNavClick,
    handleProfileAction,
    handleLogoutAction,
    isItemActive,
    isSubItemActive,
    isItemExpanded,
  } = useMobileMenu({
    primaryItems,
    secondaryItems,
    onClose,
    onLogout,
    onProfileClick,
  });

  // ============================================================================
  // Render Menu Item
  // ============================================================================
  const renderMenuItem = (item: NavigationItem) => {
    const IconComponent = item.icon;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = isItemExpanded(item.label);
    const isActive = isItemActive(item);

    if (hasSubItems) {
      return (
        <motion.div 
          key={item.label} 
          variants={itemVariants}
          className="overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm"
        >
          <motion.button
            onClick={() => toggleExpand(item.label)}
            className={`w-full flex items-center justify-between p-4 transition-all duration-300 ${
              isActive 
                ? "bg-gradient-to-r from-emerald-50 to-teal-50" 
                : "hover:bg-white/80"
            }`}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <motion.div 
                className={`p-2.5 rounded-xl ${
                  isActive 
                    ? "bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-700 shadow-lg shadow-emerald-500/30" 
                    : "bg-gradient-to-br from-gray-100 to-gray-200"
                }`}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <IconComponent size={20} className={isActive ? "text-white" : "text-gray-600"} />
              </motion.div>
              <span className={`font-bold text-sm ${isActive ? "text-emerald-700" : "text-gray-700"}`}>
                {item.label}
              </span>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={18} className="text-gray-400" />
            </motion.div>
          </motion.button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-2 space-y-1 bg-gradient-to-b from-white/50 to-gray-50/50">
                  {item.subItems?.map((subItem, subIndex) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = isSubItemActive(subItem.to);
                    return (
                      <motion.div
                        key={subItem.to}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: subIndex * 0.05 }}
                      >
                        <NavLink
                          to={subItem.to}
                          onClick={handleNavClick}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
                            isSubActive 
                              ? "bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 text-white shadow-lg shadow-emerald-500/25 font-bold" 
                              : "text-gray-600 hover:bg-white hover:shadow-sm font-medium"
                          }`}
                        >
                          <SubIcon size={16} />
                          <span>{subItem.label}</span>
                          {isSubActive && (
                            <motion.div
                              className="mr-auto"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            >
                              <Sparkles size={14} className="text-white/80" />
                            </motion.div>
                          )}
                        </NavLink>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      );
    }

    return (
      <motion.div key={item.to} variants={itemVariants}>
        <NavLink
          to={item.to}
          onClick={handleNavClick}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
            isActive
              ? "bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 text-white shadow-xl shadow-emerald-500/30"
              : "bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg border border-white/50"
          }`}
        >
          <motion.div 
            className={`p-2.5 rounded-xl ${
              isActive 
                ? "bg-white/20" 
                : "bg-gradient-to-br from-emerald-100 to-teal-100"
            }`}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <IconComponent size={20} className={isActive ? "text-white" : "text-emerald-600"} />
          </motion.div>
          <span className={`flex-1 ${isActive ? "font-bold" : "font-semibold"}`}>
            {item.label}
          </span>
          {isActive && (
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-2.5 h-2.5 bg-white rounded-full shadow-lg"
            />
          )}
        </NavLink>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="xl:hidden fixed inset-0 z-[200]">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-gradient-to-br from-black/60 via-emerald-900/40 to-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          
          {/* Menu Content */}
          <motion.div 
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 h-full w-[320px] max-w-[85vw] overflow-hidden"
          >
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-gray-50/95 to-emerald-50/95 backdrop-blur-xl" />
            
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10" />
            <motion.div
              className="absolute top-20 -left-10 w-40 h-40 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ repeat: Infinity, duration: 4 }}
            />
            <motion.div
              className="absolute bottom-20 -right-10 w-60 h-60 bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 rounded-full blur-3xl"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
              transition={{ repeat: Infinity, duration: 5 }}
            />

            {/* Content */}
            <div className="relative h-full overflow-y-auto p-5" dir="rtl">
              {/* Header */}
              <motion.div 
                variants={itemVariants}
                className="flex items-center justify-between mb-6"
              >
                <div>
                  <h2 className="text-xl font-black bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 bg-clip-text text-transparent">
                    القائمة الرئيسية
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">مدرسة القرآن الكريم</p>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-2.5 rounded-xl bg-gradient-to-br from-red-100 to-pink-100 text-red-500 hover:from-red-200 hover:to-pink-200 transition-all duration-300 shadow-sm"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </motion.div>

              {/* User Card */}
              {user && (
                <motion.div 
                  variants={itemVariants}
                  className="mb-6"
                >
                  <motion.div 
                    className="relative p-5 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-700 shadow-2xl shadow-emerald-500/30 overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Decorative Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
                    </div>
                    
                    <div className="relative flex items-center gap-4">
                      <motion.div 
                        className="relative flex-shrink-0"
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className="absolute -inset-1 bg-white/30 rounded-full blur-sm" />
                        <Avatar 
                          user={user} 
                          size="lg" 
                          border="thick" 
                          showStatus={true}
                        />
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-lg truncate drop-shadow-md">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.firstName || "المستخدم"}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-white/90 text-xs font-bold px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                            {user.role === "teacher" ? "معلم" : user.role === "admin" ? "مدير" : user.role === "secretary" ? "سكرتير" : user.role === "teacherAssistant" ? "مساعد مدرس" : "طالب"}
                          </span>
                          <span className="flex items-center gap-1.5 text-emerald-100 text-xs font-semibold">
                            <motion.div 
                              className="w-2 h-2 bg-green-300 rounded-full shadow-lg shadow-green-400/50"
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ repeat: Infinity, duration: 1 }}
                            />
                            متصل
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Navigation Items */}
              <motion.div variants={itemVariants} className="space-y-2.5">
                {allItems.map((item) => renderMenuItem(item))}
              </motion.div>

              {/* Footer Actions */}
              <motion.div 
                variants={itemVariants}
                className="mt-6 pt-5 border-t border-gray-200/50 space-y-2.5"
              >
                <motion.button
                  onClick={handleProfileAction}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold hover:from-blue-100 hover:to-indigo-100 border border-blue-200/50 transition-all duration-300 shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.02, x: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30">
                    <User size={18} className="text-white" />
                  </div>
                  <span>الملف الشخصي</span>
                </motion.button>

                <motion.button
                  onClick={handleLogoutAction}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 text-red-600 font-semibold hover:from-red-100 hover:to-pink-100 border border-red-200/50 transition-all duration-300 shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.02, x: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 shadow-lg shadow-red-500/30">
                    <LogOut size={18} className="text-white" />
                  </div>
                  <span>تسجيل الخروج</span>
                </motion.button>
              </motion.div>

              {/* Bottom Spacing */}
              <div className="h-8" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;