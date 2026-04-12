import { Navigate } from "react-router-dom";
import StudentAffairsLeaderHome from "./pages/StudentAffairsLeaderHome";

const studentAffairsLeaderRoutes = [
  { index: true, element: <Navigate to="home" replace /> },
  { path: "home", element: <StudentAffairsLeaderHome /> },
];

export default studentAffairsLeaderRoutes;