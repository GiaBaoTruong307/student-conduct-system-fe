import { useState } from "react";

const GVCN_REQUESTS_KEY    = "gvcnAdjustmentRequests";
const STUDENT_REQUESTS_KEY = "studentAdjustmentRequests";
const STUDENT_NOTIF_KEY    = "studentNotifications";

const GVCN_INFO = {
  hoTen:       "Nguyễn Văn Sơn",
  msgv:        "2152369",
  ngaySinh:    "01/01/1988",
  lopChuNhiem: ["48K21.1", "48K21.2"],
};

const REASONS_GV = [
  "SV không có ĐRL vì SV đã không nộp kết quả tự đánh giá ĐRL của mình đến cuộc họp lớp vào học kỳ đó",
  "SV không có ĐRL vì tôi không nhập ĐRL của SV vào hệ thống, dù SV đã nộp kết quả tự đánh giá ĐRL của mình đến cuộc họp lớp vào học kỳ đó.",
  "SV không có ĐRL vì SV được cử đi học trao đổi tại trường khác, vì vậy SV không được đánh giá ĐRL cùng lúc với cả lớp vào học kỳ đó",
  "SV đã có ĐRL nhưng khác so với kết quả đánh giá của lớp vì tôi đã nhập sai ĐRL của SV vào hệ thống",
];

const STUDENT_REASONS = [
  "Tôi không có ĐRL vì tôi đã không nộp kết quả tự đánh giá ĐRL của mình đến cuộc họp lớp vào học kỳ đó",
  "Tôi không có ĐRL vì Giảng viên chủ nhiệm không nhập ĐRL của tôi vào hệ thống, dù tôi đã nộp kết quả tự đánh giá ĐRL của mình đến cuộc họp lớp vào học kỳ đó.",
  "Tôi không có ĐRL vì tôi được cử đi học trao đổi tại trường khác, vì vậy tôi không được đánh giá ĐRL cùng lúc với cả lớp vào học kỳ đó",
  "Tôi đã có ĐRL nhưng khác so với kết quả đánh giá của lớp vì Giảng viên chủ nhiệm đã nhập sai ĐRL của tôi vào hệ thống",
];

const readLS  = (key, def) => { try { const r = localStorage.getItem(key); return r !== null ? JSON.parse(r) : def; } catch { return def; } };
const writeLS = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

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

const loadRequests = () =>
  readLS(GVCN_REQUESTS_KEY, []).filter(
    (r) =>
      r.source === "student" ||
      r.source === "gvcn"    ||
      (r.source === "rescore" &&
        (r.trangThai === "rescore-submitted" || r.trangThai === "rescore-khoa-duyet"))
  );

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  if (status === "chua-duyet")
    return <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">Chưa duyệt</span>;
  if (status === "khoa-duyet")
    return <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Khoa đã duyệt</span>;
  if (status === "rescore-khoa-duyet")
    return <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">Khoa duyệt (lần 2)</span>;
  return <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Đã hoàn tất</span>;
};

