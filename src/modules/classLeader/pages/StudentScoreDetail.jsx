import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { classMembers } from "../constants/classMembers";
import { scoreData } from "../constants/scoreData";
import { useScoreContext } from "../../../context/ScoreContext";
import { useReviewerScoreManagement } from "../hooks/useReviewerScoreManagement";
import ReviewerScoreTableDesktop from "../components/ReviewerScoreTableDesktop";
import ReviewerScoreCardsMobile from "../components/ReviewerScoreCardsMobile";
import ImageViewer from "../components/ImageViewer";
import ConfirmModal from "../components/ConfirmModal";
import GhiChuModal from "../components/GhiChuModal";

const ActionButtons = ({ isEditing, hasAnySavedData, onBack, onSave, onStartScoring }) => (
  <div className="flex gap-3 flex-wrap">
    <button
      onClick={onBack}
      className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm"
    >
      ← Quay lại
    </button>
    {isEditing ? (
      <button
        onClick={onSave}
        className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors cursor-pointer text-sm"
      >
        Lưu
      </button>
    ) : hasAnySavedData ? (
      <button
        onClick={onStartScoring}
        className="px-5 py-2.5 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer text-sm"
      >
        Sửa
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

const StudentScoreDetail = () => {
  const { mssv } = useParams();
  const navigate = useNavigate();
  const {
    studentSavedScores,
    studentSelfTotal,
    studentUploadedImages,
  } = useScoreContext();

  const member = classMembers.find((m) => m.mssv === mssv);

  const {
    isEditing,
    showConfirmModal,
    noteModalKey,
    getItemKey,
    calculateReviewerSectionScore,
    handleReviewerScoreChange,
    getReviewerDisplayScore,
    handleStartScoring,
    handleSave,
    handleConfirmSave,
    handleCancelSave,
    hasAnySavedData,
    calculateReviewerTotals,
    openNoteModal,
    handleSaveNote,
    closeNoteModal,
    getNote,
  } = useReviewerScoreManagement(scoreData, mssv);

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

  const selfScores = member.isLinkedToStudent ? studentSavedScores : {};
  const selfImages = member.isLinkedToStudent ? studentUploadedImages : {};
  const selfTotal = member.isLinkedToStudent ? studentSelfTotal : 0;

  const reviewerTotals = calculateReviewerTotals();
  const savedData = hasAnySavedData();
  const goBack = () => navigate("/class-leader/class-score");

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header card: thông tin sinh viên + buttons trên */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Thông tin sinh viên */}
          <div className="flex-1 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {member.ten.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-gray-800 text-base md:text-lg">
                {member.ho} {member.ten}
              </div>
              <div className="text-sm text-gray-500">
                MSSV: {member.mssv} · Ngày sinh: {member.ngaySinh}
              </div>
            </div>
          </div>

          <ActionButtons
            isEditing={isEditing}
            hasAnySavedData={savedData}
            onBack={goBack}
            onSave={handleSave}
            onStartScoring={handleStartScoring}
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
        handleReviewerScoreChange={handleReviewerScoreChange}
        handleImageClick={(img) => setViewingImage(img)}
        getNote={getNote}
        openNoteModal={openNoteModal}
        selfTotal={selfTotal}
        reviewerTotals={reviewerTotals}
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
      />

      {/* Buttons dưới cùng — tránh phải scroll lên */}
      <div className="flex justify-end">
        <ActionButtons
          isEditing={isEditing}
          hasAnySavedData={savedData}
          onBack={goBack}
          onSave={handleSave}
          onStartScoring={handleStartScoring}
        />
      </div>

      {/* Image Viewer */}
      <ImageViewer
        imageUrl={viewingImage}
        onClose={() => setViewingImage(null)}
      />

      {/* Confirm Save Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />

      {/* Ghi chú BCS Modal */}
      {noteModalKey !== null && (
        <GhiChuModal
          initialText={getNote(noteModalKey)}
          onSave={handleSaveNote}
          onClose={closeNoteModal}
        />
      )}
    </div>
  );
};

export default StudentScoreDetail;