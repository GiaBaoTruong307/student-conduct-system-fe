import { useState } from "react";
import { useAcademicData } from "../hooks/useAcademicData";
import { genId, fmtDate } from "../constants/admin.constants";
import ConfirmModal from "../components/ConfirmModal";
import StatusBadge from "../components/StatusBadge";
import { EditBtn, DeleteBtn } from "../components/IconButtons";

// ─── Modal Năm học ────────────────────────────────────────────────────────────

const AcademicYearModal = ({ initial, onClose, onSave }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    startDate: initial?.startDate ?? "",
    endDate: initial?.endDate ?? "",
  });
  const [err, setErr] = useState("");
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSave = () => {
    if (!form.name.trim()) return setErr("Vui lòng nhập tên năm học.");
    if (!form.startDate)   return setErr("Vui lòng chọn ngày bắt đầu.");
    if (!form.endDate)     return setErr("Vui lòng chọn ngày kết thúc.");
    if (form.endDate <= form.startDate) return setErr("Ngày kết thúc phải sau ngày bắt đầu.");
    onSave({ id: initial?.id ?? genId(), ...form });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800">{isEdit ? "Sửa năm học" : "Tạo năm học"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên năm học <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={set("name")} placeholder="VD: 2024-2025"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày bắt đầu <span className="text-red-500">*</span></label>
              <input type="date" value={form.startDate} onChange={set("startDate")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày kết thúc <span className="text-red-500">*</span></label>
              <input type="date" value={form.endDate} onChange={set("endDate")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] cursor-pointer" />
            </div>
          </div>
          {err && <p className="text-sm text-red-500">{err}</p>}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">Hủy</button>
          <button onClick={handleSave} className="px-5 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg cursor-pointer transition-colors">Lưu</button>
        </div>
      </div>
    </div>
  );
};

// ─── Modal Học kỳ ─────────────────────────────────────────────────────────────

const SemesterModal = ({ yearName, initial, onClose, onSave }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    startDate: initial?.startDate ?? "",
    endDate: initial?.endDate ?? "",
  });
  const [err, setErr] = useState("");
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSave = () => {
    if (!form.name.trim()) return setErr("Vui lòng nhập tên học kỳ.");
    if (!form.startDate)   return setErr("Vui lòng chọn ngày bắt đầu.");
    if (!form.endDate)     return setErr("Vui lòng chọn ngày kết thúc.");
    if (form.endDate <= form.startDate) return setErr("Ngày kết thúc phải sau ngày bắt đầu.");
    onSave({ id: initial?.id ?? genId(), ...form });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-800">{isEdit ? "Sửa học kỳ" : "Tạo học kỳ"}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{yearName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên học kỳ <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={set("name")} placeholder="VD: Học kỳ 1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày bắt đầu <span className="text-red-500">*</span></label>
              <input type="date" value={form.startDate} onChange={set("startDate")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày kết thúc <span className="text-red-500">*</span></label>
              <input type="date" value={form.endDate} onChange={set("endDate")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] cursor-pointer" />
            </div>
          </div>
          {err && <p className="text-sm text-red-500">{err}</p>}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">Hủy</button>
          <button onClick={handleSave} className="px-5 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg cursor-pointer transition-colors">Lưu</button>
        </div>
      </div>
    </div>
  );
};

// ─── SearchBar ────────────────────────────────────────────────────────────────

