const ScoreFilter = ({
  years,              // [{ id, name }] — từ admin_academic_years
  semesters,          // [{ id, name }] — semesters của year đang chọn
  selectedYearId,
  selectedSemesterId,
  onYearChange,
  onSemesterChange,
  showActionButton,
  actionButton,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        {/* Năm học */}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Chọn năm học cần tra cứu điểm
          </label>
          <select
            value={selectedYearId}
            onChange={(e) => onYearChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] focus:border-transparent bg-white cursor-pointer"
          >
            <option value="">-- Chọn năm học --</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>
        </div>

        {/* Học kỳ — disabled khi chưa chọn năm */}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Chọn học kỳ cần tra cứu điểm
          </label>
          <select
            value={selectedSemesterId}
            onChange={(e) => onSemesterChange(e.target.value)}
            disabled={!selectedYearId}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] focus:border-transparent bg-white cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-default"
          >
            <option value="">-- Chọn học kỳ --</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Button */}
        {showActionButton && (
          <div className="md:flex md:items-end">{actionButton}</div>
        )}
      </div>
    </div>
  );
};

export default ScoreFilter;