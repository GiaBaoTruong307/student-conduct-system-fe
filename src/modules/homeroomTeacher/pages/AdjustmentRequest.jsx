import { useState, useRef, useEffect } from "react";
import { classMembers } from "../../classLeader/constants/classMembers";

const ADMIN_LS_KEYS = {
  YEARS:     "admin_academic_years",
  SEMESTERS: "admin_academic_semesters",
};

const STUDENT_REQUESTS_KEY = "studentAdjustmentRequests";
const GVCN_REQUESTS_KEY    = "gvcnAdjustmentRequests";
const NOTIF_KEY            = "studentNotifications";

const GVCN = {
  hoTen:       "Nguyễn Văn Sơn",
  msgv:        "2152369",
  ngaySinh:    "01/01/1988",
  lopChuNhiem: ["48K21.1", "48K21.2"],
};

const STUDENT_INFO = {
  hoTen:    "Trương Văn Gia Bảo",
  mssv:     "221121521200",
  ngaySinh: "15/03/2004",
  lop:      "48K14.1",
  khoa:     "Khoa Thống kê - Tin học",
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

const readLS  = (key, def) => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : def; } catch { return def; } };
const writeLS = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

const today = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
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

// ── Custom Date Input ──────────────────────────────────────────────────────────
const DateInput = ({ value, onChange, hasError }) => {
  const [dd,   setDd]   = useState(value ? value.split("/")[0] ?? "" : "");
  const [mm,   setMm]   = useState(value ? value.split("/")[1] ?? "" : "");
  const [yyyy, setYyyy] = useState(value ? value.split("/")[2] ?? "" : "");
  const refDd   = useRef(null);
  const refMm   = useRef(null);
  const refYyyy = useRef(null);

  useEffect(() => { if (!value) { setDd(""); setMm(""); setYyyy(""); } }, [value]);

  const emit = (d, m, y) => {
    if (d.length === 2 && m.length === 2 && y.length === 4) onChange(`${d}/${m}/${y}`);
    else onChange("");
  };

  const handleDd   = (e) => { const v = e.target.value.replace(/\D/g,"").slice(0,2); setDd(v);   emit(v, mm, yyyy); if (v.length===2) refMm.current?.focus(); };
  const handleMm   = (e) => { const v = e.target.value.replace(/\D/g,"").slice(0,2); setMm(v);   emit(dd, v, yyyy); if (v.length===2) refYyyy.current?.focus(); };
  const handleYyyy = (e) => { const v = e.target.value.replace(/\D/g,"").slice(0,4); setYyyy(v); emit(dd, mm, v); };

  const base = "text-center outline-none bg-transparent text-sm py-2.5 px-1";
  const wrap = `flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-[#3d2f6b] ${hasError ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`;

  return (
    <div className={wrap}>
      <input ref={refDd}   type="text" inputMode="numeric" placeholder="dd"   value={dd}   onChange={handleDd}   maxLength={2} className={`${base} w-10`} />
      <span className="text-gray-400 select-none text-sm">/</span>
      <input ref={refMm}   type="text" inputMode="numeric" placeholder="mm"   value={mm}   onChange={handleMm}   onKeyDown={(e)=>{ if(e.key==="Backspace"&&mm==="") refDd.current?.focus(); }} maxLength={2} className={`${base} w-10`} />
      <span className="text-gray-400 select-none text-sm">/</span>
      <input ref={refYyyy} type="text" inputMode="numeric" placeholder="yyyy" value={yyyy} onChange={handleYyyy} onKeyDown={(e)=>{ if(e.key==="Backspace"&&yyyy==="") refMm.current?.focus(); }} maxLength={4} className={`${base} flex-1 text-left pl-2`} />
    </div>
  );
};

// ── Status badge ───────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  if (status === "chua-duyet")  return <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">Chưa duyệt</span>;
  if (status === "gvcn-duyet")  return <span className="inline-block px-3 py-1 bg-amber-100  text-amber-700  text-xs font-semibold rounded-full">GVCN duyệt</span>;
  if (status === "khoa-duyet")  return <span className="inline-block px-3 py-1 bg-blue-100   text-blue-700   text-xs font-semibold rounded-full">Khoa duyệt</span>;
  return                               <span className="inline-block px-3 py-1 bg-green-100  text-green-700  text-xs font-semibold rounded-full">Đã hoàn tất</span>;
};

