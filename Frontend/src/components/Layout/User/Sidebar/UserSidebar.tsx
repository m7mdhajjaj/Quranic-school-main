import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import { User, Key, LogOut, Menu, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleLayout } from '@/hooks/useRoleLayout';
import { showLogoutConfirmation } from '@/pages/Auth/LogOut/logoutUtils';

interface UserSidebarProps {
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  onToggle?: () => void;
  onMobileToggle?: () => void;
  onMobileClose?: () => void;
  onChangePasswordClick?: () => void;
}

const UserSidebar: React.FC<UserSidebarProps> = ({
  isCollapsed = false,
  isMobileOpen = false,
  onToggle,
  onMobileClose,
  onChangePasswordClick,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser, logout: authLogout } = useAuth();
  const { navGroups } = useRoleLayout();

  // حالة المجموعات المفتوحة - افتراضياً جميع المجموعات مفتوحة
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const isInitialized = useRef(false);

  // إنشاء dependency ثابت من navGroups لتجنب تغيير حجم dependency array
  const navGroupsKey = useMemo(
    () => JSON.stringify(navGroups.map((group) => ({ title: group.title, itemsCount: group.items.length }))),
    [navGroups]
  );

  // فتح جميع المجموعات افتراضياً عند التحميل (بما في ذلك مجموعة الحساب)
  // تخطي مجموعة "الرئيسية" لأنها معروضة مباشرة بدون قائمة
  useEffect(() => {
    if (navGroups.length > 0 && !isInitialized.current) {
      const allGroups = new Set(
        navGroups
          .filter((group) => group.title !== 'الرئيسية')
          .map((group) => group.title)
      );
      // إضافة مجموعة الحساب أيضاً
      allGroups.add('الحساب');
      setOpenGroups(allGroups);
      isInitialized.current = true;
    }
  }, [navGroups, navGroupsKey]);

  // فتح المجموعة التي تحتوي على الصفحة النشطة تلقائياً
  useEffect(() => {
    const activeGroup = navGroups.find((group) =>
      group.items.some((item) => {
        if (item.to === '/') return location.pathname === '/';
        return (
          location.pathname === item.to ||
          location.pathname.startsWith(item.to + '/')
        );
      })
    );
    if (activeGroup) {
      setOpenGroups((prev) => new Set(prev).add(activeGroup.title));
    }
  }, [location.pathname, navGroups, navGroupsKey]);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  const isActive = (path: string): boolean => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isGroupActive = (group: { items: { to: string }[] }): boolean => {
    return group.items.some((item) => isActive(item.to));
  };

  const handleLogout = async () => {
    await showLogoutConfirmation({
      userType: 'user',
      onConfirm: () => {
        authLogout();
      },
    });
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleChangePasswordClick = () => {
    onMobileClose?.();
    onChangePasswordClick?.();
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <aside
        className={`fixed right-0 top-14 sm:top-16 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-50 via-teal-50 to-emerald-50 border-l border-emerald-100 shadow-xl z-40 overflow-y-auto overflow-x-hidden transition-all duration-300 lg:hidden sidebar-scrollbar ${
          isMobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '280px' }}
        dir="rtl">
        {/* Mobile Navigation */}
        <nav className="p-4 space-y-2 pb-4">
          {navGroups.map((group) => {
            const isOpen = openGroups.has(group.title);
            const groupActive = isGroupActive(group);

            // عرض الصفحة الرئيسية مباشرة بدون قائمة
            if (group.title === 'الرئيسية' && group.items.length > 0) {
              const homeItem = group.items[0];
              const HomeIcon = homeItem.icon;
              const isHomeActive = isActive(homeItem.to);

              return (
                <NavLink
                  key={homeItem.to}
                  to={homeItem.to}
                  onClick={onMobileClose}
                  className={`
                    group relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 mb-3
                    ${isHomeActive
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-emerald-600 hover:bg-white/60 hover:text-emerald-700'
                    }
                  `}>
                  {isHomeActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/30 rounded-l-full" />
                  )}
                  <div
                    className={`
                    flex-shrink-0 transition-colors duration-200
                    ${isHomeActive ? 'text-white' : 'text-emerald-500 group-hover:text-emerald-600'}
                  `}>
                    <HomeIcon size={22} />
                  </div>
                  <span className="font-medium text-sm flex-1">
                    {homeItem.label}
                  </span>
                </NavLink>
              );
            }

            // تخطي مجموعة "الرئيسية" لأنها معروضة مباشرة
            if (group.title === 'الرئيسية') {
              return null;
            }

            return (
              <div key={group.title} className="space-y-2">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.title)}
                  aria-label={`${isOpen ? 'إغلاق' : 'فتح'} قائمة ${group.title}`}
                  aria-expanded={isOpen ? true : false}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    groupActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-emerald-600 hover:bg-white/60'
                  }`}>
                  <span className="font-semibold text-xs uppercase tracking-wide">
                    {group.title}
                  </span>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-emerald-600" aria-hidden="true" />
                  ) : (
                    <ChevronDown size={16} className="text-emerald-600" aria-hidden="true" />
                  )}
                </button>

                {/* Group Items */}
                {isOpen && (
                  <div className="pr-4 space-y-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.to);

                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={onMobileClose}
                          className={`
                            group relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200
                            ${active
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'text-emerald-600 hover:bg-white/60 hover:text-emerald-700'
                            }
                          `}>
                          {active && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/30 rounded-l-full" />
                          )}
                          <div
                            className={`
                            flex-shrink-0 transition-colors duration-200
                            ${active ? 'text-white' : 'text-emerald-500 group-hover:text-emerald-600'}
                          `}>
                            <Icon size={22} />
                          </div>
                          <span className="font-medium text-sm flex-1">
                            {item.label}
                          </span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Mobile User Account Section - As Collapsible Group */}
        {currentUser && (
          <div className="p-4 border-t border-emerald-200 bg-white/50 backdrop-blur-sm">
            <div className="space-y-2">
              {/* Account Group Header */}
              <button
                onClick={() => toggleGroup('الحساب')}
                aria-label={`${openGroups.has('الحساب') ? 'إغلاق' : 'فتح'} قائمة الحساب`}
                aria-expanded={openGroups.has('الحساب') ? true : false}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  location.pathname === '/profile'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-emerald-600 hover:bg-white/60'
                }`}>
                <span className="font-semibold text-xs uppercase tracking-wide">
                  الحساب
                </span>
                {openGroups.has('الحساب') ? (
                  <ChevronUp size={16} className="text-emerald-600" aria-hidden="true" />
                ) : (
                  <ChevronDown size={16} className="text-emerald-600" aria-hidden="true" />
                )}
              </button>

              {/* Account Group Items */}
              {openGroups.has('الحساب') && (
                <div className="pr-4 space-y-2">
                  <button
                    onClick={() => {
                      handleProfileClick();
                      onMobileClose?.();
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 font-medium text-sm relative ${
                      location.pathname === '/profile' &&
                      !location.search.includes('change-password')
                        ? 'bg-white text-emerald-700 shadow-md'
                        : 'text-emerald-600 hover:bg-white/60 hover:text-emerald-700'
                    }`}>
                    {location.pathname === '/profile' &&
                      !location.search.includes('change-password') && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-l-full" />
                      )}
                    <div
                      className={`
                      flex-shrink-0 transition-colors duration-200
                      ${location.pathname === '/profile' && !location.search.includes('change-password') ? 'text-emerald-600' : 'text-emerald-500'}
                    `}>
                      <User size={22} />
                    </div>
                    <span className="font-medium text-sm flex-1">الملف الشخصي</span>
                  </button>
                  <button
                    onClick={handleChangePasswordClick}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 font-medium text-sm relative ${
                      location.pathname === '/profile' &&
                      location.search.includes('change-password')
                        ? 'bg-white text-emerald-700 shadow-md'
                        : 'text-emerald-600 hover:bg-white/60 hover:text-emerald-700'
                    }`}>
                    {location.pathname === '/profile' &&
                      location.search.includes('change-password') && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-l-full" />
                      )}
                    <div
                      className={`
                      flex-shrink-0 transition-colors duration-200
                      ${location.pathname === '/profile' && location.search.includes('change-password') ? 'text-emerald-600' : 'text-emerald-500'}
                    `}>
                      <Key size={22} />
                    </div>
                    <span className="font-medium text-sm flex-1">تغيير كلمة المرور</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      onMobileClose?.();
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium text-sm">
                    <div className="flex-shrink-0">
                      <LogOut size={22} />
                    </div>
                    <span className="font-medium text-sm flex-1">تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed right-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-50 via-teal-50 to-emerald-50 border-l border-emerald-100 shadow-xl z-40 overflow-y-auto overflow-x-hidden transition-all duration-300 sidebar-scrollbar`}
        style={{ width: isCollapsed ? '80px' : '280px' }}
        dir="rtl">
        {/* Toggle Button */}
        {onToggle && (
          <div className="p-4 border-b border-emerald-200">
            <button
              onClick={onToggle}
              title={isCollapsed ? 'إظهار القائمة' : 'إخفاء القائمة'}
              aria-label={isCollapsed ? 'إظهار القائمة' : 'إخفاء القائمة'}
              className="w-full flex items-center justify-center p-2 rounded-2xl hover:bg-white/60 transition-all duration-200 text-emerald-600">
              <Menu size={20} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-4 space-y-2 pb-4">
          {navGroups.map((group) => {
            const isOpen = openGroups.has(group.title);
            const groupActive = isGroupActive(group);

            // عرض الصفحة الرئيسية مباشرة بدون قائمة
            if (group.title === 'الرئيسية' && group.items.length > 0 && !isCollapsed) {
              const homeItem = group.items[0];
              const HomeIcon = homeItem.icon;
              const isHomeActive = isActive(homeItem.to);

              return (
                <NavLink
                  key={homeItem.to}
                  to={homeItem.to}
                  className={`
                    group relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 mb-3
                    ${isHomeActive
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-emerald-600 hover:bg-white/60 hover:text-emerald-700'
                    }
                  `}>
                  {isHomeActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/30 rounded-l-full" />
                  )}
                  <div
                    className={`
                    flex-shrink-0 transition-colors duration-200
                    ${isHomeActive ? 'text-white' : 'text-emerald-500 group-hover:text-emerald-600'}
                  `}>
                    <HomeIcon size={22} />
                  </div>
                  <span className="font-medium text-sm flex-1">
                    {homeItem.label}
                  </span>
                </NavLink>
              );
            }

            if (isCollapsed) {
              // في حالة الانهيار، نعرض الأيقونات مع فواصل بين المجموعات
              return (
                <div key={group.title} className="space-y-1.5">
                  {/* Divider before group (except first group) */}
                  {navGroups.indexOf(group) > 0 && (
                    <div className="my-3 border-t border-emerald-200/60" />
                  )}
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.to);

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                          className={`
                          group relative flex items-center justify-center w-12 h-12 mx-auto rounded-2xl transition-all duration-300
                          ${active
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-400/50 border border-emerald-500 scale-105'
                            : 'text-emerald-600 bg-white/90 hover:bg-white hover:shadow-md hover:shadow-emerald-200/30 border border-emerald-100/60 hover:border-emerald-200/80 hover:scale-105'
                          }
                        `}
                        title={`${group.title} - ${item.label}`}>
                        <div
                          className={`
                          flex-shrink-0 transition-all duration-300
                          ${active ? 'text-white scale-110' : 'text-emerald-500 group-hover:text-emerald-600 group-hover:scale-110'}
                        `}>
                          <Icon size={22} className="stroke-[2.5]" />
                        </div>
                      </NavLink>
                    );
                  })}
                </div>
              );
            }

            // تخطي مجموعة "الرئيسية" لأنها معروضة مباشرة
            if (group.title === 'الرئيسية') {
              return null;
            }

            return (
              <div key={group.title} className="space-y-2">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.title)}
                  aria-label={`${isOpen ? 'إغلاق' : 'فتح'} قائمة ${group.title}`}
                  aria-expanded={isOpen ? true : false}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    groupActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-emerald-600 hover:bg-white/60'
                  }`}>
                  <span className="font-semibold text-xs uppercase tracking-wide">
                    {group.title}
                  </span>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-emerald-600" aria-hidden="true" />
                  ) : (
                    <ChevronDown size={16} className="text-emerald-600" aria-hidden="true" />
                  )}
                </button>

                {/* Group Items */}
                {isOpen && (
                  <div className="pr-4 space-y-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.to);

                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={`
                            group relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200
                            ${active
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'text-emerald-600 hover:bg-white/60 hover:text-emerald-700'
                            }
                          `}>
                          {active && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/30 rounded-l-full" />
                          )}
                          <div
                            className={`
                            flex-shrink-0 transition-colors duration-200
                            ${active ? 'text-white' : 'text-emerald-500 group-hover:text-emerald-600'}
                          `}>
                            <Icon size={22} />
                          </div>
                          <span className="font-medium text-sm flex-1">
                            {item.label}
                          </span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Account Section - Collapsed State */}
        {isCollapsed && currentUser && (
          <div className="p-4 border-t border-emerald-200/60 space-y-1.5">
            <button
              onClick={handleProfileClick}
                className={`
                group relative flex items-center justify-center w-12 h-12 mx-auto rounded-2xl transition-all duration-300
                ${location.pathname === '/profile' && !location.search.includes('change-password')
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-400/50 border border-emerald-500 scale-105'
                  : 'text-emerald-600 bg-white/90 hover:bg-white hover:shadow-md hover:shadow-emerald-200/30 border border-emerald-100/60 hover:border-emerald-200/80 hover:scale-105'
                }
              `}
              title="الملف الشخصي">
              <div
                className={`
                flex-shrink-0 transition-all duration-300
                ${location.pathname === '/profile' && !location.search.includes('change-password') ? 'text-white scale-110' : 'text-emerald-500 group-hover:text-emerald-600 group-hover:scale-110'}
              `}>
                <User size={22} className="stroke-[2.5]" />
              </div>
            </button>
            <button
              onClick={handleChangePasswordClick}
                className={`
                group relative flex items-center justify-center w-12 h-12 mx-auto rounded-2xl transition-all duration-300
                ${location.pathname === '/profile' && location.search.includes('change-password')
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-400/50 border border-emerald-500 scale-105'
                  : 'text-emerald-600 bg-white/90 hover:bg-white hover:shadow-md hover:shadow-emerald-200/30 border border-emerald-100/60 hover:border-emerald-200/80 hover:scale-105'
                }
              `}
              title="تغيير كلمة المرور">
              <div
                className={`
                flex-shrink-0 transition-all duration-300
                ${location.pathname === '/profile' && location.search.includes('change-password') ? 'text-white scale-110' : 'text-emerald-500 group-hover:text-emerald-600 group-hover:scale-110'}
              `}>
                <Key size={22} className="stroke-[2.5]" />
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="group relative flex items-center justify-center w-12 h-12 mx-auto rounded-2xl transition-all duration-300 text-red-500 bg-white/90 hover:bg-red-50 hover:text-red-600 hover:shadow-md hover:shadow-red-200/30 border border-red-100/60 hover:border-red-200/80 hover:scale-105"
              title="تسجيل الخروج">
              <div className="flex-shrink-0 transition-all duration-300 group-hover:scale-110">
                <LogOut size={22} className="stroke-[2.5]" />
              </div>
            </button>
          </div>
        )}

        {/* User Account Section - As Collapsible Group */}
        {!isCollapsed && currentUser && (
          <div className="p-4 border-t border-emerald-200 bg-white/50 backdrop-blur-sm">
            <div className="space-y-2">
              {/* Account Group Header */}
              <button
                onClick={() => toggleGroup('الحساب')}
                aria-label={`${openGroups.has('الحساب') ? 'إغلاق' : 'فتح'} قائمة الحساب`}
                aria-expanded={openGroups.has('الحساب') ? true : false}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  location.pathname === '/profile'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-emerald-600 hover:bg-white/60'
                }`}>
                <span className="font-semibold text-xs uppercase tracking-wide">
                  الحساب
                </span>
                {openGroups.has('الحساب') ? (
                  <ChevronUp size={16} className="text-emerald-600" aria-hidden="true" />
                ) : (
                  <ChevronDown size={16} className="text-emerald-600" aria-hidden="true" />
                )}
              </button>

              {/* Account Group Items */}
              {openGroups.has('الحساب') && (
                <div className="pr-4 space-y-2">
                  <button
                    onClick={handleProfileClick}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 font-medium text-sm relative ${
                      location.pathname === '/profile' &&
                      !location.search.includes('change-password')
                        ? 'bg-white text-emerald-700 shadow-md'
                        : 'text-emerald-600 hover:bg-white/60 hover:text-emerald-700'
                    }`}>
                    {location.pathname === '/profile' &&
                      !location.search.includes('change-password') && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-l-full" />
                      )}
                    <div
                      className={`
                      flex-shrink-0 transition-colors duration-200
                      ${location.pathname === '/profile' && !location.search.includes('change-password') ? 'text-emerald-600' : 'text-emerald-500'}
                    `}>
                      <User size={22} />
                    </div>
                    <span className="font-medium text-sm flex-1">الملف الشخصي</span>
                  </button>
                  <button
                    onClick={handleChangePasswordClick}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 font-medium text-sm relative ${
                      location.pathname === '/profile' &&
                      location.search.includes('change-password')
                        ? 'bg-white text-emerald-700 shadow-md'
                        : 'text-emerald-600 hover:bg-white/60 hover:text-emerald-700'
                    }`}>
                    {location.pathname === '/profile' &&
                      location.search.includes('change-password') && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-l-full" />
                      )}
                    <div
                      className={`
                      flex-shrink-0 transition-colors duration-200
                      ${location.pathname === '/profile' && location.search.includes('change-password') ? 'text-emerald-600' : 'text-emerald-500'}
                    `}>
                      <Key size={22} />
                    </div>
                    <span className="font-medium text-sm flex-1">تغيير كلمة المرور</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium text-sm">
                    <div className="flex-shrink-0">
                      <LogOut size={22} />
                    </div>
                    <span className="font-medium text-sm flex-1">تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default UserSidebar;
