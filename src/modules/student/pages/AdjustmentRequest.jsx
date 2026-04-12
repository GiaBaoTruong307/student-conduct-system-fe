import { useState, useRef, useEffect } from "react";

const LS_KEY_REQUESTS = "studentAdjustmentRequests";
const ADMIN_LS_KEYS = {
  YEARS: "admin_academic_years",
  SEMESTERS: "admin_academic_semesters",
};

const STUDENT = {
  hoTen: "Trương Văn Gia Bảo",
  mssv: "221121521200",
  ngaySinh: "15/03/2004",
  lop: "48K14.1",
  khoa: "Khoa Thống kê - Tin học",
  gvcn: "Nguyễn Văn Sơn",
};

const REASONS = [
  "Tôi không có ĐRL vì tôi đã không nộp kết quả tự đánh giá ĐRL của mình đến cuộc họp lớp vào học kỳ đó",
  "Tôi không có ĐRL vì Giảng viên chủ nhiệm không nhập ĐRL của tôi vào hệ thống, dù tôi đã nộp kết quả tự đánh giá ĐRL của mình đến cuộc họp lớp vào học kỳ đó.",
  "Tôi không có ĐRL vì tôi được cử đi học trao đổi tại trường khác, vì vậy tôi không được đánh giá ĐRL cùng lúc với cả lớp vào học kỳ đó",
  "Tôi đã có ĐRL nhưng khác so với kết quả đánh giá của lớp vì Giảng viên chủ nhiệm đã nhập sai ĐRL của tôi vào hệ thống",
];

const readLS = (key, def) => {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : def; }
  catch { return def; }
};
const writeLS = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

const today = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

// ── Custom Date Input ─────────────────────────────────────────────────────────
const DateInput = ({ value, onChange, hasError }) => {
  const [dd,   setDd]   = useState(value ? value.split("/")[0] ?? "" : "");
  const [mm,   setMm]   = useState(value ? value.split("/")[1] ?? "" : "");
  const [yyyy, setYyyy] = useState(value ? value.split("/")[2] ?? "" : "");

  const refDd   = useRef(null);
  const refMm   = useRef(null);
  const refYyyy = useRef(null);

  useEffect(() => {
    if (!value) { setDd(""); setMm(""); setYyyy(""); }
  }, [value]);

  const emit = (d, m, y) => {
    if (d.length === 2 && m.length === 2 && y.length === 4) {
      onChange(`${d}/${m}/${y}`);
    } else {
      onChange("");
    }
  };

  const handleDd = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    setDd(v); emit(v, mm, yyyy);
    if (v.length === 2) refMm.current?.focus();
  };
  const handleMm = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    setMm(v); emit(dd, v, yyyy);
    if (v.length === 2) refYyyy.current?.focus();
  };
  const handleYyyy = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
    setYyyy(v); emit(dd, mm, v);
  };
  const handleMmKeyDown   = (e) => { if (e.key === "Backspace" && mm   === "") refDd.current?.focus(); };
  const handleYyyyKeyDown = (e) => { if (e.key === "Backspace" && yyyy === "") refMm.current?.focus(); };

  const base = "text-center outline-none bg-transparent text-sm py-2.5 px-1";
  const wrap = `flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-[#3d2f6b] ${
    hasError ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
  }`;

  return (
    <div className={wrap}>
      <input ref={refDd}   type="text" inputMode="numeric" placeholder="dd"   value={dd}   onChange={handleDd}   maxLength={2} className={`${base} w-10`} />
      <span className="text-gray-400 select-none text-sm">/</span>
      <input ref={refMm}   type="text" inputMode="numeric" placeholder="mm"   value={mm}   onChange={handleMm}   onKeyDown={handleMmKeyDown}   maxLength={2} className={`${base} w-10`} />
      <span className="text-gray-400 select-none text-sm">/</span>
      <input ref={refYyyy} type="text" inputMode="numeric" placeholder="yyyy" value={yyyy} onChange={handleYyyy} onKeyDown={handleYyyyKeyDown} maxLength={4} className={`${base} flex-1 text-left pl-2`} />
    </div>
  );
};

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  if (status === "chua-duyet")
    return <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">Chưa duyệt</span>;
  if (status === "gvcn-duyet")
    return <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">GVCN đã duyệt</span>;
  if (status === "khoa-duyet")
    return <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Khoa đã duyệt</span>;
  return <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Đã hoàn tất</span>;
};

