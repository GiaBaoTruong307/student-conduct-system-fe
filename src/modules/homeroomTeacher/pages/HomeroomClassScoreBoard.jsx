import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { classMembers } from "../../classLeader/constants/classMembers";
import { useScoreContext } from "../../../context/ScoreContext";
import { useTimeWindow } from "../../../hooks/useTimeWindow";

const ADMIN_LS_KEYS = {
  YEARS: "admin_academic_years",
  SEMESTERS: "admin_academic_semesters",
};

const GVCN_SCORES_KEY  = "gvcnScoresByMssv";
const GVCN_CHECKED_KEY = "gvcnBoardChecked";

const readLS = (key, def) => {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : def;
  } catch {
    return def;
  }
};

const fakeSelfScores = [
  null, 88, 89, 85, 90, 83, 78, 89, 87, 87, 76, 77, 80, 70, 88, 83, 92, 87,
  86, 78, 79, 92, 83,
];

const HomeroomClassScoreBoard = () => {
  const navigate = useNavigate();

  const allYears     = readLS(ADMIN_LS_KEYS.YEARS, []);
  const allSemesters = readLS(ADMIN_LS_KEYS.SEMESTERS, {});

  const [selectedYearId,     setSelectedYearId]     = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");

  const semesters        = selectedYearId ? (allSemesters[selectedYearId] ?? []) : [];
  const selectedYear     = allYears.find((y) => y.id === selectedYearId)         ?? null;
  const selectedSemester = semesters.find((s) => s.id === selectedSemesterId)    ?? null;

  const handleYearChange = (yearId) => {
    setSelectedYearId(yearId);
    setSelectedSemesterId("");
  };

  const { studentSelfTotal } = useScoreContext();
  const [gvcnScores] = useState(() => readLS(GVCN_SCORES_KEY, {}));

  const [checked, setChecked] = useState(() => {
    try {
      const raw = localStorage.getItem(GVCN_CHECKED_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const hasData    = !!selectedYearId && !!selectedSemesterId;
  const timeWindow = useTimeWindow(selectedYearId, selectedSemesterId, "teacher");
  const canEdit    = !hasData ? false : timeWindow.canEdit;

  const toggleChecked = (mssv) => {
    if (!canEdit) return;
    setChecked((prev) => {
      const updated = { ...prev, [mssv]: !prev[mssv] };
      localStorage.setItem(GVCN_CHECKED_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const getSelfScore = (member, idx) => {
    if (!hasData) return "-";
    if (member.isLinkedToStudent) return studentSelfTotal || 0;
    return fakeSelfScores[idx] ?? "-";
  };

  const getGvcnScore = (member) => {
    if (!hasData) return "-";
    const data = gvcnScores[member.mssv];
    if (data && data.total !== undefined && data.total > 0) return data.total;
    return "-";
  };

  const handleViewDetail = (mssv) => {
    navigate(
      `/homeroom-teacher/class-score/${mssv}?yearId=${selectedYearId}&semId=${selectedSemesterId}`
    );
  };

  const renderFilterAction = () => {
    if (!hasData) {
      return (
        <button
          disabled
          className="w-full md:w-auto px-6 py-2.5 bg-amber-400 text-white font-semibold rounded-lg opacity-50 cursor-not-allowed"
        >
          Xác nhận điểm
        </button>
      );
    }

    const { status, startTime, endTime } = timeWindow;

    if (status === "no-setting") {
      return (
        <div className="flex flex-col items-start md:items-end gap-0.5 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg">
          <span className="text-sm font-semibold text-gray-600">Chưa có thời gian xem xét được thiết lập</span>
          <span className="text-xs text-gray-400">Vui lòng chờ admin cài đặt thời gian</span>
        </div>
      );
    }

    if (status === "before") {
      return (
        <div className="flex flex-col items-start md:items-end gap-0.5 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
          <span className="text-sm font-semibold text-amber-700">Chưa tới thời gian xem xét</span>
          {startTime && <span className="text-xs text-amber-600">Bắt đầu từ: {startTime}</span>}
        </div>
      );
    }

    if (status === "after") {
      return (
        <div className="flex flex-col items-start md:items-end gap-0.5 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-sm font-semibold text-red-700">Đã hết thời gian xem xét</span>
          {endTime && <span className="text-xs text-red-500">Kết thúc lúc: {endTime}</span>}
        </div>
      );
    }

    // "active"
    return (
      <button
        disabled
        className="w-full md:w-auto px-6 py-2.5 bg-amber-400 text-white font-semibold rounded-lg opacity-50 cursor-not-allowed"
      >
        Xác nhận điểm
      </button>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chọn năm học cần tra cứu điểm
            </label>
            <select
              value={selectedYearId}
              onChange={(e) => handleYearChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] focus:border-transparent bg-white cursor-pointer"
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] focus:border-transparent bg-white cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-default"
            >
              <option value="">-- Chọn học kỳ --</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="md:flex md:items-end">
            {renderFilterAction()}
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
                  <span className="font-semibold text-[#3d2f6b]">học kỳ</span> để xem bảng điểm lớp.
                </p>
              ) : (
                <p className="text-sm md:text-base text-gray-600 max-w-md">
                  Vui lòng chọn{" "}
                  <span className="font-semibold text-[#3d2f6b]">học kỳ</span> để xem bảng điểm lớp năm học{" "}
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
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-32">Điểm SV đánh giá</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-32">Điểm GVCN đánh giá</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-36">Tình trạng xử lý</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 w-24">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {classMembers.map((member, idx) => {
                  const selfScore = getSelfScore(member, idx);
                  const gvcnScore = getGvcnScore(member);
                  const isChecked = !!checked[member.mssv];
                  return (
                    <tr
                      key={member.mssv}
                      className={`border-b border-gray-100 transition-colors ${
                        isChecked ? "bg-green-50" : "hover:bg-gray-50"
                      }`}
                    >
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
                        <span className={`font-semibold ${
                          member.isLinkedToStudent && selfScore > 0 ? "text-[#3d2f6b]" : "text-gray-700"
                        }`}>
                          {selfScore}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span className={`font-semibold ${
                          gvcnScore !== "-" && gvcnScore > 0 ? "text-emerald-700" : "text-gray-400"
                        }`}>
                          {gvcnScore}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleChecked(member.mssv)}
                          disabled={!canEdit}
                          className={`w-4 h-4 accent-[#3d2f6b] ${
                            canEdit ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                          }`}
                        />
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

export default HomeroomClassScoreBoard;