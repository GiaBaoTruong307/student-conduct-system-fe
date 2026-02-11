const ConfirmModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 ease-out animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-800 mb-3">Xác nhận lưu</h3>
        <p className="text-gray-600 mb-6">
          Bạn có chắc chắn muốn lưu các thay đổi về điểm và minh chứng không?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer font-medium"
          >
            Quay lại
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-[#3d2f6b] text-white rounded-lg hover:bg-[#2f2454] transition-colors cursor-pointer font-medium"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
