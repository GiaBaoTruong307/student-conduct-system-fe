import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FACULTY_CLASSES,
  FACULTY_APPROVED_KEY,
  GVCN_SUBMITTED_KEY,
} from "../constants/facultyStaff.constants";
import { useRoleFilter } from "../../../hooks/useRoleFilter";
import { ROLES } from "../../../utils/role";

const ADMIN_LS_KEYS = { YEARS: "admin_academic_years", SEMESTERS: "admin_academic_semesters" };

const readLS = (key, def) => {
  try { const r = localStorage.getItem(key); return r !== null ? JSON.parse(r) : def; }
  catch { return def; }
};
const writeLS = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

const ApproveConfirmModal = ({ classItem, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Xác nhận phê duyệt</h2>
      </div>
      <div className="px-6 py-5 space-y-3">
        <p className="text-gray-700">
          Bạn có chắc muốn phê duyệt bảng điểm lớp{" "}
          <span className="font-bold text-[#3d2f6b]">{classItem.tenLop}</span>?
        </p>
        <p className="text-sm text-gray-500">
          GVCN: <span className="font-medium">{classItem.gvcn}</span>
        </p>
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Sau khi phê duyệt, thao tác này không thể hoàn tác.
        </p>
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="px-5 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Hủy
        </button>
        <button
          onClick={onConfirm}
          className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Xác nhận phê duyệt
        </button>
      </div>
    </div>
  </div>
);

const FacultyBangDiemKhoa = () => {
  const navigate = useNavigate();

  const allYears     = readLS(ADMIN_LS_KEYS.YEARS, []);
  const allSemesters = readLS(ADMIN_LS_KEYS.SEMESTERS, {});

  const [filter, updateFilter] = useRoleFilter(ROLES.FACULTY_STAFF, {
    yearId: "",
    semesterId: "",
    classId: "",
  });

  const selectedYearId     = filter.yearId;
  const selectedSemesterId = filter.semesterId;
  const filterClassId      = filter.classId;

  const semesters    = selectedYearId ? (allSemesters[selectedYearId] ?? []) : [];
  const selectedYear = allYears.find((y) => y.id === selectedYearId) ?? null;

  const handleYearChange = (yearId) => {
    updateFilter({ yearId, semesterId: "" });
  };

  const hasData = !!selectedYearId && !!selectedSemesterId;

  const [gvcnSubmitted, setGvcnSubmitted] = useState(() => readLS(GVCN_SUBMITTED_KEY, {}));
  const [approved, setApproved]           = useState(() => readLS(FACULTY_APPROVED_KEY, {}));

  const [approveTarget, setApproveTarget] = useState(null);
  const openApproveModal  = (classId) => setApproveTarget(classId);
  const closeApproveModal = () => setApproveTarget(null);

  const getPeriodKey = (classId) =>
    hasData ? `${classId}_${selectedYearId}_${selectedSemesterId}` : "";

  const handleConfirmApprove = () => {
    if (!approveTarget || !hasData) return;
    const key = getPeriodKey(approveTarget);
    const updated = { ...approved, [key]: true };
    setApproved(updated);
    writeLS(FACULTY_APPROVED_KEY, updated);
    setApproveTarget(null);
  };

  const handleViewClass = (classId) => {
    if (!hasData) return;
    const fresh = readLS(GVCN_SUBMITTED_KEY, {});
    setGvcnSubmitted(fresh);
    const key = getPeriodKey(classId);
    if (!fresh[key]) return;
    navigate(
      `/faculty-staff/bang-diem-khoa/${classId}?yearId=${selectedYearId}&semId=${selectedSemesterId}`
    );
  };

  const filteredClasses = useMemo(() => {
    if (!filterClassId) return FACULTY_CLASSES;
    return FACULTY_CLASSES.filter((c) => c.id === filterClassId);
  }, [filterClassId]);

  const approveClass = approveTarget ? FACULTY_CLASSES.find((c) => c.id === approveTarget) : null;

  return (
    <div className="space-y-4 md:space-y-6">

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">

          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chọn năm học cần tra cứu điểm
            </label>
            <select
              value={selectedYearId}
              onChange={(e) => handleYearChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] bg-white cursor-pointer"
            >
              <option value="">-- Chọn năm học --</option>
              {allYears.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chọn học kỳ cần tra cứu điểm
            </label>
            <select
              value={selectedSemesterId}
              onChange={(e) => updateFilter({ semesterId: e.target.value })}
              disabled={!selectedYearId}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] bg-white cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-default"
            >
              <option value="">-- Chọn học kỳ --</option>
              {semesters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chọn lớp cần tra cứu điểm
            </label>
            <select
              value={filterClassId}
              onChange={(e) => updateFilter({ classId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] bg-white cursor-pointer"
            >
              <option value="">Chọn lớp</option>
              {FACULTY_CLASSES.map((c) => <option key={c.id} value={c.id}>{c.tenLop}</option>)}
            </select>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800">Chưa có dữ liệu bảng điểm</h3>
              {!selectedYearId ? (
                <p className="text-sm md:text-base text-gray-600 max-w-md">
                  Vui lòng chọn{" "}
                  <span className="font-semibold text-[#3d2f6b]">năm học</span> và{" "}
                  <span className="font-semibold text-[#3d2f6b]">học kỳ</span> để xem bảng điểm.
                </p>
              ) : (
                <p className="text-sm md:text-base text-gray-600 max-w-md">
                  Vui lòng chọn{" "}
                  <span className="font-semibold text-[#3d2f6b]">học kỳ</span> để xem bảng điểm năm học{" "}
                  <span className="font-semibold text-[#3d2f6b]">{selectedYear?.name}</span>.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-200">Tên lớp</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-200">GVCN</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-48">Trạng thái</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-40"></th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.map((cls) => {
                  const periodKey = getPeriodKey(cls.id);
                  const gvcnDone  = !!gvcnSubmitted[periodKey];
                  const khoaDone  = !!approved[periodKey];
                  return (
                    <tr key={cls.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800 border-r border-gray-100">{cls.tenLop}</td>
                      <td className="px-4 py-3 text-gray-600 border-r border-gray-100">{cls.gvcn}</td>

                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        {khoaDone ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Khoa đã duyệt
                          </span>
                        ) : gvcnDone ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                            GVCN Đã duyệt
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">...</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        {gvcnDone && !khoaDone && (
                          <button
                            onClick={() => openApproveModal(cls.id)}
                            className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            Phê duyệt
                          </button>
                        )}
                        {khoaDone && (
                          <span className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-lg inline-block">
                            ✓ Đã phê duyệt
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {gvcnDone ? (
                          <button
                            onClick={() => handleViewClass(cls.id)}
                            className="text-[#3d2f6b] hover:underline font-medium cursor-pointer text-sm"
                          >
                            xem
                          </button>
                        ) : (
                          <span className="text-gray-300 text-sm">xem</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {approveTarget && approveClass && (
        <ApproveConfirmModal
          classItem={approveClass}
          onConfirm={handleConfirmApprove}
          onCancel={closeApproveModal}
        />
      )}
    </div>
  );
};

export default FacultyBangDiemKhoa;