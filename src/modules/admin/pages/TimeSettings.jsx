import { useLocalStorage } from "../hooks/useLocalStorage";
import { useTimeSettings } from "../hooks/useTimeSettings";
import { COURSES, LS_KEYS, fmtDateTime } from "../constants/admin.constants";
import ConfirmModal from "../components/ConfirmModal";
import { EditBtn, DeleteBtn, ViewBtn } from "../components/IconButtons";

// ─── TimeRangeField ───────────────────────────────────────────────────────────

const TimeRangeField = ({ label, fromValue, toValue, onFromChange, onToChange }) => (
  <div className="space-y-2">
    <p className="text-sm font-medium text-gray-800">{label} <span className="text-red-500">*</span></p>
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 shrink-0">Từ:</span>
      <input type="datetime-local" value={fromValue} onChange={onFromChange}
        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] min-w-0 flex-1" />
      <span className="text-sm text-gray-600 shrink-0">Đến:</span>
      <input type="datetime-local" value={toValue} onChange={onToChange}
        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] min-w-0 flex-1" />
    </div>
  </div>
);

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const DetailModal = ({ setting, onClose }) => {
  const rows = [
    { role: "Sinh viên tự đánh giá", from: setting.studentFrom, to: setting.studentTo },
    { role: "Ban cán sự đánh giá",   from: setting.classLeaderFrom, to: setting.classLeaderTo },
    { role: "Khoa duyệt",            from: setting.facultyFrom, to: setting.facultyTo },
    { role: "GVCN xem xét",          from: setting.teacherFrom, to: setting.teacherTo },
  ];
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-800">Chi tiết cài đặt thời gian</h3>
            <p className="text-xs text-gray-400 mt-0.5">{setting.academicYearName} — {setting.semesterName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-purple-50 border border-purple-100 text-[#3d2f6b] text-sm font-semibold rounded-full">{setting.academicYearName}</span>
            <span className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium rounded-full">{setting.semesterName}</span>
            {setting.courses.map((c) => (
              <span key={c} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">Khóa {c}</span>
            ))}
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Đối tượng</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Bắt đầu</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Kết thúc</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.role} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-800">{r.role}</td>
                    <td className="px-4 py-3 text-gray-600">{fmtDateTime(r.from)}</td>
                    <td className="px-4 py-3 text-gray-600">{fmtDateTime(r.to)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">Đóng</button>
        </div>
      </div>
    </div>
  );
};

// ─── Settings Table ───────────────────────────────────────────────────────────

const SettingsTable = ({ settings, onView, onEdit, onDelete }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-200">
          <th className="text-left px-4 py-3 font-semibold text-gray-600 w-12">STT</th>
          <th className="text-left px-4 py-3 font-semibold text-gray-600">Năm học</th>
          <th className="text-left px-4 py-3 font-semibold text-gray-600">Học kỳ</th>
          <th className="text-left px-4 py-3 font-semibold text-gray-600">Khóa áp dụng</th>
          <th className="text-left px-4 py-3 font-semibold text-gray-600">Thời gian SV</th>
          <th className="text-left px-4 py-3 font-semibold text-gray-600">Thời gian GVCN</th>
          <th className="text-center px-4 py-3 font-semibold text-gray-600">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {settings.length === 0 ? (
          <tr><td colSpan={7} className="text-center py-12 text-gray-400">Chưa có đợt cài đặt nào</td></tr>
        ) : settings.map((s, i) => (
          <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
            <td className="px-4 py-3 text-gray-400">{i + 1}</td>
            <td className="px-4 py-3 font-semibold text-[#3d2f6b]">{s.academicYearName}</td>
            <td className="px-4 py-3 text-gray-700">{s.semesterName}</td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-1">
                {s.courses.map((c) => (
                  <span key={c} className="px-2 py-0.5 bg-purple-50 text-[#3d2f6b] text-xs rounded-full font-medium border border-purple-100">{c}</span>
                ))}
              </div>
            </td>
            <td className="px-4 py-3 text-xs text-gray-600">
              <div className="font-medium">{fmtDateTime(s.studentFrom)}</div>
              <div className="text-gray-400 mt-0.5">→ {fmtDateTime(s.studentTo)}</div>
            </td>
            <td className="px-4 py-3 text-xs text-gray-600">
              <div className="font-medium">{fmtDateTime(s.teacherFrom)}</div>
              <div className="text-gray-400 mt-0.5">→ {fmtDateTime(s.teacherTo)}</div>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-center gap-1">
                <ViewBtn onClick={() => onView(s)} />
                <EditBtn onClick={() => onEdit(s)} />
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

const TimeSettings = () => {
  const [years]        = useLocalStorage(LS_KEYS.YEARS, []);
  const [allSemesters] = useLocalStorage(LS_KEYS.SEMESTERS, {});

  const {
    settings, form, editingId, editingRecord, formErr, toastMsg,
    viewTarget, setViewTarget, deleteTarget, setDeleteTarget,
    semestersForYear, selectedYear, formRef,
    setField, handleYearChange, toggleCourse,
    startEdit, cancelEdit, handleSave, confirmDelete,
  } = useTimeSettings(years, allSemesters);

  const WarnBox = ({ msg }) => (
    <div className="flex items-center gap-1.5 mt-1.5">
      <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <p className="text-xs text-amber-600">{msg}</p>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 w-full space-y-10">

      {/* ── Form ── */}
      <div ref={formRef}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingId ? "Cập nhật cài đặt thời gian" : "Cài đặt thời gian chấm điểm"}
          </h2>
          {editingId && (
            <button onClick={cancelEdit} className="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">✕ Hủy chỉnh sửa</button>
          )}
        </div>

        {editingId && editingRecord && (
          <div className="mb-6 mt-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-700">
              Đang chỉnh sửa: <span className="font-semibold">{editingRecord.academicYearName} — {editingRecord.semesterName}</span>
            </p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8 mt-6">
          <div className="flex flex-wrap gap-x-8 gap-y-5 items-end">

            {/* Năm học */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Năm học <span className="text-red-500">*</span></label>
              {years.length === 0 ? (
                <>
                  <select disabled className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-400 bg-gray-50 cursor-not-allowed w-48"><option>Chưa có năm học</option></select>
                  <WarnBox msg="Tạo năm học ở tab Học kì & Năm học trước" />
                </>
              ) : (
                <select value={form.academicYearId} onChange={handleYearChange}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] cursor-pointer w-48">
                  <option value="">Chọn năm học</option>
                  {years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
                </select>
              )}
            </div>

            {/* Học kỳ */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Học kỳ <span className="text-red-500">*</span></label>
              {!form.academicYearId ? (
                <select disabled className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-400 bg-gray-50 cursor-not-allowed w-48"><option>Chọn năm học trước</option></select>
              ) : semestersForYear.length === 0 ? (
                <>
                  <select disabled className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-400 bg-gray-50 cursor-not-allowed w-48"><option>Chưa có học kỳ</option></select>
                  <WarnBox msg={`Tạo học kỳ cho ${selectedYear?.name}`} />
                </>
              ) : (
                <select value={form.semesterId} onChange={setField("semesterId")}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] cursor-pointer w-48">
                  <option value="">Chọn học kỳ</option>
                  {semestersForYear.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}
            </div>

            {/* Khóa */}
            <div>
              <p className="text-sm font-medium text-gray-800 mb-1.5">Khóa áp dụng <span className="text-red-500">*</span></p>
              <div className="flex items-center gap-5">
                {[...COURSES, "Tất cả"].map((c) => (
                  <label key={c} className="flex items-center gap-1.5 cursor-pointer select-none text-sm text-gray-700">
                    <input type="checkbox"
                      checked={c === "Tất cả" ? form.courses.length === COURSES.length : form.courses.includes(c)}
                      onChange={() => toggleCourse(c)}
                      className="w-4 h-4 accent-[#3d2f6b] cursor-pointer" />
                    {c}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-7">
            <TimeRangeField label="Thời gian chấm điểm của sinh viên"
              fromValue={form.studentFrom}     toValue={form.studentTo}
              onFromChange={setField("studentFrom")}     onToChange={setField("studentTo")} />
            <TimeRangeField label="Thời gian duyệt bảng điểm của Khoa"
              fromValue={form.facultyFrom}     toValue={form.facultyTo}
              onFromChange={setField("facultyFrom")}     onToChange={setField("facultyTo")} />
            <TimeRangeField label="Thời gian xem xét bảng điểm của ban cán sự"
              fromValue={form.classLeaderFrom} toValue={form.classLeaderTo}
              onFromChange={setField("classLeaderFrom")} onToChange={setField("classLeaderTo")} />
            <TimeRangeField label="Thời gian xem xét chấm điểm của GVCN"
              fromValue={form.teacherFrom}     toValue={form.teacherTo}
              onFromChange={setField("teacherFrom")}     onToChange={setField("teacherTo")} />
          </div>

          {formErr && (
            <p className="text-sm text-red-500 flex items-center gap-1.5">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formErr}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            {editingId && (
              <button type="button" onClick={cancelEdit}
                className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
                Hủy
              </button>
            )}
            <button type="submit"
              className="bg-[#e07b39] hover:bg-[#c96b2e] text-white font-semibold px-10 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm">
              {editingId ? "Cập nhật" : "Cài đặt"}
            </button>
          </div>
        </form>
      </div>

      <div className="border-t border-gray-100" />

      {/* ── Table ── */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-bold text-gray-800">Danh sách đợt cài đặt</h3>
          <p className="text-xs text-gray-400 mt-0.5">{settings.length} đợt cài đặt</p>
        </div>
        <SettingsTable settings={settings} onView={setViewTarget} onEdit={startEdit} onDelete={setDeleteTarget} />
      </div>

      {/* Modals */}
      {viewTarget && <DetailModal setting={viewTarget} onClose={() => setViewTarget(null)} />}
      {deleteTarget && (
        <ConfirmModal
          label={`${deleteTarget.academicYearName} — ${deleteTarget.semesterName}`}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {toastMsg}
        </div>
      )}
    </div>
  );
};

export default TimeSettings;