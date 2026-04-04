import { useState, useRef } from "react";

export default function MinhChungModal({ onSave, onClose, initialData }) {
  const isEditing = !!initialData;

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initialData?.url || null);
  const [description, setDescription] = useState(initialData?.description || "");
  const [date, setDate] = useState(initialData?.date || "");
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleFileChange = (e) => {
    handleFile(e.target.files[0]);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith("image/")) {
      handleFile(dropped);
    }
  };

  const handleSave = () => {
    setSubmitted(true);
    // Khi edit: ảnh có thể giữ nguyên (không cần chọn lại)
    const hasImage = isEditing ? preview : file;
    if (!hasImage || !description.trim() || !date) return;
    onSave({ file, preview, description, date });
  };

  const hasImage = isEditing ? preview : file;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg relative animate-fadeIn">
        {/* Close button */}
        <button
          className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-700 cursor-pointer"
          onClick={onClose}
          aria-label="Đóng"
        >
          ×
        </button>

        <h2 className="font-bold text-lg mb-5">
          {isEditing ? "Chỉnh sửa minh chứng" : "Thêm minh chứng"}
        </h2>

        {/* Upload ảnh */}
        <div className="mb-1">
          {!preview ? (
            <div
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition ${
                submitted && !hasImage
                  ? "border-red-400 bg-red-50"
                  : dragging
                  ? "border-[#3d2f6b] bg-purple-50"
                  : "border-gray-300 hover:border-[#3d2f6b] hover:bg-gray-50"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-500">
                Kéo thả hoặc <span className="text-[#3d2f6b] font-semibold underline">chọn ảnh</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG...</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="relative flex flex-col items-center gap-2">
              <div className="relative">
                <img src={preview} alt="preview" className="max-h-40 rounded shadow object-contain" />
                <button
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-red-600"
                  onClick={() => { setFile(null); setPreview(null); }}
                >
                  ×
                </button>
              </div>
              {/* Nút đổi ảnh khi đang edit */}
              <button
                className="text-xs text-[#3d2f6b] underline cursor-pointer hover:text-purple-800"
                onClick={() => fileInputRef.current?.click()}
              >
                Đổi ảnh khác
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}
          {submitted && !hasImage && (
            <p className="text-red-500 text-xs mt-1">Vui lòng chọn ảnh minh chứng.</p>
          )}
        </div>

        {/* Mô tả */}
        <div className="mt-4 mb-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 rounded flex-shrink-0">
              <svg width="20" height="20" fill="none" stroke="#f59e42" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7h18M7 3v4M17 3v4" />
              </svg>
            </span>
            <input
              className={`flex-1 border rounded px-3 py-2 outline-none focus:ring-2 transition text-sm ${
                submitted && !description.trim()
                  ? "border-red-400 focus:ring-red-300 bg-red-50"
                  : "border-gray-300 focus:ring-yellow-400"
              }`}
              type="text"
              placeholder="Nhập mô tả minh chứng"
              value={description}
              maxLength={120}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {submitted && !description.trim() && (
            <p className="text-red-500 text-xs mt-1 ml-10">Vui lòng nhập mô tả minh chứng.</p>
          )}
        </div>

        {/* Ngày tháng */}
        <div className="mt-3 mb-1">
          <input
            className={`border rounded px-3 py-2 w-full outline-none focus:ring-2 transition text-sm ${
              submitted && !date
                ? "border-red-400 focus:ring-red-300 bg-red-50"
                : "border-gray-300 focus:ring-yellow-400"
            }`}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {submitted && !date && (
            <p className="text-red-500 text-xs mt-1">Vui lòng chọn ngày tháng năm.</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-5">
          <button
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer text-sm font-medium"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer text-sm font-semibold"
            onClick={handleSave}
          >
            Lưu
          </button>
        </div>
      </div>

      <style>{`
        .animate-fadeIn {
          animation: fadeIn .2s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}