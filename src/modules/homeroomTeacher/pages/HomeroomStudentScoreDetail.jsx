import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { classMembers } from "../../classLeader/constants/classMembers";
import { useScoreContext } from "../../../context/ScoreContext";
import GVCNScoreTableDesktop from "../components/GVCNScoreTableDesktop";
import GVCNScoreCardsMobile from "../components/GVCNScoreCardsMobile";
import GhiChuViewModal from "../components/GhiChuViewModal";
import ImageViewer from "../../classLeader/components/ImageViewer";
import ConfirmModal from "../../classLeader/components/ConfirmModal";
import { useGVCNScoreManagement } from "../hooks/Usegvcnscoremanagement";
import { useTimeWindow } from "../../../hooks/useTimeWindow";

const ADMIN_LS_KEYS = {
  YEARS:    "admin_academic_years",
  SEMESTERS:"admin_academic_semesters",
  CRITERIA: "admin_criteria_sections",
};

const BCS_SUBMITTED_KEY = "bcsSubmittedPeriods";
const GVCN_REQUESTS_KEY = "gvcnAdjustmentRequests";
const GVCN_NOTIF_KEY    = "gvcnNotifications";

const readLS  = (key, def) => { try { const r = localStorage.getItem(key); return r !== null ? JSON.parse(r) : def; } catch { return def; } };
const writeLS = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

const transformToScoreData = (adminSections) =>
  [...adminSections]
    .sort((a, b) => {
      if (a.number && b.number) return a.number - b.number;
      if (a.number) return -1;
      if (b.number) return 1;
      return 0;
    })
    .map((sec) => {
      const criteria = (sec.criteria || []).map((cr, idx) => {
        const subs  = cr.subCriteria || [];
        const items =
          subs.length > 0
            ? subs.map((sub) => ({
                description: sub.content,
                maxScore:    sub.maxScore,
                selfScore:   0,
                reviewerScore: 0,
                proof: "Tải minh chứng lên",
                note:  sub.isAutoUpdate ? "Hệ thống của trường sẽ tự động cập nhật" : undefined,
              }))
            : [{
                description: cr.content,
                maxScore:    cr.maxScore,
                selfScore:   0,
                reviewerScore: 0,
                proof: "Tải minh chứng lên",
                note:  cr.isAutoUpdate ? "Hệ thống của trường sẽ tự động cập nhật" : undefined,
              }];
        return { id: String.fromCharCode(97 + idx), title: subs.length > 0 ? cr.content : "", items };
      });
      const maxScore = (sec.criteria || []).reduce((s, c) => s + (c.maxScore || 0), 0);
      return {
        section:       sec.number ? `Điều ${sec.number}. ${sec.name}` : sec.name,
        maxScore,
        selfScore:     0,
        reviewerScore: 0,
        criteria,
      };
    });

// ── Rescore helpers ───────────────────────────────────────────────────────────

const getRescoreWindow = (mssv, hocKy, namHoc) => {
  if (!mssv || !hocKy || !namHoc) return null;
  const notifs = readLS(GVCN_NOTIF_KEY, []);
  const now    = new Date();
  return notifs.find(
    (n) =>
      n.type === "pctsv-approved-rescore" &&
      n.mssv === mssv &&
      n.hocKy === hocKy &&
      n.namHoc === namHoc &&
      new Date(n.deadline) > now &&
      !n.rescoreSubmitted
  ) || null;
};

const hasRescoreSubmission = (mssv, hocKy, namHoc) => {
  const reqs = readLS(GVCN_REQUESTS_KEY, []);
  return reqs.some(
    (r) =>
      r.source === "rescore" &&
      r.mssv === mssv &&
      r.hocKy === hocKy &&
      r.namHoc === namHoc
  );
};

const getDaysRemaining = (deadlineISO) => {
  const diff = new Date(deadlineISO) - new Date();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const todayDisplay = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
};

