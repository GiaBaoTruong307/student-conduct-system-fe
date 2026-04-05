import { Navigate } from "react-router-dom";
import HomeroomClassScoreBoard from "./pages/HomeroomClassScoreBoard";
import HomeroomStudentScoreDetail from "./pages/HomeroomStudentScoreDetail";
import AdjustmentRequest from "./pages/AdjustmentRequest";

const homeroomTeacherRoutes = [
  {
    index: true,
    element: <Navigate to="/homeroom-teacher/class-score" replace />,
  },
  {
    path: "class-score",
    element: <HomeroomClassScoreBoard />,
  },
  {
    path: "class-score/:mssv",
    element: <HomeroomStudentScoreDetail />,
  },
  {
    path: "adjustment",
    element: <AdjustmentRequest />,
  },
  {
    path: "*",
    element: <Navigate to="/homeroom-teacher/class-score" replace />,
  },
];

export default homeroomTeacherRoutes;