import { useState } from "react";
import { useScoreContext } from "../../../context/ScoreContext";

export const useReviewerScoreManagement = (scoreData, mssv) => {
  const { reviewerScoresByMssv, setReviewerScoresForMssv } = useScoreContext();

  const existing = reviewerScoresByMssv[mssv] || {
    savedScores: {},
    notes: {},
    total: 0,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [savedReviewerScores, setSavedReviewerScores] = useState(
    existing.savedScores
  );
  const [tempReviewerScores, setTempReviewerScores] = useState({});
  const [savedNotes, setSavedNotes] = useState(existing.notes);
  const [tempNotes, setTempNotes] = useState({});
  const [noteModalKey, setNoteModalKey] = useState(null);

  const getItemKey = (sectionIdx, criterionIdx, itemIdx) =>
    `${sectionIdx}-${criterionIdx}-${itemIdx}`;

  const calculateReviewerSectionScore = (sectionIdx) => {
    const section = scoreData[sectionIdx];
    let total = 0;
    section.criteria.forEach((criterion, criterionIdx) => {
      criterion.items.forEach((item, itemIdx) => {
        if (item.note) return;
        const key = getItemKey(sectionIdx, criterionIdx, itemIdx);
        const source = isEditing ? tempReviewerScores : savedReviewerScores;
        const score = source[key];
        if (score !== undefined && score !== "") total += Number(score);
      });
    });
    return total;
  };

  const handleReviewerScoreChange = (itemKey, value, maxScore) => {
    const numValue = value === "" ? "" : Number(value);
    if (value === "" || (numValue >= 0 && numValue <= maxScore)) {
      setTempReviewerScores((prev) => ({
        ...prev,
        [itemKey]: value === "" ? "" : numValue,
      }));
    }
  };

  const getReviewerDisplayScore = (itemKey) => {
    if (isEditing) {
      return tempReviewerScores[itemKey] !== undefined
        ? tempReviewerScores[itemKey]
        : savedReviewerScores[itemKey] !== undefined
        ? savedReviewerScores[itemKey]
        : "";
    }
    return savedReviewerScores[itemKey] !== undefined
      ? savedReviewerScores[itemKey]
      : "";
  };

  const handleStartScoring = () => {
    setIsEditing(true);
    setTempReviewerScores({ ...savedReviewerScores });
    setTempNotes({ ...savedNotes });
  };

  const handleSave = () => setShowConfirmModal(true);

  const handleConfirmSave = () => {
    const filteredScores = {};
    Object.keys(tempReviewerScores).forEach((key) => {
      if (
        tempReviewerScores[key] !== "" &&
        tempReviewerScores[key] !== undefined &&
        tempReviewerScores[key] !== null
      ) {
        filteredScores[key] = tempReviewerScores[key];
      }
    });

    const total = Object.values(filteredScores).reduce(
      (sum, v) => sum + Number(v),
      0
    );

    const newNotes = { ...tempNotes };

    setSavedReviewerScores(filteredScores);
    setSavedNotes(newNotes);
    setTempReviewerScores({});
    setTempNotes({});
    setIsEditing(false);
    setShowConfirmModal(false);

    setReviewerScoresForMssv(mssv, {
      savedScores: filteredScores,
      notes: newNotes,
      total,
    });
  };

  const handleCancelSave = () => setShowConfirmModal(false);

  const hasAnySavedData = () =>
    Object.values(savedReviewerScores).some(
      (s) => s !== "" && s !== undefined && s !== null
    );

  const calculateReviewerTotals = () => {
    return scoreData.reduce(
      (acc, section) => {
        section.criteria.forEach((criterion) => {
          criterion.items.forEach((item, itemIdx) => {
            const sectionIdx = scoreData.indexOf(section);
            const criterionIdx = section.criteria.indexOf(criterion);
            const key = getItemKey(sectionIdx, criterionIdx, itemIdx);
            acc.max += Number(item.maxScore || 0);
            const s = savedReviewerScores[key];
            if (s !== undefined && s !== "" && s !== null)
              acc.reviewer += Number(s);
          });
        });
        return acc;
      },
      { max: 0, reviewer: 0 }
    );
  };

  // Note handlers
  const openNoteModal = (itemKey) => setNoteModalKey(itemKey);

  const handleSaveNote = (text) => {
    const key = noteModalKey;
    if (isEditing) {
      setTempNotes((prev) => ({ ...prev, [key]: text }));
    } else {
      // Khi không ở edit mode (click Xem → sửa → lưu), cập nhật thẳng vào savedNotes + context
      const newNotes = { ...savedNotes, [key]: text };
      setSavedNotes(newNotes);
      const data = reviewerScoresByMssv[mssv] || {
        savedScores: {},
        total: 0,
      };
      setReviewerScoresForMssv(mssv, { ...data, notes: newNotes });
    }
    setNoteModalKey(null);
  };

  const closeNoteModal = () => setNoteModalKey(null);

  const getNote = (itemKey) => {
    const source = isEditing ? tempNotes : savedNotes;
    return source[itemKey] || "";
  };

  return {
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
  };
};