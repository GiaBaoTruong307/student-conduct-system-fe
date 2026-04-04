import { createContext, useContext, useState } from "react";

const ScoreContext = createContext(null);

const read = (key, def) => {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : def;
  } catch {
    return def;
  }
};

export const ScoreProvider = ({ children }) => {
  const [studentSelfTotal, setStudentSelfTotalState] = useState(
    () => read("studentSelfTotal", 0)
  );
  const [studentSavedScores, setStudentSavedScoresState] = useState(
    () => read("studentSavedScores", {})
  );
  // Ảnh lưu dạng base64 nên persist được qua reload
  const [studentUploadedImages, setStudentUploadedImagesState] = useState(
    () => read("studentUploadedImages", {})
  );
  const [reviewerScoresByMssv, setReviewerScoresByMssvState] = useState(
    () => read("reviewerScoresByMssv", {})
  );

  const setStudentSelfTotal = (value) => {
    localStorage.setItem("studentSelfTotal", JSON.stringify(value));
    setStudentSelfTotalState(value);
  };

  const setStudentSavedScores = (scores) => {
    localStorage.setItem("studentSavedScores", JSON.stringify(scores));
    setStudentSavedScoresState(scores);
  };

  const setStudentUploadedImages = (images) => {
    localStorage.setItem("studentUploadedImages", JSON.stringify(images));
    setStudentUploadedImagesState(images);
  };

  const setReviewerScoresForMssv = (mssv, data) => {
    setReviewerScoresByMssvState((prev) => {
      const updated = { ...prev, [mssv]: data };
      localStorage.setItem("reviewerScoresByMssv", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ScoreContext.Provider
      value={{
        studentSelfTotal,
        setStudentSelfTotal,
        studentSavedScores,
        setStudentSavedScores,
        studentUploadedImages,
        setStudentUploadedImages,
        reviewerScoresByMssv,
        setReviewerScoresForMssv,
      }}
    >
      {children}
    </ScoreContext.Provider>
  );
};

export const useScoreContext = () => {
  const ctx = useContext(ScoreContext);
  if (!ctx) throw new Error("useScoreContext must be used within ScoreProvider");
  return ctx;
};