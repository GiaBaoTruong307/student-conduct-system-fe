import { Navigate } from "react-router-dom";
import FacultyBangDiemKhoa from "./pages/FacultyBangDiemKhoa";
import FacultyClassScoreBoard from "./pages/FacultyClassScoreBoard";
import FacultyStudentScoreDetail from "./pages/FacultyStudentScoreDetail";
import FacultyAdjustmentRequest from "./pages/FacultyAdjustmentRequest";

const facultyStaffRoutes = [
  { index: true, element: <Navigate to="bang-diem-khoa" replace /> },
  { path: "bang-diem-khoa",                              element: <FacultyBangDiemKhoa /> },
  { path: "bang-diem-khoa/:classId",                     element: <FacultyClassScoreBoard /> },
  { path: "bang-diem-khoa/:classId/student/:mssv",       element: <FacultyStudentScoreDetail /> },
  { path: "de-nghi-dieu-chinh",                          element: <FacultyAdjustmentRequest /> },
];

export default facultyStaffRoutes;