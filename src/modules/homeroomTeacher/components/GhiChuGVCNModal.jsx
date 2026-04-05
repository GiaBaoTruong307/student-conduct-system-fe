import { useState } from "react";

const GhiChuGVCNModal = ({ initialText = "", onSave, onClose }) => {
  const [text, setText] = useState(initialText);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-700 cursor-pointer leading-none"
          aria-label="Đóng"
        >
          ×
        </button>

        <h2 className="font-bold text-lg mb-4 text-gray-800">
          Ghi chú của GVCN
        </h2>

        <textarea
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập ghi chú của giáo viên chủ nhiệm..."
          maxLength={500}
        />
        <div className="text-xs text-gray-400 text-right mt-1">
          {text.length}/500
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer text-sm font-medium"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(text)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer text-sm font-medium"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default GhiChuGVCNModal;