// ── ActionButtons ─────────────────────────────────────────────────────────────
const ActionButtons = ({
  isEditing,
  hasAnySavedData,
  isDraft,
  onBack,
  onSave,
  onSaveDraft,
  onStartScoring,
  timeWindow,
  rescoreWindow,
}) => {
  const isInRescoreWindow = !!rescoreWindow;
  const blocked = !isInRescoreWindow && timeWindow && !timeWindow.canEdit;

  const renderBadge = () => {
    const { status, startTime, endTime } = timeWindow;
    if (status === "no-setting") {
      return (
        <div className="flex flex-col items-start gap-0.5 px-4 py-2 rounded-lg border text-sm bg-gray-50 border-gray-300">
          <span className="font-semibold text-gray-600">Chưa có thời gian chấm được thiết lập</span>
          <span className="text-xs text-gray-400">Vui lòng chờ admin cài đặt thời gian</span>
        </div>
      );
    }
    if (status === "before") {
      return (
        <div className="flex flex-col items-start gap-0.5 px-4 py-2 rounded-lg border text-sm bg-amber-50 border-amber-200">
          <span className="font-semibold text-amber-700">Chưa tới thời gian chấm</span>
          {startTime && <span className="text-xs text-amber-600">Bắt đầu từ: {startTime}</span>}
        </div>
      );
    }
    if (status === "after") {
      return (
        <div className="flex flex-col items-start gap-0.5 px-4 py-2 rounded-lg border text-sm bg-red-50 border-red-200">
          <span className="font-semibold text-red-700">Đã hết thời gian chấm</span>
          {endTime && <span className="text-xs text-red-500">Kết thúc lúc: {endTime}</span>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex gap-3 flex-wrap items-center">
      <button
        onClick={onBack}
        className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm"
      >
        ← Quay lại
      </button>

      {isEditing ? (
        <>
          <button
            onClick={onSaveDraft}
            className="px-5 py-2.5 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors cursor-pointer text-sm"
          >
            Lưu tạm
          </button>
          <button
            onClick={onSave}
            className={`px-5 py-2.5 text-white font-semibold rounded-lg transition-colors cursor-pointer text-sm ${
              isInRescoreWindow
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isInRescoreWindow ? "Gửi duyệt lại" : "Lưu"}
          </button>
        </>
      ) : blocked ? (
        renderBadge()
      ) : hasAnySavedData ? (
        <button
          onClick={onStartScoring}
          className={`px-5 py-2.5 text-white font-semibold rounded-lg transition-colors cursor-pointer text-sm ${
            isInRescoreWindow
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-yellow-500 hover:bg-yellow-600"
          }`}
        >
          {isInRescoreWindow ? "Chấm lại" : isDraft ? "Tiếp tục chấm" : "Sửa"}
        </button>
      ) : (
        <button
          onClick={onStartScoring}
          className={`px-5 py-2.5 text-white font-semibold rounded-lg transition-colors cursor-pointer text-sm ${
            isInRescoreWindow
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {isInRescoreWindow ? "Chấm lại" : "Chấm"}
        </button>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
const HomeroomStudentScoreDetail = () => {
  const { mssv }    = useParams();
  const navigate    = useNavigate();
  const [searchParams] = useSearchParams();

  const yearId = searchParams.get("yearId") ?? "";
  const semId  = searchParams.get("semId")  ?? "";

  const allYears     = readLS(ADMIN_LS_KEYS.YEARS, []);
  const allSemesters = readLS(ADMIN_LS_KEYS.SEMESTERS, {});
  const adminCriteria = readLS(ADMIN_LS_KEYS.CRITERIA, []);

  const selectedYear     = allYears.find((y) => y.id === yearId) ?? null;
  const yearSemesters    = yearId ? (allSemesters[yearId] ?? []) : [];
  const selectedSemester = yearSemesters.find((s) => s.id === semId) ?? null;

  const hocKy  = selectedSemester?.name ?? "";
  const namHoc = selectedYear?.name ?? "";

  const scoreData = transformToScoreData(adminCriteria);

  const { getStudentPeriodData } = useScoreContext();
  const studentPeriodData = getStudentPeriodData(yearId, semId);

  const member = classMembers.find((m) => m.mssv === mssv);

  const selfScores = member?.isLinkedToStudent ? (studentPeriodData.savedScores ?? {}) : {};
  const selfImages = member?.isLinkedToStudent ? (studentPeriodData.uploadedImages ?? {}) : {};
  const selfTotal  = member?.isLinkedToStudent ? (studentPeriodData.total ?? 0) : 0;

  // ── Rescore window state ──────────────────────────────────────────────────
  const [rescoreWindow, setRescoreWindow] = useState(
    () => getRescoreWindow(mssv, hocKy, namHoc)
  );
  const rescoreAlreadySubmitted = hasRescoreSubmission(mssv, hocKy, namHoc);
  const effectiveRescoreWindow  = rescoreWindow && !rescoreAlreadySubmitted ? rescoreWindow : null;

  // Auto-submit khi hết deadline nhưng chưa gửi
  useEffect(() => {
    const window_ = getRescoreWindow(mssv, hocKy, namHoc);
    if (!window_ || hasRescoreSubmission(mssv, hocKy, namHoc)) return;
    if (new Date(window_.deadline) > new Date()) return;

    // Deadline hết: auto-submit với điểm hiện tại trong gvcnAllData
    const existing = readLS(GVCN_REQUESTS_KEY, []);
    const newId    = existing.length > 0 ? Math.max(...existing.map((r) => r.id)) + 1 : 1;
    const svHoTen  = member ? `${member.ho} ${member.ten}` : mssv;

    const gvcnAllData = readLS("gvcnAllData", {});
    const scoreKey    = yearId && semId ? `${yearId}_${semId}` : null;
    const savedData   = scoreKey ? (gvcnAllData[scoreKey] ?? {})[mssv] : null;

    const autoEntry = {
      id:                 newId,
      source:             "rescore",
      originalNotifId:    window_.id,
      mssv,
      svHoTen,
      svLop:              "48K14.1",
      hocKy,
      namHoc,
      yearId,
      semId,
      drlMoi:             savedData?.total ?? 0,
      trangThai:          "rescore-submitted",
      autoSubmitted:      true,
      rescoreSubmittedAt: new Date().toISOString(),
      ngayTao:            todayDisplay(),
    };
    writeLS(GVCN_REQUESTS_KEY, [autoEntry, ...existing]);

    // Đánh dấu notification đã submit
    const notifs = readLS(GVCN_NOTIF_KEY, []);
    writeLS(GVCN_NOTIF_KEY, notifs.map((n) =>
      n.id === window_.id ? { ...n, rescoreSubmitted: true } : n
    ));
    window.dispatchEvent(new CustomEvent("gvcnRescoreSubmitted"));
    window.dispatchEvent(new CustomEvent("gvcnRequestsUpdated"));
    setRescoreWindow(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const svHoTen = member ? `${member.ho} ${member.ten}` : mssv;

  const {
    isEditing,
    isDraft,
    showConfirmModal,
    noteModalKey,
    noteModalOwner,
    getItemKey,
    calculateGvcnSectionScore,
    handleGvcnScoreChange,
    getGvcnDisplayScore,
    isGvcnModified,
    handleStartScoring,
    handleSave,
    handleSaveDraft,
    handleConfirmSave,
    handleCancelSave,
    hasAnySavedData,
    calculateGvcnTotals,
    openBcsNoteModal,
    closeNoteModal,
    getBcsNote,
  } = useGVCNScoreManagement(scoreData, mssv, yearId, semId, selfScores, {
    rescoreMode:    !!effectiveRescoreWindow,
    rescoreNotifId: effectiveRescoreWindow?.id ?? null,
    hocKy,
    namHoc,
    svHoTen,
    svLop: "48K14.1",
  });

  const timeWindow = useTimeWindow(yearId, semId, "teacher");

  const periodKey   = yearId && semId ? `${yearId}_${semId}` : null;
  const bcsSubmitted = periodKey
    ? readLS(BCS_SUBMITTED_KEY, []).includes(periodKey)
    : false;

  const getVisibleBcsNote = (itemKey) => (!bcsSubmitted ? "" : getBcsNote(itemKey));

  const [viewingImage, setViewingImage] = useState(null);

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-4">
        <p className="text-gray-500">Không tìm thấy sinh viên.</p>
        <button
          onClick={() => navigate("/homeroom-teacher/class-score")}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer text-sm"
        >
          ← Quay lại bảng điểm lớp
        </button>
      </div>
    );
  }

  const gvcnTotals    = calculateGvcnTotals();
  const savedData     = hasAnySavedData();
  const goBack        = () => navigate("/homeroom-teacher/class-score");
  const isBcsNoteOpen = noteModalKey !== null && noteModalOwner === "bcs";
  const daysRemaining = effectiveRescoreWindow
    ? getDaysRemaining(effectiveRescoreWindow.deadline)
    : 0;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 mt-0.5">
              {member.ten.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-gray-800 text-base md:text-lg">
                {member.ho} {member.ten}
              </div>
              <div className="text-sm text-gray-500">
                MSSV: {member.mssv} · Ngày sinh: {member.ngaySinh}
              </div>
              {(selectedSemester || selectedYear) && (
                <div className="text-xs text-emerald-700 font-medium mt-0.5">
                  {selectedSemester?.name && `${selectedSemester.name} · `}
                  {selectedYear?.name && `Năm học ${selectedYear.name}`}
                </div>
              )}
              {isDraft && !isEditing && !effectiveRescoreWindow && (
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-700 text-xs font-medium rounded-full">
                  <span>✏️</span>
                  <span>Đang chấm dở — chưa hoàn tất</span>
                </div>
              )}
            </div>
          </div>

          <ActionButtons
            isEditing={isEditing}
            hasAnySavedData={savedData}
            isDraft={isDraft}
            onBack={goBack}
            onSave={handleSave}
            onSaveDraft={handleSaveDraft}
            onStartScoring={handleStartScoring}
            timeWindow={timeWindow}
            rescoreWindow={effectiveRescoreWindow}
          />
        </div>

        {/* Banner: cửa sổ chấm lại đang mở */}
        {effectiveRescoreWindow && (
          <div className="mt-3 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-blue-700">
              <span className="font-semibold">PCTSV đã duyệt đơn</span> — bạn còn{" "}
              <span className="font-bold">{daysRemaining} ngày</span> để chấm lại điểm cho sinh viên này.
              Nhấn <span className="font-semibold">Chấm lại</span> để bắt đầu.
            </span>
          </div>
        )}

        {/* Banner: đã gửi duyệt lại, chờ Khoa */}
        {rescoreAlreadySubmitted && (
          <div className="mt-3 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-green-700 font-medium">
              Đã gửi duyệt lại — đang chờ Khoa xét duyệt
            </span>
          </div>
        )}

        {!bcsSubmitted && !effectiveRescoreWindow && !rescoreAlreadySubmitted && (
          <div className="mt-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="text-sm text-amber-700">
              Ban cán sự chưa gửi duyệt kết quả — ghi chú của BCS sẽ hiển thị sau khi BCS xác nhận gửi duyệt.
            </span>
          </div>
        )}
      </div>

      {/* Bảng điểm Desktop */}
      <GVCNScoreTableDesktop
        scoreData={scoreData}
        selfScores={selfScores}
        uploadedImages={selfImages}
        isEditing={isEditing}
        getItemKey={getItemKey}
        calculateGvcnSectionScore={calculateGvcnSectionScore}
        getGvcnDisplayScore={getGvcnDisplayScore}
        isGvcnModified={isGvcnModified}
        handleGvcnScoreChange={handleGvcnScoreChange}
        handleImageClick={(img) => setViewingImage(img)}
        getBcsNote={getVisibleBcsNote}
        openBcsNoteModal={openBcsNoteModal}
        selfTotal={selfTotal}
        gvcnTotals={gvcnTotals}
      />

      {/* Bảng điểm Mobile */}
      <GVCNScoreCardsMobile
        scoreData={scoreData}
        selfScores={selfScores}
        uploadedImages={selfImages}
        isEditing={isEditing}
        getItemKey={getItemKey}
        calculateGvcnSectionScore={calculateGvcnSectionScore}
        getGvcnDisplayScore={getGvcnDisplayScore}
        isGvcnModified={isGvcnModified}
        handleGvcnScoreChange={handleGvcnScoreChange}
        handleImageClick={(img) => setViewingImage(img)}
        getBcsNote={getVisibleBcsNote}
        openBcsNoteModal={openBcsNoteModal}
        selfTotal={selfTotal}
        gvcnTotals={gvcnTotals}
      />

      {/* Buttons dưới cùng */}
      <div className="flex justify-end">
        <ActionButtons
          isEditing={isEditing}
          hasAnySavedData={savedData}
          isDraft={isDraft}
          onBack={goBack}
          onSave={handleSave}
          onSaveDraft={handleSaveDraft}
          onStartScoring={handleStartScoring}
          timeWindow={timeWindow}
          rescoreWindow={effectiveRescoreWindow}
        />
      </div>

      <ImageViewer
        imageUrl={viewingImage}
        onClose={() => setViewingImage(null)}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
        title={effectiveRescoreWindow ? "Xác nhận gửi duyệt lại" : "Xác nhận lưu hoàn tất"}
        message={
          effectiveRescoreWindow
            ? "Sau khi gửi, điểm chấm lại sẽ được chuyển lên Khoa xét duyệt. Bạn sẽ không thể chỉnh sửa thêm."
            : "Sau khi lưu, điểm sẽ được tính là đã hoàn thành và tự động tick xác nhận cho sinh viên này. Bạn có chắc chắn không?"
        }
        confirmLabel={effectiveRescoreWindow ? "Gửi duyệt lại" : "Lưu hoàn tất"}
      />

      {isBcsNoteOpen && (
        <GhiChuViewModal
          title="Ghi chú của BCS"
          text={getVisibleBcsNote(noteModalKey)}
          onClose={closeNoteModal}
        />
      )}
    </div>
  );
};

export default HomeroomStudentScoreDetail;