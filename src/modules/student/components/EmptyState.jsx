const EmptyState = ({ selectedSemester, selectedYear }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
    <div className="flex flex-col items-center justify-center text-center space-y-4">
      {/* Icon */}
      <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center">
        <svg
          className="w-10 h-10 md:w-12 md:h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800">
          Chưa có dữ liệu bảng điểm
        </h3>
        <p className="text-sm md:text-base text-gray-600 max-w-md">
          Hiện tại chưa có dữ liệu điểm rèn luyện cho{" "}
          <span className="font-semibold text-[#3d2f6b]">
            {selectedSemester}
          </span>{" "}
          năm học{" "}
          <span className="font-semibold text-[#3d2f6b]">{selectedYear}</span>
        </p>
      </div>
    </div>
  </div>
);

export default EmptyState;
