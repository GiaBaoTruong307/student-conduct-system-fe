import { useNavigate } from "react-router-dom";
import { clearRoleFilter } from "./useRoleFilter";

const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    clearRoleFilter(localStorage.getItem("role"));
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
    window.location.reload();
  };

  return logout;
};

export default useLogout;