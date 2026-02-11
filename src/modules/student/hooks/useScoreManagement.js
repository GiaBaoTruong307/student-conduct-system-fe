import { useState, useRef, useEffect } from "react";

export const useScoreManagement = (scoreData) => {
  const [selectedSemester, setSelectedSemester] = useState("Kỳ II");
  const [selectedYear, setSelectedYear] = useState("2025-2026");
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [uploadedImages, setUploadedImages] = useState({});
  const [tempImages, setTempImages] = useState({});
  const [savedScores, setSavedScores] = useState({});
  const [tempScores, setTempScores] = useState({});
  const [viewingImage, setViewingImage] = useState(null);
  const fileInputRefs = useRef({});

  // Effect để khóa scroll khi modal mở
  useEffect(() => {
    if (showConfirmModal || viewingImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showConfirmModal, viewingImage]);

  // Kiểm tra xem có dữ liệu cho học kỳ hiện tại không
  const hasDataForCurrentPeriod =
    selectedSemester === "Kỳ II" && selectedYear === "2025-2026";

  // Tạo unique key cho mỗi item
  const getItemKey = (sectionIdx, criterionIdx, itemIdx) => {
    return `${sectionIdx}-${criterionIdx}-${itemIdx}`;
  };

  // Tính tổng điểm cho từng section
  const calculateSectionScore = (sectionIdx) => {
    const section = scoreData[sectionIdx];
    let total = 0;

    section.criteria.forEach((criterion, criterionIdx) => {
      criterion.items.forEach((item, itemIdx) => {
        if (item.note) return;

        const itemKey = getItemKey(sectionIdx, criterionIdx, itemIdx);
        const scoreSource = isEditing ? tempScores : savedScores;
        const score = scoreSource[itemKey];

        if (score !== undefined && score !== "") {
          total += Number(score);
        }
      });
    });

    return total;
  };

  // Xử lý thay đổi điểm
  const handleScoreChange = (itemKey, value, maxScore) => {
    const numValue = value === "" ? "" : Number(value);

    if (value === "" || (numValue >= 0 && numValue <= maxScore)) {
      setTempScores((prev) => ({
        ...prev,
        [itemKey]: value === "" ? "" : numValue,
      }));
    }
  };

  // Xử lý upload ảnh
  const handleImageUpload = (e, itemKey) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const imageUrls = files.map((file) => URL.createObjectURL(file));

    setTempImages((prev) => ({
      ...prev,
      [itemKey]: [...(prev[itemKey] || []), ...imageUrls],
    }));
  };

  // Xóa ảnh tạm
  const handleRemoveTempImage = (itemKey, imageIndex) => {
    setTempImages((prev) => ({
      ...prev,
      [itemKey]: prev[itemKey].filter((_, idx) => idx !== imageIndex),
    }));
  };

  // Xử lý click vào "Tải minh chứng lên"
  const handleUploadClick = (itemKey) => {
    if (isEditing && fileInputRefs.current[itemKey]) {
      fileInputRefs.current[itemKey].click();
    }
  };

  // Xử lý click vào ảnh để xem phóng to
  const handleImageClick = (imageUrl) => {
    if (!isEditing) {
      setViewingImage(imageUrl);
    }
  };

  // Đóng image viewer
  const closeImageViewer = () => {
    setViewingImage(null);
  };

  // Lưu ảnh và điểm
  const handleSave = () => {
    setShowConfirmModal(true);
  };

  // Xác nhận lưu
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
  };

  // Hủy lưu
  const handleCancelSave = () => {
    setShowConfirmModal(false);
  };

  // Kiểm tra xem có dữ liệu đã lưu không
  const hasAnySavedData = () => {
    const hasSavedImages = Object.values(uploadedImages).some(
      (images) => images && images.length > 0,
    );
    const hasSavedScores = Object.values(savedScores).some(
      (score) => score !== "" && score !== undefined && score !== null,
    );
    return hasSavedImages || hasSavedScores;
  };

  // Bắt đầu chế độ chấm điểm
  const handleStartScoring = () => {
    setIsEditing(true);
    setTempImages({ ...uploadedImages });
    setTempScores({ ...savedScores });
  };

  // Lấy điểm hiển thị cho item
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

  // Tính tổng cho bảng
  const calculateTotals = () => {
    return scoreData.reduce(
      (acc, section) => {
        section.criteria.forEach((criterion) => {
          (criterion.items || []).forEach((item, itemIdx) => {
            const sectionIdx = scoreData.indexOf(section);
            const criterionIdx = section.criteria.indexOf(criterion);
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
      { max: 0, self: 0, reviewer: 0 },
    );
  };

  return {
    // States
    selectedSemester,
    selectedYear,
    isEditing,
    showConfirmModal,
    uploadedImages,
    tempImages,
    savedScores,
    tempScores,
    viewingImage,
    fileInputRefs,
    hasDataForCurrentPeriod,

    // Setters
    setSelectedSemester,
    setSelectedYear,

    // Handlers
    handleScoreChange,
    handleImageUpload,
    handleRemoveTempImage,
    handleUploadClick,
    handleImageClick,
    closeImageViewer,
    handleSave,
    handleConfirmSave,
    handleCancelSave,
    handleStartScoring,

    // Helpers
    getItemKey,
    calculateSectionScore,
    hasAnySavedData,
    getDisplayScore,
    calculateTotals,
  };
};