const SearchBar = ({ value, onChange, onSearch, onClear, placeholder, hasSearched }) => (
  <div className="flex items-center gap-3 flex-1">
    <div className="relative flex-1 max-w-md">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input type="text" placeholder={placeholder} value={value} onChange={onChange}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d2f6b]" />
    </div>
    {hasSearched && (
      <button onClick={onClear} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
);

// ─── Tables ───────────────────────────────────────────────────────────────────

const YearTable = ({ years, onEdit, onDelete, onSelect }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-200">
          <th className="text-left px-4 py-3 font-semibold text-gray-600 w-14">STT</th>
          <th className="text-left px-4 py-3 font-semibold text-gray-600">Tên năm học</th>
          <th className="text-left px-4 py-3 font-semibold text-gray-600">Ngày bắt đầu</th>
          <th className="text-left px-4 py-3 font-semibold text-gray-600">Ngày kết thúc</th>
          <th className="text-left px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
          <th className="text-center px-4 py-3 font-semibold text-gray-600">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {years.length === 0 ? (
          <tr><td colSpan={6} className="text-center py-12 text-gray-400">Chưa có năm học nào</td></tr>
        ) : years.map((y, i) => (
          <tr key={y.id} className="border-b border-gray-100 hover:bg-orange-50/40 transition-colors">
            <td className="px-4 py-3 text-gray-400">{i + 1}</td>
            <td className="px-4 py-3">
              <button onClick={() => onSelect(y)} className="font-medium text-[#3d2f6b] hover:underline cursor-pointer">
                {y.name}
              </button>
            </td>
            <td className="px-4 py-3 text-gray-600">{fmtDate(y.startDate)}</td>
            <td className="px-4 py-3 text-gray-600">{fmtDate(y.endDate)}</td>
            <td className="px-4 py-3"><StatusBadge startDate={y.startDate} endDate={y.endDate} /></td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                {new Date(y.startDate) > new Date() && <EditBtn onClick={() => onEdit(y)} />}
                <DeleteBtn onClick={() => onDelete(y)} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SemesterTable = ({ semesters, onEdit, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-200">
          <th className="text-left px-4 py-3 font-semibold text-gray-600 w-14">STT</th>
          <th className="text-left px-4 py-3 font-semibold text-gray-600">Tên học kỳ</th>
          <th className="text-left px-4 py-3 font-semibold text-gray-600">Ngày bắt đầu</th>
          <th className="text-left px-4 py-3 font-semibold text-gray-600">Ngày kết thúc</th>
          <th className="text-left px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
          <th className="text-center px-4 py-3 font-semibold text-gray-600">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {semesters.length === 0 ? (
          <tr><td colSpan={6} className="text-center py-12 text-gray-400">Chưa có học kỳ nào</td></tr>
        ) : semesters.map((s, i) => (
          <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-gray-400">{i + 1}</td>
            <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
            <td className="px-4 py-3 text-gray-600">{fmtDate(s.startDate)}</td>
            <td className="px-4 py-3 text-gray-600">{fmtDate(s.endDate)}</td>
            <td className="px-4 py-3"><StatusBadge startDate={s.startDate} endDate={s.endDate} /></td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-center gap-1">
                {new Date(s.startDate) > new Date() && <EditBtn onClick={() => onEdit(s)} />}
                <DeleteBtn onClick={() => onDelete(s)} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const Academic = () => {
  const {
    years, semesters, tab, setTab,
    selectedYearId, setSelectedYearId,
    selectedYear, currentSems,
    saveYear, deleteYear, selectYear,
    saveSem, deleteSem,
  } = useAcademicData();

  const [yearSearch, setYearSearch]     = useState("");
  const [yearSearched, setYearSearched] = useState(false);
  const [semSearch, setSemSearch]       = useState("");
  const [semSearched, setSemSearched]   = useState(false);

  const [yearModal, setYearModal]               = useState(null);
  const [semModal, setSemModal]                 = useState(null);
  const [deleteYearTarget, setDeleteYearTarget] = useState(null);
  const [deleteSemTarget, setDeleteSemTarget]   = useState(null);

  const filteredYears = yearSearched
    ? years.filter((y) => y.name.toLowerCase().includes(yearSearch.toLowerCase()))
    : years;

  const filteredSems = semSearched
    ? currentSems.filter((s) => s.name.toLowerCase().includes(semSearch.toLowerCase()))
    : currentSems;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full flex flex-col" style={{ minHeight: "calc(100vh - 8rem)" }}>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 shrink-0">
        {[
          { key: "year", label: "Năm học" },
          { key: "semester", label: selectedYear ? `Học kỳ (${selectedYear.name})` : "Học kỳ" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-7 py-4 text-sm font-semibold transition-colors cursor-pointer border-b-2
              ${tab === key ? "text-[#e07b39] border-[#e07b39] bg-orange-50" : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab Năm học */}
      {tab === "year" && (
        <div className="flex-1 flex flex-col p-5 gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <SearchBar
              value={yearSearch}
              onChange={(e) => { setYearSearch(e.target.value); if (!e.target.value) setYearSearched(false); }}
              onSearch={() => yearSearch && setYearSearched(true)}
              onClear={() => { setYearSearch(""); setYearSearched(false); }}
              placeholder="Tìm kiếm năm học..."
              hasSearched={yearSearched}
            />
            <button onClick={() => setYearModal("create")}
              className="bg-[#e07b39] hover:bg-[#c96b2e] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer shrink-0">
              + Tạo năm học
            </button>
          </div>
          {yearSearched && (
            <p className="text-xs text-gray-400 -mt-2">
              Tìm thấy <span className="font-medium text-gray-600">{filteredYears.length}</span> kết quả cho "{yearSearch}"
            </p>
          )}
          <div className="flex-1 border border-gray-100 rounded-lg overflow-auto">
            <YearTable years={filteredYears} onEdit={setYearModal} onDelete={setDeleteYearTarget} onSelect={selectYear} />
          </div>
        </div>
      )}

      {/* Tab Học kỳ */}
      {tab === "semester" && (
        <div className="flex-1 flex flex-col p-5 gap-4">
          <div className="shrink-0 flex items-end gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Năm học</label>
              <select
                value={selectedYearId ?? ""}
                onChange={(e) => { setSelectedYearId(e.target.value || null); setSemSearch(""); setSemSearched(false); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] cursor-pointer min-w-[180px]"
              >
                <option value="">-- Chọn năm học --</option>
                {years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
              </select>
            </div>
            {years.length === 0 && (
              <p className="text-sm text-gray-400 mb-1">
                Chưa có năm học nào.{" "}
                <button onClick={() => setTab("year")} className="text-[#e07b39] hover:underline cursor-pointer font-medium">Tạo năm học trước</button>
              </p>
            )}
          </div>

          {selectedYear ? (
            <>
              <div className="flex items-center gap-3 shrink-0">
                <SearchBar
                  value={semSearch}
                  onChange={(e) => { setSemSearch(e.target.value); if (!e.target.value) setSemSearched(false); }}
                  onSearch={() => semSearch && setSemSearched(true)}
                  onClear={() => { setSemSearch(""); setSemSearched(false); }}
                  placeholder={`Tìm học kỳ trong ${selectedYear.name}...`}
                  hasSearched={semSearched}
                />
                <button onClick={() => setSemModal("create")}
                  className="bg-[#e07b39] hover:bg-[#c96b2e] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer shrink-0">
                  + Tạo học kỳ
                </button>
              </div>
              {semSearched && (
                <p className="text-xs text-gray-400 -mt-2">
                  Tìm thấy <span className="font-medium text-gray-600">{filteredSems.length}</span> kết quả cho "{semSearch}"
                </p>
              )}
              <div className="flex-1 border border-gray-100 rounded-lg overflow-auto">
                <SemesterTable semesters={filteredSems} onEdit={setSemModal} onDelete={setDeleteSemTarget} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
              <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Vui lòng chọn năm học để xem học kỳ</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {yearModal && (
        <AcademicYearModal
          initial={yearModal === "create" ? null : yearModal}
          onClose={() => setYearModal(null)}
          onSave={(y) => saveYear(y, () => setYearModal(null))}
        />
      )}
      {semModal && selectedYear && (
        <SemesterModal
          yearName={selectedYear.name}
          initial={semModal === "create" ? null : semModal}
          onClose={() => setSemModal(null)}
          onSave={(s) => saveSem(s, selectedYear.id, () => setSemModal(null))}
        />
      )}
      {deleteYearTarget && (
        <ConfirmModal
          label={deleteYearTarget.name}
          onClose={() => setDeleteYearTarget(null)}
          onConfirm={() => { deleteYear(deleteYearTarget.id); setDeleteYearTarget(null); }}
        />
      )}
      {deleteSemTarget && (
        <ConfirmModal
          label={deleteSemTarget.name}
          onClose={() => setDeleteSemTarget(null)}
          onConfirm={() => { deleteSem(deleteSemTarget.id, selectedYear.id); setDeleteSemTarget(null); }}
        />
      )}
    </div>
  );
};

export default Academic;