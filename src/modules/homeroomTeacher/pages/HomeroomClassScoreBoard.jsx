import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { classMembers } from "../../classLeader/constants/classMembers";
import { useScoreContext } from "../../../context/ScoreContext";
import { useTimeWindow } from "../../../hooks/useTimeWindow";
import { useRoleFilter } from "../../../hooks/useRoleFilter";
import { ROLES } from "../../../utils/role";
import { PCTSV_CLASSES } from "../../studentAffairs/constants/studentAffairs.constants";
import ClassScorePrintModal from "../../../components/ClassScorePrintModal";

const ADMIN_LS_KEYS = {
  YEARS:     "admin_academic_years",
  SEMESTERS: "admin_academic_semesters",
};

const GVCN_ALL_DATA_KEY  = "gvcnAllData";
const GVCN_CHECKED_KEY   = "gvcnBoardChecked";
const GVCN_SUBMITTED_KEY = "gvcnSubmittedClasses";
const GVCN_NOTIF_KEY     = "gvcnNotifications";
const GVCN_REQUESTS_KEY  = "gvcnAdjustmentRequests";

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

// ── Rescore indicator helper ───────────────────────────────────────────────────
const getRescoringMssvs = (hocKyName, namHocName) => {
  if (!hocKyName || !namHocName) return new Set();
  const notifs    = readLS(GVCN_NOTIF_KEY, []);
  const reqs      = readLS(GVCN_REQUESTS_KEY, []);
  const now       = new Date();
  const submitted = new Set(
    reqs
      .filter((r) => r.source === "rescore" && r.hocKy === hocKyName && r.namHoc === namHocName)
      .map((r) => r.mssv)
  );
  return new Set(
    notifs
      .filter(
        (n) =>
          n.type === "pctsv-approved-rescore" &&
          n.hocKy === hocKyName &&
          n.namHoc === namHocName &&
          new Date(n.deadline) > now &&
          !n.rescoreSubmitted &&
          !submitted.has(n.mssv)
      )
      .map((n) => n.mssv)
  );
};