// ── Confirm approve modal ──────────────────────────────────────────────────────
const ApproveModal = ({ req, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-base font-bold text-gray-800">Xác nhận phê duyệt đơn</h2>
      </div>
      <div className="px-6 py-4 space-y-2">
        <p className="text-sm text-gray-700">Bạn có chắc muốn phê duyệt đơn đề nghị của sinh viên này?</p>
        <p className="text-xs text-gray-500">Mã đơn: <span className="font-semibold">#{req.id}</span> · Học kỳ {req.hocKy} · {req.namHoc}</p>
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
        <button onClick={onCancel}  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 cursor-pointer">Không</button>
        <button onClick={onConfirm} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg cursor-pointer">Phê duyệt</button>
      </div>
    </div>
  </div>
);

// ── Delete confirm modal ───────────────────────────────────────────────────────
const DeleteModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
      <div className="px-6 py-5 border-b border-gray-200"><h2 className="text-base font-bold text-gray-800">Xác nhận xoá đơn</h2></div>
      <div className="px-6 py-4"><p className="text-sm text-gray-700">Bạn có chắc muốn xoá đơn này? Thao tác không thể hoàn tác.</p></div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
        <button onClick={onCancel}  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 cursor-pointer">Không</button>
        <button onClick={onConfirm} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg cursor-pointer">Xoá đơn</button>
      </div>
    </div>
  </div>
);

