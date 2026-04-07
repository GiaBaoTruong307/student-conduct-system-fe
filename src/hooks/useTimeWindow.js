import { useState, useEffect } from "react";

const TIME_SETTINGS_KEY = "admin_time_settings";

const readSettings = () => {
  try {
    const raw = localStorage.getItem(TIME_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const fmtDT = (str) => {
  if (!str) return null;
  const d = new Date(str);
  return (
    `${String(d.getDate()).padStart(2, "0")}/` +
    `${String(d.getMonth() + 1).padStart(2, "0")}/` +
    `${d.getFullYear()} ` +
    `${String(d.getHours()).padStart(2, "0")}:` +
    `${String(d.getMinutes()).padStart(2, "0")}`
  );
};

const ROLE_KEYS = {
  student:     ["studentFrom",     "studentTo"],
  classLeader: ["classLeaderFrom", "classLeaderTo"],
  teacher:     ["teacherFrom",     "teacherTo"],
};

function compute(yearId, semId, role) {
  if (!yearId || !semId)
    return { canEdit: false, status: "no-period", startTime: null, endTime: null };

  const settings = readSettings();
  const setting  = settings.find(
    (s) => s.academicYearId === yearId && s.semesterId === semId
  );

  // Admin chưa cài đặt thời gian → CHẶN, không cho tự ý chấm
  if (!setting)
    return { canEdit: false, status: "no-setting", startTime: null, endTime: null };

  const [fromKey, toKey] = ROLE_KEYS[role] ?? [];
  const fromStr = setting[fromKey];
  const toStr   = setting[toKey];

  // Cài đặt tồn tại nhưng role này chưa được điền giờ → CHẶN
  if (!fromStr && !toStr)
    return { canEdit: false, status: "no-setting", startTime: null, endTime: null };

  const now  = new Date();
  const from = fromStr ? new Date(fromStr) : null;
  const to   = toStr   ? new Date(toStr)   : null;

  if (from && now < from)
    return { canEdit: false, status: "before", startTime: fmtDT(fromStr), endTime: fmtDT(toStr) };

  if (to && now > to)
    return { canEdit: false, status: "after", startTime: fmtDT(fromStr), endTime: fmtDT(toStr) };

  return { canEdit: true, status: "active", startTime: fmtDT(fromStr), endTime: fmtDT(toStr) };
}

/**
 * @param {string} yearId
 * @param {string} semId
 * @param {"student"|"classLeader"|"teacher"} role
 * @returns {{ canEdit, status, startTime, endTime }}
 *   status: "no-period" | "no-setting" | "before" | "active" | "after"
 */
export function useTimeWindow(yearId, semId, role) {
  const [result, setResult] = useState(() => compute(yearId, semId, role));

  useEffect(() => {
    setResult(compute(yearId, semId, role));
    const id = setInterval(
      () => setResult(compute(yearId, semId, role)),
      60_000
    );
    return () => clearInterval(id);
  }, [yearId, semId, role]);

  return result;
}