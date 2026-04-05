import { useState } from "react";
import { useCriteria } from "../hooks/useCriteria";
import ConfirmModal from "../components/ConfirmModal";
import { IconEdit, IconDelete, IconChevron, IconPlus, IconEye } from "../components/IconButtons";

// ─── Preview Modal ────────────────────────────────────────────────────────────

const PreviewModal = ({ sections, onClose }) => {
  const totalMax = sections.reduce(
    (sum, s) => sum + (s.criteria || []).reduce((cs, c) => cs + (c.maxScore || 0), 0), 0
  );
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-800">Xem trước bảng tiêu chí</h3>
            <p className="text-xs text-gray-400 mt-0.5">Đây là cách bảng điểm sẽ hiển thị với sinh viên</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-auto flex-1 p-4">
          {sections.length === 0 ? (
            <div className="text-center py-16 text-gray-400">Chưa có điều mục nào để xem trước</div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#c4b5e8] text-[#3d2f6b]">
                  <th className="px-4 py-3 text-left font-bold border border-gray-300">NỘI DUNG VÀ TIÊU CHÍ ĐÁNH GIÁ</th>
                  <th className="px-4 py-3 text-center font-bold border border-gray-300 w-24">Điểm tối đa</th>
                  <th className="px-4 py-3 text-center font-bold border border-gray-300 w-28">Điểm SV tự đánh giá</th>
                  <th className="px-4 py-3 text-center font-bold border border-gray-300 w-28">Điểm BCS đánh giá</th>
                  <th className="px-4 py-3 text-center font-bold border border-gray-300 w-32">Minh chứng</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((sec) => {
                  const secMax = (sec.criteria || []).reduce((s, c) => s + (c.maxScore || 0), 0);
                  return (
                    <>
                      <tr key={sec.id} className="bg-gray-100">
                        <td className="px-4 py-2 font-bold text-gray-800 border border-gray-300">
                          {sec.number ? `Điều ${sec.number}. ` : ""}{sec.name}
                          {sec.note && <span className="font-normal text-xs text-gray-500 ml-2">({sec.note})</span>}
                        </td>
                        <td className="px-4 py-2 text-center font-bold border border-gray-300">{secMax}</td>
                        <td className="px-4 py-2 text-center border border-gray-300 text-gray-400">-</td>
                        <td className="px-4 py-2 text-center border border-gray-300 text-gray-400">-</td>
                        <td className="px-4 py-2 border border-gray-300"></td>
                      </tr>
                      {(sec.criteria || []).map((cr, ci) => (
                        <tr key={cr.id}>
                          <td className="px-4 py-2 border border-gray-200 whitespace-pre-line text-gray-700">
                            <span className="font-semibold italic mr-2 text-gray-500">{String.fromCharCode(97 + ci)}.</span>
                            {cr.content}
                            {cr.note && <div className="text-xs text-gray-400 mt-0.5 italic">({cr.note})</div>}
                          </td>
                          <td className="px-4 py-2 text-center border border-gray-200">{cr.maxScore}</td>
                          <td className="px-4 py-2 text-center border border-gray-200 text-gray-400">-</td>
                          <td className="px-4 py-2 text-center border border-gray-200 text-gray-400">-</td>
                          <td className="px-4 py-2 text-center border border-gray-200 text-xs text-blue-500">Tải minh chứng</td>
                        </tr>
                      ))}
                    </>
                  );
                })}
                <tr className="bg-gray-100 font-bold">
                  <td className="px-4 py-3 border border-gray-300">TỔNG CỘNG</td>
                  <td className="px-4 py-3 text-center border border-gray-300">{totalMax}</td>
                  <td className="px-4 py-3 text-center border border-gray-300 text-gray-400">-</td>
                  <td className="px-4 py-3 text-center border border-gray-300 text-gray-400">-</td>
                  <td className="px-4 py-3 border border-gray-300"></td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">Đóng</button>
        </div>
      </div>
    </div>
  );
};

