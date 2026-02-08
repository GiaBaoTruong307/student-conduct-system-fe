import { Navigate } from "react-router-dom";
import { ROLES } from "../utils/role";

const RootRedirect = () => {
  const role = localStorage.getItem("role");

  if (!role) return <Navigate to="/login" replace />;

  switch (role) {
    case ROLES.ADMIN:
      return <Navigate to="/admin" replace />;
    case ROLES.CLASS_LEADER:
      return <Navigate to="/class-leader" replace />;
    case ROLES.FACULTY_STAFF:
      return <Navigate to="/faculty-staff" replace />;
    case ROLES.HOMEROOM_TEACHER:
      return <Navigate to="/homeroom-teacher" replace />;
    case ROLES.STUDENT_AFFAIRS:
      return <Navigate to="/student-affairs" replace />;
    case ROLES.STUDENT:
      return <Navigate to="/student" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default RootRedirect;
