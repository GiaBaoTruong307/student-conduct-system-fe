import { useState } from "react";

const STUDENT_REQUESTS_KEY = "studentAdjustmentRequests";
const GVCN_REQUESTS_KEY    = "gvcnAdjustmentRequests";
const STUDENT_NOTIF_KEY    = "studentNotifications";

const STUDENT_INFO = {
  hoTen:    "Trương Văn Gia Bảo",
  mssv:     "221121521200",
  ngaySinh: "15/03/2004",
  lop:      "48K14.1",
  khoa:     "Khoa Thống kê - Tin học",
};

const GVCN_INFO = {
  hoTen:       "Nguyễn Văn Sơn",
  msgv:        "2152369",
  ngaySinh:    "01/01/1988",
  lopChuNhiem: ["48K21.1", "48K21.2"],
};

const STUDENT_REASONS = [
  "Tôi không có ĐRL vì tôi đã không nộp kết quả tự đánh giá ĐRL của mình đến cuộc họp lớp vào học kỳ đó",
  "Tôi không có ĐRL vì Giảng viên chủ nhiệm không nhập ĐRL của tôi vào hệ thống, dù tôi đã nộp kết quả tự đánh giá ĐRL của mình đến cuộc họp lớp vào học kỳ đó.",
  "Tôi không có ĐRL vì tôi được cử đi học trao đổi tại trường khác, vì vậy tôi không được đánh giá ĐRL cùng lúc với cả lớp vào học kỳ đó",
  "Tôi đã có ĐRL nhưng khác so với kết quả đánh giá của lớp vì Giảng viên chủ nhiệm đã nhập sai ĐRL của tôi vào hệ thống",
];

