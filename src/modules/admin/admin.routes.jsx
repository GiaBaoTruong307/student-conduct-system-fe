import { Navigate } from "react-router-dom";
import TimeSettings from "./pages/TimeSettings";
import Accounts from "./pages/Accounts";
import UserGroups from "./pages/UserGroups";
import Academic from "./pages/Academic";
import Criteria from "./pages/Criteria";

const adminRoutes = [
  { index: true, element: <Navigate to="time-settings" replace /> },
  { path: "time-settings", element: <TimeSettings /> },
  { path: "accounts", element: <Accounts /> },
  { path: "user-groups", element: <UserGroups /> },
  { path: "academic", element: <Academic /> },
  { path: "criteria", element: <Criteria /> },
];

export default adminRoutes;