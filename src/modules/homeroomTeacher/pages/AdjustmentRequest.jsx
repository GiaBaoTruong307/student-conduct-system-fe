const AdjustmentRequest = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-10 h-10 text-amber-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Đề nghị điều chỉnh điểm
      </h3>
      <p className="text-gray-500 text-center max-w-sm">
        Chức năng này đang được phát triển và sẽ sớm được bổ sung.
      </p>
    </div>
  );
};

export default AdjustmentRequest;