import { useState } from "react";
import { useScoreManagement } from "../hooks/useScoreManagement";
import EmptyState from "../components/EmptyState";
import ScoreFilter from "../components/ScoreFilter";
import ActionButton from "../components/ActionButton";
import ScoreTableDesktop from "../components/ScoreTableDesktop";
import ScoreCardsMobile from "../components/ScoreCardsMobile";
import ImageViewer from "../components/ImageViewer";
import ConfirmModal from "../components/ConfirmModal";
import MinhChungModal from "../components/MinhChungModal";
import { useTimeWindow } from "../../../hooks/useTimeWindow";
import { useRoleFilter } from "../../../hooks/useRoleFilter";
import { ROLES } from "../../../utils/role";

const LS_KEYS = {
  YEARS: "admin_academic_years",
  SEMESTERS: "admin_academic_semesters",
  CRITERIA: "admin_criteria_sections",
};

const PCTSV_APPROVED_KEY = "pctsvApprovedClasses";
const GVCN_ALL_DATA_KEY  = "gvcnAllData";
const LINKED_MSSV        = "221121521200";
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

const injectGvcnScores = (scoreData, gvcnSavedScores, selfScores) =>
  scoreData.map((section, sectionIdx) => {
    let sectionGvcnTotal = 0;
    const criteria = section.criteria.map((criterion, criterionIdx) => {
      const items = criterion.items.map((item, itemIdx) => {
        if (item.note) return item;
        const key = `${sectionIdx}-${criterionIdx}-${itemIdx}`;
        const score =
          gvcnSavedScores[key] !== undefined
            ? gvcnSavedScores[key]
            : (selfScores[key] !== undefined ? selfScores[key] : 0);
        sectionGvcnTotal += Number(score);
        return { ...item, reviewerScore: score };
      });
      return { ...criterion, items };
    });
    return { ...section, criteria, reviewerScore: sectionGvcnTotal };
  });

