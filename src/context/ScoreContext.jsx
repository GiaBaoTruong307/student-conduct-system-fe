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
  // studentAllData: { "yearId_semId": { savedScores, uploadedImages, total } }
  const [studentAllData, setStudentAllDataState] = useState(
    () => read("studentAllData", {})
  );
  // reviewerAllData: { "yearId_semId": { [mssv]: { savedScores, notes, total } } }
  const [reviewerAllData, setReviewerAllDataState] = useState(
    () => read("reviewerAllData", {})
  );

  const getPeriodKey = (yearId, semId) => `${yearId}_${semId}`;

  const getStudentPeriodData = (yearId, semId) => {
    if (!yearId || !semId) return { savedScores: {}, uploadedImages: {}, total: 0 };
    return (
      studentAllData[getPeriodKey(yearId, semId)] ?? {
        savedScores: {},
        uploadedImages: {},
        total: 0,
      }
    );
  };

  const setStudentPeriodData = (yearId, semId, data) => {
    setStudentAllDataState((prev) => {
      const updated = { ...prev, [getPeriodKey(yearId, semId)]: data };
      localStorage.setItem("studentAllData", JSON.stringify(updated));
      return updated;
    });
  };

  const getReviewerPeriodData = (yearId, semId) => {
    if (!yearId || !semId) return {};
    return reviewerAllData[getPeriodKey(yearId, semId)] ?? {};
  };

  const setReviewerForPeriod = (yearId, semId, mssv, data) => {
    setReviewerAllDataState((prev) => {
      const key = getPeriodKey(yearId, semId);
      const updated = {
        ...prev,
        [key]: { ...(prev[key] ?? {}), [mssv]: data },
      };
      localStorage.setItem("reviewerAllData", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ScoreContext.Provider
      value={{
        getStudentPeriodData,
        setStudentPeriodData,
        getReviewerPeriodData,
        setReviewerForPeriod,
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