// ── Approve Confirm Modal ─────────────────────────────────────────────────────
const ApproveModal = ({ req, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-base font-bold text-gray-800">
          {req.source === "rescore" ? "Xác nhận duyệt điểm chấm lại" : "Xác nhận phê duyệt đơn"}
        </h2>
      </div>
      <div className="px-6 py-4 space-y-2">
        {req.source === "rescore" ? (
          <>
            <p className="text-sm text-gray-700">
              GVCN đã chấm lại điểm cho SV <span className="font-semibold">{req.svHoTen}</span>. Xác nhận chuyển lên PCTSV?
            </p>
            <p className="text-xs text-gray-500">
              Mã: <span className="font-semibold">#{req.id}</span> · MSSV: {req.mssv} · {req.hocKy} · {req.namHoc}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-700">Bạn có chắc muốn phê duyệt đơn đề nghị này?</p>
            <p className="text-xs text-gray-500">
              Mã đơn: <span className="font-semibold">#{req.id}</span> · SV: {req.svHoTen} · {req.hocKy} · {req.namHoc}
            </p>
          </>
        )}
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
        <button onClick={onCancel}  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 cursor-pointer">Không</button>
        <button onClick={onConfirm} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg cursor-pointer">Phê duyệt</button>
      </div>
    </div>
  </div>
);

// ── View Rescore Modal ────────────────────────────────────────────────────────
const ViewRescoreModal = ({ req, onClose, onApprove }) => {
  if (!req) return null;
  const gvcnAllData = readLS("gvcnAllData", {});
  const scoreKey    = req.yearId && req.semId ? `${req.yearId}_${req.semId}` : null;
  const rescoreData = scoreKey ? (gvcnAllData[scoreKey] ?? {})[req.mssv] : null;
  const newTotal    = rescoreData?.total ?? req.drlMoi ?? "—";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-500">Kết quả chấm lại của GVCN</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none cursor-pointer">×</button>
        </div>
        <div className="px-6 py-5 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            <div><span className="text-gray-500">Sinh viên:</span><span className="font-semibold ml-1">{req.svHoTen}</span></div>
            <div><span className="text-gray-500">MSSV:</span><span className="font-semibold ml-1">{req.mssv}</span></div>
            <div><span className="text-gray-500">Lớp:</span><span className="font-semibold ml-1">{req.svLop || "48K14.1"}</span></div>
            <div><span className="text-gray-500">Học kỳ:</span><span className="font-semibold ml-1">{req.hocKy}</span></div>
            <div><span className="text-gray-500">Năm học:</span><span className="font-semibold ml-1">{req.namHoc}</span></div>
            <div>
              <span className="text-gray-500">Tổng điểm mới:</span>
              <span className="font-bold text-[#3d2f6b] text-base ml-1">{newTotal}</span>
            </div>
          </div>
          {req.autoSubmitted && (
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
              ⚠ Tự động gửi khi hết 3 ngày chấm lại
            </p>
          )}
        </div>
        {onApprove && req.trangThai === "rescore-submitted" ? (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button onClick={onClose}   className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 cursor-pointer">Đóng</button>
            <button onClick={onApprove} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg cursor-pointer">Phê duyệt</button>
          </div>
        ) : (
          <div className="flex justify-end px-6 py-4 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 cursor-pointer">Đóng</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── View Student Letter Modal ─────────────────────────────────────────────────
const ViewStudentLetterModal = ({ req, onClose, onApprove }) => {
  if (!req) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <span className="text-sm text-gray-500 font-medium">Xem đơn đề nghị của sinh viên</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 cursor-pointer text-xl leading-none">×</button>
        </div>
        <div className="px-8 py-6 text-sm text-gray-800 leading-relaxed space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="text-center space-y-1">
            <p className="font-bold uppercase text-xs tracking-wide">Cộng hoà xã hội chủ nghĩa Việt Nam</p>
            <p className="font-semibold text-xs underline">Độc lập – Tự do – Hạnh phúc</p>
            <p className="mt-3 font-bold uppercase text-sm">Đơn đề nghị</p>
            <p className="font-bold uppercase text-sm">Cập nhật điểm rèn luyện học kỳ {req.hocKy}, năm học {req.namHoc}</p>
          </div>
          <div className="space-y-0.5">
            <p className="font-semibold">Kính gửi:</p>
            <p>- Khoa Thống kê - Tin học, Trường Đại học Kinh tế – Đại học Đà Nẵng;</p>
            <p>- Giảng viên Chủ nhiệm lớp {req.svLop || "48K14.1"};</p>
            <p>- Phòng Công tác sinh viên, Quan hệ doanh nghiệp và Truyền thông.</p>
          </div>
          <div className="space-y-0.5">
            <p>Tôi tên là: <span className="font-semibold">{req.svHoTen}</span>&nbsp;&nbsp;Ngày sinh: {req.ngaySinh || ""}</p>
            <p>Lớp: {req.svLop || "48K14.1"}&nbsp;&nbsp;MSSV: {req.mssv}</p>
          </div>
          <p>Vào ngày {req.ngayPhatHien}, tôi phát hiện vấn đề liên quan đến Điểm rèn luyện (ĐRL) của mình trong học kỳ {req.hocKy}, năm học {req.namHoc} trên hệ thống của Trường. Cụ thể như sau:</p>
          <div className="space-y-1.5">
            {STUDENT_REASONS.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0 w-4 h-4 border border-gray-500 rounded-sm flex items-center justify-center text-xs">
                  {req.lyDoChecked?.includes(i) ? "✓" : ""}
                </span>
                <span>{r}</span>
              </div>
            ))}
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex-shrink-0 w-4 h-4 border border-gray-500 rounded-sm flex items-center justify-center text-xs">
                {req.lyDoKhac ? "✓" : ""}
              </span>
              <span>Lý do khác: {req.lyDoKhac || "..............................................................................."}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p>Tôi làm đơn này kính mong Quý cấp kiểm tra và cập nhật ĐRL cho tôi. Cụ thể:</p>
            <p><span className="font-semibold">ĐRL đang có:</span> {req.drlHienTai};&nbsp;&nbsp;<span className="font-semibold">ĐRL mới:</span> {req.drlMoi}</p>
          </div>
          <p>Tôi xin nộp Phiếu tự đánh giá kết quả rèn luyện và các minh chứng liên quan để phục vụ việc kiểm tra và cập nhật ĐRL của Quý cấp.</p>
          <p>Tôi cam đoan nội dung trên là đúng sự thật và chịu hoàn toàn trách nhiệm về đề nghị của mình. Trân trọng cảm ơn.</p>
        </div>
        {onApprove && req.trangThai === "chua-duyet" && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">Xác nhận phê duyệt đơn</span>
            <div className="flex gap-3">
              <button onClick={onClose}   className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 cursor-pointer">Đóng</button>
              <button onClick={onApprove} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg cursor-pointer">Phê duyệt</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── View GVCN Letter Modal ────────────────────────────────────────────────────
const ViewGvcnLetterModal = ({ req, onClose, onApprove }) => {
  if (!req) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <span className="text-sm text-gray-500 font-medium">Xem đơn đề nghị của GVCN</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 cursor-pointer text-xl leading-none">×</button>
        </div>
        <div className="px-8 py-6 text-sm text-gray-800 leading-relaxed space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="text-center space-y-1">
            <p className="font-bold uppercase text-xs tracking-wide">Cộng hoà xã hội chủ nghĩa Việt Nam</p>
            <p className="font-semibold text-xs underline">Độc lập – Tự do – Hạnh phúc</p>
            <p className="mt-3 font-bold uppercase text-sm">Đơn đề nghị</p>
            <p className="font-bold uppercase text-sm">Cập nhật điểm rèn luyện học kỳ {req.hocKy}, năm học {req.namHoc}</p>
          </div>
          <div className="space-y-0.5">
            <p className="font-semibold">Kính gửi:</p>
            <p>- Khoa Thống kê - Tin học, Trường Đại học Kinh tế – Đại học Đà Nẵng;</p>
            <p>- Phòng Công tác sinh viên, Quan hệ doanh nghiệp và Truyền thông.</p>
          </div>
          <div className="space-y-0.5">
            <p>Tôi tên là: <span className="font-semibold">{GVCN_INFO.hoTen}</span>&nbsp;&nbsp;Ngày sinh: {GVCN_INFO.ngaySinh}</p>
            <p>GVCN lớp: {GVCN_INFO.lopChuNhiem.join(", ")}&nbsp;&nbsp;MSGV: {GVCN_INFO.msgv}</p>
          </div>
          <p>
            Vào ngày {req.ngayPhatHien}, tôi phát hiện vấn đề liên quan đến Điểm rèn luyện (ĐRL) của sinh viên:{" "}
            <strong>{req.svHoTen}</strong>; MSSV: {req.mssv}; thành viên lớp: {req.svLop || "48K14.1"} trong học kỳ{" "}
            {req.hocKy}, năm học {req.namHoc} trên hệ thống của Trường. Cụ thể như sau:
          </p>
          <div className="space-y-1.5">
            {REASONS_GV.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0 w-4 h-4 border border-gray-500 rounded-sm flex items-center justify-center text-xs">
                  {req.lyDoChecked?.includes(i) ? "✓" : ""}
                </span>
                <span>{r}</span>
              </div>
            ))}
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex-shrink-0 w-4 h-4 border border-gray-500 rounded-sm flex items-center justify-center text-xs">
                {req.lyDoKhac ? "✓" : ""}
              </span>
              <span>Lý do khác: {req.lyDoKhac || "..............................................................................."}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p>Tôi làm đơn này kính mong Quý cấp kiểm tra và cập nhật ĐRL cho sinh viên. Cụ thể:</p>
            <p><span className="font-semibold">ĐRL đang có:</span> {req.drlHienTai};&nbsp;&nbsp;<span className="font-semibold">ĐRL mới:</span> {req.drlMoi}</p>
          </div>
          <p>Tôi xin nộp Phiếu tự đánh giá kết quả rèn luyện và các minh chứng liên quan để phục vụ việc kiểm tra và cập nhật ĐRL của Quý cấp.</p>
          <p>Tôi cam đoan nội dung trên là đúng sự thật và chịu hoàn toàn trách nhiệm về đề nghị của mình. Trân trọng cảm ơn.</p>
        </div>
        {onApprove && req.trangThai === "chua-duyet" && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">Xác nhận phê duyệt đơn</span>
            <div className="flex gap-3">
              <button onClick={onClose}   className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 cursor-pointer">Đóng</button>
              <button onClick={onApprove} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg cursor-pointer">Phê duyệt</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const FacultyAdjustmentRequest = () => {
  const [requests,     setRequests]     = useState(() => loadRequests());
  const [viewingReq,   setViewingReq]   = useState(null);
  const [approvingReq, setApprovingReq] = useState(null);

  const confirmApprove = () => {
    if (!approvingReq) return;

    const allReqs = readLS(GVCN_REQUESTS_KEY, []);
    const ts      = nowStr();

    if (approvingReq.source === "rescore") {
      // Khoa duyệt lần 2 → "rescore-khoa-duyet"
      const updated = allReqs.map((r) =>
        r.id === approvingReq.id ? { ...r, trangThai: "rescore-khoa-duyet" } : r
      );
      writeLS(GVCN_REQUESTS_KEY, updated);
      setRequests(loadRequests());

      // Push notification riêng lẻ cho sinh viên
      const existingNotifs = readLS(STUDENT_NOTIF_KEY, []);
      writeLS(STUDENT_NOTIF_KEY, [
        {
          id:        `notif_sv_khoa_rescore_${approvingReq.id}_${Date.now()}`,
          refId:     `sv_khoa_rescore_${approvingReq.id}`,
          type:      "adjustment",
          title:     `Khoa đã duyệt kết quả chấm điểm lại #${approvingReq.id}`,
          message:   [approvingReq.hocKy, approvingReq.namHoc].filter(Boolean).join(" · "),
          read:      false,
          createdAt: ts,
        },
        ...existingNotifs,
      ]);

      window.dispatchEvent(new CustomEvent("khoaRescoreUpdated"));
      window.dispatchEvent(new CustomEvent("gvcnRequestsUpdated"));
      window.dispatchEvent(new CustomEvent("studentStatusUpdated"));
    } else {
      // Luồng bình thường: student/gvcn → "khoa-duyet"
      const updated = allReqs.map((r) =>
        r.id === approvingReq.id ? { ...r, trangThai: "khoa-duyet" } : r
      );
      writeLS(GVCN_REQUESTS_KEY, updated);
      setRequests(loadRequests());

      // Push notification riêng lẻ cho sinh viên
      const existingNotifs = readLS(STUDENT_NOTIF_KEY, []);
      writeLS(STUDENT_NOTIF_KEY, [
        {
          id:        `notif_sv_khoa_duyet_${approvingReq.id}_${Date.now()}`,
          refId:     `sv_khoa_duyet_${approvingReq.id}`,
          type:      "adjustment",
          title:     `Khoa đã duyệt đơn yêu cầu chấm điểm lại #${approvingReq.id}`,
          message:   [approvingReq.hocKy, approvingReq.namHoc].filter(Boolean).join(" · "),
          read:      false,
          createdAt: ts,
        },
        ...existingNotifs,
      ]);

      window.dispatchEvent(new CustomEvent("khoaRequestsUpdated"));
      window.dispatchEvent(new CustomEvent("gvcnRequestsUpdated"));
      window.dispatchEvent(new CustomEvent("studentStatusUpdated"));
      window.dispatchEvent(new CustomEvent("gvcnStatusUpdated"));

      if (approvingReq.studentRequestId) {
        const studentReqs = readLS(STUDENT_REQUESTS_KEY, []);
        writeLS(STUDENT_REQUESTS_KEY, studentReqs.map((r) =>
          r.id === approvingReq.studentRequestId ? { ...r, trangThai: "khoa-duyet" } : r
        ));
      }
    }

    setApprovingReq(null);
    setViewingReq(null);
  };

  const getSourceLabel = (req) => {
    if (req.source === "rescore") return "GVCN chấm lại";
    if (req.source === "gvcn")    return "GVCN";
    return "SV";
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">Chưa có đơn đề nghị nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-20">Mã Đơn</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-200">Lý do / Sinh viên</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-24">Nguồn</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-32">Ngày tạo</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-24">Học kỳ</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-28">Năm học</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-40">Trạng thái</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const reasons  = req.source === "student" ? STUDENT_REASONS : REASONS_GV;
                  const lyDoText = req.source === "rescore"
                    ? `GVCN chấm lại cho SV ${req.svHoTen} (MSSV: ${req.mssv})`
                    : req.lyDoChecked?.length > 0 ? reasons[req.lyDoChecked[0]] : req.lyDoKhac || "";

                  const isPendingAction =
                    req.trangThai === "chua-duyet" ||
                    req.trangThai === "rescore-submitted";

                  return (
                    <tr key={`${req.source}-${req.id}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100 font-medium">{req.id}</td>
                      <td className="px-4 py-3 text-gray-700 border-r border-gray-100 max-w-xs">
                        <span className="line-clamp-2">{lyDoText}</span>
                      </td>
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          req.source === "rescore"
                            ? "bg-indigo-50 text-indigo-700"
                            : req.source === "gvcn"
                              ? "bg-teal-50 text-teal-700"
                              : "bg-gray-100 text-gray-600"
                        }`}>
                          {getSourceLabel(req)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100">{req.ngayTao}</td>
                      <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100">{req.hocKy}</td>
                      <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100">{req.namHoc}</td>
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        {isPendingAction ? (
                          <button
                            onClick={() => setApprovingReq(req)}
                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                              req.source === "rescore"
                                ? "bg-indigo-100 hover:bg-indigo-200 text-indigo-700"
                                : "bg-orange-100 hover:bg-orange-200 text-orange-700"
                            }`}
                          >
                            {req.source === "rescore" ? "GVCN đã chấm lại" : "Chưa duyệt"}
                          </button>
                        ) : (
                          <StatusBadge status={req.trangThai} />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setViewingReq(req)}
                          className="text-[#3d2f6b] hover:underline font-medium cursor-pointer text-sm"
                        >
                          xem
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {viewingReq?.source === "rescore" && (
        <ViewRescoreModal
          req={viewingReq}
          onClose={() => setViewingReq(null)}
          onApprove={
            viewingReq.trangThai === "rescore-submitted"
              ? () => { setApprovingReq(viewingReq); setViewingReq(null); }
              : null
          }
        />
      )}
      {viewingReq?.source === "student" && (
        <ViewStudentLetterModal
          req={viewingReq}
          onClose={() => setViewingReq(null)}
          onApprove={
            viewingReq.trangThai === "chua-duyet"
              ? () => { setApprovingReq(viewingReq); setViewingReq(null); }
              : null
          }
        />
      )}
      {viewingReq?.source === "gvcn" && (
        <ViewGvcnLetterModal
          req={viewingReq}
          onClose={() => setViewingReq(null)}
          onApprove={
            viewingReq.trangThai === "chua-duyet"
              ? () => { setApprovingReq(viewingReq); setViewingReq(null); }
              : null
          }
        />
      )}

      {approvingReq && (
        <ApproveModal
          req={approvingReq}
          onConfirm={confirmApprove}
          onCancel={() => setApprovingReq(null)}
        />
      )}
    </div>
  );
};

export default FacultyAdjustmentRequest;