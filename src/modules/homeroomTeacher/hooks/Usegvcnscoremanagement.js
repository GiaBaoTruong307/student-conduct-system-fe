import { useState, useEffect } from "react";
import { useScoreContext } from "../../../context/ScoreContext";

const GVCN_ALL_DATA_KEY = "gvcnAllData";
const GVCN_CHECKED_KEY  = "gvcnBoardChecked";
const GVCN_REQUESTS_KEY = "gvcnAdjustmentRequests";
const GVCN_NOTIF_KEY    = "gvcnNotifications";

const readLS  = (key, def) => { try { const r = localStorage.getItem(key); return r !== null ? JSON.parse(r) : def; } catch { return def; } };
const writeLS = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

const todayStr = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
};

export const useGVCNScoreManagement = (
  scoreData,
  mssv,
  yearId,
  semId,
  selfScores = {},
  {
    rescoreMode    = false,
    rescoreNotifId = null,
    hocKy          = "",
    namHoc         = "",
    svHoTen        = "",
    svLop          = "48K14.1",
  } = {}
) => {
  const { getReviewerPeriodData } = useScoreContext();

  const [isEditing,        setIsEditing]        = useState(false);
  const [showConfirmModal, setShowConfirmModal]  = useState(false);
  const [savedGvcnScores,  setSavedGvcnScores]  = useState({});
  const [tempGvcnScores,   setTempGvcnScores]   = useState({});
  const [noteModalKey,     setNoteModalKey]      = useState(null);
  const [noteModalOwner,   setNoteModalOwner]    = useState(null);
  const [isDraft,          setIsDraft]           = useState(false);
  const [modifiedKeys,     setModifiedKeys]      = useState({});

  // Load / reset when period or mssv changes
  useEffect(() => {
    if (!yearId || !semId || !mssv) {
      setSavedGvcnScores({});
      setIsEditing(false);
      setTempGvcnScores({});
      setIsDraft(false);
      setModifiedKeys({});
      return;
    }
    try {
      const all  = readLS(GVCN_ALL_DATA_KEY, {});
      const data = (all[`${yearId}_${semId}`] ?? {})[mssv];
      setSavedGvcnScores(data?.savedScores ?? {});
      setIsDraft(data?.isDraft ?? false);
      setModifiedKeys(data?.modifiedKeys ?? {});
    } catch {
      setSavedGvcnScores({});
      setIsDraft(false);
      setModifiedKeys({});
    }
    setIsEditing(false);
    setTempGvcnScores({});
  }, [yearId, semId, mssv]);

  const persistGvcnScores = (data) => {
    const all = readLS(GVCN_ALL_DATA_KEY, {});
    const key = `${yearId}_${semId}`;
    writeLS(GVCN_ALL_DATA_KEY, {
      ...all,
      [key]: { ...(all[key] ?? {}), [mssv]: data },
    });
  };

  const getItemKey = (sectionIdx, criterionIdx, itemIdx) =>
    `${sectionIdx}-${criterionIdx}-${itemIdx}`;

  const getBcsScore = (itemKey) => {
    const periodData = getReviewerPeriodData(yearId, semId);
    const data = periodData[mssv];
    if (!data) return "";
    return data.savedScores?.[itemKey] !== undefined ? data.savedScores[itemKey] : "";
  };

  const getBcsNote = (itemKey) => {
    const periodData = getReviewerPeriodData(yearId, semId);
    const data = periodData[mssv];
    if (!data) return "";
    return data.notes?.[itemKey] || "";
  };

  const calculateGvcnSectionScore = (sectionIdx) => {
    const section = scoreData[sectionIdx];
    if (!section) return 0;
    let total = 0;
    section.criteria.forEach((criterion, criterionIdx) => {
      criterion.items.forEach((item, itemIdx) => {
        if (item.note) return;
        const key    = getItemKey(sectionIdx, criterionIdx, itemIdx);
        const source = isEditing ? tempGvcnScores : savedGvcnScores;
        const score  = source[key] !== undefined ? source[key] : selfScores[key];
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
      setModifiedKeys((prev) => ({ ...prev, [itemKey]: true }));
    }
  };

  const getGvcnDisplayScore = (itemKey) => {
    if (isEditing) {
      return tempGvcnScores[itemKey] !== undefined
        ? tempGvcnScores[itemKey]
        : savedGvcnScores[itemKey] !== undefined
          ? savedGvcnScores[itemKey]
          : selfScores[itemKey] !== undefined
            ? selfScores[itemKey]
            : "";
    }
    if (savedGvcnScores[itemKey] !== undefined) return savedGvcnScores[itemKey];
    return selfScores[itemKey] !== undefined ? selfScores[itemKey] : "";
  };

  const isGvcnModified = (itemKey) => !!modifiedKeys[itemKey];

  const handleStartScoring = () => {
    setIsEditing(true);
    if (Object.keys(savedGvcnScores).length === 0) {
      setTempGvcnScores({ ...selfScores });
      setModifiedKeys({});
    } else {
      setTempGvcnScores({ ...savedGvcnScores });
    }
  };

  const handleSave = () => setShowConfirmModal(true);

  const handleSaveDraft = () => {
    const filteredScores = {};
    Object.keys(tempGvcnScores).forEach((key) => {
      if (tempGvcnScores[key] !== "" && tempGvcnScores[key] !== undefined && tempGvcnScores[key] !== null)
        filteredScores[key] = tempGvcnScores[key];
    });
    const total = Object.values(filteredScores).reduce((sum, v) => sum + Number(v), 0);
    setSavedGvcnScores(filteredScores);
    setTempGvcnScores({});
    setIsEditing(false);
    setIsDraft(true);
    persistGvcnScores({ savedScores: filteredScores, total, isDraft: true, modifiedKeys });
  };

  const handleConfirmSave = () => {
    const filteredScores = {};
    Object.keys(tempGvcnScores).forEach((key) => {
      if (tempGvcnScores[key] !== "" && tempGvcnScores[key] !== undefined && tempGvcnScores[key] !== null)
        filteredScores[key] = tempGvcnScores[key];
    });
    const total = Object.values(filteredScores).reduce((sum, v) => sum + Number(v), 0);

    setSavedGvcnScores(filteredScores);
    setTempGvcnScores({});
    setIsEditing(false);
    setShowConfirmModal(false);
    setIsDraft(false);
    persistGvcnScores({ savedScores: filteredScores, total, isDraft: false, modifiedKeys });

    if (!rescoreMode) {
      // Chế độ thường: auto-tick checkbox
      if (mssv) {
        const periodKey    = `${yearId}_${semId}`;
        const allCheckedLS = readLS(GVCN_CHECKED_KEY, {});
        writeLS(GVCN_CHECKED_KEY, {
          ...allCheckedLS,
          [periodKey]: { ...(allCheckedLS[periodKey] ?? {}), [mssv]: true },
        });
        window.dispatchEvent(new CustomEvent("gvcnCheckedUpdated"));
      }
    } else {
      // Chế độ chấm lại: tạo entry rescore trong gvcnAdjustmentRequests
      const existing = readLS(GVCN_REQUESTS_KEY, []);
      const newId    = existing.length > 0 ? Math.max(...existing.map((r) => r.id)) + 1 : 1;
      const rescoreEntry = {
        id:                 newId,
        source:             "rescore",
        originalNotifId:    rescoreNotifId,
        mssv,
        svHoTen,
        svLop,
        hocKy,
        namHoc,
        yearId,
        semId,
        drlMoi:             total,
        trangThai:          "rescore-submitted",
        rescoreSubmittedAt: new Date().toISOString(),
        ngayTao:            todayStr(),
      };
      writeLS(GVCN_REQUESTS_KEY, [rescoreEntry, ...existing]);

      // Đánh dấu notification đã submit
      if (rescoreNotifId) {
        const notifs = readLS(GVCN_NOTIF_KEY, []);
        writeLS(GVCN_NOTIF_KEY, notifs.map((n) =>
          n.id === rescoreNotifId ? { ...n, rescoreSubmitted: true } : n
        ));
      }

      window.dispatchEvent(new CustomEvent("gvcnRescoreSubmitted"));
      window.dispatchEvent(new CustomEvent("gvcnRequestsUpdated"));
    }
  };

  const handleCancelSave = () => setShowConfirmModal(false);

  const hasAnySavedData = () => Object.keys(savedGvcnScores).length > 0;

  const calculateGvcnTotals = () => {
    return scoreData.reduce(
      (acc, section, sectionIdx) => {
        section.criteria.forEach((criterion, criterionIdx) => {
          criterion.items.forEach((item, itemIdx) => {
            const key = getItemKey(sectionIdx, criterionIdx, itemIdx);
            acc.max += Number(item.maxScore || 0);
            const s = savedGvcnScores[key] !== undefined ? savedGvcnScores[key] : selfScores[key];
            if (s !== undefined && s !== "" && s !== null) acc.gvcn += Number(s);
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
    getBcsScore,
    getBcsNote,
  };
};