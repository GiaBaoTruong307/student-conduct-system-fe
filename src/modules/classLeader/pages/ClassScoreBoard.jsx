import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { classMembers } from "../constants/classMembers";
import { useScoreContext } from "../../../context/ScoreContext";

const SEMESTERS = ["Kỳ I", "Kỳ II"];
const YEARS = ["2024-2025", "2025-2026", "2026-2027"];

const CHECKED_KEY = "classBoardChecked";

const fakeSelfScores = [
  null, 88, 89, 85, 90, 83, 78, 89, 87, 87, 76, 77, 80, 70, 88, 83, 92, 87,
  86, 78, 79, 92, 83,
];

const ClassScoreBoard = () => {
  const navigate = useNavigate();
  const [selectedSemester, setSelectedSemester] = useState("Kỳ II");
  const [selectedYear, setSelectedYear] = useState("2025-2026");

  // Init checked từ localStorage để persist qua reload/logout
  const [checked, setChecked] = useState(() => {
    try {
      const raw = localStorage.getItem(CHECKED_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const { studentSelfTotal, reviewerScoresByMssv } = useScoreContext();

  const hasData = selectedSemester === "Kỳ II" && selectedYear === "2025-2026";

  const toggleChecked = (mssv) => {
    setChecked((prev) => {
      const updated = { ...prev, [mssv]: !prev[mssv] };
      localStorage.setItem(CHECKED_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const getSelfScore = (member, idx) => {
    if (!hasData) return "-";
    if (member.isLinkedToStudent) return studentSelfTotal || 0;
    return fakeSelfScores[idx] ?? "-";
  };

  const getReviewerScore = (member) => {
    if (!hasData) return "-";
    const data = reviewerScoresByMssv[member.mssv];
    if (data && data.total !== undefined) return data.total;
    return 0;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filter + Gửi duyệt */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chọn học kỳ cần tra cứu điểm
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] focus:border-transparent bg-white cursor-pointer"
            >
              {SEMESTERS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chọn năm học cần tra cứu điểm
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] focus:border-transparent bg-white cursor-pointer"
            >
              {YEARS.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="md:flex md:items-end">
            <button
              disabled
              className="w-full md:w-auto px-6 py-2.5 bg-amber-400 text-white font-semibold rounded-lg opacity-50 cursor-not-allowed"
            >
              Gửi duyệt
            </button>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                Chưa có dữ liệu bảng điểm
              </h3>
              <p className="text-sm md:text-base text-gray-600 max-w-md">
                Hiện tại chưa có dữ liệu điểm rèn luyện cho{" "}
                <span className="font-semibold text-[#3d2f6b]">
                  {selectedSemester}
                </span>{" "}
                năm học{" "}
                <span className="font-semibold text-[#3d2f6b]">
                  {selectedYear}
                </span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-36">
                    MSSV
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-200">
                    Họ và tên
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-32">
                    Ngày sinh
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-32">
                    Điểm SV đánh giá
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-32">
                    Điểm GVCN đánh giá
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-36">
                    Tình trạng xử lý
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 w-24">
                    Chi tiết
                  </th>
                </tr>
              </thead>
              <tbody>
                {classMembers.map((member, idx) => {
                  const selfScore = getSelfScore(member, idx);
                  const reviewerScore = getReviewerScore(member);
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
                          <span className="text-gray-800 font-medium w-20 text-right">
                            {member.ten}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100">
                        {member.ngaySinh}
                      </td>
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span
                          className={`font-semibold ${
                            member.isLinkedToStudent && selfScore > 0
                              ? "text-[#3d2f6b]"
                              : "text-gray-700"
                          }`}
                        >
                          {selfScore}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span
                          className={`font-semibold ${
                            reviewerScore > 0
                              ? "text-green-700"
                              : "text-gray-400"
                          }`}
                        >
                          {reviewerScore}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleChecked(member.mssv)}
                          className="w-4 h-4 accent-[#3d2f6b] cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() =>
                            navigate(`/class-leader/class-score/${member.mssv}`)
                          }
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

export default ClassScoreBoard;