// ── Delete confirm modal ──────────────────────────────────────────────────────
const DeleteModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-base font-bold text-gray-800">Xác nhận xoá đơn</h2>
      </div>
      <div className="px-6 py-4">
        <p className="text-sm text-gray-700">Bạn có chắc muốn xoá đơn đề nghị này? Thao tác không thể hoàn tác.</p>
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
        <button onClick={onCancel}  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 cursor-pointer">Không</button>
        <button onClick={onConfirm} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg cursor-pointer">Xoá đơn</button>
      </div>
    </div>
  </div>
);

// ── View letter modal ─────────────────────────────────────────────────────────
const ViewLetterModal = ({ req, onClose }) => {
  if (!req) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <span className="text-sm text-gray-500 font-medium">Xem lại đơn đề nghị</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 cursor-pointer text-xl leading-none">×</button>
        </div>

        <div className="px-8 py-6 text-sm text-gray-800 leading-relaxed space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="text-center space-y-1">
            <p className="font-bold uppercase text-xs tracking-wide">Cộng hoà xã hội chủ nghĩa Việt Nam</p>
            <p className="font-semibold text-xs underline">Độc lập – Tự do – Hạnh phúc</p>
            <p className="mt-3 font-bold uppercase text-sm">Đơn đề nghị</p>
            <p className="font-bold uppercase text-sm">Cập nhật điểm rèn luyện học kỳ {req.hocKy}, năm học {req.namHoc}</p>
          </div>

          <div className="space-y-0.5">
            <p className="font-semibold">Kính gửi:</p>
            <p>- {STUDENT.khoa}, Trường Đại học Kinh tế – Đại học Đà Nẵng;</p>
            <p>- Giảng viên Chủ nhiệm lớp {STUDENT.lop};</p>
            <p>- Phòng Công tác sinh viên, Quan hệ doanh nghiệp và Truyền thông.</p>
          </div>

          <div className="space-y-0.5">
            <p>Tôi tên là: <span className="font-semibold">{STUDENT.hoTen}</span>&nbsp;&nbsp;Ngày sinh: {STUDENT.ngaySinh}</p>
            <p>Lớp: {STUDENT.lop}&nbsp;&nbsp;MSSV: {STUDENT.mssv}</p>
          </div>

          <p>
            Vào ngày {req.ngayPhatHien}, tôi phát hiện vấn đề liên quan đến Điểm rèn luyện (ĐRL) của mình trong học kỳ {req.hocKy}, năm học {req.namHoc} trên hệ thống của Trường. Cụ thể như sau:
          </p>

          <div className="space-y-1.5">
            {REASONS.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0 w-4 h-4 border border-gray-500 rounded-sm flex items-center justify-center text-xs">
                  {req.lyDoChecked.includes(i) ? "✓" : ""}
                </span>
                <span>{r}</span>
              </div>
            ))}
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex-shrink-0 w-4 h-4 border border-gray-500 rounded-sm flex items-center justify-center text-xs">
                {req.lyDoKhac ? "✓" : ""}
              </span>
              <span>Lý do khác: {req.lyDoKhac ? req.lyDoKhac : "..............................................................................."}</span>
            </div>
          </div>

          <div className="space-y-1">
            <p>Tôi làm đơn này kính mong Quý cấp kiểm tra và cập nhật ĐRL cho tôi. Cụ thể:</p>
            <p><span className="font-semibold">ĐRL đang có:</span> {req.drlHienTai};&nbsp;&nbsp;<span className="font-semibold">ĐRL mới:</span> {req.drlMoi}</p>
          </div>

          <p>Tôi xin nộp Phiếu tự đánh giá kết quả rèn luyện và các minh chứng liên quan để phục vụ việc kiểm tra và cập nhật ĐRL của Quý cấp.</p>
          <p>Tôi cam đoan nội dung trên là đúng sự thật và chịu hoàn toàn trách nhiệm về đề nghị của mình. Trân trọng cảm ơn.</p>
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const EMPTY_STEP1 = { ngayPhatHien: "", hocKy: "", namHoc: "", lyDoChecked: [], lyDoKhac: "" };
const EMPTY_STEP2 = { drlHienTai: "", drlMoi: "" };

