const ScoreFilter = ({
  selectedSemester,
  selectedYear,
  onSemesterChange,
  onYearChange,
  showActionButton,
  actionButton,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        {/* Semester Select */}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Chọn học kỳ cần tra cứu điểm
          </label>
          <select
            value={selectedSemester}
            onChange={(e) => onSemesterChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] focus:border-transparent bg-white cursor-pointer"
          >
            <option value="Kỳ I">Kỳ I</option>
            <option value="Kỳ II">Kỳ II</option>
          </select>
        </div>

        {/* Year Select */}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Chọn năm học cần tra cứu điểm
          </label>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] focus:border-transparent bg-white cursor-pointer"
          >
            <option value="2024-2025">2024-2025</option>
            <option value="2025-2026">2025-2026</option>
            <option value="2026-2027">2026-2027</option>
          </select>
        </div>

        {/* Action Button - Top */}
        {showActionButton && (
          <div className="md:flex md:items-end">{actionButton}</div>
        )}
      </div>
    </div>
  );
};

export default ScoreFilter;
