import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import useLogout from "../hooks/useLogout";
import logo from "../assets/images/logo-header.png";

const GVCN_REQUESTS_KEY    = "gvcnAdjustmentRequests";
const STUDENT_REQUESTS_KEY = "studentAdjustmentRequests";
const NOTIF_KEY            = "pctsvNotifications";

const NAV_ITEMS = [
  {
    label: "Tài khoản",
    path: null,
    disabled: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    label: "Bảng điểm sinh viên",
    path: "/student-affairs-leader/bang-diem-sv",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Đề nghị chỉnh điểm trong trường",
    path: "/student-affairs-leader/de-nghi-dieu-chinh",
    badge: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    label: "Học kì - Năm học",
    path: "/student-affairs-leader/academic",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    label: "Tiêu chí chấm điểm",
    path: "/student-affairs-leader/criteria",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Cài đặt thời gian",
    path: "/student-affairs-leader/time-settings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Báo cáo",
    path: "/student-affairs-leader/bao-cao",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const readPendingRequests = () => {
  try {
    const gvcnReqs    = JSON.parse(localStorage.getItem(GVCN_REQUESTS_KEY)    || "[]");
    const studentReqs = JSON.parse(localStorage.getItem(STUDENT_REQUESTS_KEY) || "[]");
    const fromGvcn    = gvcnReqs.filter((r) => r.trangThai === "khoa-duyet");
    const fromRescore = gvcnReqs.filter((r) => r.trangThai === "rescore-khoa-duyet");
    const coveredIds  = new Set(fromGvcn.map((r) => r.studentRequestId).filter(Boolean));
    const fromStudent = studentReqs.filter(
      (r) => r.trangThai === "khoa-duyet" && !coveredIds.has(r.id)
    );
    return [...fromGvcn, ...fromStudent, ...fromRescore];
  } catch { return []; }
};

const readNotifications = () => {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]"); }
  catch { return []; }
};

const saveNotifications = (notifs) => {
  try { localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs)); } catch {}
};

const syncNotifications = (pendingReqs) => {
  const existing       = readNotifications();
  const existingRefIds = new Set(existing.map((n) => n.refId));
  const newNotifs = pendingReqs
    .filter((req) => {
      const refId = req.trangThai === "rescore-khoa-duyet" ? `rescore_${req.id}` : req.id;
      return !existingRefIds.has(refId);
    })
    .map((req) => {
      const isRescore = req.trangThai === "rescore-khoa-duyet";
      const refId     = isRescore ? `rescore_${req.id}` : req.id;
      return {
        id:        `notif_pctsv_${isRescore ? "rescore_" : ""}${req.id}`,
        type:      isRescore ? "rescore_request" : "adjustment_request",
        refId,
        title:     isRescore
          ? `Kết quả chấm lại của GVCN #${req.id}`
          : `Đơn đề nghị điều chỉnh điểm #${req.id}`,
        message:   isRescore
          ? ["Khoa đã duyệt kết quả chấm lại, chờ PCTSV xác nhận", req.hocKy, req.namHoc, req.ngayTao].filter(Boolean).join(" · ")
          : ["Khoa đã duyệt, chờ PCTSV xử lý", req.hocKy, req.namHoc, req.ngayTao].filter(Boolean).join(" · "),
        read:      false,
        createdAt: req.ngayTao || "",
      };
    });
  if (newNotifs.length === 0) return existing;
  const updated = [...newNotifs, ...existing];
  saveNotifications(updated);
  return updated;
};

// ── Component ─────────────────────────────────────────────────────────────────

const StudentAffairsLeaderLayout = () => {
  const logout   = useLogout();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [pendingCount,     setPendingCount]     = useState(() => readPendingRequests().length);
  const [notifications,    setNotifications]    = useState(() => syncNotifications(readPendingRequests()));
  const [highlightedIds,   setHighlightedIds]   = useState(new Set());
  const [showBellDropdown, setShowBellDropdown] = useState(false);

  const bellRef     = useRef(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const userInfo = {
    name:     "Nguyễn Lê Na",
    role:     "Lãnh đạo PCTSV",
    initials: "LN",
  };

  const isActive = (path) =>
    path && (pathname === path || pathname.startsWith(path + "/"));

  useEffect(() => {
    const handleUpdate = () => {
      const pending = readPendingRequests();
      setPendingCount(pending.length);
      setNotifications(syncNotifications(pending));
    };
    window.addEventListener("khoaRequestsUpdated", handleUpdate);
    window.addEventListener("khoaRescoreUpdated",  handleUpdate);
    return () => {
      window.removeEventListener("khoaRequestsUpdated", handleUpdate);
      window.removeEventListener("khoaRescoreUpdated",  handleUpdate);
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

  const handleGoToAdjustment = () => {
    setShowBellDropdown(false);
    setHighlightedIds(new Set());
    navigate("/student-affairs-leader/de-nghi-dieu-chinh");
  };

  return (
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
          fixed top-0 left-0 z-40 h-full w-56 bg-white border-r border-gray-200 flex flex-col
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
            if (item.disabled) {
              return (
                <div
                  key="disabled-account"
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-300 cursor-not-allowed select-none"
                >
                  <span className="text-gray-300">{item.icon}</span>
                  {item.label}
                </div>
              );
            }

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
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && pendingCount > 0 && (
                  <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="shrink-0 border-t border-gray-100 p-4">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Đăng xuất
          </button>
        </div>
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

              {/* Bell */}
              <div className="relative" ref={bellRef}>
                <button
                  onClick={handleBellClick}
                  className="relative p-1.5 text-gray-400 hover:text-[#3d2f6b] transition-colors cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
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
                          const isNew     = highlightedIds.has(notif.id);
                          const isRescore = notif.type === "rescore_request";
                          return (
                            <button
                              key={notif.id}
                              onClick={handleGoToAdjustment}
                              className={`w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors cursor-pointer ${isNew ? "bg-orange-50/60" : "bg-white"}`}
                            >
                              <div className="flex items-start gap-2.5">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${isNew ? (isRescore ? "bg-purple-500" : "bg-orange-500") : "bg-gray-300"}`} />
                                <div>
                                  <p className={`text-sm font-semibold ${isNew ? "text-gray-800" : "text-gray-500"}`}>{notif.title}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
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

              {/* User dropdown */}
              <div className="relative group">
                <div className="flex items-center gap-2 border border-gray-200 rounded-full pl-3 pr-1 py-1 cursor-pointer hover:bg-gray-50 transition-colors select-none">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-gray-800 leading-tight">{userInfo.name}</div>
                    <div className="text-xs text-[#3d2f6b] font-medium leading-tight">{userInfo.role}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#3d2f6b] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {userInfo.initials}
                  </div>
                </div>
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                      Thông tin cá nhân
                    </button>
                    <hr className="border-gray-100" />
                    <button onClick={logout} className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 cursor-pointer">
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

export default StudentAffairsLeaderLayout;