const StudentHome = () => {
  const allYears      = readLS(LS_KEYS.YEARS, []);
  const allSemesters  = readLS(LS_KEYS.SEMESTERS, {});
  const adminCriteria = readLS(LS_KEYS.CRITERIA, []);

  const [filter, updateFilter] = useRoleFilter(ROLES.STUDENT, {
    yearId: "",
    semesterId: "",
  });

  const selectedYearId     = filter.yearId;
  const selectedSemesterId = filter.semesterId;

  const selectedYear     = allYears.find((y) => y.id === selectedYearId) ?? null;
  const semesters        = selectedYearId ? (allSemesters[selectedYearId] ?? []) : [];
  const selectedSemester = semesters.find((s) => s.id === selectedSemesterId) ?? null;

  const baseScoreData = transformToScoreData(adminCriteria);

  const periodKey = selectedYearId && selectedSemesterId
    ? `${selectedYearId}_${selectedSemesterId}`
    : null;

  const pctsvApproved   = readLS(PCTSV_APPROVED_KEY, {});
  const isPctsvApproved = periodKey
    ? !!pctsvApproved[`${LINKED_CLASS_ID}_${periodKey}`]
    : false;

  const gvcnAllData     = readLS(GVCN_ALL_DATA_KEY, {});
  const gvcnSavedScores = periodKey
    ? (gvcnAllData[periodKey]?.[LINKED_MSSV]?.savedScores ?? {})
    : {};

  const hasDataForCurrentPeriod =
    !!selectedYearId && !!selectedSemesterId && adminCriteria.length > 0;

  const handleYearChange = (yearId) => {
    updateFilter({ yearId, semesterId: "" });
  };

  const timeWindow = useTimeWindow(selectedYearId, selectedSemesterId, "student");

  const {
    isEditing,
    isSubmitted,
    showConfirmModal,
    uploadedImages,
    tempImages,
    viewingImage,
    modalItemKey,
    setModalItemKey,
    editingImage,
    setEditingImage,
    handleScoreChange,
    handleRemoveTempImage,
    handleUploadClick,
    handleImageClick,
    closeImageViewer,
    handleSave,
    handleConfirmSave,
    handleCancelSave,
    handleStartScoring,
    handleSubmitForReview,
    handleSaveMinhChung,
    handleUpdateMinhChung,
    getItemKey,
    calculateSectionScore,
    hasAnySavedData,
    getDisplayScore,
    calculateTotals,
  } = useScoreManagement(
    baseScoreData,
    selectedYearId,
    selectedSemesterId,
    hasDataForCurrentPeriod,
    timeWindow
  );

  const selfScoresForInject = (() => {
    try {
      const raw = localStorage.getItem("studentAllData");
      if (!raw || !periodKey) return {};
      const all = JSON.parse(raw);
      return all[periodKey]?.savedScores ?? {};
    } catch { return {}; }
  })();

  const scoreData = isPctsvApproved
    ? injectGvcnScores(baseScoreData, gvcnSavedScores, selfScoresForInject)
    : baseScoreData;

  const totals = calculateTotals();

  const effectiveTimeWindow = isPctsvApproved
    ? { canEdit: false, status: "after", startTime: null, endTime: null }
    : timeWindow;

  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const handleSubmitClick   = () => setShowSubmitModal(true);
  const handleConfirmSubmit = () => { setShowSubmitModal(false); handleSubmitForReview(); };
  const handleCancelSubmit  = () => setShowSubmitModal(false);

  return (
    <div className="space-y-4 md:space-y-6">

      <ScoreFilter
        years={allYears}
        semesters={semesters}
        selectedYearId={selectedYearId}
        selectedSemesterId={selectedSemesterId}
        onYearChange={handleYearChange}
        onSemesterChange={(id) => updateFilter({ semesterId: id })}
        showActionButton={hasDataForCurrentPeriod}
        actionButton={
          <ActionButton
            isEditing={isEditing}
            hasAnySavedData={hasAnySavedData()}
            onSave={handleSave}
            onEdit={handleStartScoring}
            onSubmit={handleSubmitClick}
            isSubmitted={isSubmitted}
            timeWindow={effectiveTimeWindow}
          />
        }
      />

      {!hasDataForCurrentPeriod ? (
        <EmptyState
          selectedSemesterName={selectedSemester?.name ?? ""}
          selectedYearName={selectedYear?.name ?? ""}
          hasCriteria={adminCriteria.length > 0}
          hasPeriodSelected={!!selectedYearId && !!selectedSemesterId}
        />
      ) : (
        <>
          <ScoreTableDesktop
            scoreData={scoreData}
            totals={totals}
            isEditing={isEditing}
            uploadedImages={uploadedImages}
            tempImages={tempImages}
            getItemKey={getItemKey}
            calculateSectionScore={calculateSectionScore}
            getDisplayScore={getDisplayScore}
            handleScoreChange={handleScoreChange}
            handleUploadClick={handleUploadClick}
            handleImageClick={handleImageClick}
            handleRemoveTempImage={handleRemoveTempImage}
          />

          <ScoreCardsMobile
            scoreData={scoreData}
            totals={totals}
            isEditing={isEditing}
            uploadedImages={uploadedImages}
            tempImages={tempImages}
            getItemKey={getItemKey}
            calculateSectionScore={calculateSectionScore}
            getDisplayScore={getDisplayScore}
            handleScoreChange={handleScoreChange}
            handleUploadClick={handleUploadClick}
            handleImageClick={handleImageClick}
            handleRemoveTempImage={handleRemoveTempImage}
          />

          <div className="flex justify-center md:justify-end">
            <ActionButton
              isEditing={isEditing}
              hasAnySavedData={hasAnySavedData()}
              onSave={handleSave}
              onEdit={handleStartScoring}
              onSubmit={handleSubmitClick}
              isSubmitted={isSubmitted}
              timeWindow={effectiveTimeWindow}
            />
          </div>
        </>
      )}

      <ImageViewer imageUrl={viewingImage} onClose={closeImageViewer} />

      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />

      <ConfirmModal
        isOpen={showSubmitModal}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        title="Xác nhận gửi duyệt"
        message="Sau khi gửi, điểm tự chấm của bạn sẽ được chuyển đến Ban cán sự lớp. Bạn có chắc chắn muốn gửi duyệt không?"
        confirmLabel="Gửi duyệt"
        confirmClassName="px-5 py-2.5 bg-[#3d2f6b] text-white rounded-lg hover:bg-[#2f2454] transition-colors cursor-pointer font-medium"
      />

      {modalItemKey && (
        <MinhChungModal
          onSave={handleSaveMinhChung}
          onClose={() => setModalItemKey(null)}
        />
      )}

      {editingImage && (
        <MinhChungModal
          initialData={editingImage.data}
          onSave={handleUpdateMinhChung}
          onClose={() => setEditingImage(null)}
        />
      )}
    </div>
  );
};

export default StudentHome;