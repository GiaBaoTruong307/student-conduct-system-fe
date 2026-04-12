import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import useLogout from "../hooks/useLogout";
import logo from "../assets/images/logo-header.png";

const NOTIF_KEY          = "studentNotifications";
const PCTSV_APPROVED_KEY = "pctsvApprovedClasses";
const LINKED_CLASS_ID    = "48K14.1";
const ADJUSTMENT_PATH    = "/student/adjustment-request";

// ── Helpers ──────────────────────────────────────────────────────────────────

const readNotifications = () => {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]"); }
  catch { return []; }
};

const saveNotifications = (notifs) => {
  try { localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs)); } catch {}
};

const nowStr = () => {
  const d    = new Date();
  const dd   = String(d.getDate()).padStart(2, "0");
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh   = String(d.getHours()).padStart(2, "0");
  const min  = String(d.getMinutes()).padStart(2, "0");
  const ss   = String(d.getSeconds()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
};

// Chỉ sync thông báo PCTSV phê duyệt điểm cả lớp (push-based cho đơn chỉnh điểm)
const syncStudentNotifications = () => {
  try {
    const existing     = readNotifications();
    const existingRefs = new Set(existing.map((n) => n.refId));
    const newNotifs    = [];

    // ── Thông báo PCTSV phê duyệt điểm cả lớp ────────────────────────────
    const pctsvApproved = JSON.parse(localStorage.getItem(PCTSV_APPROVED_KEY) || "{}");
    const allYears      = JSON.parse(localStorage.getItem("admin_academic_years") || "[]");
    const allSemesters  = JSON.parse(localStorage.getItem("admin_academic_semesters") || "{}");

    for (const key of Object.keys(pctsvApproved)) {
      if (!key.startsWith(`${LINKED_CLASS_ID}_`)) continue;
      const refId = `pctsv_approved_${key}`;
      if (existingRefs.has(refId)) continue;

      let yearName = "";
      let semName  = "";
      for (const y of allYears) {
        for (const s of (allSemesters[y.id] || [])) {
          if (`${LINKED_CLASS_ID}_${y.id}_${s.id}` === key) {
            yearName = y.name;
            semName  = s.name;
            break;
          }
        }
        if (yearName) break;
      }

      newNotifs.push({
        id:        `notif_pctsv_${key}`,
        refId,
        title:     "Điểm rèn luyện đã được PCTSV phê duyệt chính thức",
        message:   [semName, yearName && `Năm học ${yearName}`].filter(Boolean).join(" · "),
        read:      false,
        createdAt: nowStr(),
        type:      "pctsv",
      });
    }

    if (newNotifs.length === 0) return existing;
    const updated = [...newNotifs, ...existing];
    saveNotifications(updated);
    return updated;
  } catch { return readNotifications(); }
};

// ── Component ─────────────────────────────────────────────────────────────────

const StudentLayout = () => {
  const logout   = useLogout();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [notifications,    setNotifications]    = useState(() => syncStudentNotifications());
  const [highlightedIds,   setHighlightedIds]   = useState(new Set());
  const [showBellDropdown, setShowBellDropdown] = useState(false);

  const bellRef     = useRef(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const studentInfo = { name: "Trương Văn Gia Bảo", role: "Sinh viên" };

  useEffect(() => {
    const handleStatusUpdate = () => setNotifications(readNotifications());
    window.addEventListener("studentStatusUpdated", handleStatusUpdate);
    window.addEventListener("pctsvApproved",        () => setNotifications(syncStudentNotifications()));
    return () => {
      window.removeEventListener("studentStatusUpdated", handleStatusUpdate);
      window.removeEventListener("pctsvApproved",        handleStatusUpdate);
    };
  }, []);

  useEffect(() => {
    if (!showBellDropdown) return;
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target))
        setShowBellDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showBellDropdown]);

  const handleBellClick = () => {
    if (!showBellDropdown) {
      const unreadIds = new Set(notifications.filter((n) => !n.read).map((n) => n.id));
      setHighlightedIds(unreadIds);
      if (unreadIds.size > 0) {
        const updated = notifications.map((n) => ({ ...n, read: true }));
        saveNotifications(updated);
        setNotifications(updated);
      }
    } else {
      setHighlightedIds(new Set());
    }
    setShowBellDropdown((v) => !v);
  };

  const handleNotifClick = (notif) => {
    setShowBellDropdown(false);
    setHighlightedIds(new Set());
    if (notif.type === "pctsv") {
      navigate("/student/individual-score");
    } else {
      navigate(ADJUSTMENT_PATH);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <img src={logo} alt="DUE Logo" className="h-8 md:h-12" />
              <div>
                <h1 className="text-base md:text-xl font-bold text-gray-800">DUE-Score</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <NavLink
                to="/student/individual-score"
                className={({ isActive }) =>
                  isActive
                    ? "text-[#3d2f6b] font-semibold border-b-2 border-[#3d2f6b] pb-1"
                    : "text-gray-600 hover:text-[#3d2f6b] font-medium transition-colors pb-1"
                }
              >
                Bảng điểm cá nhân
              </NavLink>
              <NavLink
                to="/student/adjustment-request"
                className={({ isActive }) =>
                  isActive
                    ? "text-[#3d2f6b] font-semibold border-b-2 border-[#3d2f6b] pb-1"
                    : "text-gray-600 hover:text-[#3d2f6b] font-medium transition-colors pb-1"
                }
              >
                Đơn đề nghị chỉnh điểm cá nhân
              </NavLink>

              {/* Bell */}
              <div className="relative" ref={bellRef}>
                <button
                  onClick={handleBellClick}
                  className="relative text-gray-600 hover:text-[#3d2f6b] transition-colors cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showBellDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-800">Thông báo</span>
                      {highlightedIds.size > 0 && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                          {highlightedIds.size} chưa đọc
                        </span>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">Không có thông báo nào</div>
                    ) : (
                      <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                        {notifications.map((notif) => {
                          const isNew   = highlightedIds.has(notif.id);
                          const isPctsv = notif.type === "pctsv";
                          return (
                            <button
                              key={notif.id}
                              onClick={() => handleNotifClick(notif)}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${isNew ? (isPctsv ? "bg-green-50/60" : "bg-orange-50/60") : "bg-white"}`}
                            >
                              <div className="flex items-start gap-2.5">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${isNew ? (isPctsv ? "bg-green-500" : "bg-orange-500") : "bg-gray-300"}`} />
                                <div className="min-w-0">
                                  <p className={`text-sm font-semibold ${isNew ? "text-gray-800" : "text-gray-500"}`}>
                                    {notif.title}
                                  </p>
                                  {notif.message && (
                                    <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                                  )}
                                  {notif.createdAt && (
                                    <p className="text-xs text-gray-400 mt-0.5">{notif.createdAt}</p>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </nav>

            {/* Right: User Info & Mobile Toggle */}
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <div className="font-semibold text-gray-800 text-sm md:text-base">{studentInfo.name}</div>
                  <div className="text-xs md:text-sm text-gray-500">{studentInfo.role}</div>
                </div>
                <div className="relative group">
                  <button className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold hover:shadow-lg transition-shadow cursor-pointer text-sm md:text-base">
                    GB
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">Thông tin cá nhân</button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">Cài đặt</button>
                      <hr className="my-2 border-gray-200" />
                      <button onClick={logout} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer">Đăng xuất</button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-[#3d2f6b] cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">GB</div>
                <div>
                  <div className="font-semibold text-gray-800">{studentInfo.name}</div>
                  <div className="text-sm text-gray-500">{studentInfo.role}</div>
                </div>
              </div>
              <nav className="space-y-2">
                <NavLink
                  to="/student/individual-score"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block w-full text-left px-4 py-2 rounded-lg cursor-pointer ${
                      isActive ? "text-[#3d2f6b] font-semibold bg-purple-50" : "text-gray-600 hover:bg-gray-50"
                    }`
                  }
                >
                  Bảng điểm cá nhân
                </NavLink>
                <NavLink
                  to="/student/adjustment-request"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block w-full text-left px-4 py-2 rounded-lg cursor-pointer ${
                      isActive ? "text-[#3d2f6b] font-semibold bg-purple-50" : "text-gray-600 hover:bg-gray-50"
                    }`
                  }
                >
                  Đơn đề nghị chỉnh điểm cá nhân
                </NavLink>
              </nav>
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">Thông tin cá nhân</button>
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">Cài đặt</button>
                <button onClick={logout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">Đăng xuất</button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="px-4 md:px-6 py-4 md:py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;