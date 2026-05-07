import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { classMembers } from "../modules/classLeader/constants/classMembers";
import {
  convertGpaToScore,
  getAllSystemBGpa,
  saveGpaToSystemB,
} from "../utils/gpaConvert";
import logo from "../assets/images/logo-header.png";

const BADGE = {
  4: "bg-green-100 text-green-800 border-green-300",
  2: "bg-yellow-100 text-yellow-800 border-yellow-300",
  0: "bg-red-100 text-red-800 border-red-300",
};

const RULES = [
  { range: "≥ 3.2", score: 4, label: "4 điểm", cls: "text-green-700 bg-green-50 border-green-200" },
  { range: "2.0 – 3.19", score: 2, label: "2 điểm", cls: "text-yellow-700 bg-yellow-50 border-yellow-200" },
  { range: "< 2.0", score: 0, label: "0 điểm", cls: "text-red-700 bg-red-50 border-red-200" },
];

const SystemBPage = () => {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState(() => {
    const all = getAllSystemBGpa();
    return Object.fromEntries(
      classMembers.map((m) => [m.mssv, all[m.mssv] !== undefined ? String(all[m.mssv]) : ""])
    );
  });
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleChange = (mssv, val) => {
    if (val === "" || (/^\d*\.?\d{0,2}$/.test(val) && parseFloat(val || 0) <= 4)) {
      setInputs((prev) => ({ ...prev, [mssv]: val }));
    }
  };

  const saveOne = (mssv) => {
    saveGpaToSystemB(mssv, inputs[mssv] ?? "");
  };

  const saveAll = () => {
    classMembers.forEach((m) => saveGpaToSystemB(m.mssv, inputs[m.mssv] ?? ""));
    showToast("Đã lưu điểm TBHK — Hệ thống Rèn Luyện sẽ cập nhật ngay");
  };

  const resetAll = () => {
    const empty = Object.fromEntries(classMembers.map((m) => [m.mssv, ""]));
    setInputs(empty);
    classMembers.forEach((m) => saveGpaToSystemB(m.mssv, ""));
    showToast("Đã xóa toàn bộ điểm TBHK");
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a5276] text-white py-3 md:py-4 px-4 md:px-6 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-8 md:h-10" />
          <div className="flex-1">
            <div className="font-bold text-base md:text-lg">Hệ thống B — Quản lý Kết quả Học tập</div>
            <div className="text-xs opacity-75 uppercase tracking-wide">
              Đại học Đà Nẵng · Hệ thống Quản lý Đào tạo
            </div>
          </div>
          <span className="hidden md:inline bg-blue-400/30 border border-blue-300/40 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full">
            DEMO
          </span>
          <button
            onClick={handleLogout}
            className="ml-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 cursor-pointer transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 flex gap-3">
          <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            <strong>Tích hợp demo:</strong> Dữ liệu GPA từ trang này được đồng bộ tự động sang{" "}
            <a href="/student/individual-score" className="underline font-semibold">DUE-Score</a>.{" "}
            Mục <em>"Kết quả học tập"</em> trong bảng điểm rèn luyện sẽ cập nhật điểm quy đổi ngay khi bạn nhập và lưu.
            Trong thực tế, dữ liệu được lấy tự động qua API.
          </span>
        </div>

        {/* Title + bảng quy đổi */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col md:flex-row gap-5">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800">Điểm Trung Bình Học Kỳ (TBHK) — Thang 4</h2>
              <p className="text-sm text-gray-500 mt-1">
                Lớp: <span className="font-semibold text-[#1a5276]">48K14.1</span> · Học kỳ 1 · Năm học 2025–2026
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Nhập điểm TBHK cho từng SV. DUE-Score sẽ tự động quy đổi sang điểm rèn luyện
                tại mục <strong>"Kết quả học tập"</strong>.
              </p>
            </div>
            <div className="shrink-0 space-y-1.5">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Bảng quy đổi</div>
              {RULES.map((r) => (
                <div key={r.score} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${r.cls}`}>
                  <span className="w-20 font-bold">TBHK {r.range}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-bold">{r.label} rèn luyện</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bảng danh sách */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Danh sách sinh viên — Lớp 48K14.1</h3>
            <div className="flex gap-2">
              <button
                onClick={resetAll}
                className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Xóa tất cả
              </button>
              <button
                onClick={saveAll}
                className="px-4 py-1.5 bg-[#1a5276] text-white text-sm font-semibold rounded-lg hover:bg-[#154360] cursor-pointer"
              >
                Lưu tất cả
              </button>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#aed6f1] text-[#1a5276] text-sm font-bold">
                  <th className="px-4 py-3 text-center w-12">STT</th>
                  <th className="px-4 py-3 text-left">Họ và tên</th>
                  <th className="px-4 py-3 text-center">MSSV</th>
                  <th className="px-4 py-3 text-center w-40">Điểm TBHK (thang 4)</th>
                  <th className="px-4 py-3 text-center w-40">Điểm quy đổi → Rèn luyện</th>
                </tr>
              </thead>
              <tbody>
                {classMembers.map((m, idx) => {
                  const val = inputs[m.mssv] ?? "";
                  const gpaNum = val !== "" ? parseFloat(val) : null;
                  const converted = convertGpaToScore(gpaNum);
                  const badgeStyle = converted !== null ? BADGE[converted] : null;
                  return (
                    <tr key={m.mssv} className={`border-t border-gray-100 hover:bg-gray-50/50 ${idx % 2 ? "bg-gray-50/30" : ""}`}>
                      <td className="px-4 py-3 text-center text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {m.ho} {m.ten}
                        {m.isLinkedToStudent && (
                          <span className="ml-2 text-xs bg-purple-100 text-[#3d2f6b] border border-purple-200 rounded-full px-2 py-0.5">
                            Liên kết SV
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-mono text-gray-600">{m.mssv}</td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="4"
                          step="0.01"
                          value={val}
                          onChange={(e) => handleChange(m.mssv, e.target.value)}
                          onBlur={() => saveOne(m.mssv)}
                          placeholder="0.00"
                          className="w-28 px-3 py-1.5 border border-gray-300 rounded-lg text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {badgeStyle ? (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeStyle}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {converted} điểm
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm italic">Chưa nhập</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y divide-gray-100">
            {classMembers.map((m, idx) => {
              const val = inputs[m.mssv] ?? "";
              const gpaNum = val !== "" ? parseFloat(val) : null;
              const converted = convertGpaToScore(gpaNum);
              const badgeStyle = converted !== null ? BADGE[converted] : null;
              return (
                <div key={m.mssv} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{idx + 1}. {m.ho} {m.ten}</div>
                      <div className="text-xs text-gray-500 font-mono">{m.mssv}</div>
                    </div>
                    {badgeStyle && (
                      <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badgeStyle}`}>
                        {converted} điểm
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-gray-600 shrink-0">Điểm TBHK:</label>
                    <input
                      type="number"
                      min="0"
                      max="4"
                      step="0.01"
                      value={val}
                      onChange={(e) => handleChange(m.mssv, e.target.value)}
                      onBlur={() => saveOne(m.mssv)}
                      placeholder="0.00"
                      className="w-28 px-2 py-1.5 border border-gray-300 rounded-lg text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          Hệ thống B Demo · Đại học Đà Nẵng · Dữ liệu lưu tạm trên trình duyệt (localStorage)
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-5 py-2.5 rounded-full shadow-lg z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
};

export default SystemBPage;