// ── View student/gvcn letter modal ─────────────────────────────────────────────
const ViewStudentLetterModal = ({ req, isGvcnLetter = false, onClose, onApprove }) => {
  if (!req) return null;
  const reasons = isGvcnLetter ? REASONS_GV : STUDENT_REASONS;
  const svInfo  = isGvcnLetter
    ? { hoTen: req.svHoTen || "", mssv: req.mssv || "", ngaySinh: "", lop: req.svLop || "48K14.1" }
    : STUDENT_INFO;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <span className="text-sm text-gray-500 font-medium">Xem lại đơn đề nghị</span>
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

          {isGvcnLetter ? (
            <div className="space-y-0.5">
              <p>Tôi tên là: <span className="font-semibold">{GVCN.hoTen}</span>&nbsp;&nbsp;Ngày sinh: {GVCN.ngaySinh}</p>
              <p>GVCN lớp: {GVCN.lopChuNhiem.join(", ")}&nbsp;&nbsp;MSGV: {GVCN.msgv}</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              <p>Tôi tên là: <span className="font-semibold">{svInfo.hoTen}</span>&nbsp;&nbsp;Ngày sinh: {svInfo.ngaySinh}</p>
              <p>Lớp: {svInfo.lop}&nbsp;&nbsp;MSSV: {svInfo.mssv}</p>
            </div>
          )}

          <p>
            Vào ngày {req.ngayPhatHien}, tôi phát hiện vấn đề liên quan đến Điểm rèn luyện (ĐRL) của{" "}
            {isGvcnLetter ? `sinh viên: ${req.svHoTen}; MSSV: ${req.mssv}; thành viên lớp: ${req.svLop || "48K14.1"}` : "mình"}{" "}
            trong học kỳ {req.hocKy}, năm học {req.namHoc} trên hệ thống của Trường. Cụ thể như sau:
          </p>

          <div className="space-y-1.5">
            {reasons.map((r, i) => (
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
            <p>Tôi làm đơn này kính mong Quý cấp kiểm tra và cập nhật ĐRL {isGvcnLetter ? "cho sinh viên" : "cho tôi"}. Cụ thể:</p>
            <p><span className="font-semibold">ĐRL đang có:</span> {req.drlHienTai};&nbsp;&nbsp;<span className="font-semibold">ĐRL mới:</span> {req.drlMoi}</p>
          </div>

          <p>Tôi xin nộp Phiếu tự đánh giá kết quả rèn luyện và các minh chứng liên quan để phục vụ việc kiểm tra và cập nhật ĐRL của Quý cấp.</p>
          <p>Tôi cam đoan nội dung trên là đúng sự thật và chịu hoàn toàn trách nhiệm về đề nghị của mình. Trân trọng cảm ơn.</p>
        </div>

        {onApprove && req.trangThai === "chua-duyet" && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">Xác nhận phê duyệt đơn đề nghị</span>
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

// ── Trash icon button ──────────────────────────────────────────────────────────
const TrashBtn = ({ onClick }) => (
  <button onClick={onClick} className="w-7 h-7 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center cursor-pointer transition-colors" title="Xoá đơn">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  </button>
);

// ══════════════════════════════════════════════════════════════════════════════
const EMPTY_STEP1 = { mssv: "" };
const EMPTY_STEP2 = { ngayPhatHien: "", hocKy: "", namHoc: "", lyDoChecked: [], lyDoKhac: "" };
const EMPTY_STEP3 = { drlHienTai: "", drlMoi: "" };

const AdjustmentRequest = () => {
  const allYears     = readLS(ADMIN_LS_KEYS.YEARS, []);
  const allSemesters = readLS(ADMIN_LS_KEYS.SEMESTERS, {});

  const [sideTab,  setSideTab]  = useState("ca-nhan");
  const [subTab,   setSubTab]   = useState("don-de-nghi");
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);

  const [step1, setStep1] = useState(EMPTY_STEP1);
  const [step2, setStep2] = useState(EMPTY_STEP2);
  const [step3, setStep3] = useState(EMPTY_STEP3);

  const [mssvSearch, setMssvSearch] = useState("");

  const [errors1, setErrors1] = useState({});
  const [errors2, setErrors2] = useState({});
  const [errors3, setErrors3] = useState({});

  const [gvcnRequests,    setGvcnRequests]    = useState(() => readLS(GVCN_REQUESTS_KEY, []));
  const [studentRequests, setStudentRequests] = useState(() => readLS(STUDENT_REQUESTS_KEY, []));

  const [viewingReq,    setViewingReq]    = useState(null);
  const [viewingIsGvcn, setViewingIsGvcn] = useState(false);
  const [approvingReq,  setApprovingReq]  = useState(null);
  const [deletingKey,   setDeletingKey]   = useState(null);

  const yearObj      = allYears.find((y) => y.name === step2.namHoc);
  const semesterOpts = yearObj ? (allSemesters[yearObj.id] ?? []) : [];

  const filteredMembers = mssvSearch.trim()
    ? classMembers.filter((m) =>
        m.mssv.includes(mssvSearch.trim()) ||
        `${m.ho} ${m.ten}`.toLowerCase().includes(mssvSearch.trim().toLowerCase())
      )
    : classMembers;

  const selectedMember = classMembers.find((m) => m.mssv === step1.mssv);

  const pendingSideCount = studentRequests.filter((r) => r.trangThai === "chua-duyet").length;

  const validateStep1 = () => {
    const e = {};
    if (!step1.mssv.trim()) e.mssv = "Vui lòng nhập hoặc chọn MSSV";
    setErrors1(e);
    return Object.keys(e).length === 0;
  };
  const validateStep2 = () => {
    const e = {};
    if (!step2.ngayPhatHien) e.ngayPhatHien = "Vui lòng nhập ngày";
    if (!step2.namHoc)       e.namHoc       = "Vui lòng chọn năm học";
    if (!step2.hocKy)        e.hocKy        = "Vui lòng chọn học kỳ";
    if (step2.lyDoChecked.length === 0 && !step2.lyDoKhac.trim())
      e.lyDo = "Vui lòng chọn ít nhất một lý do";
    setErrors2(e);
    return Object.keys(e).length === 0;
  };
  const validateStep3 = () => {
    const e = {};
    if (step3.drlHienTai === "" || step3.drlHienTai === undefined) e.drlHienTai = "Vui lòng nhập ĐRL hiện tại";
    if (step3.drlMoi     === "" || step3.drlMoi     === undefined) e.drlMoi     = "Vui lòng nhập ĐRL mới";
    setErrors3(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setShowForm(false); setFormStep(1);
    setStep1(EMPTY_STEP1); setStep2(EMPTY_STEP2); setStep3(EMPTY_STEP3);
    setMssvSearch(""); setErrors1({}); setErrors2({}); setErrors3({});
  };

  const handleNext1 = () => { if (validateStep1()) setFormStep(2); };
  const handleNext2 = () => { if (validateStep2()) setFormStep(3); };

  const handleSave = () => {
    if (!validateStep3()) return;

    const member   = classMembers.find((m) => m.mssv === step1.mssv);
    const existing = readLS(GVCN_REQUESTS_KEY, []);
    const todayStr = today();
    const ts       = nowStr();

    const newReq = {
      id:           existing.length > 0 ? Math.max(...existing.map((r) => r.id)) + 1 : 1,
      source:       "gvcn",
      mssv:         step1.mssv,
      svHoTen:      member ? `${member.ho} ${member.ten}` : step1.mssv,
      svLop:        "48K14.1",
      lyDoChecked:  step2.lyDoChecked,
      lyDoKhac:     step2.lyDoKhac,
      ngayPhatHien: step2.ngayPhatHien,
      hocKy:        step2.hocKy,
      namHoc:       step2.namHoc,
      drlHienTai:   Number(step3.drlHienTai),
      drlMoi:       Number(step3.drlMoi),
      ngayTao:      todayStr,
      trangThai:    "chua-duyet",
    };

    const updated = [newReq, ...existing];
    setGvcnRequests(updated);
    writeLS(GVCN_REQUESTS_KEY, updated);
    window.dispatchEvent(new CustomEvent("gvcnRequestsUpdated"));

    // ── Push notification cho sinh viên ───────────────────────────────────
    const reasonTexts = step2.lyDoChecked.map((i) => REASONS_GV[i]);
    if (step2.lyDoKhac.trim()) reasonTexts.push(step2.lyDoKhac.trim());
    const lyDoSummary = reasonTexts[0] || "";

    const existingNotifs = readLS(NOTIF_KEY, []);
    writeLS(NOTIF_KEY, [
      {
        id:        `notif_gvcn_req_${newReq.id}_${Date.now()}`,
        refId:     `gvcn_req_${newReq.id}`,
        type:      "adjustment",
        title:     `GVCN đã yêu cầu Khoa chỉnh điểm cho bạn`,
        message:   `${lyDoSummary ? `${lyDoSummary} · ` : ""}Học kỳ ${newReq.hocKy} · ${newReq.namHoc}`,
        read:      false,
        createdAt: ts,
      },
      ...existingNotifs,
    ]);
    window.dispatchEvent(new CustomEvent("studentStatusUpdated"));
    // ───────────────────────────────────────────────────────────────────────

    resetForm();
    setSubTab("lich-su");
  };

  const toggleReason = (idx) => {
    setStep2((prev) => {
      const c = prev.lyDoChecked.includes(idx)
        ? prev.lyDoChecked.filter((i) => i !== idx)
        : [...prev.lyDoChecked, idx];
      return { ...prev, lyDoChecked: c };
    });
    setErrors2((e) => ({ ...e, lyDo: undefined }));
  };

  const handleApproveStudent = (req) => setApprovingReq(req);

  const confirmApprove = () => {
    if (!approvingReq) return;

    const updatedStudentReqs = studentRequests.map((r) =>
      r.id === approvingReq.id ? { ...r, trangThai: "gvcn-duyet" } : r
    );
    setStudentRequests(updatedStudentReqs);
    writeLS(STUDENT_REQUESTS_KEY, updatedStudentReqs);
    window.dispatchEvent(new CustomEvent("studentRequestsUpdated"));

    // ── Push notification riêng lẻ cho sinh viên (GVCN duyệt) ────────────
    const existingNotifs = readLS(NOTIF_KEY, []);
    writeLS(NOTIF_KEY, [
      {
        id:        `notif_sv_gvcn_duyet_${approvingReq.id}_${Date.now()}`,
        refId:     `sv_gvcn_duyet_${approvingReq.id}`,
        type:      "adjustment",
        title:     `GVCN đã duyệt đơn yêu cầu chấm điểm lại #${approvingReq.id}`,
        message:   [approvingReq.hocKy, approvingReq.namHoc].filter(Boolean).join(" · "),
        read:      false,
        createdAt: nowStr(),
      },
      ...existingNotifs,
    ]);
    window.dispatchEvent(new CustomEvent("studentStatusUpdated"));
    // ───────────────────────────────────────────────────────────────────────

    const existingGvcnReqs = readLS(GVCN_REQUESTS_KEY, []);
    const newEntry = {
      id:               existingGvcnReqs.length > 0 ? Math.max(...existingGvcnReqs.map((r) => r.id)) + 1 : 1,
      source:           "student",
      studentRequestId: approvingReq.id,
      mssv:             STUDENT_INFO.mssv,
      svHoTen:          STUDENT_INFO.hoTen,
      svLop:            STUDENT_INFO.lop,
      ngaySinh:         STUDENT_INFO.ngaySinh,
      lyDoChecked:      approvingReq.lyDoChecked,
      lyDoKhac:         approvingReq.lyDoKhac,
      ngayPhatHien:     approvingReq.ngayPhatHien,
      hocKy:            approvingReq.hocKy,
      namHoc:           approvingReq.namHoc,
      drlHienTai:       approvingReq.drlHienTai,
      drlMoi:           approvingReq.drlMoi,
      ngayTao:          approvingReq.ngayTao,
      trangThai:        "chua-duyet",
    };
    const updatedGvcnReqs = [newEntry, ...existingGvcnReqs];
    setGvcnRequests(updatedGvcnReqs);
    writeLS(GVCN_REQUESTS_KEY, updatedGvcnReqs);
    window.dispatchEvent(new CustomEvent("gvcnRequestsUpdated"));

    setApprovingReq(null);
    setViewingReq(null);
  };

  const handleDelete  = (type, id) => setDeletingKey({ type, id });
  const confirmDelete = () => {
    if (!deletingKey) return;
    if (deletingKey.type === "gvcn") {
      const updated = gvcnRequests.filter((r) => r.id !== deletingKey.id);
      setGvcnRequests(updated);
      writeLS(GVCN_REQUESTS_KEY, updated);
    } else {
      const updated = studentRequests.filter((r) => r.id !== deletingKey.id);
      setStudentRequests(updated);
      writeLS(STUDENT_REQUESTS_KEY, updated);
      window.dispatchEvent(new CustomEvent("studentRequestsUpdated"));
    }
    setDeletingKey(null);
  };

  // ── Render form step 1 ─────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          MSSV cần chỉnh điểm <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Nhập MSSV"
          value={step1.mssv}
          onChange={(e) => {
            setStep1((p) => ({ ...p, mssv: e.target.value }));
            setMssvSearch(e.target.value);
            setErrors1((p) => ({ ...p, mssv: undefined }));
          }}
          className={`w-full max-w-sm px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] ${errors1.mssv ? "border-red-400 bg-red-50" : "border-gray-300"}`}
        />
        {errors1.mssv && <p className="text-xs text-red-500 mt-1">{errors1.mssv}</p>}
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden max-w-lg">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Danh sách sinh viên trong lớp</p>
        </div>
        <div className="max-h-56 overflow-y-auto divide-y divide-gray-100">
          {filteredMembers.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400">Không tìm thấy sinh viên.</p>
          ) : (
            filteredMembers.map((m) => (
              <button
                key={m.mssv}
                onClick={() => { setStep1((p) => ({ ...p, mssv: m.mssv })); setMssvSearch(m.mssv); setErrors1((p) => ({ ...p, mssv: undefined })); }}
                className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-purple-50 transition-colors cursor-pointer text-sm ${step1.mssv === m.mssv ? "bg-purple-50 font-semibold text-[#3d2f6b]" : "text-gray-700"}`}
              >
                <span className="font-mono text-xs text-gray-500 w-32 flex-shrink-0">{m.mssv}</span>
                <span>{m.ho} {m.ten}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={handleNext1} className="px-6 py-2.5 bg-[#3d2f6b] hover:bg-[#2e2352] text-white text-sm font-semibold rounded-lg cursor-pointer flex items-center gap-2">
          Tiếp tục
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  );

  // ── Render form step 2 ─────────────────────────────────────────────────────
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Thời gian phát hiện vấn đề về điểm <span className="text-red-500">*</span>
          </label>
          <DateInput value={step2.ngayPhatHien} hasError={!!errors2.ngayPhatHien}
            onChange={(v) => { setStep2((p) => ({ ...p, ngayPhatHien: v })); setErrors2((p) => ({ ...p, ngayPhatHien: undefined })); }} />
          {errors2.ngayPhatHien && <p className="text-xs text-red-500 mt-1">{errors2.ngayPhatHien}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Năm học có bảng điểm sai <span className="text-red-500">*</span>
          </label>
          <select value={step2.namHoc}
            onChange={(e) => { setStep2((p) => ({ ...p, namHoc: e.target.value, hocKy: "" })); setErrors2((p) => ({ ...p, namHoc: undefined })); }}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] bg-white cursor-pointer ${errors2.namHoc ? "border-red-400 bg-red-50" : "border-gray-300"}`}>
            <option value="">Năm học</option>
            {allYears.map((y) => <option key={y.id} value={y.name}>{y.name}</option>)}
          </select>
          {errors2.namHoc && <p className="text-xs text-red-500 mt-1">{errors2.namHoc}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Học kỳ có bảng điểm sai <span className="text-red-500">*</span>
          </label>
          <select value={step2.hocKy}
            onChange={(e) => { setStep2((p) => ({ ...p, hocKy: e.target.value })); setErrors2((p) => ({ ...p, hocKy: undefined })); }}
            disabled={!step2.namHoc}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] bg-white cursor-pointer disabled:bg-gray-50 disabled:cursor-default ${errors2.hocKy ? "border-red-400 bg-red-50" : "border-gray-300"}`}>
            <option value="">Học kỳ</option>
            {semesterOpts.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          {errors2.hocKy && <p className="text-xs text-red-500 mt-1">{errors2.hocKy}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Chi tiết vấn đề về bảng điểm <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {REASONS_GV.map((r, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" checked={step2.lyDoChecked.includes(i)} onChange={() => toggleReason(i)}
                className="mt-0.5 w-4 h-4 accent-[#3d2f6b] flex-shrink-0 cursor-pointer" />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 leading-relaxed">{r}</span>
            </label>
          ))}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={!!step2.lyDoKhac}
              onChange={(e) => { if (!e.target.checked) setStep2((p) => ({ ...p, lyDoKhac: "" })); }}
              className="mt-0.5 w-4 h-4 accent-[#3d2f6b] flex-shrink-0 cursor-pointer" />
            <input type="text" placeholder="Nhập lý do khác ..."
              value={step2.lyDoKhac}
              onChange={(e) => { setStep2((p) => ({ ...p, lyDoKhac: e.target.value })); setErrors2((p) => ({ ...p, lyDo: undefined })); }}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b]" />
          </label>
        </div>
        {errors2.lyDo && <p className="text-xs text-red-500 mt-2">{errors2.lyDo}</p>}
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={() => setFormStep(1)} className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 cursor-pointer">← Quay lại</button>
        <button onClick={handleNext2} className="px-6 py-2.5 bg-[#3d2f6b] hover:bg-[#2e2352] text-white text-sm font-semibold rounded-lg cursor-pointer flex items-center gap-2">
          Tiếp tục
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  );

  // ── Render form step 3 ─────────────────────────────────────────────────────
  const renderStep3 = () => (
    <div className="space-y-6">
      {selectedMember && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 text-sm text-[#3d2f6b]">
          Sinh viên: <span className="font-semibold">{selectedMember.ho} {selectedMember.ten}</span> · MSSV: {selectedMember.mssv}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Điểm rèn luyện hiện tại</label>
          <input type="number" min="0" max="100" placeholder="Nhập số điểm rèn luyện hiện tại"
            value={step3.drlHienTai}
            onChange={(e) => { setStep3((p) => ({ ...p, drlHienTai: e.target.value })); setErrors3((p) => ({ ...p, drlHienTai: undefined })); }}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] ${errors3.drlHienTai ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
          {errors3.drlHienTai && <p className="text-xs text-red-500 mt-1">{errors3.drlHienTai}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Điểm rèn luyện mới <span className="text-red-500">*</span></label>
          <input type="number" min="0" max="100" placeholder="Nhập số điểm rèn luyện đề nghị chỉnh sửa"
            value={step3.drlMoi}
            onChange={(e) => { setStep3((p) => ({ ...p, drlMoi: e.target.value })); setErrors3((p) => ({ ...p, drlMoi: undefined })); }}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] ${errors3.drlMoi ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
          {errors3.drlMoi && <p className="text-xs text-red-500 mt-1">{errors3.drlMoi}</p>}
        </div>
      </div>
      <div className="flex justify-between pt-2">
        <button onClick={() => setFormStep(2)} className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 cursor-pointer">← Quay lại</button>
        <div className="flex gap-3">
          <button onClick={resetForm}  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg cursor-pointer">Hủy đơn</button>
          <button onClick={handleSave} className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg cursor-pointer">Lưu đơn</button>
        </div>
      </div>
    </div>
  );

  // ── Form wrapper ───────────────────────────────────────────────────────────
  const renderForm = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex gap-6 text-sm">
          {[["1. Thông tin chung", 1], ["2. Lý do đề nghị", 2], ["3. Chi tiết điều chỉnh", 3]].map(([label, step]) => (
            <span key={step} className={`pb-1 font-semibold transition-colors ${formStep === step ? "text-[#3d2f6b] border-b-2 border-[#3d2f6b]" : "text-gray-400"}`}>{label}</span>
          ))}
        </div>
        <button onClick={resetForm} className="text-gray-400 hover:text-gray-700 cursor-pointer" title="Đóng">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </button>
      </div>
      <div className="px-6 py-6">
        {formStep === 1 ? renderStep1() : formStep === 2 ? renderStep2() : renderStep3()}
      </div>
    </div>
  );

  // ── Request history table ──────────────────────────────────────────────────
  const RequestTable = ({ rows, onView, onDelete, isGvcn }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {rows.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-sm">Chưa có đơn nào.</div>
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
                <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-32">Trạng thái</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 w-28"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((req) => {
                const reasons  = isGvcn ? REASONS_GV : STUDENT_REASONS;
                const lyDoText = req.lyDoChecked?.length > 0 ? reasons[req.lyDoChecked[0]] : req.lyDoKhac || "";
                return (
                  <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100 font-medium">{req.id}</td>
                    <td className="px-4 py-3 text-gray-700 border-r border-gray-100 max-w-xs"><span className="line-clamp-2">{lyDoText}</span></td>
                    <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100">{req.ngayTao}</td>
                    <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100">{req.hocKy}</td>
                    <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100">{req.namHoc}</td>
                    <td className="px-4 py-3 text-center border-r border-gray-100"><StatusBadge status={req.trangThai} /></td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => onView(req)} className="text-[#3d2f6b] hover:underline font-medium cursor-pointer text-sm">xem</button>
                        <TrashBtn onClick={() => onDelete(req.id)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ── "Đề nghị cá nhân" panel ────────────────────────────────────────────────
  const renderCaNhan = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button onClick={() => { setSubTab("don-de-nghi"); setShowForm(false); resetForm(); }}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer ${subTab === "don-de-nghi" ? "bg-white text-[#3d2f6b] shadow-sm" : "text-gray-600 hover:text-gray-800"}`}>
            • Đơn đề nghị
          </button>
          <button onClick={() => setSubTab("lich-su")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer ${subTab === "lich-su" ? "bg-white text-[#3d2f6b] shadow-sm" : "text-gray-600 hover:text-gray-800"}`}>
            • Lịch sử tạo đơn
          </button>
        </div>
        {subTab === "don-de-nghi" && !showForm && (
          <button onClick={() => { setShowForm(true); setFormStep(1); }}
            className="px-5 py-2.5 bg-[#3d2f6b] hover:bg-[#2e2352] text-white text-sm font-semibold rounded-lg cursor-pointer">
            Tạo đơn đề nghị
          </button>
        )}
      </div>

      {subTab === "don-de-nghi" ? (
        showForm ? renderForm() : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-16 flex flex-col items-center justify-center gap-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-semibold text-gray-700">Chưa có đơn đề nghị nào</p>
              <p className="text-sm text-gray-500">Bấm nút bên trên để tạo đơn đề nghị chỉnh điểm mới.</p>
            </div>
          </div>
        )
      ) : (
        <RequestTable
          rows={gvcnRequests.filter((r) => r.source === "gvcn")}
          isGvcn={true}
          onView={(req) => { setViewingReq(req); setViewingIsGvcn(true); }}
          onDelete={(id) => handleDelete("gvcn", id)}
        />
      )}
    </div>
  );

  // ── "Đề nghị chờ duyệt" panel ─────────────────────────────────────────────
  const renderChoDuyet = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {studentRequests.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-sm">Chưa có đơn đề nghị nào từ sinh viên.</div>
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
                <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-32">Trạng thái</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 w-28"></th>
              </tr>
            </thead>
            <tbody>
              {studentRequests.map((req) => {
                const lyDoText = req.lyDoChecked?.length > 0 ? STUDENT_REASONS[req.lyDoChecked[0]] : req.lyDoKhac || "";
                return (
                  <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100 font-medium">{req.id}</td>
                    <td className="px-4 py-3 text-gray-700 border-r border-gray-100 max-w-xs"><span className="line-clamp-2">{lyDoText}</span></td>
                    <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100">{req.ngayTao}</td>
                    <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100">{req.hocKy}</td>
                    <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100">{req.namHoc}</td>
                    <td className="px-4 py-3 text-center border-r border-gray-100">
                      {req.trangThai === "chua-duyet" ? (
                        <button
                          onClick={() => handleApproveStudent(req)}
                          className="inline-block px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs font-semibold rounded-full cursor-pointer transition-colors"
                        >
                          Chưa duyệt
                        </button>
                      ) : (
                        <StatusBadge status={req.trangThai} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setViewingReq(req); setViewingIsGvcn(false); }} className="text-[#3d2f6b] hover:underline font-medium cursor-pointer text-sm">xem</button>
                        <TrashBtn onClick={() => handleDelete("student", req.id)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex gap-6">
      <div className="w-44 flex-shrink-0">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => setSideTab("ca-nhan")}
            className={`w-full text-left px-4 py-3.5 text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer border-b border-gray-100 ${sideTab === "ca-nhan" ? "bg-orange-50 text-orange-600" : "text-gray-700 hover:bg-gray-50"}`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            Đề nghị cá nhân
          </button>
          <button
            onClick={() => setSideTab("cho-duyet")}
            className={`w-full text-left px-4 py-3.5 text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${sideTab === "cho-duyet" ? "bg-orange-50 text-orange-600" : "text-gray-700 hover:bg-gray-50"}`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            <span>
              Đề nghị chờ duyệt
              {pendingSideCount > 0 && (
                <span className="ml-1 text-orange-500 font-bold">({pendingSideCount})</span>
              )}
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {sideTab === "ca-nhan" ? renderCaNhan() : renderChoDuyet()}
      </div>

      {viewingReq && (
        <ViewStudentLetterModal
          req={viewingReq}
          isGvcnLetter={viewingIsGvcn}
          onClose={() => setViewingReq(null)}
          onApprove={
            !viewingIsGvcn && viewingReq.trangThai === "chua-duyet"
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

      {deletingKey && (
        <DeleteModal onConfirm={confirmDelete} onCancel={() => setDeletingKey(null)} />
      )}
    </div>
  );
};

export default AdjustmentRequest;