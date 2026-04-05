const ConfirmModal = ({ label, description, onClose, onConfirm }) => (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-800">Xác nhận xóa</p>
          <p className="text-sm text-gray-500 mt-1">
            {description ?? <>Bạn có chắc muốn xóa <span className="font-medium text-gray-700">"{label}"</span>? Hành động này không thể hoàn tác.</>}
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
          Hủy
        </button>
        <button onClick={onConfirm}
          className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg cursor-pointer transition-colors">
          Xóa
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;