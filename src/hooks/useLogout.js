import { useNavigate } from "react-router-dom";

const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
    window.location.reload();
  };

  return logout;
};

export default useLogout;