const REASONS_GV = [
  "SV không có ĐRL vì SV đã không nộp kết quả tự đánh giá ĐRL của mình đến cuộc họp lớp vào học kỳ đó",
  "SV không có ĐRL vì tôi không nhập ĐRL của SV vào hệ thống, dù SV đã nộp kết quả tự đánh giá ĐRL của mình đến cuộc họp lớp vào học kỳ đó.",
  "SV không có ĐRL vì SV được cử đi học trao đổi tại trường khác, vì vậy SV không được đánh giá ĐRL cùng lúc với cả lớp vào học kỳ đó",
  "SV đã có ĐRL nhưng khác so với kết quả đánh giá của lớp vì tôi đã nhập sai ĐRL của SV vào hệ thống",
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

// ── Chỉ load từ gvcnAdjustmentRequests → tránh double data với studentAdjustmentRequests
const loadMergedRequests = () =>
  readLS(GVCN_REQUESTS_KEY, [])
    .filter((r) => {
      if (r.source === "student" || r.source === "gvcn")
        return r.trangThai === "khoa-duyet" || r.trangThai === "hoan-tat";
      if (r.source === "rescore")
        return r.trangThai === "rescore-khoa-duyet" || r.trangThai === "rescore-hoan-tat";
      return false;
    })
    .map((r) => ({ ...r, _source: r.source }))
    .sort((a, b) => b.id - a.id);

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  if (status === "khoa-duyet")
    return <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Khoa đã duyệt</span>;
  if (status === "rescore-khoa-duyet")
    return <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">Khoa duyệt (lần 2)</span>;
  if (status === "rescore-hoan-tat")
    return <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">PCTSV duyệt (lần 2)</span>;
  return <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">PCTSV duyệt</span>;
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
              GVCN đã chấm lại điểm cho SV <span className="font-semibold">{req.svHoTen}</span>. Xác nhận phê duyệt?
            </p>
            <p className="text-xs text-gray-500">
              Mã: <span className="font-semibold">#{req.id}</span> · MSSV: {req.mssv} · {req.hocKy} · {req.namHoc}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-700">Bạn có chắc muốn phê duyệt đơn đề nghị này?</p>
            <p className="text-xs text-gray-500">
              Mã đơn: <span className="font-semibold">#{req.id}</span> · {req.hocKy} · {req.namHoc}
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
        {onApprove && req.trangThai === "rescore-khoa-duyet" ? (
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
            <p>- {STUDENT_INFO.khoa}, Trường Đại học Kinh tế – Đại học Đà Nẵng;</p>
            <p>- Giảng viên Chủ nhiệm lớp {req.svLop || STUDENT_INFO.lop};</p>
            <p>- Phòng Công tác sinh viên, Quan hệ doanh nghiệp và Truyền thông.</p>
          </div>
          <div className="space-y-0.5">
            <p>Tôi tên là: <span className="font-semibold">{req.svHoTen || STUDENT_INFO.hoTen}</span>&nbsp;&nbsp;Ngày sinh: {req.ngaySinh || STUDENT_INFO.ngaySinh}</p>
            <p>Lớp: {req.svLop || STUDENT_INFO.lop}&nbsp;&nbsp;MSSV: {req.mssv || STUDENT_INFO.mssv}</p>
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
        {onApprove && req.trangThai === "khoa-duyet" && (
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
        {onApprove && req.trangThai === "khoa-duyet" && (
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
const PctsvAdjustmentRequest = () => {
  const [requests,     setRequests]     = useState(() => loadMergedRequests());
  const [viewingReq,   setViewingReq]   = useState(null);
  const [approvingReq, setApprovingReq] = useState(null);

  const confirmApprove = () => {
    if (!approvingReq) return;

    const allGvcnReqs = readLS(GVCN_REQUESTS_KEY, []);
    const ts          = nowStr();

    if (approvingReq.source === "rescore") {
      // PCTSV duyệt lần 2 → rescore-hoan-tat
      const updated = allGvcnReqs.map((r) =>
        r.id === approvingReq.id ? { ...r, trangThai: "rescore-hoan-tat" } : r
      );
      writeLS(GVCN_REQUESTS_KEY, updated);

      // Push notification riêng lẻ cho sinh viên
      const existingNotifs = readLS(STUDENT_NOTIF_KEY, []);
      writeLS(STUDENT_NOTIF_KEY, [
        {
          id:        `notif_sv_pctsv_rescore_hoan_tat_${approvingReq.id}_${Date.now()}`,
          refId:     `sv_pctsv_rescore_hoan_tat_${approvingReq.id}`,
          type:      "adjustment",
          title:     `PCTSV đã phê duyệt kết quả chấm điểm lại #${approvingReq.id}`,
          message:   [approvingReq.hocKy, approvingReq.namHoc].filter(Boolean).join(" · "),
          read:      false,
          createdAt: ts,
        },
        ...existingNotifs,
      ]);

      window.dispatchEvent(new CustomEvent("pctsvRescoreApproved"));
    } else {
      // PCTSV duyệt lần đầu → hoan-tat
      const updated = allGvcnReqs.map((r) =>
        r.id === approvingReq.id ? { ...r, trangThai: "hoan-tat" } : r
      );
      writeLS(GVCN_REQUESTS_KEY, updated);

      // Đồng bộ studentAdjustmentRequests nếu có studentRequestId
      if (approvingReq.source === "student" && approvingReq.studentRequestId) {
        const studentReqs = readLS(STUDENT_REQUESTS_KEY, []);
        writeLS(STUDENT_REQUESTS_KEY, studentReqs.map((r) =>
          r.id === approvingReq.studentRequestId ? { ...r, trangThai: "hoan-tat" } : r
        ));
      }

      // Push notification riêng lẻ cho sinh viên
      const existingNotifs = readLS(STUDENT_NOTIF_KEY, []);
      writeLS(STUDENT_NOTIF_KEY, [
        {
          id:        `notif_sv_pctsv_hoan_tat_${approvingReq.id}_${Date.now()}`,
          refId:     `sv_pctsv_hoan_tat_${approvingReq.id}`,
          type:      "adjustment",
          title:     `PCTSV đã hoàn tất đơn yêu cầu chấm điểm lại #${approvingReq.id}`,
          message:   [approvingReq.hocKy, approvingReq.namHoc].filter(Boolean).join(" · "),
          read:      false,
          createdAt: ts,
        },
        ...existingNotifs,
      ]);

      // Ghi notification 3 ngày cho GVCN chấm lại
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + 3);
      const deadlineISO = deadlineDate.toISOString();
      const dd   = String(deadlineDate.getDate()).padStart(2, "0");
      const mm   = String(deadlineDate.getMonth() + 1).padStart(2, "0");
      const yyyy = deadlineDate.getFullYear();

      const gvcnNotifs = readLS("gvcnNotifications", []);
      writeLS("gvcnNotifications", [
        {
          id:         `notif_pctsv_rescore_${approvingReq.id}_${Date.now()}`,
          refId:      `pctsv_rescore_${approvingReq.id}`,
          type:       "pctsv-approved-rescore",
          title:      approvingReq.source === "student"
            ? `PCTSV đã duyệt đơn của SV ${approvingReq.svHoTen || ""}`
            : `PCTSV đã duyệt đơn của bạn`,
          message:    `Bạn có 3 ngày (đến ${dd}/${mm}/${yyyy}) để chấm lại điểm cho sinh viên`,
          requestId:  approvingReq.id,
          mssv:       approvingReq.mssv,
          svHoTen:    approvingReq.svHoTen,
          svLop:      approvingReq.svLop || "48K14.1",
          hocKy:      approvingReq.hocKy,
          namHoc:     approvingReq.namHoc,
          drlMoi:     approvingReq.drlMoi,
          approvedAt: new Date().toISOString(),
          deadline:   deadlineISO,
          read:       false,
        },
        ...gvcnNotifs,
      ]);
    }

    window.dispatchEvent(new CustomEvent("khoaRequestsUpdated"));
    window.dispatchEvent(new CustomEvent("studentStatusUpdated"));
    window.dispatchEvent(new CustomEvent("gvcnStatusUpdated"));
    window.dispatchEvent(new CustomEvent("khoaStatusUpdated"));
    setRequests(loadMergedRequests());
    setApprovingReq(null);
    setViewingReq(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">Chưa có đơn đề nghị nào được Khoa duyệt chuyển lên.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-20">Mã Đơn</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-200">Lý do</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-32">Ngày tạo</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-24">Học kỳ</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-28">Năm học</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-40">Trạng thái</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, idx) => {
                  const reasons  = req._source === "gvcn" ? REASONS_GV : STUDENT_REASONS;
                  const lyDoText = req._source === "rescore"
                    ? `GVCN chấm lại cho SV ${req.svHoTen} (${req.mssv})`
                    : req.lyDoChecked?.length > 0
                      ? reasons[req.lyDoChecked[0]]
                      : req.lyDoKhac || "";

                  const isPending =
                    req.trangThai === "khoa-duyet" ||
                    req.trangThai === "rescore-khoa-duyet";

                  return (
                    <tr key={`${req._source}-${req.id}-${idx}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100 font-medium">{req.id}</td>
                      <td className="px-4 py-3 text-gray-700 border-r border-gray-100 max-w-xs">
                        <span className="line-clamp-2">{lyDoText}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100">{req.ngayTao}</td>
                      <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100">{req.hocKy}</td>
                      <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100">{req.namHoc}</td>
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        {isPending ? (
                          <button
                            onClick={() => setApprovingReq(req)}
                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                              req.trangThai === "rescore-khoa-duyet"
                                ? "bg-purple-100 hover:bg-purple-200 text-purple-700"
                                : "bg-blue-100 hover:bg-blue-200 text-blue-700"
                            }`}
                          >
                            {req.trangThai === "rescore-khoa-duyet" ? "Khoa duyệt (lần 2)" : "Khoa đã duyệt"}
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
      {viewingReq?._source === "rescore" && (
        <ViewRescoreModal
          req={viewingReq}
          onClose={() => setViewingReq(null)}
          onApprove={
            viewingReq.trangThai === "rescore-khoa-duyet"
              ? () => { setApprovingReq(viewingReq); setViewingReq(null); }
              : null
          }
        />
      )}
      {viewingReq?._source === "student" && (
        <ViewStudentLetterModal
          req={viewingReq}
          onClose={() => setViewingReq(null)}
          onApprove={
            viewingReq.trangThai === "khoa-duyet"
              ? () => { setApprovingReq(viewingReq); setViewingReq(null); }
              : null
          }
        />
      )}
      {viewingReq?._source === "gvcn" && (
        <ViewGvcnLetterModal
          req={viewingReq}
          onClose={() => setViewingReq(null)}
          onApprove={
            viewingReq.trangThai === "khoa-duyet"
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

export default PctsvAdjustmentRequest;