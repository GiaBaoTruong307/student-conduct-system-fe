import { useState, useEffect } from "react";

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const CL_ALL_DATA_KEY = "classLeaderAllData";

const loadPeriodData = (yearId, semId) => {
  if (!yearId || !semId) return { savedScores: {}, uploadedImages: {} };
  try {
    const all = JSON.parse(localStorage.getItem(CL_ALL_DATA_KEY) || "{}");
    return all[`${yearId}_${semId}`] ?? { savedScores: {}, uploadedImages: {} };
  } catch {
    return { savedScores: {}, uploadedImages: {} };
  }
};

export const useScoreManagement = (
  scoreData,
  yearId,
  semId,
  hasDataForCurrentPeriod = false
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [uploadedImages, setUploadedImages] = useState({});
  const [tempImages, setTempImages] = useState({});
  const [savedScores, setSavedScores] = useState({});
  const [tempScores, setTempScores] = useState({});
  const [viewingImage, setViewingImage] = useState(null);
  const [modalItemKey, setModalItemKey] = useState(null);
  const [editingImage, setEditingImage] = useState(null);

  // Load / reset when period changes
  useEffect(() => {
    const data = loadPeriodData(yearId, semId);
    setSavedScores(data.savedScores);
    setUploadedImages(data.uploadedImages);
    setIsEditing(false);
    setTempScores({});
    setTempImages({});
  }, [yearId, semId]);

  useEffect(() => {
    if (showConfirmModal || viewingImage || modalItemKey || editingImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showConfirmModal, viewingImage, modalItemKey, editingImage]);

  const getItemKey = (sectionIdx, criterionIdx, itemIdx) =>
    `${sectionIdx}-${criterionIdx}-${itemIdx}`;

  const calculateSectionScore = (sectionIdx) => {
    const section = scoreData[sectionIdx];
    if (!section) return 0;
    let total = 0;
    section.criteria.forEach((criterion, criterionIdx) => {
      criterion.items.forEach((item, itemIdx) => {
        if (item.note) return;
        const itemKey = getItemKey(sectionIdx, criterionIdx, itemIdx);
        const scoreSource = isEditing ? tempScores : savedScores;
        const score = scoreSource[itemKey];
        if (score !== undefined && score !== "") total += Number(score);
      });
    });
    return total;
  };

  const handleScoreChange = (itemKey, value, maxScore) => {
    const numValue = value === "" ? "" : Number(value);
    if (value === "" || (numValue >= 0 && numValue <= maxScore)) {
      setTempScores((prev) => ({
        ...prev,
        [itemKey]: value === "" ? "" : numValue,
      }));
    }
  };

  const handleUploadClick = (itemKey) => {
    if (isEditing) setModalItemKey(itemKey);
  };

  const handleSaveMinhChung = async ({ file, description, date }) => {
    const url = await fileToBase64(file);
    setTempImages((prev) => ({
      ...prev,
      [modalItemKey]: [...(prev[modalItemKey] || []), { url, description, date }],
    }));
    setModalItemKey(null);
  };

  const handleImageClick = (imageObj, itemKey, imageIndex) => {
    if (isEditing) {
      setEditingImage({ itemKey, imageIndex, data: imageObj });
    } else if (imageObj && imageObj.url) {
      setViewingImage(imageObj);
    }
  };

  const handleUpdateMinhChung = async ({ file, preview, description, date }) => {
    const { itemKey, imageIndex } = editingImage;
    const url = file ? await fileToBase64(file) : preview;
    setTempImages((prev) => {
      const updated = [...(prev[itemKey] || [])];
      updated[imageIndex] = { url, description, date };
      return { ...prev, [itemKey]: updated };
    });
    setEditingImage(null);
  };

  const handleRemoveTempImage = (itemKey, imageIndex) => {
    setTempImages((prev) => ({
      ...prev,
      [itemKey]: prev[itemKey].filter((_, idx) => idx !== imageIndex),
    }));
  };

  const closeImageViewer = () => setViewingImage(null);
  const handleSave = () => setShowConfirmModal(true);

  const handleConfirmSave = () => {
    const filteredScores = {};
    Object.keys(tempScores).forEach((key) => {
      if (
        tempScores[key] !== "" &&
        tempScores[key] !== undefined &&
        tempScores[key] !== null
      ) {
        filteredScores[key] = tempScores[key];
      }
    });

    const filteredImages = {};
    Object.keys(tempImages).forEach((key) => {
      if (tempImages[key] && tempImages[key].length > 0) {
        filteredImages[key] = tempImages[key];
      }
    });

    setUploadedImages(filteredImages);
    setSavedScores(filteredScores);
    setTempImages({});
    setTempScores({});
    setIsEditing(false);
    setShowConfirmModal(false);

    if (yearId && semId) {
      try {
        const all = JSON.parse(
          localStorage.getItem(CL_ALL_DATA_KEY) || "{}"
        );
        all[`${yearId}_${semId}`] = {
          savedScores: filteredScores,
          uploadedImages: filteredImages,
        };
        localStorage.setItem(CL_ALL_DATA_KEY, JSON.stringify(all));
      } catch {
        // ignore
      }
    }
  };

  const handleCancelSave = () => setShowConfirmModal(false);

  const hasAnySavedData = () => {
    const hasSavedImages = Object.values(uploadedImages).some(
      (images) => images && images.length > 0
    );
    const hasSavedScores = Object.values(savedScores).some(
      (score) => score !== "" && score !== undefined && score !== null
    );
    return hasSavedImages || hasSavedScores;
  };

  const handleStartScoring = () => {
    setIsEditing(true);
    setTempImages({ ...uploadedImages });
    setTempScores({ ...savedScores });
  };

  const getDisplayScore = (itemKey) => {
    if (isEditing) {
      return tempScores[itemKey] !== undefined
        ? tempScores[itemKey]
        : savedScores[itemKey] !== undefined
        ? savedScores[itemKey]
        : "";
    }
    return savedScores[itemKey] !== undefined ? savedScores[itemKey] : "";
  };

  const calculateTotals = () => {
    return scoreData.reduce(
      (acc, section, sectionIdx) => {
        section.criteria.forEach((criterion, criterionIdx) => {
          (criterion.items || []).forEach((item, itemIdx) => {
            const itemKey = getItemKey(sectionIdx, criterionIdx, itemIdx);
            acc.max += Number(item.maxScore || 0);
            const savedScore = savedScores[itemKey];
            if (
              savedScore !== undefined &&
              savedScore !== "" &&
              savedScore !== null
            ) {
              acc.self += Number(savedScore);
            }
            acc.reviewer += Number(item.reviewerScore ?? 0);
          });
        });
        return acc;
      },
      { max: 0, self: 0, reviewer: 0 }
    );
  };

  return {
    isEditing,
    showConfirmModal,
    uploadedImages,
    tempImages,
    savedScores,
    viewingImage,
    hasDataForCurrentPeriod,
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
  };
};