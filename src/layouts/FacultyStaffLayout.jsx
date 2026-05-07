import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import useLogout from "../hooks/useLogout";
import logo from "../assets/images/logo-header.png";
import { getRoleLabel, getInitials } from "../utils/role";

const GVCN_REQUESTS_KEY = "gvcnAdjustmentRequests";
const NOTIF_KEY = "khoaNotifications";

const NAV_ITEMS = [
  { label: "Bảng điểm Khoa", path: "/faculty-staff/bang-diem-khoa" },
  { label: "Đề nghị điều chỉnh điểm trong Khoa", path: "/faculty-staff/de-nghi-dieu-chinh" },
];

const ADJUSTMENT_PATH = "/faculty-staff/de-nghi-dieu-chinh";

const readPendingRequests = () => {
  try {
    const all = JSON.parse(localStorage.getItem(GVCN_REQUESTS_KEY) || "[]");
    return all.filter(
      (r) =>
        ((r.source === "student" || r.source === "gvcn") && r.trangThai === "chua-duyet") ||
        (r.source === "rescore" && r.trangThai === "rescore-submitted")
    );
  } catch { return []; }
};

const readNotifications = () => {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]"); }
  catch { return []; }
};

const saveNotifications = (notifs) => {
  try { localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs)); } catch { }
};

const syncNotifications = (pendingReqs) => {
  const existing = readNotifications();
  const existingRefs = new Set(existing.map((n) => n.refId));

  // Part 1: đơn chua-duyet bình thường từ SV/GVCN
  const incomingNotifs = pendingReqs
    .filter((req) => req.source !== "rescore" && !existingRefs.has(req.id))
    .map((req) => ({
      id: `notif_khoa_${req.id}`,
      refId: req.id,
      title: `Đơn đề nghị điều chỉnh điểm #${req.id}`,
      message: ["GVCN chuyển đơn chờ Khoa duyệt", req.hocKy, req.namHoc, req.ngayTao]
        .filter(Boolean).join(" · "),
      read: false,
      createdAt: req.ngayTao || "",
    }));

  // Part 2: GVCN đã chấm lại → thông báo Khoa duyệt lần 2
  const rescoreNotifs = pendingReqs
    .filter((req) => req.source === "rescore" && !existingRefs.has(`rescore_submitted_${req.id}`))
    .map((req) => ({
      id: `notif_khoa_rescore_${req.id}`,
      refId: `rescore_submitted_${req.id}`,
      title: `GVCN đã chấm lại điểm — chờ Khoa duyệt`,
      message: [`SV: ${req.svHoTen}`, req.hocKy, req.namHoc].filter(Boolean).join(" · "),
      read: false,
      createdAt: req.rescoreSubmittedAt || req.ngayTao || "",
    }));

  // Part 3: PCTSV hoàn tất → thông báo về Khoa
  const allGvcnReqs = (() => {
    try { return JSON.parse(localStorage.getItem(GVCN_REQUESTS_KEY) || "[]"); }
    catch { return []; }
  })();

  const statusNotifs = allGvcnReqs
    .filter((req) => req.trangThai === "hoan-tat" || req.trangThai === "rescore-hoan-tat")
    .filter((req) => !existingRefs.has(`khoa_status_${req.id}_${req.trangThai}`))
    .map((req) => ({
      id: `notif_khoa_${req.id}_${req.trangThai}`,
      refId: `khoa_status_${req.id}_${req.trangThai}`,
      title: req.trangThai === "rescore-hoan-tat"
        ? `PCTSV đã duyệt điểm chấm lại #${req.id}`
        : `PCTSV đã hoàn tất đơn #${req.id}`,
      message: [req.hocKy, req.namHoc, req.ngayTao].filter(Boolean).join(" · "),
      read: false,
      createdAt: req.ngayTao || "",
    }));

  const allNew = [...incomingNotifs, ...rescoreNotifs, ...statusNotifs];
  if (allNew.length === 0) return existing;
  const updated = [...allNew, ...existing];
  saveNotifications(updated);
  return updated;
};

