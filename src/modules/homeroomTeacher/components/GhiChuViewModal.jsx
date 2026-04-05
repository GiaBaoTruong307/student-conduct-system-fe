const GhiChuViewModal = ({ title = "Ghi chú", text = "", onClose }) => {
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

        <h2 className="font-bold text-lg mb-4 text-gray-800">{title}</h2>

        <div className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm bg-gray-50 min-h-[100px] whitespace-pre-wrap text-gray-700">
          {text || <span className="text-gray-400 italic">Không có ghi chú</span>}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer text-sm font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default GhiChuViewModal;