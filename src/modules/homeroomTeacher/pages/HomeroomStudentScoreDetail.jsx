import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { classMembers } from "../../classLeader/constants/classMembers";
import { scoreData } from "../../classLeader/constants/scoreData";
import { useScoreContext } from "../../../context/ScoreContext";
import GVCNScoreTableDesktop from "../components/GVCNScoreTableDesktop";
import GVCNScoreCardsMobile from "../components/GVCNScoreCardsMobile";
import GhiChuViewModal from "../components/GhiChuViewModal";
import ImageViewer from "../../classLeader/components/ImageViewer";
import ConfirmModal from "../../classLeader/components/ConfirmModal";
import { useGVCNScoreManagement } from "../hooks/Usegvcnscoremanagement";

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
        className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer text-sm"
      >
        Chấm
      </button>
    )}
  </div>
);

const HomeroomStudentScoreDetail = () => {
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
    noteModalOwner,
    getItemKey,
    calculateGvcnSectionScore,
    handleGvcnScoreChange,
    getGvcnDisplayScore,
    handleStartScoring,
    handleSave,
    handleConfirmSave,
    handleCancelSave,
    hasAnySavedData,
    calculateGvcnTotals,
    openBcsNoteModal,
    closeNoteModal,
    getBcsNote,
  } = useGVCNScoreManagement(scoreData, mssv);

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

  const selfScores = member.isLinkedToStudent ? (studentSavedScores || {}) : {};
  const selfImages = member.isLinkedToStudent ? (studentUploadedImages || {}) : {};
  const selfTotal = member.isLinkedToStudent ? studentSelfTotal : 0;

  const gvcnTotals = calculateGvcnTotals();
  const savedData = hasAnySavedData();
  const goBack = () => navigate("/homeroom-teacher/class-score");

  const isBcsNoteOpen = noteModalKey !== null && noteModalOwner === "bcs";

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
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
      <GVCNScoreTableDesktop
        scoreData={scoreData}
        selfScores={selfScores}
        uploadedImages={selfImages}
        isEditing={isEditing}
        getItemKey={getItemKey}
        calculateGvcnSectionScore={calculateGvcnSectionScore}
        getGvcnDisplayScore={getGvcnDisplayScore}
        handleGvcnScoreChange={handleGvcnScoreChange}
        handleImageClick={(img) => setViewingImage(img)}
        getBcsNote={getBcsNote}
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
        handleGvcnScoreChange={handleGvcnScoreChange}
        handleImageClick={(img) => setViewingImage(img)}
        getBcsNote={getBcsNote}
        openBcsNoteModal={openBcsNoteModal}
        selfTotal={selfTotal}
        gvcnTotals={gvcnTotals}
      />

      {/* Buttons dưới cùng */}
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

      {/* Modal xem ghi chú BCS — chỉ đọc */}
      {isBcsNoteOpen && (
        <GhiChuViewModal
          title="Ghi chú của BCS"
          text={getBcsNote(noteModalKey)}
          onClose={closeNoteModal}
        />
      )}
    </div>
  );
};

export default HomeroomStudentScoreDetail;