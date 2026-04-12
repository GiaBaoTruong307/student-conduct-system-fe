import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../auth/Login";
import ProtectedRoute from "./ProtectedRoute";
import { ROLES } from "../utils/role";

// layouts
import AdminLayout from "../layouts/AdminLayout";
import StudentLayout from "../layouts/StudentLayout";
import ClassLeaderLayout from "../layouts/ClassLeaderLayout";
import FacultyStaffLayout from "../layouts/FacultyStaffLayout";
import HomeroomTeacherLayout from "../layouts/HomeroomTeacherLayout";
import StudentAffairsStaffLayout from "../layouts/StudentAffairsStaffLayout";
import StudentAffairsLeaderLayout from "../layouts/StudentAffairsLeaderLayout";

// routes
import studentRoutes from "../modules/student/student.routes";
import classLeaderRoutes from "../modules/classLeader/classLeader.routes";
import homeroomTeacherRoutes from "../modules/homeroomTeacher/homeroomTeacher.routes";
import adminRoutes from "../modules/admin/admin.routes";
import facultyStaffRoutes from "../modules/facultyStaff/facultyStaff.routes";
import studentAffairsStaffRoutes from "../modules/studentAffairs/studentAffairsStaff.routes";
import studentAffairsLeaderRoutes from "../modules/studentAffairs/studentAffairsLeader.routes";

const RootRedirect = () => {
  const role = localStorage.getItem("role");
  if (!role) return <Navigate to="/login" replace />;
  switch (role) {
    case ROLES.ADMIN:                    return <Navigate to="/admin" replace />;
    case ROLES.STUDENT:                  return <Navigate to="/student/individual-score" replace />;
    case ROLES.CLASS_LEADER:             return <Navigate to="/class-leader/individual-score" replace />;
    case ROLES.FACULTY_STAFF:            return <Navigate to="/faculty-staff" replace />;
    case ROLES.HOMEROOM_TEACHER:         return <Navigate to="/homeroom-teacher" replace />;
    case ROLES.STUDENT_AFFAIRS_STAFF:    return <Navigate to="/student-affairs-staff" replace />;
    case ROLES.STUDENT_AFFAIRS_LEADER:   return <Navigate to="/student-affairs-leader" replace />;
    default:                             return <Navigate to="/login" replace />;
  }
};

const AppRoutes = () => {
  const role = localStorage.getItem("role");

  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={role ? <RootRedirect /> : <Login />} />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {adminRoutes.map((route, index) => (
          <Route key={index} index={route.index} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* STUDENT */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        {studentRoutes.map((route, index) => (
          <Route key={index} index={route.index} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* CLASS LEADER */}
      <Route
        path="/class-leader"
        element={
          <ProtectedRoute allowedRoles={[ROLES.CLASS_LEADER]}>
            <ClassLeaderLayout />
          </ProtectedRoute>
        }
      >
        {classLeaderRoutes.map((route, index) => (
          <Route key={index} index={route.index} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* FACULTY STAFF */}
      <Route
        path="/faculty-staff"
        element={
          <ProtectedRoute allowedRoles={[ROLES.FACULTY_STAFF]}>
            <FacultyStaffLayout />
          </ProtectedRoute>
        }
      >
        {facultyStaffRoutes.map((route, index) => (
          <Route key={index} index={route.index} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* HOMEROOM TEACHER */}
      <Route
        path="/homeroom-teacher"
        element={
          <ProtectedRoute allowedRoles={[ROLES.HOMEROOM_TEACHER]}>
            <HomeroomTeacherLayout />
          </ProtectedRoute>
        }
      >
        {homeroomTeacherRoutes.map((route, index) => (
          <Route key={index} index={route.index} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* STUDENT AFFAIRS — NHÂN VIÊN */}
      <Route
        path="/student-affairs-staff"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STUDENT_AFFAIRS_STAFF]}>
            <StudentAffairsStaffLayout />
          </ProtectedRoute>
        }
      >
        {studentAffairsStaffRoutes.map((route, index) => (
          <Route key={index} index={route.index} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* STUDENT AFFAIRS — LÃNH ĐẠO */}
      <Route
        path="/student-affairs-leader"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STUDENT_AFFAIRS_LEADER]}>
            <StudentAffairsLeaderLayout />
          </ProtectedRoute>
        }
      >
        {studentAffairsLeaderRoutes.map((route, index) => (
          <Route key={index} index={route.index} path={route.path} element={route.element} />
        ))}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;