import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PCTSV_CLASSES,
  PCTSV_FACULTIES,
  PCTSV_APPROVED_KEY,
  FACULTY_APPROVED_KEY,
} from "../constants/studentAffairs.constants";
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
          Cán bộ Khoa phụ trách:{" "}
          <span className="font-medium">{classItem.canBoKhoa}</span>
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

const PctsvBangDiemSV = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isLeader = pathname.startsWith("/student-affairs-leader");
  const _base    = isLeader ? "/student-affairs-leader" : "/student-affairs-staff";
  const _role    = isLeader ? ROLES.STUDENT_AFFAIRS_LEADER : ROLES.STUDENT_AFFAIRS_STAFF;

  const allYears     = readLS(ADMIN_LS_KEYS.YEARS, []);
  const allSemesters = readLS(ADMIN_LS_KEYS.SEMESTERS, {});

  const [filter, updateFilter] = useRoleFilter(_role, {
    semesterId: "",
    yearId: "",
    khoaId: "",
  });

  const selectedSemesterId = filter.semesterId;
  const selectedYearId     = filter.yearId;
  const filterKhoaId       = filter.khoaId;

  const semesters    = selectedYearId ? (allSemesters[selectedYearId] ?? []) : [];
  const selectedYear = allYears.find((y) => y.id === selectedYearId) ?? null;

  const handleYearChange     = (yearId) => updateFilter({ yearId, semesterId: "" });
  const handleSemesterChange = (semId)  => updateFilter({ semesterId: semId });

  const hasData = !!selectedYearId && !!selectedSemesterId;

  const [facultyApproved, setFacultyApproved] = useState(() => readLS(FACULTY_APPROVED_KEY, {}));
  const [pctsvApproved,   setPctsvApproved]   = useState(() => readLS(PCTSV_APPROVED_KEY, {}));

  const [approveTarget, setApproveTarget] = useState(null);
  const openApproveModal  = (classId) => setApproveTarget(classId);
  const closeApproveModal = () => setApproveTarget(null);

  const getPeriodKey = (classId) =>
    hasData ? `${classId}_${selectedYearId}_${selectedSemesterId}` : "";

  const handleConfirmApprove = () => {
    if (!approveTarget || !hasData) return;
    const key = getPeriodKey(approveTarget);
    const updated = { ...pctsvApproved, [key]: true };
    setPctsvApproved(updated);
    writeLS(PCTSV_APPROVED_KEY, updated);
    setApproveTarget(null);
  };

  const handleViewClass = (classId) => {
    if (!hasData) return;
    const freshFaculty = readLS(FACULTY_APPROVED_KEY, {});
    setFacultyApproved(freshFaculty);
    const key = getPeriodKey(classId);
    if (!freshFaculty[key]) return;
    navigate(`${_base}/bang-diem-sv/${classId}?yearId=${selectedYearId}&semId=${selectedSemesterId}`);
  };

  const filteredClasses = useMemo(() => {
    if (!filterKhoaId) return PCTSV_CLASSES;
    return PCTSV_CLASSES.filter((c) => c.khoaId === filterKhoaId);
  }, [filterKhoaId]);

  const approveClass = approveTarget
    ? PCTSV_CLASSES.find((c) => c.id === approveTarget)
    : null;

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
              {allYears.map((y) => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chọn học kỳ cần tra cứu điểm
            </label>
            <select
              value={selectedSemesterId}
              onChange={(e) => handleSemesterChange(e.target.value)}
              disabled={!selectedYearId}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] bg-white cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-default"
            >
              <option value="">-- Chọn học kỳ --</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chọn Khoa cần tra cứu điểm
            </label>
            <select
              value={filterKhoaId}
              onChange={(e) => updateFilter({ khoaId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] bg-white cursor-pointer"
            >
              <option value="">Chọn khoa trực thuộc</option>
              {PCTSV_FACULTIES.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
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
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-200">Cán bộ Khoa phụ trách</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-48">Trạng thái</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-40"></th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.map((cls) => {
                  const periodKey = getPeriodKey(cls.id);
                  const khoaDone  = !!facultyApproved[periodKey];
                  const pctsvDone = !!pctsvApproved[periodKey];
                  return (
                    <tr key={cls.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800 border-r border-gray-100">
                        {cls.tenLop}
                      </td>
                      <td className="px-4 py-3 text-gray-600 border-r border-gray-100">
                        {cls.canBoKhoa}
                      </td>

                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        {pctsvDone ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            PCTSV đã duyệt
                          </span>
                        ) : khoaDone ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                            Khoa Đã duyệt
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">...</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        {khoaDone && !pctsvDone && (
                          <button
                            onClick={() => openApproveModal(cls.id)}
                            className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            Phê duyệt
                          </button>
                        )}
                        {pctsvDone && (
                          <span className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-lg inline-block">
                            ✓ Đã phê duyệt
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {khoaDone ? (
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

export default PctsvBangDiemSV;