const FacultyStaffLayout = () => {
  const logout = useLogout();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [pendingCount, setPendingCount] = useState(() => readPendingRequests().length);
  const [notifications, setNotifications] = useState(() => syncNotifications(readPendingRequests()));
  const [highlightedIds, setHighlightedIds] = useState(new Set());
  const [showBellDropdown, setShowBellDropdown] = useState(false);

  const bellRef = useRef(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const userInfo = {
    name: "Nguyễn Văn Hùng",
    role: getRoleLabel(localStorage.getItem("role")),
    initials: "VH",
  };

  const isActive = (path) => pathname.startsWith(path);

  useEffect(() => {
    const handleIncoming = () => {
      const pending = readPendingRequests();
      setPendingCount(pending.length);
      setNotifications(syncNotifications(pending));
    };
    const handleStatusUpdate = () => {
      setNotifications(syncNotifications(readPendingRequests()));
    };

    window.addEventListener("gvcnRequestsUpdated", handleIncoming);
    window.addEventListener("gvcnRescoreSubmitted", handleIncoming);   // ← mới: GVCN nộp chấm lại
    window.addEventListener("khoaStatusUpdated", handleStatusUpdate);
    window.addEventListener("khoaRescoreUpdated", handleStatusUpdate); // ← mới: sau khi Khoa approve lần 2
    return () => {
      window.removeEventListener("gvcnRequestsUpdated", handleIncoming);
      window.removeEventListener("gvcnRescoreSubmitted", handleIncoming);
      window.removeEventListener("khoaStatusUpdated", handleStatusUpdate);
      window.removeEventListener("khoaRescoreUpdated", handleStatusUpdate);
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
    navigate(ADJUSTMENT_PATH);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <img src={logo} alt="DUE Logo" className="h-8 md:h-12" />
              <h1 className="text-base md:text-xl font-bold text-gray-800">DUE-Score</h1>
            </div>

            <nav className="hidden lg:flex items-center gap-8">
              {NAV_ITEMS.map((item) => {
                const isAdjustment = item.path === ADJUSTMENT_PATH;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-1.5 font-medium transition-colors cursor-pointer pb-1 ${isActive(item.path)
                      ? "text-[#3d2f6b] font-semibold border-b-2 border-[#3d2f6b]"
                      : "text-gray-600 hover:text-[#3d2f6b]"
                      }`}
                  >
                    {item.label}
                    {isAdjustment && pendingCount > 0 && (
                      <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                );
              })}

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
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
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
                          const isNew = highlightedIds.has(notif.id);
                          return (
                            <button
                              key={notif.id}
                              onClick={handleGoToAdjustment}
                              className={`w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors cursor-pointer ${isNew ? "bg-orange-50/60" : "bg-white"}`}
                            >
                              <div className="flex items-start gap-2.5">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${isNew ? "bg-orange-500" : "bg-gray-300"}`} />
                                <div>
                                  <p className={`text-sm font-semibold ${isNew ? "text-gray-800" : "text-gray-500"}`}>
                                    {notif.title}
                                  </p>
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
            </nav>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <div className="font-semibold text-gray-800 text-sm md:text-base">{userInfo.name}</div>
                  <div className="text-xs md:text-sm text-gray-500">{userInfo.role}</div>
                </div>
                <div className="relative group">
                  <button className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold hover:shadow-lg transition-shadow cursor-pointer text-sm md:text-base">
                    {userInfo.initials}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">Thông tin cá nhân</button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">Cài đặt</button>
                      <hr className="my-2 border-gray-200" />
                      <button onClick={logout} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 cursor-pointer">Đăng xuất</button>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-gray-600 hover:text-[#3d2f6b] cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {userInfo.initials}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{userInfo.name}</div>
                  <div className="text-sm text-gray-500">{userInfo.role}</div>
                </div>
              </div>
              <nav className="space-y-2">
                {NAV_ITEMS.map((item) => {
                  const isAdjustment = item.path === ADJUSTMENT_PATH;
                  return (
                    <button
                      key={item.path}
                      onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-2 ${isActive(item.path) ? "text-[#3d2f6b] font-semibold bg-purple-50" : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      {item.label}
                      {isAdjustment && pendingCount > 0 && (
                        <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                          {pendingCount}
                        </span>
                      )}
                    </button>
                  );
                })}
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

export default FacultyStaffLayout;