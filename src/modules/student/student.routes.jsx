import { Navigate } from "react-router-dom";
import StudentHome from "./pages/StudentHome";
import AdjustmentRequest from "./pages/AdjustmentRequest";

const studentRoutes = [
  { index: true, element: <Navigate to="/student/individual-score" replace /> },
  { path: "individual-score",   element: <StudentHome /> },
  { path: "adjustment-request", element: <AdjustmentRequest /> },
  { path: "*",                  element: <Navigate to="/student/individual-score" replace /> },
];

export default studentRoutes;