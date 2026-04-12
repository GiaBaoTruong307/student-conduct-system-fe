import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { classMembers } from "../../classLeader/constants/classMembers";
import { PCTSV_CLASSES } from "../constants/studentAffairs.constants";
import { useScoreContext } from "../../../context/ScoreContext";

const ADMIN_LS_KEYS = {
  YEARS: "admin_academic_years",
  SEMESTERS: "admin_academic_semesters",
  CRITERIA: "admin_criteria_sections",
};

const GVCN_ALL_DATA_KEY = "gvcnAllData";

const readLS = (key, def) => {
  try { const r = localStorage.getItem(key); return r !== null ? JSON.parse(r) : def; }
  catch { return def; }
};

const fakeSelfScores = [null,88,89,85,90,83,78,89,87,87,76,77,80,70,88,83,92,87,86,78,79,92,83];
const fakeGvcnScores = [null,85,87,80,88,78,77,85,85,77,75,80,70,88,80,90,85,86,75,80,90,83,85];

const computeGvcnTotal = (savedScores, selfScores, adminCriteria) => {
  if (!adminCriteria || adminCriteria.length === 0) return null;
  const sorted = [...adminCriteria].sort((a, b) => {
    if (a.number && b.number) return a.number - b.number;
    if (a.number) return -1;
    if (b.number) return 1;
    return 0;
  });
  let total = 0;
  sorted.forEach((sec, sectionIdx) => {
    (sec.criteria || []).forEach((cr, ci) => {
      const subs = cr.subCriteria || [];
      const items = subs.length > 0 ? subs : [cr];
      items.forEach((item, ii) => {
        if (item.isAutoUpdate) return;
        const key = `${sectionIdx}-${ci}-${ii}`;
        const score =
          savedScores[key] !== undefined ? savedScores[key] : selfScores[key];
        if (score !== undefined && score !== "" && score !== null)
          total += Number(score);
      });
    });
  });
  return total;
};

const PctsvClassScoreBoard = () => {
  const { classId } = useParams();
  const navigate    = useNavigate();
  const [searchParams] = useSearchParams();

  const classInfo = PCTSV_CLASSES.find((c) => c.id === classId);

  const allYears      = readLS(ADMIN_LS_KEYS.YEARS, []);
  const allSemesters  = readLS(ADMIN_LS_KEYS.SEMESTERS, {});
  const adminCriteria = readLS(ADMIN_LS_KEYS.CRITERIA, []);

  const [selectedYearId,     setSelectedYearId]     = useState(searchParams.get("yearId") ?? "");
  const [selectedSemesterId, setSelectedSemesterId] = useState(searchParams.get("semId")  ?? "");

  const semesters    = selectedYearId ? (allSemesters[selectedYearId] ?? []) : [];
  const selectedYear = allYears.find((y) => y.id === selectedYearId) ?? null;

  const handleYearChange = (yearId) => {
    setSelectedYearId(yearId);
    setSelectedSemesterId("");
  };

  const hasData   = !!selectedYearId && !!selectedSemesterId;
  const periodKey = hasData ? `${selectedYearId}_${selectedSemesterId}` : null;

  const { getStudentPeriodData } = useScoreContext();

  const getSelfScore = (member, idx) => {
    if (!hasData) return "-";
    if (member.isLinkedToStudent) {
      return getStudentPeriodData(selectedYearId, selectedSemesterId).total || 0;
    }
    return fakeSelfScores[idx] ?? "-";
  };

  const getGvcnScore = (member, idx) => {
    if (!hasData) return "-";
    const gvcnAll = readLS(GVCN_ALL_DATA_KEY, {});
    const data = (gvcnAll[periodKey] ?? {})[member.mssv];

    if (member.isLinkedToStudent) {
      const savedScores = data?.savedScores ?? {};
      const selfScores  = getStudentPeriodData(selectedYearId, selectedSemesterId).savedScores ?? {};
      if (Object.keys(savedScores).length > 0 || Object.keys(selfScores).length > 0) {
        const computed = computeGvcnTotal(savedScores, selfScores, adminCriteria);
        if (computed !== null) return computed;
      }
      if (data?.total !== undefined && data.total >= 0) return data.total;
      const svTotal = getStudentPeriodData(selectedYearId, selectedSemesterId).total || 0;
      return svTotal > 0 ? svTotal : "-";
    }

    if (data?.total !== undefined && data.total > 0) return data.total;
    return fakeGvcnScores[idx] ?? "-";
  };

  const handleViewDetail = (mssv) => {
    navigate(
      `/student-affairs-staff/bang-diem-sv/${classId}/student/${mssv}?yearId=${selectedYearId}&semId=${selectedSemesterId}`
    );
  };

  if (!classInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-4">
        <p className="text-gray-500">Không tìm thấy lớp học.</p>
        <button
          onClick={() => navigate("/student-affairs-staff/bang-diem-sv")}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer text-sm"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

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
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              disabled={!selectedYearId}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] bg-white cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-default"
            >
              <option value="">-- Chọn học kỳ --</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="md:flex md:items-end">
            <button
              onClick={() => navigate("/student-affairs-staff/bang-diem-sv")}
              className="w-full md:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-5 py-3 flex items-center gap-3">
        <span className="font-bold text-[#3d2f6b] text-base">Lớp {classInfo.tenLop}</span>
        <span className="text-gray-400">·</span>
        <span className="text-gray-600 text-sm">
          Cán bộ Khoa phụ trách:{" "}
          <span className="font-medium text-gray-800">{classInfo.canBoKhoa}</span>
        </span>
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
                  Vui lòng chọn <span className="font-semibold text-[#3d2f6b]">năm học</span> và{" "}
                  <span className="font-semibold text-[#3d2f6b]">học kỳ</span> để xem bảng điểm lớp.
                </p>
              ) : (
                <p className="text-sm md:text-base text-gray-600 max-w-md">
                  Vui lòng chọn <span className="font-semibold text-[#3d2f6b]">học kỳ</span> để xem bảng điểm năm học{" "}
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
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-36">MSSV</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-200">Họ và tên</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-32">Ngày sinh</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-36">Điểm SV đánh giá</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-36">Điểm GVCN đánh giá</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 w-24">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {classMembers.map((member, idx) => {
                  const selfScore = getSelfScore(member, idx);
                  const gvcnScore = getGvcnScore(member, idx);
                  return (
                    <tr key={member.mssv} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100 font-mono text-xs">
                        {member.mssv}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-100">
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-800">{member.ho}</span>
                          <span className="text-gray-800 font-medium w-20 text-right">{member.ten}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100">
                        {member.ngaySinh}
                      </td>
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span className="font-semibold text-[#3d2f6b]">{selfScore}</span>
                      </td>
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span className="font-semibold text-emerald-700">{gvcnScore}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleViewDetail(member.mssv)}
                          className="text-[#3d2f6b] hover:underline font-medium cursor-pointer"
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
        </div>
      )}
    </div>
  );
};

export default PctsvClassScoreBoard;