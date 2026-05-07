import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import useLogout from "../hooks/useLogout";
import logo from "../assets/images/logo-header.png";
import { getRoleLabel, getInitials } from "../utils/role";

const STUDENT_REQUESTS_KEY = "studentAdjustmentRequests";
const GVCN_REQUESTS_KEY = "gvcnAdjustmentRequests";
const NOTIF_KEY = "gvcnNotifications";

const NAV_ITEMS = [
  { label: "Bảng điểm lớp chủ nhiệm", path: "/homeroom-teacher/class-score" },
  { label: "Đề nghị điều chỉnh điểm", path: "/homeroom-teacher/adjustment" },
];

const readPendingRequests = () => {
  try {
    const all = JSON.parse(localStorage.getItem(STUDENT_REQUESTS_KEY) || "[]");
    return all.filter((r) => r.trangThai === "chua-duyet");
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

  // Part 1: incoming student requests chờ GVCN duyệt
  const incomingNotifs = pendingReqs
    .filter((req) => !existingRefs.has(req.id))
    .map((req) => ({
      id: `notif_adj_${req.id}`,
      refId: req.id,
      type: "student-pending",
      title: `Đơn đề nghị điều chỉnh điểm #${req.id}`,
      message: ["Sinh viên gửi đơn chờ duyệt", req.hocKy, req.namHoc, req.ngayTao]
        .filter(Boolean).join(" · "),
      read: false,
      createdAt: req.ngayTao || "",
    }));

  // Part 2: Khoa đã duyệt đơn GVCN gửi lên (chỉ khoa-duyet, không tạo lại cho hoan-tat
  // vì PCTSV sẽ tự ghi pctsv-approved-rescore trực tiếp)
  const gvcnReqs = (() => {
    try { return JSON.parse(localStorage.getItem(GVCN_REQUESTS_KEY) || "[]"); }
    catch { return []; }
  })();

  const statusNotifs = [];
  for (const req of gvcnReqs) {
    if (req.trangThai !== "khoa-duyet") continue;
    const refId = `gvcn_status_${req.id}_khoa-duyet`;
    if (existingRefs.has(refId)) continue;
    statusNotifs.push({
      id: `notif_gvcn_${req.id}_khoa-duyet`,
      refId,
      type: "khoa-approved",
      title: `Khoa đã duyệt đơn đề nghị #${req.id}`,
      message: [req.hocKy, req.namHoc, req.ngayTao].filter(Boolean).join(" · "),
      read: false,
      createdAt: req.ngayTao || "",
    });
  }

  const allNew = [...incomingNotifs, ...statusNotifs];
  if (allNew.length === 0) return existing;
  const updated = [...allNew, ...existing];
  saveNotifications(updated);
  return updated;
};

const HomeroomTeacherLayout = () => {
  const logout = useLogout();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [pendingCount, setPendingCount] = useState(() => readPendingRequests().length);
  const [notifications, setNotifications] = useState(() => syncNotifications(readPendingRequests()));
  const [highlightedIds, setHighlightedIds] = useState(new Set());
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const bellRef = useRef(null);
  const loginPopupShown = useRef(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const userInfo = {
    name: "Nguyễn Văn Sơn",
    role: getRoleLabel(localStorage.getItem("role")),
    initials: "NS",
  };
  const isActive = (path) => pathname.startsWith(path);

  useEffect(() => {
    if (!loginPopupShown.current) {
      loginPopupShown.current = true;
      const pending = readPendingRequests();
      if (pending.length > 0) setShowLoginPopup(true);
    }

    const handleIncoming = () => {
      const pending = readPendingRequests();
      setPendingCount(pending.length);
      setNotifications(syncNotifications(pending));
    };
    const handleStatusUpdate = () => {
      setNotifications(syncNotifications(readPendingRequests()));
    };
    // PCTSV ghi notification pctsv-approved-rescore trực tiếp → đọc lại
    const handlePctsvRescore = () => {
      setNotifications(readNotifications());
    };

    window.addEventListener("studentRequestsUpdated", handleIncoming);
    window.addEventListener("gvcnStatusUpdated", handleStatusUpdate);
    window.addEventListener("pctsvApprovedRescore", handlePctsvRescore);
    return () => {
      window.removeEventListener("studentRequestsUpdated", handleIncoming);
      window.removeEventListener("gvcnStatusUpdated", handleStatusUpdate);
      window.removeEventListener("pctsvApprovedRescore", handlePctsvRescore);
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
    if (notif.type === "pctsv-approved-rescore") {
      // Điều hướng về bảng điểm lớp để GVCN chọn SV chấm lại
      navigate("/homeroom-teacher/class-score");
    } else {
      navigate("/homeroom-teacher/adjustment");
    }
  };

  const handleGoToAdjustment = () => {
    setShowLoginPopup(false);
    setShowBellDropdown(false);
    setHighlightedIds(new Set());
    navigate("/homeroom-teacher/adjustment");
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {showLoginPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="px-6 pt-6 pb-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-base">Thông báo đề nghị điều chỉnh điểm</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Đang có{" "}
                  <span className="font-bold text-orange-600">{pendingCount} đơn</span>{" "}
                  cần được duyệt từ sinh viên trong lớp.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-5 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowLoginPopup(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Để sau
              </button>
              <button
                onClick={handleGoToAdjustment}
                className="px-4 py-2 bg-[#3d2f6b] hover:bg-[#2e2352] text-white text-sm font-semibold rounded-lg cursor-pointer"
              >
                Xem ngay
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <img src={logo} alt="DUE Logo" className="h-8 md:h-12" />
              <h1 className="text-base md:text-xl font-bold text-gray-800">DUE-Score</h1>
            </div>

            <nav className="hidden lg:flex items-center gap-8">
              {NAV_ITEMS.map((item) => {
                const isAdjustment = item.path === "/homeroom-teacher/adjustment";
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
                          const isRescore = notif.type === "pctsv-approved-rescore";
                          return (
                            <button
                              key={notif.id}
                              onClick={() => handleNotifClick(notif)}
                              className={`w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors cursor-pointer ${isRescore
                                ? isNew ? "bg-blue-50/60" : "bg-white"
                                : isNew ? "bg-orange-50/60" : "bg-white"
                                }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${isNew
                                  ? isRescore ? "bg-blue-500" : "bg-orange-500"
                                  : "bg-gray-300"
                                  }`} />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-semibold ${isNew ? "text-gray-800" : "text-gray-500"}`}>
                                    {notif.title}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                                  {isRescore && notif.deadline && (
                                    <p className="text-xs text-blue-600 font-medium mt-0.5">
                                      Hạn: {new Date(notif.deadline).toLocaleDateString("vi-VN")}
                                    </p>
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

            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <div className="font-semibold text-gray-800 text-sm md:text-base">{userInfo.name}</div>
                  <div className="text-xs md:text-sm text-gray-500">{userInfo.role}</div>
                </div>
                <div className="relative group">
                  <button className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold hover:shadow-lg transition-shadow cursor-pointer text-sm md:text-base">
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
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {userInfo.initials}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{userInfo.name}</div>
                  <div className="text-sm text-gray-500">{userInfo.role}</div>
                </div>
              </div>
              <nav className="space-y-2">
                {NAV_ITEMS.map((item) => {
                  const isAdjustment = item.path === "/homeroom-teacher/adjustment";
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
                <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">Cài đặt</button>
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

export default HomeroomTeacherLayout;