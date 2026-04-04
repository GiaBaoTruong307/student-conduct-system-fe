import { Navigate } from "react-router-dom";
import ClassLeaderHome from "./pages/ClassLeaderHome";
import ClassScoreBoard from "./pages/ClassScoreBoard";
import StudentScoreDetail from "./pages/StudentScoreDetail";

const classLeaderRoutes = [
  {
    index: true,
    element: <Navigate to="/class-leader/individual-score" replace />,
  },
  {
    path: "individual-score",
    element: <ClassLeaderHome />,
  },
  {
    path: "class-score",
    element: <ClassScoreBoard />,
  },
  {
    path: "class-score/:mssv",
    element: <StudentScoreDetail />,
  },
  {
    path: "*",
    element: <Navigate to="/class-leader/individual-score" replace />,
  },
];

export default classLeaderRoutes;