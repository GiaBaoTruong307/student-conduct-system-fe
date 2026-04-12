const TimeWindowBadge = ({ status, startTime, endTime }) => {
  if (status === "no-setting") {
    return (
      <div className="flex flex-col items-start md:items-end gap-0.5 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg">
        <span className="text-sm font-semibold text-gray-600">Chưa có thời gian chấm điểm được thiết lập</span>
        <span className="text-xs text-gray-400">Vui lòng chờ admin cài đặt thời gian</span>
      </div>
    );
  }
  if (status === "before") {
    return (
      <div className="flex flex-col items-start md:items-end gap-0.5 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
        <span className="text-sm font-semibold text-amber-700">Chưa tới thời gian chấm điểm</span>
        {startTime && <span className="text-xs text-amber-600">Bắt đầu từ: {startTime}</span>}
      </div>
    );
  }
  if (status === "after") {
    return (
      <div className="flex flex-col items-start md:items-end gap-0.5 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg">
        <span className="text-sm font-semibold text-red-700">Đã hết thời gian chấm điểm</span>
        {endTime && <span className="text-xs text-red-500">Kết thúc lúc: {endTime}</span>}
      </div>
    );
  }
  return null;
};

const ActionButton = ({
  isEditing,
  hasAnySavedData,
  onSave,
  onEdit,
  onSubmit,
  isSubmitted,
  timeWindow,
}) => {
  // Đang trong chế độ chấm/sửa → hiện nút Lưu
  if (isEditing) {
    return (
      <button
        onClick={onSave}
        className="w-full md:w-auto px-8 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm cursor-pointer"
      >
        Lưu
      </button>
    );
  }

  // Hết thời gian / chưa đến / chưa cài → hiện badge
  if (timeWindow && !timeWindow.canEdit) {
    // Nếu đã gửi thì ưu tiên hiện badge "Đã gửi duyệt"
    if (isSubmitted) {
      return (
        <div className="flex flex-col items-start md:items-end gap-0.5 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-sm font-semibold text-green-700">✓ Đã gửi duyệt</span>
          <span className="text-xs text-green-600">BCS đã nhận được kết quả chấm của bạn</span>
        </div>
      );
    }
    return (
      <TimeWindowBadge
        status={timeWindow.status}
        startTime={timeWindow.startTime}
        endTime={timeWindow.endTime}
      />
    );
  }

  // Trong thời gian chấm và đã gửi duyệt rồi
  if (isSubmitted) {
    return (
      <div className="flex flex-col items-start md:items-end gap-0.5 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg">
        <span className="text-sm font-semibold text-green-700">✓ Đã gửi duyệt</span>
        <span className="text-xs text-green-600">BCS đã nhận được kết quả chấm của bạn</span>
      </div>
    );
  }

  // Đã có dữ liệu lưu → hiện nút Sửa + Gửi duyệt
  if (hasAnySavedData) {
    return (
      <div className="flex flex-col md:flex-row gap-2">
        <button
          onClick={onEdit}
          className="w-full md:w-auto px-8 py-2.5 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors duration-200 shadow-sm cursor-pointer"
        >
          Sửa
        </button>
        <button
          onClick={onSubmit}
          className="w-full md:w-auto px-8 py-2.5 bg-[#3d2f6b] text-white font-semibold rounded-lg hover:bg-[#2e2251] transition-colors duration-200 shadow-sm cursor-pointer"
        >
          Gửi duyệt
        </button>
      </div>
    );
  }

  // Chưa có dữ liệu → nút Chấm
  return (
    <button
      onClick={onEdit}
      className="w-full md:w-auto px-8 py-2.5 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors duration-200 shadow-sm cursor-pointer"
    >
      Chấm
    </button>
  );
};

export default ActionButton;