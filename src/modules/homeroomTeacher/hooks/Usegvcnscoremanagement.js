import { useState } from "react";
import { useScoreContext } from "../../../context/ScoreContext";

const GVCN_SCORES_KEY = "gvcnScoresByMssv";

const readLS = (key, def) => {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : def;
  } catch {
    return def;
  }
};

export const useGVCNScoreManagement = (scoreData, mssv) => {
  const [gvcnScoresByMssv, setGvcnScoresByMssvState] = useState(
    () => readLS(GVCN_SCORES_KEY, {})
  );

  const { reviewerScoresByMssv } = useScoreContext();

  const setGvcnScoresForMssv = (mssvKey, data) => {
    setGvcnScoresByMssvState((prev) => {
      const updated = { ...prev, [mssvKey]: data };
      localStorage.setItem(GVCN_SCORES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const existing = gvcnScoresByMssv[mssv] || { savedScores: {}, total: 0 };

  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [savedGvcnScores, setSavedGvcnScores] = useState(existing.savedScores || {});
  const [tempGvcnScores, setTempGvcnScores] = useState({});

  // Note modal — chỉ dùng để xem ghi chú BCS (read-only)
  const [noteModalKey, setNoteModalKey] = useState(null);
  const [noteModalOwner, setNoteModalOwner] = useState(null);

  const getItemKey = (sectionIdx, criterionIdx, itemIdx) =>
    `${sectionIdx}-${criterionIdx}-${itemIdx}`;

  // Đọc điểm & ghi chú của BCS từ context (chỉ đọc)
  const getBcsScore = (itemKey) => {
    const data = reviewerScoresByMssv[mssv];
    if (!data) return "";
    return data.savedScores?.[itemKey] !== undefined
      ? data.savedScores[itemKey]
      : "";
  };

  const getBcsNote = (itemKey) => {
    const data = reviewerScoresByMssv[mssv];
    if (!data) return "";
    return data.notes?.[itemKey] || "";
  };

  const calculateGvcnSectionScore = (sectionIdx) => {
    const section = scoreData[sectionIdx];
    let total = 0;
    section.criteria.forEach((criterion, criterionIdx) => {
      criterion.items.forEach((item, itemIdx) => {
        if (item.note) return;
        const key = getItemKey(sectionIdx, criterionIdx, itemIdx);
        const source = isEditing ? tempGvcnScores : savedGvcnScores;
        const score = source[key];
        if (score !== undefined && score !== "") total += Number(score);
      });
    });
    return total;
  };

  const handleGvcnScoreChange = (itemKey, value, maxScore) => {
    const numValue = value === "" ? "" : Number(value);
    if (value === "" || (numValue >= 0 && numValue <= maxScore)) {
      setTempGvcnScores((prev) => ({
        ...prev,
        [itemKey]: value === "" ? "" : numValue,
      }));
    }
  };

  const getGvcnDisplayScore = (itemKey) => {
    if (isEditing) {
      return tempGvcnScores[itemKey] !== undefined
        ? tempGvcnScores[itemKey]
        : savedGvcnScores[itemKey] !== undefined
        ? savedGvcnScores[itemKey]
        : "";
    }
    return savedGvcnScores[itemKey] !== undefined
      ? savedGvcnScores[itemKey]
      : "";
  };

  const handleStartScoring = () => {
    setIsEditing(true);
    setTempGvcnScores({ ...savedGvcnScores });
  };

  const handleSave = () => setShowConfirmModal(true);

  const handleConfirmSave = () => {
    const filteredScores = {};
    Object.keys(tempGvcnScores).forEach((key) => {
      if (
        tempGvcnScores[key] !== "" &&
        tempGvcnScores[key] !== undefined &&
        tempGvcnScores[key] !== null
      ) {
        filteredScores[key] = tempGvcnScores[key];
      }
    });

    const total = Object.values(filteredScores).reduce(
      (sum, v) => sum + Number(v),
      0
    );

    setSavedGvcnScores(filteredScores);
    setTempGvcnScores({});
    setIsEditing(false);
    setShowConfirmModal(false);

    setGvcnScoresForMssv(mssv, { savedScores: filteredScores, total });
  };

  const handleCancelSave = () => setShowConfirmModal(false);

  const hasAnySavedData = () => Object.keys(savedGvcnScores).length > 0;

  const calculateGvcnTotals = () => {
    return scoreData.reduce(
      (acc, section) => {
        section.criteria.forEach((criterion) => {
          criterion.items.forEach((item, itemIdx) => {
            const sectionIdx = scoreData.indexOf(section);
            const criterionIdx = section.criteria.indexOf(criterion);
            const key = getItemKey(sectionIdx, criterionIdx, itemIdx);
            acc.max += Number(item.maxScore || 0);
            const s = savedGvcnScores[key];
            if (s !== undefined && s !== "" && s !== null)
              acc.gvcn += Number(s);
          });
        });
        return acc;
      },
      { max: 0, gvcn: 0 }
    );
  };

  const openBcsNoteModal = (itemKey) => {
    setNoteModalKey(itemKey);
    setNoteModalOwner("bcs");
  };

  const closeNoteModal = () => {
    setNoteModalKey(null);
    setNoteModalOwner(null);
  };

  return {
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
    getBcsScore,
    getBcsNote,
  };
};