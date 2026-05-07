import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { classMembers } from "../constants/classMembers";
import { useScoreContext } from "../../../context/ScoreContext";
import { useReviewerScoreManagement } from "../hooks/useReviewerScoreManagement";
import ReviewerScoreTableDesktop from "../components/ReviewerScoreTableDesktop";
import ReviewerScoreCardsMobile from "../components/ReviewerScoreCardsMobile";
import ImageViewer from "../components/ImageViewer";
import ConfirmModal from "../components/ConfirmModal";
import GhiChuModal from "../components/GhiChuModal";
import { useTimeWindow } from "../../../hooks/useTimeWindow";

const ADMIN_LS_KEYS = {
  YEARS: "admin_academic_years",
  SEMESTERS: "admin_academic_semesters",
  CRITERIA: "admin_criteria_sections",
};

const PCTSV_APPROVED_KEY = "pctsvApprovedClasses";
const GVCN_ALL_DATA_KEY  = "gvcnAllData";
const LINKED_CLASS_ID    = "48K14.1";

const readLS = (key, def) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : def;
  } catch {
    return def;
  }
};

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
        const subs = cr.subCriteria || [];
        const items =
          subs.length > 0
            ? subs.map((sub) => ({
                description: sub.content,
                maxScore: sub.maxScore,
                selfScore: 0,
                reviewerScore: 0,
                proof: "Tải minh chứng lên",
                note: sub.isAutoUpdate
                  ? "Hệ thống của trường sẽ tự động cập nhật"
                  : undefined,
              }))
            : [
                {
                  description: cr.content,
                  maxScore: cr.maxScore,
                  selfScore: 0,
                  reviewerScore: 0,
                  proof: "Tải minh chứng lên",
                  note: cr.isAutoUpdate
                    ? "Hệ thống của trường sẽ tự động cập nhật"
                    : undefined,
                },
              ];
        return {
          id: String.fromCharCode(97 + idx),
          title: subs.length > 0 ? cr.content : "",
          items,
        };
      });

      const maxScore = (sec.criteria || []).reduce(
        (s, c) => s + (c.maxScore || 0),
        0
      );

      return {
        section: sec.number ? `Điều ${sec.number}. ${sec.name}` : sec.name,
        maxScore,
        selfScore: 0,
        reviewerScore: 0,
        criteria,
      };
    });

const ActionButtons = ({
  isEditing,
  hasAnySavedData,
  isDraft,
  onBack,
  onSave,
  onSaveDraft,
  onStartScoring,
  timeWindow,
}) => {
  const blocked = timeWindow && !timeWindow.canEdit;

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
            className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors cursor-pointer text-sm"
          >
            Lưu
          </button>
        </>
      ) : blocked ? (
        renderBadge()
      ) : hasAnySavedData ? (
        <button
          onClick={onStartScoring}
          className="px-5 py-2.5 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer text-sm"
        >
          {isDraft ? "Tiếp tục chấm" : "Sửa"}
        </button>
      ) : (
        <button
          onClick={onStartScoring}
          className="px-5 py-2.5 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors cursor-pointer text-sm"
        >
          Chấm
        </button>
      )}
    </div>
  );
};

