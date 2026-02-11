import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROLES } from "../utils/role";
import logo from "../assets/images/logo-header.png";
import logoLogin from "../assets/images/logo-login.png";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: ROLES.STUDENT,
  });

  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // DEMO: fake login
    localStorage.setItem("role", form.role);

    switch (form.role) {
      case ROLES.ADMIN:
        navigate("/admin");
        break;
      case ROLES.CLASS_LEADER:
        navigate("/class-leader");
        break;
      case ROLES.FACULTY_STAFF:
        navigate("/faculty-staff");
        break;
      case ROLES.HOMEROOM_TEACHER:
        navigate("/homeroom-teacher");
        break;
      case ROLES.STUDENT_AFFAIRS:
        navigate("/student-affairs");
        break;
      case ROLES.STUDENT:
        navigate("/student/individual-score");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#3d2f6b] text-white py-3 md:py-4 px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <img src={logo} alt="Logo" className="h-8 md:h-10" />
          <div>
            <div className="font-bold text-base md:text-lg">DUE-Score</div>
            <div className="text-xs md:text-sm">
              HỆ THỐNG QUẢN LÝ ĐIỂM RÈN LUYỆN DUE
            </div>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex items-center justify-center px-4 py-8 md:pt-20">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-6 md:mb-8">
            <img src={logoLogin} alt="Logo" className="h-20 md:h-25 w-auto" />
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-[#3d2f6b] text-center mb-6 md:mb-8">
            ĐĂNG NHẬP
          </h1>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Nhập tên tài khoản"
                className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] focus:border-transparent text-sm md:text-base"
                required
              />
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] focus:border-transparent text-sm md:text-base"
                required
              />
            </div>

            {/* Role Selection */}
            <div>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] focus:border-transparent text-gray-700 text-sm md:text-base cursor-pointer"
              >
                <option value={ROLES.STUDENT}>Sinh viên</option>
                <option value={ROLES.CLASS_LEADER}>Lớp trưởng</option>
                <option value={ROLES.HOMEROOM_TEACHER}>
                  Giáo viên chủ nhiệm
                </option>
                <option value={ROLES.FACULTY_STAFF}>Cán bộ khoa</option>
                <option value={ROLES.STUDENT_AFFAIRS}>Phòng CTCT-SV</option>
                <option value={ROLES.ADMIN}>Quản trị viên</option>
              </select>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#3d2f6b] border-gray-300 rounded focus:ring-[#3d2f6b] cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="ml-2 text-xs md:text-sm text-gray-700 cursor-pointer select-none"
              >
                Lưu thông tin đăng nhập
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#3d2f6b] text-white py-2.5 md:py-3 rounded-lg font-semibold hover:bg-[#2f2454] active:bg-[#261d3f] transition-colors duration-200 flex items-center justify-center gap-2 text-sm md:text-base cursor-pointer touch-manipulation"
            >
              Đăng nhập ngay
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </form>

          {/* Footer Info - Optional */}
          <div className="mt-6 text-center text-xs md:text-sm text-gray-500">
            <p>© 2026 Đại học Kinh tế - Đại học Đà Nẵng</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
