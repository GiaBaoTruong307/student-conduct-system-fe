import { scoreData } from "../constants/scoreData";
import { useScoreManagement } from "../hooks/useScoreManagement";
import EmptyState from "../components/EmptyState";
import ScoreFilter from "../components/ScoreFilter";
import ActionButton from "../components/ActionButton";
import ScoreTableDesktop from "../components/ScoreTableDesktop";
import ScoreCardsMobile from "../components/ScoreCardsMobile";
import ImageViewer from "../components/ImageViewer";
import ConfirmModal from "../components/ConfirmModal";
import MinhChungModal from "../components/MinhChungModal";

const ClassLeaderHome = () => {
  const {
    selectedSemester,
    selectedYear,
    isEditing,
    showConfirmModal,
    uploadedImages,
    tempImages,
    viewingImage,
    hasDataForCurrentPeriod,
    modalItemKey,
    setModalItemKey,
    editingImage,
    setEditingImage,
    setSelectedSemester,
    setSelectedYear,
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
  } = useScoreManagement(scoreData);

  const totals = calculateTotals();

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filters */}
      <ScoreFilter
        selectedSemester={selectedSemester}
        selectedYear={selectedYear}
        onSemesterChange={setSelectedSemester}
        onYearChange={setSelectedYear}
        showActionButton={hasDataForCurrentPeriod}
        actionButton={
          <ActionButton
            isEditing={isEditing}
            hasAnySavedData={hasAnySavedData()}
            onSave={handleSave}
            onEdit={handleStartScoring}
          />
        }
      />

      {/* Conditional Rendering: Empty State hoặc Score Table */}
      {!hasDataForCurrentPeriod ? (
        <EmptyState
          selectedSemester={selectedSemester}
          selectedYear={selectedYear}
        />
      ) : (
        <>
          {/* Score Table - Desktop */}
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

          {/* Score Cards - Mobile & Tablet */}
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

          {/* Action Button - Bottom */}
          <div className="flex justify-center md:justify-end">
            <ActionButton
              isEditing={isEditing}
              hasAnySavedData={hasAnySavedData()}
              onSave={handleSave}
              onEdit={handleStartScoring}
            />
          </div>
        </>
      )}

      {/* Image Viewer Modal */}
      <ImageViewer imageUrl={viewingImage} onClose={closeImageViewer} />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />

      {/* Modal thêm minh chứng mới */}
      {modalItemKey && (
        <MinhChungModal
          onSave={handleSaveMinhChung}
          onClose={() => setModalItemKey(null)}
        />
      )}

      {/* Modal chỉnh sửa minh chứng */}
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