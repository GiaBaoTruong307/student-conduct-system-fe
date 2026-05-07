export const ROLES = {
  ADMIN: "admin",
  STUDENT: "student",
  CLASS_LEADER: "classLeader",
  FACULTY_STAFF: "facultyStaff",
  HOMEROOM_TEACHER: "homeroomTeacher",
  STUDENT_AFFAIRS: "studentAffairs",
  STUDENT_AFFAIRS_STAFF: "studentAffairsStaff",
  STUDENT_AFFAIRS_LEADER: "studentAffairsLeader",
  SYSTEM_B: "systemB", // ← THÊM
};

export const ROLE_LABELS = {
  [ROLES.STUDENT]:                "Sinh viên",
  [ROLES.CLASS_LEADER]:           "Ban cán sự",
  [ROLES.HOMEROOM_TEACHER]:       "Giảng viên chủ nhiệm",
  [ROLES.FACULTY_STAFF]:          "Lãnh đạo Khoa",
  [ROLES.STUDENT_AFFAIRS_STAFF]:  "Chuyên viên",
  [ROLES.STUDENT_AFFAIRS_LEADER]: "Lãnh đạo",
  [ROLES.ADMIN]:                  "Admin",
  [ROLES.SYSTEM_B]:               "Hệ thống B", // ← THÊM
};

export const getRoleLabel = (role) => ROLE_LABELS[role] || role;

export const getInitials = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.slice(-2).map((w) => w[0]).join("").toUpperCase();
};