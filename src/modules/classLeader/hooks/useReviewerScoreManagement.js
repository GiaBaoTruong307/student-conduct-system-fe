import { useState, useEffect } from "react";
import { useScoreContext } from "../../../context/ScoreContext";
import { getAutoScoreFromSystemB } from "../../../utils/gpaConvert"; // ← THÊM

const CHECKED_KEY = "classBoardChecked";

export const useReviewerScoreManagement = (scoreData, mssv, yearId, semId) => {
  const { getReviewerPeriodData, setReviewerForPeriod } = useScoreContext();

  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [savedReviewerScores, setSavedReviewerScores] = useState({});
  const [tempReviewerScores, setTempReviewerScores] = useState({});
  const [savedNotes, setSavedNotes] = useState({});
  const [tempNotes, setTempNotes] = useState({});
  const [noteModalKey, setNoteModalKey] = useState(null);
  const [isDraft, setIsDraft] = useState(false);

  useEffect(() => {
    if (!yearId || !semId || !mssv) {
      setSavedReviewerScores({});
      setSavedNotes({});
      setIsEditing(false);
      setTempReviewerScores({});
      setTempNotes({});
      setIsDraft(false);
      return;
    }
    try {
      const all = JSON.parse(localStorage.getItem("reviewerAllData") || "{}");
      const periodData = all[`${yearId}_${semId}`] ?? {};
      const existing = periodData[mssv] ?? { savedScores: {}, notes: {}, isDraft: false };
      setSavedReviewerScores(existing.savedScores ?? {});
      setSavedNotes(existing.notes ?? {});
      setIsDraft(existing.isDraft ?? false);
    } catch {
      setSavedReviewerScores({});
      setSavedNotes({});
      setIsDraft(false);
    }
    setIsEditing(false);
    setTempReviewerScores({});
    setTempNotes({});
  }, [yearId, semId, mssv]);

  const getItemKey = (sectionIdx, criterionIdx, itemIdx) =>
    `${sectionIdx}-${criterionIdx}-${itemIdx}`;

  // ← SỬA: bổ sung auto-score cho note items
  const calculateReviewerSectionScore = (sectionIdx) => {
    const section = scoreData[sectionIdx];
    let total = 0;
    section.criteria.forEach((criterion, criterionIdx) => {
      criterion.items.forEach((item, itemIdx) => {
        if (item.note) {
          const auto = getAutoScoreFromSystemB(mssv);
          if (auto !== null) total += auto;
          return;
        }
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

  const handleSaveDraft = () => {
    const filteredScores = {};
    Object.keys(tempReviewerScores).forEach((key) => {
      if (tempReviewerScores[key] !== "" && tempReviewerScores[key] !== undefined && tempReviewerScores[key] !== null) {
        filteredScores[key] = tempReviewerScores[key];
      }
    });

    // ← SỬA: cộng auto-score vào total
    let total = Object.values(filteredScores).reduce((sum, v) => sum + Number(v), 0);
    scoreData.forEach((section) => {
      section.criteria.forEach((criterion) => {
        criterion.items.forEach((item) => {
          if (!item.note) return;
          const auto = getAutoScoreFromSystemB(mssv);
          if (auto !== null) total += auto;
        });
      });
    });

    const newNotes = { ...tempNotes };

    setSavedReviewerScores(filteredScores);
    setSavedNotes(newNotes);
    setTempReviewerScores({});
    setTempNotes({});
    setIsEditing(false);
    setIsDraft(true);

    setReviewerForPeriod(yearId, semId, mssv, {
      savedScores: filteredScores,
      notes: newNotes,
      total,
      isDraft: true,
    });
  };

  const handleConfirmSave = () => {
    const filteredScores = {};
    Object.keys(tempReviewerScores).forEach((key) => {
      if (tempReviewerScores[key] !== "" && tempReviewerScores[key] !== undefined && tempReviewerScores[key] !== null) {
        filteredScores[key] = tempReviewerScores[key];
      }
    });

    // ← SỬA: cộng auto-score vào total
    let total = Object.values(filteredScores).reduce((sum, v) => sum + Number(v), 0);
    scoreData.forEach((section) => {
      section.criteria.forEach((criterion) => {
        criterion.items.forEach((item) => {
          if (!item.note) return;
          const auto = getAutoScoreFromSystemB(mssv);
          if (auto !== null) total += auto;
        });
      });
    });

    const newNotes = { ...tempNotes };

    setSavedReviewerScores(filteredScores);
    setSavedNotes(newNotes);
    setTempReviewerScores({});
    setTempNotes({});
    setIsEditing(false);
    setShowConfirmModal(false);
    setIsDraft(false);

    setReviewerForPeriod(yearId, semId, mssv, {
      savedScores: filteredScores,
      notes: newNotes,
      total,
      isDraft: false,
    });

    if (yearId && semId && mssv) {
      try {
        const periodKey = `${yearId}_${semId}`;
        const allChecked = JSON.parse(localStorage.getItem(CHECKED_KEY) || "{}");
        const updated = {
          ...allChecked,
          [periodKey]: { ...(allChecked[periodKey] || {}), [mssv]: true },
        };
        localStorage.setItem(CHECKED_KEY, JSON.stringify(updated));
      } catch {}
    }
  };

  const handleCancelSave = () => setShowConfirmModal(false);

  const hasAnySavedData = () =>
    Object.values(savedReviewerScores).some(
      (s) => s !== "" && s !== undefined && s !== null
    ) ||
    Object.values(savedNotes).some(
      (n) => n !== "" && n !== undefined && n !== null
    );

  // ← SỬA: bổ sung auto-score vào totals
  const calculateReviewerTotals = () => {
    return scoreData.reduce(
      (acc, section) => {
        section.criteria.forEach((criterion) => {
          criterion.items.forEach((item) => {
            const sectionIdx = scoreData.indexOf(section);
            const criterionIdx = section.criteria.indexOf(criterion);
            const itemIdx = criterion.items.indexOf(item);
            const key = getItemKey(sectionIdx, criterionIdx, itemIdx);
            acc.max += Number(item.maxScore || 0);
            if (item.note) {
              const auto = getAutoScoreFromSystemB(mssv);
              if (auto !== null) acc.reviewer += auto;
              return;
            }
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

  const openNoteModal = (itemKey) => setNoteModalKey(itemKey);
  const closeNoteModal = () => setNoteModalKey(null);
  const getNote = (itemKey) => {
    if (isEditing) return tempNotes[itemKey] || "";
    return savedNotes[itemKey] || "";
  };
  const handleSaveNote = (text) => {
    if (noteModalKey === null) return;
    if (text && text.trim()) {
      setTempNotes((prev) => ({ ...prev, [noteModalKey]: text }));
    } else {
      setTempNotes((prev) => {
        const next = { ...prev };
        delete next[noteModalKey];
        return next;
      });
    }
    setNoteModalKey(null);
  };

  return {
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
  };
};