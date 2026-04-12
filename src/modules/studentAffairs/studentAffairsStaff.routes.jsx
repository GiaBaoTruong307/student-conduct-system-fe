import { Navigate } from "react-router-dom";
import PctsvBangDiemSV from "./pages/PctsvBangDiemSV";
import PctsvClassScoreBoard from "./pages/PctsvClassScoreBoard";
import PctsvStudentScoreDetail from "./pages/PctsvStudentScoreDetail";
import PctsvAdjustmentRequest from "./pages/PctsvAdjustmentRequest";
import PctsvBaoCaoTyLe from "./pages/PctsvBaoCaoTyLe";

const studentAffairsStaffRoutes = [
  { index: true,  element: <Navigate to="bang-diem-sv" replace /> },
  { path: "bang-diem-sv",                         element: <PctsvBangDiemSV /> },
  { path: "bang-diem-sv/:classId",                element: <PctsvClassScoreBoard /> },
  { path: "bang-diem-sv/:classId/student/:mssv",  element: <PctsvStudentScoreDetail /> },
  { path: "de-nghi-dieu-chinh",                   element: <PctsvAdjustmentRequest /> },
  { path: "bao-cao",                              element: <PctsvBaoCaoTyLe /> },
];

export default studentAffairsStaffRoutes;