const StudentScoreDetail = () => {
  const { mssv } = useParams();
  const navigate  = useNavigate();
  const [searchParams] = useSearchParams();

  const yearId = searchParams.get("yearId") ?? "";
  const semId  = searchParams.get("semId")  ?? "";

  const allYears      = readLS(ADMIN_LS_KEYS.YEARS, []);
  const allSemesters  = readLS(ADMIN_LS_KEYS.SEMESTERS, {});
  const adminCriteria = readLS(ADMIN_LS_KEYS.CRITERIA, []);

  const selectedYear     = allYears.find((y) => y.id === yearId) ?? null;
  const yearSemesters    = yearId ? (allSemesters[yearId] ?? []) : [];
  const selectedSemester = yearSemesters.find((s) => s.id === semId) ?? null;

  const scoreData = transformToScoreData(adminCriteria);

  // PCTSV approval check
  const periodKey       = yearId && semId ? `${yearId}_${semId}` : null;
  const pctsvApproved   = readLS(PCTSV_APPROVED_KEY, {});
  const isPctsvApproved = periodKey
    ? !!pctsvApproved[`${LINKED_CLASS_ID}_${periodKey}`]
    : false;

  // Điểm GVCN cuối cùng (để hiển thị trong banner)
  const gvcnAllData    = readLS(GVCN_ALL_DATA_KEY, {});
  const gvcnFinalTotal = periodKey
    ? (gvcnAllData[periodKey]?.[mssv]?.total ?? null)
    : null;

  const { getStudentPeriodData } = useScoreContext();
  const studentPeriodData = getStudentPeriodData(yearId, semId);

  const member = classMembers.find((m) => m.mssv === mssv);

  const {
    isEditing,
    isDraft,
    showConfirmModal,
    noteModalKey,
    getItemKey,
    calculateReviewerSectionScore,
    getReviewerDisplayScore,
    handleReviewerScoreChange,
    handleStartScoring,
    handleSave,
    handleSaveDraft,
    handleConfirmSave,
    handleCancelSave,
    hasAnySavedData,
    calculateReviewerTotals,
    openNoteModal,
    handleSaveNote,
    closeNoteModal,
    getNote,
  } = useReviewerScoreManagement(scoreData, mssv, yearId, semId);

  const timeWindow = useTimeWindow(yearId, semId, "classLeader");

  // Khi PCTSV đã duyệt → khóa chỉnh sửa
  const effectiveTimeWindow = isPctsvApproved
    ? { canEdit: false, status: "after", startTime: null, endTime: null }
    : timeWindow;

  const [viewingImage, setViewingImage] = useState(null);

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-4">
        <p className="text-gray-500">Không tìm thấy sinh viên.</p>
        <button
          onClick={() => navigate("/class-leader/class-score")}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer text-sm"
        >
          ← Quay lại bảng điểm lớp
        </button>
      </div>
    );
  }

  const selfScores = member.isLinkedToStudent ? (studentPeriodData.savedScores ?? {}) : {};
  const selfImages = member.isLinkedToStudent ? (studentPeriodData.uploadedImages ?? {}) : {};
  const selfTotal  = member.isLinkedToStudent ? (studentPeriodData.total ?? 0) : 0;

  const reviewerTotals = calculateReviewerTotals();
  const savedData      = hasAnySavedData();
  const goBack         = () => navigate("/class-leader/class-score");

  return (
    <div className="space-y-4 md:space-y-6">

      {/* Banner PCTSV đã duyệt */}
      {isPctsvApproved && (
        <div className="bg-green-50 border border-green-300 rounded-lg px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 flex-shrink-0 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">✓</span>
            <div>
              <p className="font-bold text-green-800 text-sm md:text-base">
                Điểm rèn luyện của <span className="text-green-900">{member.ho} {member.ten}</span> đã được PCTSV phê duyệt chính thức
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                Điểm do Giáo viên chủ nhiệm đánh giá đã là điểm cuối cùng. Không thể chỉnh sửa thêm.
              </p>
            </div>
          </div>
          {gvcnFinalTotal !== null && (
            <div className="flex-shrink-0 text-right">
              <span className="text-2xl font-extrabold text-green-700">{gvcnFinalTotal}</span>
              <span className="text-sm text-green-600 ml-1">điểm GVCN</span>
            </div>
          )}
        </div>
      )}

      {/* Header card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 mt-0.5">
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
                <div className="text-xs text-[#3d2f6b] font-medium mt-0.5">
                  {selectedSemester?.name && `${selectedSemester.name} · `}
                  {selectedYear?.name && `Năm học ${selectedYear.name}`}
                </div>
              )}
              {isDraft && !isEditing && (
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
            timeWindow={effectiveTimeWindow}
          />
        </div>
      </div>

           {/* Bảng điểm Desktop */}
      <ReviewerScoreTableDesktop
        scoreData={scoreData}
        selfScores={selfScores}
        uploadedImages={selfImages}
        isEditing={isEditing}
        getItemKey={getItemKey}
        calculateReviewerSectionScore={calculateReviewerSectionScore}
        getReviewerDisplayScore={getReviewerDisplayScore}
        handleImageClick={(img) => setViewingImage(img)}
        getNote={getNote}
        openNoteModal={openNoteModal}
        selfTotal={selfTotal}
        reviewerTotals={reviewerTotals}
        mssv={mssv}
      />

      {/* Bảng điểm Mobile */}
      <ReviewerScoreCardsMobile
        scoreData={scoreData}
        selfScores={selfScores}
        uploadedImages={selfImages}
        isEditing={isEditing}
        getItemKey={getItemKey}
        calculateReviewerSectionScore={calculateReviewerSectionScore}
        getReviewerDisplayScore={getReviewerDisplayScore}
        handleReviewerScoreChange={handleReviewerScoreChange}
        handleImageClick={(img) => setViewingImage(img)}
        getNote={getNote}
        openNoteModal={openNoteModal}
        selfTotal={selfTotal}
        reviewerTotals={reviewerTotals}
        mssv={mssv}
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
          timeWindow={effectiveTimeWindow}
        />
      </div>

      <ImageViewer imageUrl={viewingImage} onClose={() => setViewingImage(null)} />

      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
        title="Xác nhận lưu hoàn tất"
        message="Sau khi lưu, điểm sẽ được tính là đã hoàn thành và tự động tick xác nhận cho sinh viên này. Bạn có chắc chắn không?"
        confirmLabel="Lưu hoàn tất"
      />

      {noteModalKey !== null && (
        <GhiChuModal
          initialText={getNote(noteModalKey)}
          onSave={handleSaveNote}
          onClose={closeNoteModal}
          readOnly={!isEditing}
        />
      )}
    </div>
  );
};

export default StudentScoreDetail;