const AdjustmentRequest = () => {
  const allYears     = readLS(ADMIN_LS_KEYS.YEARS, []);
  const allSemesters = readLS(ADMIN_LS_KEYS.SEMESTERS, {});

  const [activeTab, setActiveTab] = useState("don-de-nghi");
  const [showForm,  setShowForm]  = useState(false);
  const [formStep,  setFormStep]  = useState(1);

  const [step1, setStep1] = useState(EMPTY_STEP1);
  const [step2, setStep2] = useState(EMPTY_STEP2);

  const [requests, setRequests] = useState(() => readLS(LS_KEY_REQUESTS, []));

  const [viewingReq, setViewingReq] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [errors1,    setErrors1]    = useState({});
  const [errors2,    setErrors2]    = useState({});

  const yearObj      = allYears.find((y) => y.name === step1.namHoc);
  const semesterOpts = yearObj ? (allSemesters[yearObj.id] ?? []) : [];

  const validateStep1 = () => {
    const e = {};
    if (!step1.ngayPhatHien) e.ngayPhatHien = "Vui lòng nhập ngày";
    if (!step1.namHoc)       e.namHoc       = "Vui lòng chọn năm học";
    if (!step1.hocKy)        e.hocKy        = "Vui lòng chọn học kỳ";
    if (step1.lyDoChecked.length === 0 && !step1.lyDoKhac.trim())
      e.lyDo = "Vui lòng chọn ít nhất một lý do";
    setErrors1(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (step2.drlHienTai === "" || step2.drlHienTai === undefined) e.drlHienTai = "Vui lòng nhập ĐRL hiện tại";
    if (step2.drlMoi     === "" || step2.drlMoi     === undefined) e.drlMoi     = "Vui lòng nhập ĐRL mới";
    setErrors2(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep1()) setFormStep(2); };

  const handleSubmit = () => {
    if (!validateStep2()) return;
    const newReq = {
      id:           requests.length > 0 ? Math.max(...requests.map((r) => r.id)) + 1 : 1,
      lyDoChecked:  step1.lyDoChecked,
      lyDoKhac:     step1.lyDoKhac,
      ngayPhatHien: step1.ngayPhatHien,
      hocKy:        step1.hocKy,
      namHoc:       step1.namHoc,
      drlHienTai:   Number(step2.drlHienTai),
      drlMoi:       Number(step2.drlMoi),
      ngayTao:      today(),
      trangThai:    "chua-duyet",
    };
    const updated = [newReq, ...requests];
    setRequests(updated);
    writeLS(LS_KEY_REQUESTS, updated);
    setShowForm(false);
    setFormStep(1);
    setStep1(EMPTY_STEP1);
    setStep2(EMPTY_STEP2);
    setErrors1({});
    setErrors2({});
    setActiveTab("lich-su");
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setFormStep(1);
    setStep1(EMPTY_STEP1);
    setStep2(EMPTY_STEP2);
    setErrors1({});
    setErrors2({});
  };

  const handleDelete  = (id) => setDeletingId(id);
  const confirmDelete = () => {
    const updated = requests.filter((r) => r.id !== deletingId);
    setRequests(updated);
    writeLS(LS_KEY_REQUESTS, updated);
    setDeletingId(null);
  };

  const toggleReason = (idx) => {
    setStep1((prev) => {
      const checked = prev.lyDoChecked.includes(idx)
        ? prev.lyDoChecked.filter((i) => i !== idx)
        : [...prev.lyDoChecked, idx];
      return { ...prev, lyDoChecked: checked };
    });
    setErrors1((e) => ({ ...e, lyDo: undefined }));
  };

  // ── Step 1 ──────────────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Thời gian phát hiện vấn đề về điểm <span className="text-red-500">*</span>
          </label>
          <DateInput
            value={step1.ngayPhatHien}
            hasError={!!errors1.ngayPhatHien}
            onChange={(v) => { setStep1((p) => ({ ...p, ngayPhatHien: v })); setErrors1((p) => ({ ...p, ngayPhatHien: undefined })); }}
          />
          {errors1.ngayPhatHien && <p className="text-xs text-red-500 mt-1">{errors1.ngayPhatHien}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Năm học có bảng điểm sai <span className="text-red-500">*</span>
          </label>
          <select
            value={step1.namHoc}
            onChange={(e) => { setStep1((p) => ({ ...p, namHoc: e.target.value, hocKy: "" })); setErrors1((p) => ({ ...p, namHoc: undefined })); }}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] bg-white cursor-pointer ${errors1.namHoc ? "border-red-400 bg-red-50" : "border-gray-300"}`}
          >
            <option value="">Năm học</option>
            {allYears.map((y) => <option key={y.id} value={y.name}>{y.name}</option>)}
          </select>
          {errors1.namHoc && <p className="text-xs text-red-500 mt-1">{errors1.namHoc}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Học kỳ có bảng điểm sai <span className="text-red-500">*</span>
          </label>
          <select
            value={step1.hocKy}
            onChange={(e) => { setStep1((p) => ({ ...p, hocKy: e.target.value })); setErrors1((p) => ({ ...p, hocKy: undefined })); }}
            disabled={!step1.namHoc}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] bg-white cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-default ${errors1.hocKy ? "border-red-400 bg-red-50" : "border-gray-300"}`}
          >
            <option value="">Học kỳ</option>
            {semesterOpts.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          {errors1.hocKy && <p className="text-xs text-red-500 mt-1">{errors1.hocKy}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Chi tiết vấn đề về bảng điểm <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {REASONS.map((r, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" checked={step1.lyDoChecked.includes(i)} onChange={() => toggleReason(i)}
                className="mt-0.5 w-4 h-4 accent-[#3d2f6b] flex-shrink-0 cursor-pointer" />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 leading-relaxed">{r}</span>
            </label>
          ))}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={!!step1.lyDoKhac}
              onChange={(e) => { if (!e.target.checked) setStep1((p) => ({ ...p, lyDoKhac: "" })); }}
              className="mt-0.5 w-4 h-4 accent-[#3d2f6b] flex-shrink-0 cursor-pointer" />
            <input type="text" placeholder="Nhập lý do khác ..."
              value={step1.lyDoKhac}
              onChange={(e) => { setStep1((p) => ({ ...p, lyDoKhac: e.target.value })); setErrors1((p) => ({ ...p, lyDo: undefined })); }}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b]" />
          </label>
        </div>
        {errors1.lyDo && <p className="text-xs text-red-500 mt-2">{errors1.lyDo}</p>}
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={handleNext}
          className="px-6 py-2.5 bg-[#3d2f6b] hover:bg-[#2e2352] text-white text-sm font-semibold rounded-lg cursor-pointer flex items-center gap-2">
          Tiếp tục
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );

  // ── Step 2 ──────────────────────────────────────────────────────────────────
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            ĐRL đang có <span className="text-red-500">*</span>
          </label>
          <input type="number" min="0" max="100" placeholder="Nhập điểm rèn luyện hiện tại"
            value={step2.drlHienTai}
            onChange={(e) => { setStep2((p) => ({ ...p, drlHienTai: e.target.value })); setErrors2((p) => ({ ...p, drlHienTai: undefined })); }}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] ${errors2.drlHienTai ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
          {errors2.drlHienTai && <p className="text-xs text-red-500 mt-1">{errors2.drlHienTai}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            ĐRL mới (đề nghị cập nhật) <span className="text-red-500">*</span>
          </label>
          <input type="number" min="0" max="100" placeholder="Nhập điểm rèn luyện đề nghị"
            value={step2.drlMoi}
            onChange={(e) => { setStep2((p) => ({ ...p, drlMoi: e.target.value })); setErrors2((p) => ({ ...p, drlMoi: undefined })); }}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] ${errors2.drlMoi ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
          {errors2.drlMoi && <p className="text-xs text-red-500 mt-1">{errors2.drlMoi}</p>}
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={() => setFormStep(1)}
          className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 cursor-pointer">
          ← Quay lại
        </button>
        <button onClick={handleSubmit}
          className="px-6 py-2.5 bg-[#3d2f6b] hover:bg-[#2e2352] text-white text-sm font-semibold rounded-lg cursor-pointer">
          Nộp đơn
        </button>
      </div>
    </div>
  );

  // ── Form wrapper ──────────────────────────────────────────────────────────────
  const renderForm = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex gap-6 text-sm">
          <button className={`pb-1 font-semibold transition-colors ${formStep === 1 ? "text-[#3d2f6b] border-b-2 border-[#3d2f6b]" : "text-gray-400"}`}>
            1. Lý do đề nghị
          </button>
          <button className={`pb-1 font-semibold transition-colors ${formStep === 2 ? "text-[#3d2f6b] border-b-2 border-[#3d2f6b]" : "text-gray-400"}`}>
            2. Chi tiết điều chỉnh
          </button>
        </div>
        <button onClick={handleCancelForm} className="text-gray-400 hover:text-gray-700 cursor-pointer" title="Đóng">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      </div>
      <div className="px-6 py-6">
        {formStep === 1 ? renderStep1() : renderStep2()}
      </div>
    </div>
  );

  // ── "Đơn đề nghị" tab ────────────────────────────────────────────────────────
  const renderDonDeNghiTab = () => {
    if (showForm) return renderForm();
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-16 flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="text-center space-y-1">
          <p className="text-base font-semibold text-gray-700">Chưa có đơn đề nghị nào</p>
          <p className="text-sm text-gray-500">Bấm nút bên dưới để tạo đơn đề nghị chỉnh điểm mới.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormStep(1); }}
          className="px-6 py-2.5 bg-[#3d2f6b] hover:bg-[#2e2352] text-white text-sm font-semibold rounded-lg cursor-pointer"
        >
          + Tạo đơn đề nghị
        </button>
      </div>
    );
  };

  // ── "Lịch sử tạo đơn" tab ────────────────────────────────────────────────────
  const renderLichSuTab = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {requests.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-sm">Chưa có đơn nào được tạo.</div>
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
              {requests.map((req) => {
                const lyDoText = req.lyDoChecked.length > 0
                  ? REASONS[req.lyDoChecked[0]]
                  : req.lyDoKhac || "";
                return (
                  <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100 font-medium">{req.id}</td>
                    <td className="px-4 py-3 text-gray-700 border-r border-gray-100 max-w-xs">
                      <span className="line-clamp-2">{lyDoText}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100">{req.ngayTao}</td>
                    <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100">{req.hocKy}</td>
                    <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100">{req.namHoc}</td>
                    <td className="px-4 py-3 text-center border-r border-gray-100">
                      <StatusBadge status={req.trangThai} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setViewingReq(req)}
                          className="text-[#3d2f6b] hover:underline font-medium cursor-pointer text-sm">
                          xem
                        </button>
                        <button onClick={() => handleDelete(req.id)}
                          className="w-7 h-7 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                          title="Xoá đơn">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
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
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => { setActiveTab("don-de-nghi"); setShowForm(false); setFormStep(1); }}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === "don-de-nghi" ? "bg-white text-[#3d2f6b] shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            • Đơn đề nghị
          </button>
          <button
            onClick={() => setActiveTab("lich-su")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === "lich-su" ? "bg-white text-[#3d2f6b] shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            • Lịch sử tạo đơn
          </button>
        </div>

        {activeTab === "don-de-nghi" && !showForm && (
          <button
            onClick={() => { setShowForm(true); setFormStep(1); }}
            className="px-5 py-2.5 bg-[#3d2f6b] hover:bg-[#2e2352] text-white text-sm font-semibold rounded-lg cursor-pointer"
          >
            Tạo đơn đề nghị
          </button>
        )}
      </div>

      {activeTab === "don-de-nghi" ? renderDonDeNghiTab() : renderLichSuTab()}

      {viewingReq && <ViewLetterModal req={viewingReq} onClose={() => setViewingReq(null)} />}
      {deletingId  && <DeleteModal onConfirm={confirmDelete} onCancel={() => setDeletingId(null)} />}
    </div>
  );
};

export default AdjustmentRequest;