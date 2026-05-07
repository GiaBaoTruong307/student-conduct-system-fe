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

const ADMIN_LS_KEYS = {
  YEARS: "admin_academic_years",
  SEMESTERS: "admin_academic_semesters",
  CRITERIA: "admin_criteria_sections",
};

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
          title: subs.length > 0 ? (cr.content || "") : null,
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

const ClassLeaderHome = () => {
  const allYears = readLS(ADMIN_LS_KEYS.YEARS, []);
  const allSemesters = readLS(ADMIN_LS_KEYS.SEMESTERS, {});
  const adminCriteria = readLS(ADMIN_LS_KEYS.CRITERIA, []);

  const mssv = localStorage.getItem("username");

  const [selectedYearId, setSelectedYearId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");

  const selectedYear = allYears.find((y) => y.id === selectedYearId) ?? null;
  const semesters = selectedYearId ? (allSemesters[selectedYearId] ?? []) : [];
  const selectedSemester = semesters.find((s) => s.id === selectedSemesterId) ?? null;

  const scoreData = transformToScoreData(adminCriteria);

  const hasDataForCurrentPeriod =
    !!selectedYearId && !!selectedSemesterId && adminCriteria.length > 0;

  const handleYearChange = (yearId) => {
    setSelectedYearId(yearId);
    setSelectedSemesterId("");
  };

  const timeWindow = useTimeWindow(selectedYearId, selectedSemesterId, "classLeader");

  const {
    isEditing,
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
    handleSaveMinhChung,
    handleUpdateMinhChung,
    getItemKey,
    calculateSectionScore,
    hasAnySavedData,
    getDisplayScore,
    calculateTotals,
  } = useScoreManagement(
    scoreData,
    selectedYearId,
    selectedSemesterId,
    hasDataForCurrentPeriod
  );

  const totals = calculateTotals();

  return (
    <div className="space-y-4 md:space-y-6">
      <ScoreFilter
        years={allYears}
        semesters={semesters}
        selectedYearId={selectedYearId}
        selectedSemesterId={selectedSemesterId}
        onYearChange={handleYearChange}
        onSemesterChange={setSelectedSemesterId}
        showActionButton={hasDataForCurrentPeriod}
        actionButton={
          <ActionButton
            isEditing={isEditing}
            hasAnySavedData={hasAnySavedData()}
            onSave={handleSave}
            onEdit={handleStartScoring}
            timeWindow={timeWindow}
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
            mssv={mssv}
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
            mssv={mssv}
          />

          <div className="flex justify-center md:justify-end">
            <ActionButton
              isEditing={isEditing}
              hasAnySavedData={hasAnySavedData()}
              onSave={handleSave}
              onEdit={handleStartScoring}
              timeWindow={timeWindow}
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

export default ClassLeaderHome;