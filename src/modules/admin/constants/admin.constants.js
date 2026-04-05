export const COURSES = ["48K", "49K", "50K", "51K"];

export const LS_KEYS = {
  YEARS:         "admin_academic_years",
  SEMESTERS:     "admin_academic_semesters",
  ACADEMIC_TAB:  "admin_academic_tab",
  SELECTED_YEAR: "admin_academic_selected_year",
  TIME_SETTINGS: "admin_time_settings",
  CRITERIA:      "admin_criteria_sections",
};

export const genId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const fmtDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

export const fmtDateTime = (str) => {
  if (!str) return "—";
  const d = new Date(str);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export const isPast = (dateStr) => dateStr && new Date(dateStr) <= new Date();