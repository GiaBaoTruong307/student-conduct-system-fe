const ActionButton = ({ isEditing, hasAnySavedData, onSave, onEdit }) => {
  return (
    <>
      {isEditing ? (
        // Button Lưu khi đang edit
        <button
          onClick={onSave}
          className="w-full md:w-auto px-8 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm cursor-pointer"
        >
          Lưu
        </button>
      ) : hasAnySavedData ? (
        // Button Sửa khi đã có dữ liệu
        <button
          onClick={onEdit}
          className="w-full md:w-auto px-8 py-2.5 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors duration-200 shadow-sm cursor-pointer"
        >
          Sửa
        </button>
      ) : (
        // Button Chấm ban đầu (màu xanh nước biển)
        <button
          onClick={onEdit}
          className="w-full md:w-auto px-8 py-2.5 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors duration-200 shadow-sm cursor-pointer"
        >
          Chấm
        </button>
      )}
    </>
  );
};

export default ActionButton;