// ── Confirm Submit Modal ───────────────────────────────────────────────────────
const ConfirmSubmitModal = ({ semesterName, yearName, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-base font-bold text-gray-800">Xác nhận gửi điểm</h2>
      </div>
      <div className="px-6 py-4 space-y-2">
        <p className="text-sm text-gray-700">
          Bạn có chắc muốn xác nhận điểm cho toàn bộ sinh viên?
        </p>
        <p className="text-xs text-gray-500">
          Học kỳ <span className="font-semibold">{semesterName}</span> · Năm học{" "}
          <span className="font-semibold">{yearName}</span>
        </p>
        <p className="text-xs text-amber-600 font-medium pt-1">
          Sau khi xác nhận, bạn sẽ không thể chỉnh sửa lại điểm.
        </p>
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 cursor-pointer"
        >
          Huỷ
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg cursor-pointer"
        >
          Xác nhận
        </button>
      </div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
const HomeroomClassScoreBoard = () => {
  const navigate = useNavigate();

  const allYears     = readLS(ADMIN_LS_KEYS.YEARS, []);
  const allSemesters = readLS(ADMIN_LS_KEYS.SEMESTERS, {});

  const [filter, updateFilter] = useRoleFilter(ROLES.HOMEROOM_TEACHER, {
    yearId:     "",
    semesterId: "",
  });

  const selectedYearId     = filter.yearId;
  const selectedSemesterId = filter.semesterId;

  const semesters        = selectedYearId ? (allSemesters[selectedYearId] ?? []) : [];
  const selectedYear     = allYears.find((y) => y.id === selectedYearId) ?? null;
  const selectedSemester = semesters.find((s) => s.id === selectedSemesterId) ?? null;

  const handleYearChange = (yearId) => {
    updateFilter({ yearId, semesterId: "" });
  };

  const { getStudentPeriodData } = useScoreContext();

  const hasData   = !!selectedYearId && !!selectedSemesterId;
  const periodKey = hasData ? `${selectedYearId}_${selectedSemesterId}` : null;
  const timeWindow = useTimeWindow(selectedYearId, selectedSemesterId, "teacher");

  const GVCN_CLASS_ID = "48K14.1";

  // ── checked state — keyed by periodKey ──────────────────────────────────────
  const [allCheckedData, setAllCheckedData] = useState(() => readLS(GVCN_CHECKED_KEY, {}));
  const checked = periodKey ? (allCheckedData[periodKey] ?? {}) : {};

  const writeChecked = (pk, periodData) => {
    setAllCheckedData((prev) => {
      const updated = { ...prev, [pk]: periodData };
      localStorage.setItem(GVCN_CHECKED_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // ── submitted state — keyed by classId_periodKey ────────────────────────────
  const [gvcnSubmitted, setGvcnSubmitted] = useState(() => readLS(GVCN_SUBMITTED_KEY, {}));
  const submitKey   = periodKey ? `${GVCN_CLASS_ID}_${periodKey}` : null;
  const isSubmitted = submitKey ? !!gvcnSubmitted[submitKey] : false;

  const allChecked = hasData && classMembers.every((m) => !!checked[m.mssv]);
  const canEdit    = !hasData ? false : (timeWindow.canEdit && !isSubmitted);

  const [toast,             setToast]            = useState({ msg: "", type: "" });
  const [showConfirmModal,  setShowConfirmModal]  = useState(false);
  const [showPrintModal,    setShowPrintModal]    = useState(false);

  // Tên GVCN lấy từ danh sách lớp
  const gvcnClassInfo   = PCTSV_CLASSES.find((c) => c.id === GVCN_CLASS_ID);
  const gvcnDisplayName = gvcnClassInfo?.gvcn ?? "";

  // ── Rescore MSSVs ────────────────────────────────────────────────────────────
  const [rescoreMssvs, setRescoreMssvs] = useState(new Set());

  useEffect(() => {
    if (selectedSemester && selectedYear) {
      setRescoreMssvs(getRescoringMssvs(selectedSemester.name, selectedYear.name));
    } else {
      setRescoreMssvs(new Set());
    }
  }, [selectedYearId, selectedSemesterId]);

  useEffect(() => {
    const refresh = () => {
      if (selectedSemester && selectedYear) {
        setRescoreMssvs(getRescoringMssvs(selectedSemester.name, selectedYear.name));
      }
    };
    window.addEventListener("gvcnStatusUpdated",    refresh);
    window.addEventListener("gvcnRescoreSubmitted", refresh);
    return () => {
      window.removeEventListener("gvcnStatusUpdated",    refresh);
      window.removeEventListener("gvcnRescoreSubmitted", refresh);
    };
  }, [selectedYearId, selectedSemesterId]);

  // ── Sync checked state khi hook lưu điểm từ trang chi tiết ─────────────────
  useEffect(() => {
    const refreshChecked = () => {
      setAllCheckedData(readLS(GVCN_CHECKED_KEY, {}));
    };
    window.addEventListener("gvcnCheckedUpdated", refreshChecked);
    return () => window.removeEventListener("gvcnCheckedUpdated", refreshChecked);
  }, []);

  const showToast = (msg, type = "warn") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  // Auto-tick + auto-submit khi hết thời gian chấm
  useEffect(() => {
    if (!hasData || !periodKey || !submitKey) return;
    if (timeWindow.status !== "after") return;

    const autoChecked = Object.fromEntries(classMembers.map((m) => [m.mssv, true]));
    setAllCheckedData((prev) => {
      const updated = { ...prev, [periodKey]: autoChecked };
      localStorage.setItem(GVCN_CHECKED_KEY, JSON.stringify(updated));
      return updated;
    });

    setGvcnSubmitted((prev) => {
      if (prev[submitKey]) return prev;
      const updated = { ...prev, [submitKey]: true };
      localStorage.setItem(GVCN_SUBMITTED_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [timeWindow.status, periodKey, submitKey, hasData]);

  const getGvcnDraftStatus = (mssv) => {
    if (!periodKey) return false;
    try {
      const all = readLS(GVCN_ALL_DATA_KEY, {});
      return (all[periodKey]?.[mssv]?.isDraft) === true;
    } catch {
      return false;
    }
  };

  const handleSubmitConfirmed = () => {
    setShowConfirmModal(false);
    const updated = { ...gvcnSubmitted, [submitKey]: true };
    localStorage.setItem(GVCN_SUBMITTED_KEY, JSON.stringify(updated));
    setGvcnSubmitted(updated);
    showToast("Đã xác nhận điểm thành công!", "success");
  };

  const handleSubmitClick = () => {
    if (!allChecked) {
      showToast("Vui lòng tick xác nhận tất cả sinh viên trước khi xác nhận điểm.", "warn");
      return;
    }
    setShowConfirmModal(true);
  };

  const toggleChecked = (mssv) => {
    if (!canEdit || !periodKey) return;
    const updated = { ...checked, [mssv]: !checked[mssv] };
    writeChecked(periodKey, updated);
  };

  const toggleAllChecked = () => {
    if (!canEdit || !periodKey) return;
    const newVal  = !allChecked;
    const updated = Object.fromEntries(classMembers.map((m) => [m.mssv, newVal]));
    writeChecked(periodKey, updated);
  };

  const getSelfScore = (member, idx) => {
    if (!hasData) return "-";
    if (member.isLinkedToStudent) {
      return getStudentPeriodData(selectedYearId, selectedSemesterId).total || 0;
    }
    return fakeSelfScores[idx] ?? "-";
  };

  const getGvcnScore = (member, selfScore) => {
    if (!hasData) return "-";
    const gvcnAll = readLS(GVCN_ALL_DATA_KEY, {});
    const data    = (gvcnAll[periodKey] ?? {})[member.mssv];
    if (data && data.total !== undefined && data.total > 0) return data.total;
    if (selfScore !== "-" && selfScore !== undefined && selfScore !== null) return selfScore;
    return "-";
  };

  // Build danh sách member kèm điểm để truyền vào print modal
  const buildPrintMembers = () =>
    classMembers.map((member, idx) => {
      const self  = getSelfScore(member, idx);
      const final = getGvcnScore(member, self);
      return {
        mssv:       member.mssv,
        ho:         member.ho,
        ten:        member.ten,
        ngaySinh:   member.ngaySinh,
        selfScore:  self,
        finalScore: final,
      };
    });

  const handleViewDetail = (mssv) => {
    navigate(
      `/homeroom-teacher/class-score/${mssv}?yearId=${selectedYearId}&semId=${selectedSemesterId}`
    );
  };

  const renderFilterAction = () => {
    if (!hasData) {
      return (
        <button disabled className="w-full md:w-auto px-6 py-2.5 bg-amber-400 text-white font-semibold rounded-lg opacity-50 cursor-not-allowed">
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
    if (isSubmitted) {
      return (
        <span className="w-full md:w-auto px-6 py-2.5 bg-green-100 text-green-700 font-semibold rounded-lg text-sm inline-flex items-center gap-2">
          ✓ Đã xác nhận điểm
        </span>
      );
    }

    return (
      <button
        onClick={handleSubmitClick}
        className={`w-full md:w-auto px-6 py-2.5 font-semibold rounded-lg transition-colors ${
          allChecked
            ? "bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
            : "bg-amber-400 text-white opacity-50 cursor-not-allowed"
        }`}
      >
        Xác nhận điểm
      </button>
    );
  };

  return (
    <>
      {showConfirmModal && createPortal(
        <ConfirmSubmitModal
          semesterName={selectedSemester?.name ?? ""}
          yearName={selectedYear?.name ?? ""}
          onConfirm={handleSubmitConfirmed}
          onCancel={() => setShowConfirmModal(false)}
        />,
        document.body
      )}

      {showPrintModal && (
        <ClassScorePrintModal
          classId={GVCN_CLASS_ID}
          semesterName={selectedSemester?.name ?? ""}
          yearName={selectedYear?.name ?? ""}
          gvcnName={gvcnDisplayName}
          members={buildPrintMembers()}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      <div className="space-y-4 md:space-y-6">
        {toast.msg && (
          <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold text-sm transition-all ${
            toast.type === "success" ? "bg-green-500" : "bg-amber-500"
          }`}>
            {toast.msg}
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
            <div className="flex flex-col md:flex-row md:items-end gap-3">
              {renderFilterAction()}
              {hasData && (
                <button
                  onClick={() => setShowPrintModal(true)}
                  className="w-full md:w-auto px-5 py-2.5 bg-white border border-[#3d2f6b] text-[#3d2f6b] font-semibold rounded-lg hover:bg-purple-50 transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  In bảng điểm
                </button>
              )}
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
                    Vui lòng chọn <span className="font-semibold text-[#3d2f6b]">năm học</span> và{" "}
                    <span className="font-semibold text-[#3d2f6b]">học kỳ</span> để xem bảng điểm lớp.
                  </p>
                ) : (
                  <p className="text-sm md:text-base text-gray-600 max-w-md">
                    Vui lòng chọn <span className="font-semibold text-[#3d2f6b]">học kỳ</span> để xem bảng điểm lớp năm học{" "}
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
                    const gvcnScore     = getGvcnScore(member, selfScore);
                    const isChecked     = !!checked[member.mssv];
                    const isDraftMember = !isChecked && getGvcnDraftStatus(member.mssv);
                    const needsRescore  = rescoreMssvs.has(member.mssv);
                    return (
                      <tr
                        key={member.mssv}
                        className={`border-b border-gray-100 transition-colors ${
                          isChecked
                            ? "bg-green-50"
                            : needsRescore
                            ? "bg-orange-50"
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
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-gray-800">{member.ho}</span>
                              {needsRescore && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 border border-orange-300 text-orange-700 text-xs font-medium rounded-full whitespace-nowrap animate-pulse">
                                  🔄 Cần chấm lại
                                </span>
                              )}
                              {!needsRescore && isDraftMember && (
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
                          <span className={`font-semibold ${
                            gvcnScore !== "-" && gvcnScore > 0 ? "text-emerald-700" : "text-gray-400"
                          }`}>{gvcnScore}</span>
                        </td>
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
      </div>
    </>
  );
};

export default HomeroomClassScoreBoard;