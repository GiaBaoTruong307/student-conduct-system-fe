import useLogout from "../hooks/useLogout";

const AdminLayout = () => {
  const logout = useLogout();

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ADMIN DASHBOARD</h1>

        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div>Admin content here...</div>
    </div>
  );
};

export default AdminLayout;
