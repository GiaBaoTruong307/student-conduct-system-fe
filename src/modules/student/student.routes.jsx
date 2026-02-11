import { Navigate } from "react-router-dom";
import StudentHome from "./pages/StudentHome";

const studentRoutes = [
  {
    index: true,
    element: <Navigate to="/student/individual-score" replace />,
  },
  {
    path: "individual-score",
    element: <StudentHome />,
  },
  {
    path: "*",
    element: <Navigate to="/student/individual-score" replace />,
  },
];

export default studentRoutes;
