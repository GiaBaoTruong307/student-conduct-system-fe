import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { classMembers } from "../constants/classMembers";
import { useScoreContext } from "../../../context/ScoreContext";
import { useTimeWindow } from "../../../hooks/useTimeWindow";
import { useRoleFilter } from "../../../hooks/useRoleFilter";
import { ROLES } from "../../../utils/role";
import ConfirmModal from "../components/ConfirmModal";

const ADMIN_LS_KEYS = {
  YEARS: "admin_academic_years",
  SEMESTERS: "admin_academic_semesters",
};

const BCS_SUBMITTED_KEY  = "bcsSubmittedPeriods";
const PCTSV_APPROVED_KEY = "pctsvApprovedClasses";
const GVCN_ALL_DATA_KEY  = "gvcnAllData";
const LINKED_CLASS_ID    = "48K14.1";
const CHECKED_KEY        = "classBoardChecked";

const readLS = (key, def) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : def;
  } catch {
    return def;
  }
};

const fakeSelfScores = [
  null, 88, 89, 85, 90, 83, 78, 89, 87, 87, 76, 77, 80, 70, 88, 83, 92, 87,
  86, 78, 79, 92, 83,
];

const ClassScoreBoard = () => {
  const navigate = useNavigate();

  const allYears     = readLS(ADMIN_LS_KEYS.YEARS, []);
  const allSemesters = readLS(ADMIN_LS_KEYS.SEMESTERS, {});

  const [filter, updateFilter] = useRoleFilter(ROLES.CLASS_LEADER, {
    yearId: "",
    semesterId: "",
  });

  const selectedYearId     = filter.yearId;
  const selectedSemesterId = filter.semesterId;

  const semesters    = selectedYearId ? (allSemesters[selectedYearId] ?? []) : [];
  const selectedYear = allYears.find((y) => y.id === selectedYearId) ?? null;

  const handleYearChange = (yearId) => {
    updateFilter({ yearId, semesterId: "" });
  };

  const [checkedAll, setCheckedAll] = useState(() => readLS(CHECKED_KEY, {}));

  const { getStudentPeriodData, getReviewerPeriodData } = useScoreContext();

  const [submittedPeriods, setSubmittedPeriods] = useState(
    () => readLS(BCS_SUBMITTED_KEY, [])
  );

  const pctsvApproved   = readLS(PCTSV_APPROVED_KEY, {});
  const isPctsvApproved = !!pctsvApproved[LINKED_CLASS_ID];

  const [toast, setToast]                       = useState({ msg: "", type: "" });
  const [showSubmitModal, setShowSubmitModal]   = useState(false);

  const showToast = (msg, type = "warn") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  const hasData   = !!selectedYearId && !!selectedSemesterId;
  const periodKey = hasData ? `${selectedYearId}_${selectedSemesterId}` : null;
  const timeWindow = useTimeWindow(selectedYearId, selectedSemesterId, "classLeader");
  const bcsSubmitted = periodKey ? submittedPeriods.includes(periodKey) : false;
  const canEdit   = !hasData ? false : (timeWindow.canEdit && !bcsSubmitted);

  const checkedForPeriod = (periodKey && checkedAll[periodKey]) ? checkedAll[periodKey] : {};

  const allChecked = hasData && classMembers.every((m) => !!checkedForPeriod[m.mssv]);
  const canSubmit  = allChecked;

  // Auto-tick + auto-gửi duyệt lên GVCN khi hết thời gian chấm
  useEffect(() => {
    if (!hasData || !periodKey) return;
    if (timeWindow.status !== "after") return;

    setCheckedAll((prev) => {
      const updated = {
        ...prev,
        [periodKey]: Object.fromEntries(classMembers.map((m) => [m.mssv, true])),
      };
      localStorage.setItem(CHECKED_KEY, JSON.stringify(updated));
      return updated;
    });

    setSubmittedPeriods((prev) => {
      if (prev.includes(periodKey)) return prev;
      const updated = [...prev, periodKey];
      localStorage.setItem(BCS_SUBMITTED_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [timeWindow.status, periodKey, hasData]);

  // Đọc isDraft từ reviewerAllData
  const getReviewerDraftStatus = (mssv) => {
    if (!periodKey) return false;
    try {
      const all = JSON.parse(localStorage.getItem("reviewerAllData") || "{}");
      return (all[periodKey]?.[mssv]?.isDraft) === true;
    } catch {
      return false;
    }
  };

  const handleSubmitClick = () => {
    if (!allChecked) {
      showToast("Vui lòng tick xác nhận tất cả sinh viên trước khi gửi duyệt.", "warn");
      return;
    }
    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = () => {
    const updated = [...submittedPeriods, periodKey];
    localStorage.setItem(BCS_SUBMITTED_KEY, JSON.stringify(updated));
    setSubmittedPeriods(updated);
    setShowSubmitModal(false);
    showToast("Đã gửi duyệt thành công!", "success");
  };

  const toggleChecked = (mssv) => {
    if (!canEdit) return;
    setCheckedAll((prev) => {
      const periodData = prev[periodKey] || {};
      const updated = {
        ...prev,
        [periodKey]: { ...periodData, [mssv]: !periodData[mssv] },
      };
      localStorage.setItem(CHECKED_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const toggleAllChecked = () => {
    if (!canEdit) return;
    setCheckedAll((prev) => {
      const newVal = !allChecked;
      const updated = {
        ...prev,
        [periodKey]: Object.fromEntries(classMembers.map((m) => [m.mssv, newVal])),
      };
      localStorage.setItem(CHECKED_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const getSelfScore = (member, idx) => {
    if (!hasData) return "-";
    if (member.isLinkedToStudent) {
      return getStudentPeriodData(selectedYearId, selectedSemesterId).total || 0;
    }
    return fakeSelfScores[idx] ?? "-";
  };

  const getReviewerScore = (member) => {
    if (!hasData) return "-";
    const periodData = getReviewerPeriodData(selectedYearId, selectedSemesterId);
    const data = periodData[member.mssv];
    if (data && data.total !== undefined) return data.total;
    return 0;
  };

  const getGvcnFinalScore = (member) => {
    if (!hasData) return "-";
    const gvcnAll = readLS(GVCN_ALL_DATA_KEY, {});
    const data = (gvcnAll[periodKey] ?? {})[member.mssv];
    if (data && data.total !== undefined && data.total > 0) return data.total;
    return "-";
  };

  const handleViewDetail = (mssv) => {
    navigate(
      `/class-leader/class-score/${mssv}?yearId=${selectedYearId}&semId=${selectedSemesterId}`
    );
  };

  const renderFilterAction = () => {
    if (!hasData) {
      return (
        <button disabled className="w-full md:w-auto px-6 py-2.5 bg-amber-400 text-white font-semibold rounded-lg opacity-50 cursor-not-allowed">
          Gửi duyệt
        </button>
      );
    }

    const { status, startTime, endTime } = timeWindow;

    if (status === "no-setting") {
      return (
        <div className="flex flex-col items-start md:items-end gap-0.5 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg">
          <span className="text-sm font-semibold text-gray-600">Chưa có thời gian chấm được thiết lập</span>
          <span className="text-xs text-gray-400">Vui lòng chờ admin cài đặt thời gian</span>
        </div>
      );
    }
    if (status === "before") {
      return (
        <div className="flex flex-col items-start md:items-end gap-0.5 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
          <span className="text-sm font-semibold text-amber-700">Chưa tới thời gian chấm</span>
          {startTime && <span className="text-xs text-amber-600">Bắt đầu từ: {startTime}</span>}
        </div>
      );
    }
    if (status === "after") {
      return (
        <div className="flex flex-col items-start md:items-end gap-0.5 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-sm font-semibold text-red-700">Đã hết thời gian chấm</span>
          {endTime && <span className="text-xs text-red-500">Kết thúc lúc: {endTime}</span>}
        </div>
      );
    }
    if (bcsSubmitted) {
      return (
        <div className="flex flex-col items-start md:items-end gap-0.5 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-sm font-semibold text-green-700">✓ Đã gửi duyệt</span>
          <span className="text-xs text-green-600">GVCN đã nhận được kết quả chấm</span>
        </div>
      );
    }

    return (
      <button
        onClick={handleSubmitClick}
        className={`w-full md:w-auto px-6 py-2.5 text-white font-semibold rounded-lg transition-all duration-200 ${
          canSubmit
            ? "bg-amber-400 hover:bg-amber-500 shadow-sm cursor-pointer"
            : "bg-amber-400 opacity-50 cursor-pointer"
        }`}
      >
        Gửi duyệt
      </button>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">

      {isPctsvApproved && hasData && (
        <div className="bg-green-50 border border-green-300 rounded-lg px-5 py-4 flex items-center gap-3">
          <span className="w-8 h-8 flex-shrink-0 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">✓</span>
          <div>
            <p className="font-bold text-green-800 text-sm md:text-base">
              Điểm rèn luyện lớp đã được PCTSV phê duyệt chính thức
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              Cột <span className="font-semibold">Điểm GVCN (Cuối cùng)</span> là điểm rèn luyện chính thức của từng sinh viên.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn năm học cần tra cứu điểm</label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn học kỳ cần tra cứu điểm</label>
            <select
              value={selectedSemesterId}
              onChange={(e) => updateFilter({ semesterId: e.target.value })}
              disabled={!selectedYearId}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] focus:border-transparent bg-white cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-default"
            >
              <option value="">-- Chọn học kỳ --</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="md:flex md:items-end">{renderFilterAction()}</div>
        </div>

        {toast.msg && (
          <div className={`mt-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
            toast.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {toast.msg}
          </div>
        )}
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
                  Vui lòng chọn <span className="font-semibold text-[#3d2f6b]">năm học</span> và <span className="font-semibold text-[#3d2f6b]">học kỳ</span> để xem bảng điểm lớp.
                </p>
              ) : (
                <p className="text-sm md:text-base text-gray-600 max-w-md">
                  Vui lòng chọn <span className="font-semibold text-[#3d2f6b]">học kỳ</span> để xem bảng điểm lớp năm học <span className="font-semibold text-[#3d2f6b]">{selectedYear?.name}</span>.
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
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-32">Điểm BCS đánh giá</th>
                  {isPctsvApproved && (
                    <th className="px-4 py-3 text-center font-semibold text-green-700 border-r border-gray-200 w-40 bg-green-50">
                      Điểm GVCN (Cuối cùng)
                    </th>
                  )}
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-r border-gray-200 w-36">
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={toggleAllChecked}
                        disabled={!canEdit}
                        title={allChecked ? "Bỏ tick tất cả" : "Tick tất cả"}
                        className={`w-4 h-4 accent-[#3d2f6b] ${canEdit ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
                      />
                      <span>Tình trạng xử lý</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 w-24">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {classMembers.map((member, idx) => {
                  const selfScore     = getSelfScore(member, idx);
                  const reviewerScore = getReviewerScore(member);
                  const gvcnScore     = getGvcnFinalScore(member);
                  const isChecked     = !!checkedForPeriod[member.mssv];
                  const isDraftMember = !isChecked && getReviewerDraftStatus(member.mssv);
                  return (
                    <tr
                      key={member.mssv}
                      className={`border-b border-gray-100 transition-colors ${
                        isChecked
                          ? "bg-green-50"
                          : isDraftMember
                          ? "bg-amber-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100 font-mono text-xs">
                        {member.mssv}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-100">
                        <div className="flex justify-between gap-4 items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-800">{member.ho}</span>
                            {isDraftMember && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 border border-amber-300 text-amber-700 text-xs font-medium rounded-full whitespace-nowrap">
                                ✏️ Đang chấm dở
                              </span>
                            )}
                          </div>
                          <span className="text-gray-800 font-medium w-20 text-right">{member.ten}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 border-r border-gray-100">{member.ngaySinh}</td>
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span className={`font-semibold ${
                          member.isLinkedToStudent && selfScore > 0 ? "text-[#3d2f6b]" : "text-gray-700"
                        }`}>{selfScore}</span>
                      </td>
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span className={`font-semibold ${reviewerScore > 0 ? "text-green-700" : "text-gray-400"}`}>
                          {reviewerScore}
                        </span>
                      </td>
                      {isPctsvApproved && (
                        <td className="px-4 py-3 text-center border-r border-gray-100 bg-green-50">
                          <span className={`font-bold text-base ${gvcnScore !== "-" ? "text-green-700" : "text-gray-300"}`}>
                            {gvcnScore}
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleChecked(member.mssv)}
                          disabled={!canEdit}
                          className={`w-4 h-4 accent-[#3d2f6b] ${canEdit ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
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

      <ConfirmModal
        isOpen={showSubmitModal}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowSubmitModal(false)}
        title="Xác nhận gửi duyệt"
        message="Sau khi gửi, kết quả chấm điểm của lớp sẽ được chuyển đến Giáo viên chủ nhiệm. Bạn có chắc chắn muốn gửi duyệt không?"
        confirmLabel="Gửi duyệt"
      />
    </div>
  );
};

export default ClassScoreBoard;