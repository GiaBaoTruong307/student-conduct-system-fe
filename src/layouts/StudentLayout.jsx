import { Outlet } from "react-router-dom";
import { useState } from "react";
import useLogout from "../hooks/useLogout";
import logo from "../assets/images/logo-header.png";

const StudentLayout = () => {
  const logout = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock data for student info
  const studentInfo = {
    name: "Trương Văn Gia Bảo",
    role: "Sinh viên",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo & Title */}
            <div className="flex items-center gap-2 md:gap-4">
              <img src={logo} alt="DUE Logo" className="h-8 md:h-12" />
              <div>
                <h1 className="text-base md:text-xl font-bold text-gray-800">
                  DUE-Score
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <button className="text-[#3d2f6b] font-semibold border-b-2 border-[#3d2f6b] pb-1 cursor-pointer">
                Bảng điểm cá nhân
              </button>
              <button className="text-gray-600 hover:text-[#3d2f6b] font-medium transition-colors cursor-pointer">
                Đơn đề nghị chỉnh điểm cá nhân
              </button>
              <button className="text-gray-600 hover:text-[#3d2f6b] font-medium transition-colors cursor-pointer">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
            </nav>

            {/* Right: User Info & Mobile Menu Toggle */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Desktop User Info */}
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <div className="font-semibold text-gray-800 text-sm md:text-base">
                    {studentInfo.name}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500">
                    {studentInfo.role}
                  </div>
                </div>
                <div className="relative group">
                  <button className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold hover:shadow-lg transition-shadow cursor-pointer text-sm md:text-base">
                    GB
                  </button>
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
                        Thông tin cá nhân
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
                        Cài đặt
                      </button>
                      <hr className="my-2 border-gray-200" />
                      <button
                        onClick={logout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-[#3d2f6b] cursor-pointer"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4 space-y-4">
              {/* User Info - Mobile */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                  GB
                </div>
                <div>
                  <div className="font-semibold text-gray-800">
                    {studentInfo.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {studentInfo.role}
                  </div>
                </div>
              </div>

              {/* Navigation - Mobile */}
              <nav className="space-y-2">
                <button className="w-full text-left px-4 py-2 text-[#3d2f6b] font-semibold bg-purple-50 rounded-lg cursor-pointer">
                  Bảng điểm cá nhân
                </button>
                <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
                  Đơn đề nghị chỉnh điểm cá nhân
                </button>
                <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2 cursor-pointer">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  Thông báo
                </button>
              </nav>

              {/* Actions - Mobile */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
                  Thông tin cá nhân
                </button>
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
                  Cài đặt
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 md:px-6 py-4 md:py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