// ─── StepTabs ─────────────────────────────────────────────────────────────────

const StepTabs = ({ step }) => (
  <div className="flex gap-0 mb-6 shrink-0 border-b border-gray-100">
    {[{ n: 1, label: "Tạo điều mục" }, { n: 2, label: "Tạo tiêu chí" }].map(({ n, label }) => {
      const active = step === n;
      const done = step > n;
      return (
        <div key={n} className={`flex items-center gap-2 px-5 py-3 text-sm border-b-2 transition-colors
          ${active ? "font-semibold text-[#3d2f6b] border-[#3d2f6b]" : "font-normal text-gray-400 border-transparent"}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
            ${active ? "bg-[#3d2f6b] text-white" : done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
            {done ? "✓" : n}
          </span>
          {label}
        </div>
      );
    })}
  </div>
);

// ─── SectionForm ──────────────────────────────────────────────────────────────

const SectionForm = ({ initial, usedNumbers, onNext, onSaveDirect, onCancel, genId }) => {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    number: initial?.number ?? "",
    name: initial?.name ?? "",
    note: initial?.note ?? "",
  });
  const [err, setErr] = useState("");
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) { setErr("Vui lòng nhập tên điều mục."); return null; }
    const num = form.number ? Number(form.number) : null;
    if (num && usedNumbers.includes(num)) { setErr("Số điều mục này đã được sử dụng."); return null; }
    setErr("");
    return { id: initial?.id ?? genId(), ...form, number: num ?? "" };
  };

  return (
    <div className="flex flex-col flex-1">
      <StepTabs step={1} />
      <div className="space-y-4 flex-1">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điều mục</label>
            <input type="number" min="1" value={form.number} onChange={set("number")} placeholder="VD: 4"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b]" />
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên điều mục <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={set("name")} placeholder="VD: Đánh giá về ý thức và thái độ học tập"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b]" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghi chú điều mục</label>
          <input type="text" value={form.note} onChange={set("note")} placeholder="Nhập ghi chú cho điều mục (tùy chọn)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b]" />
        </div>
        {err && <p className="text-sm text-red-500">{err}</p>}
        {isEdit && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <svg className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-blue-600">
              Nhấn <strong>Lưu</strong> để chỉ cập nhật thông tin điều mục, hoặc nhấn <strong>Tiếp tục</strong> để chỉnh sửa tiêu chí.
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100 shrink-0">
        <button onClick={onCancel} className="text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">Hủy</button>
        <div className="flex items-center gap-3">
          {isEdit && (
            <button onClick={() => { const d = validate(); if (d) onSaveDirect(d); }}
              className="px-5 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg cursor-pointer transition-colors">
              Lưu
            </button>
          )}
          <button onClick={() => { const d = validate(); if (d) onNext(d); }}
            className="px-6 py-2 text-sm font-medium text-white bg-[#3d2f6b] hover:bg-[#2e2354] rounded-lg cursor-pointer transition-colors">
            {isEdit ? "Tiếp tục → Sửa tiêu chí" : "Tiếp tục →"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── CriteriaForm ─────────────────────────────────────────────────────────────

const CriteriaForm = ({ section, onBack, onSave, genId }) => {
  const [rows, setRows] = useState(() =>
    (section.criteria || []).length > 0
      ? section.criteria.map((c) => ({ ...c }))
      : [{ id: genId(), content: "", note: "", maxScore: "" }]
  );
  const [err, setErr] = useState("");

  const setRow = (idx, field, val) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));

  const handleSave = () => {
    for (let i = 0; i < rows.length; i++) {
      if (!rows[i].content.trim()) return setErr(`Tiêu chí ${i + 1}: Vui lòng nhập nội dung.`);
      if (rows[i].maxScore === "" || isNaN(Number(rows[i].maxScore)) || Number(rows[i].maxScore) < 0)
        return setErr(`Tiêu chí ${i + 1}: Vui lòng nhập điểm tối đa hợp lệ.`);
    }
    setErr("");
    onSave(rows.map((r) => ({ ...r, maxScore: Number(r.maxScore) })));
  };

  const totalScore = rows.reduce((s, r) => s + (Number(r.maxScore) || 0), 0);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <StepTabs step={2} />
      <div className="mb-4 px-4 py-3 bg-purple-50 rounded-lg border border-purple-100 shrink-0">
        <p className="text-xs text-purple-500 font-medium uppercase tracking-wide mb-0.5">Điều mục</p>
        <p className="text-sm font-semibold text-[#3d2f6b]">
          {section.number ? `Điều ${section.number}. ` : ""}{section.name}
        </p>
        {section.note && <p className="text-xs text-purple-400 mt-0.5">{section.note}</p>}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
        {rows.map((row, idx) => (
          <div key={row.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tiêu chí {String.fromCharCode(97 + idx)}</span>
              {rows.length > 1 && (
                <button onClick={() => setRows((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="space-y-3">
              <textarea rows={3} value={row.content} onChange={(e) => setRow(idx, "content", e.target.value)}
                placeholder="Nhập nội dung tiêu chí đánh giá..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] resize-none bg-white" />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Điểm tối đa <span className="text-red-500">*</span></label>
                  <input type="number" min="0" value={row.maxScore} onChange={(e) => setRow(idx, "maxScore", e.target.value)}
                    placeholder="VD: 6" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] bg-white" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ghi chú tiêu chí</label>
                  <input type="text" value={row.note} onChange={(e) => setRow(idx, "note", e.target.value)}
                    placeholder="Ghi chú (tùy chọn)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] bg-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="shrink-0 mt-4 pt-4 border-t border-gray-100 space-y-2">
        {totalScore > 0 && (
          <p className="text-xs text-gray-500">Tổng điểm tiêu chí: <span className="font-semibold text-[#3d2f6b]">{totalScore}</span></p>
        )}
        {err && <p className="text-sm text-red-500">{err}</p>}
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </button>
          <div className="flex gap-3">
            <button onClick={() => setRows((prev) => [...prev, { id: genId(), content: "", note: "", maxScore: "" }])}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#3d2f6b] bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg cursor-pointer transition-colors">
              <IconPlus /> Thêm tiêu chí
            </button>
            <button onClick={handleSave}
              className="px-5 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg cursor-pointer transition-colors">
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── SectionCard ──────────────────────────────────────────────────────────────

const SectionCard = ({ section, index, onEdit, onDelete, onManageCriteria }) => {
  const [open, setOpen] = useState(false);
  const secScore = (section.criteria || []).reduce((s, c) => s + (c.maxScore || 0), 0);
  const criteriaCount = (section.criteria || []).length;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="w-7 h-7 rounded-full bg-[#3d2f6b] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
          {section.number || index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {section.number ? `Điều ${section.number}. ` : ""}{section.name}
          </p>
          {section.note && <p className="text-xs text-gray-400 truncate mt-0.5">{section.note}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{criteriaCount} tiêu chí</span>
          <span className="text-xs text-[#3d2f6b] bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full font-semibold">{secScore} điểm</span>
          <button onClick={() => onManageCriteria(section)} title="Quản lý tiêu chí"
            className="p-1.5 text-[#3d2f6b] hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"><IconPlus /></button>
          <button onClick={() => onEdit(section)} title="Sửa điều mục"
            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"><IconEdit /></button>
          <button onClick={() => onDelete(section)} title="Xóa điều mục"
            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"><IconDelete /></button>
          <button onClick={() => setOpen((v) => !v)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            <IconChevron open={open} />
          </button>
        </div>
      </div>
      {open && (
        <div className="divide-y divide-gray-50">
          {criteriaCount === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-400">Chưa có tiêu chí nào</p>
              <button onClick={() => onManageCriteria(section)}
                className="mt-2 text-xs text-[#3d2f6b] hover:underline cursor-pointer font-medium">+ Thêm tiêu chí ngay</button>
            </div>
          ) : (section.criteria || []).map((cr, ci) => (
            <div key={cr.id} className="flex items-start gap-3 px-4 py-3">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-[#3d2f6b] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {String.fromCharCode(97 + ci)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 whitespace-pre-line">{cr.content}</p>
                {cr.note && <p className="text-xs text-gray-400 mt-1 italic">({cr.note})</p>}
              </div>
              <span className="shrink-0 text-xs font-semibold text-[#3d2f6b] bg-purple-50 px-2 py-0.5 rounded-full">{cr.maxScore} điểm</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const Criteria = () => {
  const {
    sections, view, setView, pendingSection, deleteTarget, setDeleteTarget,
    showPreview, setShowPreview, usedNumbers, totalScore, sortedSections,
    startCreate, handleStep1Next, handleStep1SaveDirect, handleStep2Save,
    startEdit, startManageCriteria, cancelWizard, confirmDelete, genId,
  } = useCriteria();

  const isEditing = pendingSection && sections.find((s) => s.id === pendingSection.id);

  if (view === "step1" || view === "step2") {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full flex flex-col" style={{ minHeight: "calc(100vh - 8rem)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-bold text-gray-800">
            {isEditing ? "Chỉnh sửa điều mục & tiêu chí" : "Tạo điều mục & tiêu chí mới"}
          </h2>
          <button onClick={cancelWizard} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          {view === "step1" ? (
            <SectionForm
              initial={pendingSection} usedNumbers={usedNumbers} genId={genId}
              onNext={handleStep1Next} onSaveDirect={handleStep1SaveDirect} onCancel={cancelWizard}
            />
          ) : (
            <CriteriaForm
              section={pendingSection} genId={genId}
              onBack={() => setView("step1")} onSave={handleStep2Save}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full flex flex-col" style={{ minHeight: "calc(100vh - 8rem)" }}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <div>
          <h2 className="text-base font-bold text-gray-800">Tiêu chí chấm điểm</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {sections.length}{" "}điều mục &bull;{" "}
            {sections.reduce((s, sec) => s + (sec.criteria || []).length, 0)}{" "}tiêu chí &bull;{" "}
            Tổng <span className="font-semibold text-[#3d2f6b]">{totalScore}</span> điểm
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
            <IconEye /> Xem trước
          </button>
          <button onClick={startCreate}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#e07b39] hover:bg-[#c96b2e] rounded-lg cursor-pointer transition-colors">
            <IconPlus /> Thêm điều mục
          </button>
        </div>
      </div>

      <div className="flex-1 p-5 overflow-y-auto">
        {sortedSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4 py-20">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Chưa có điều mục nào</p>
              <p className="text-xs text-gray-400 mt-1">Tạo điều mục đầu tiên để xây dựng bảng tiêu chí chấm điểm</p>
            </div>
            <button onClick={startCreate}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-[#3d2f6b] hover:bg-[#2e2354] rounded-lg cursor-pointer transition-colors">
              <IconPlus /> Tạo điều mục đầu tiên
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedSections.map((sec, idx) => (
              <SectionCard key={sec.id} section={sec} index={idx}
                onEdit={startEdit}
                onDelete={setDeleteTarget}
                onManageCriteria={startManageCriteria}
              />
            ))}
            <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#3d2f6b] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#3d2f6b]">Tổng điểm rèn luyện tối đa</p>
                  <p className="text-xs text-purple-400">
                    {sections.length}{" "}điều mục &bull;{" "}
                    {sections.reduce((s, sec) => s + (sec.criteria || []).length, 0)}{" "}tiêu chí
                  </p>
                </div>
              </div>
              <span className="text-3xl font-bold text-[#3d2f6b]">{totalScore}</span>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmModal
          label={`${deleteTarget.number ? `Điều ${deleteTarget.number}. ` : ""}${deleteTarget.name}`}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
      {showPreview && <PreviewModal sections={sortedSections} onClose={() => setShowPreview(false)} />}
    </div>
  );
};

export default Criteria;