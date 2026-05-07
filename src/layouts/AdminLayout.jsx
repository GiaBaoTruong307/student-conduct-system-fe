import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import useLogout from "../hooks/useLogout";
import logo from "../assets/images/logo-header.png";
import { getRoleLabel, getInitials } from "../utils/role";

const NAV_ITEMS = [
  {
    label: "Tài khoản",
    path: "/admin/accounts",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    label: "Nhóm người dùng",
    path: "/admin/user-groups",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Học kì - Năm học",
    path: "/admin/academic",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    label: "Tiêu chí chấm điểm",
    path: "/admin/criteria",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Cài đặt thời gian",
    path: "/admin/time-settings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  },
];

const AdminLayout = () => {
  const logout = useLogout();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminInfo = {
    name: "Admin123",
    role: getRoleLabel(localStorage.getItem("role")),
    initials: "A",
  };

  const isActive = (path) => pathname === path || pathname.startsWith(path + "/");

  return (
    // Chiếm đúng toàn bộ viewport
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-52 bg-white border-r border-gray-200 flex flex-col
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:flex lg:shrink-0
        `}
      >
        {/* Logo */}
        <div className="flex flex-col items-center pt-6 pb-5 border-b border-gray-100 px-4 shrink-0">
          <div className="w-16 h-16 rounded-full bg-[#3d2f6b] flex items-center justify-center mb-2 shadow-md">
            <img src={logo} alt="DUE Logo" className="h-10 w-10 object-contain" />
          </div>
          <span className="font-bold text-[#3d2f6b] text-sm tracking-wide mt-1">DUE-Score</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors cursor-pointer text-left
                  ${active
                    ? "bg-purple-50 text-[#3d2f6b] border-r-4 border-[#3d2f6b]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#3d2f6b]"
                  }
                `}
              >
                <span className={active ? "text-[#3d2f6b]" : "text-gray-400"}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── MAIN COLUMN ── */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">

        {/* Header */}
        <header className="shrink-0 bg-white border-b border-gray-200 shadow-sm z-20">
          <div className="px-5 py-3 flex items-center justify-between h-14">
            {/* Hamburger mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-gray-500 hover:text-[#3d2f6b] cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex-1" />

            {/* Right: bell + user */}
            <div className="flex items-center gap-3">
              <button className="p-1.5 text-gray-400 hover:text-[#3d2f6b] transition-colors cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              {/* User dropdown */}
              <div className="relative group">
                <div className="flex items-center gap-2 border border-gray-200 rounded-full pl-3 pr-1 py-1 cursor-pointer hover:bg-gray-50 transition-colors select-none">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-gray-800 leading-tight">{adminInfo.name}</div>
                    <div className="text-xs text-gray-400 leading-tight">{adminInfo.role}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#3d2f6b] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {adminInfo.initials}
                  </div>
                </div>

                {/* Dropdown menu */}
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                      Thông tin cá nhân
                    </button>
                    <hr className="border-gray-100" />
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 cursor-pointer"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;