export const LS_KEY_SYSTEM_B = "systemB_gpa";

export const getGpaFromSystemB = (mssv) => {
  if (!mssv) return null;
  try {
    const data = JSON.parse(localStorage.getItem(LS_KEY_SYSTEM_B) || "{}");
    const val = data[mssv];
    if (val === undefined || val === "" || val === null) return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  } catch {
    return null;
  }
};

export const convertGpaToScore = (gpa) => {
  if (gpa === null || gpa === undefined) return null;
  const num = Number(gpa);
  if (isNaN(num)) return null;
  if (num >= 3.2) return 4;
  if (num >= 2.0) return 2;
  return 0;
};

export const getAutoScoreFromSystemB = (mssv) =>
  convertGpaToScore(getGpaFromSystemB(mssv));

export const getAllSystemBGpa = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY_SYSTEM_B) || "{}");
  } catch {
    return {};
  }
};

// ← THÊM
export const saveGpaToSystemB = (mssv, val) => {
  try {
    const data = JSON.parse(localStorage.getItem(LS_KEY_SYSTEM_B) || "{}");
    if (val === "" || val === null || val === undefined) {
      delete data[mssv];
    } else {
      const num = parseFloat(val);
      if (!isNaN(num)) data[mssv] = num;
      else delete data[mssv];
    }
    localStorage.setItem(LS_KEY_SYSTEM_B, JSON.stringify(data));
  } catch { }
};