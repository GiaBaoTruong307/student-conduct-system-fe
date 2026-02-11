import ScoreItem from "./ScoreItem";

const ScoreTableDesktop = ({
  scoreData,
  totals,
  isEditing,
  uploadedImages,
  tempImages,
  savedScores,
  fileInputRefs,
  getItemKey,
  calculateSectionScore,
  getDisplayScore,
  handleScoreChange,
  handleUploadClick,
  handleImageClick,
  handleRemoveTempImage,
  handleImageUpload,
}) => {
  return (
    <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#c4b5e8] text-[#3d2f6b]">
              <th className="px-4 py-3 text-left text-sm font-bold border-r border-gray-300">
                NỘI DUNG VÀ TIÊU CHÍ ĐÁNH GIÁ
                <div className="text-xs font-normal mt-1">
                  (theo Quyết định số 3768/QĐ-ĐHĐN ngày 29/06/2026 của Giám đốc
                  ĐHĐN)
                </div>
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold border-r border-gray-300 w-24">
                Điểm tối đa
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold border-r border-gray-300 w-24">
                Điểm SV đánh giá
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold border-r border-gray-300 w-24">
                Điểm GVCN đánh giá
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold w-48">
                Minh chứng kèm theo
              </th>
            </tr>
          </thead>
          <tbody>
            {scoreData.map((section, sectionIdx) => (
              <>
                {/* Section Header */}
                <tr key={`section-${sectionIdx}`} className="bg-gray-100">
                  <td className="px-4 py-3 font-bold text-gray-800 border-r border-gray-300">
                    {section.section}
                  </td>
                  <td className="px-4 py-3 text-center font-bold border-r border-gray-300">
                    {section.maxScore}
                  </td>
                  <td className="px-4 py-3 text-center font-bold border-r border-gray-300">
                    {calculateSectionScore(sectionIdx)}
                  </td>
                  <td className="px-4 py-3 text-center font-bold border-r border-gray-300">
                    {section.reviewerScore}
                  </td>
                  <td className="px-4 py-3 text-center"></td>
                </tr>

                {/* Criteria */}
                {section.criteria.map((criterion, criterionIdx) => (
                  <>
                    {/* Criterion Title Row */}
                    <tr
                      key={`criterion-title-${sectionIdx}-${criterionIdx}`}
                      className="border-t border-gray-200 bg-white"
                    >
                      <td
                        colSpan={5}
                        className="px-4 py-2 border-r border-gray-300"
                      >
                        <div className="flex gap-3">
                          <span className="font-semibold text-gray-700 flex-shrink-0 italic">
                            {criterion.id}
                          </span>
                          <div className="text-sm text-gray-800 font-medium">
                            {criterion.title}
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Criterion Items */}
                    {criterion.items.map((item, itemIdx) => {
                      const itemKey = getItemKey(
                        sectionIdx,
                        criterionIdx,
                        itemIdx,
                      );
                      const currentImages = isEditing
                        ? tempImages[itemKey] || []
                        : uploadedImages[itemKey] || [];
                      const displayScore = getDisplayScore(itemKey);

                      return (
                        <ScoreItem
                          key={`item-${sectionIdx}-${criterionIdx}-${itemIdx}`}
                          item={item}
                          itemKey={itemKey}
                          isEditing={isEditing}
                          displayScore={displayScore}
                          currentImages={currentImages}
                          onScoreChange={handleScoreChange}
                          onUploadClick={handleUploadClick}
                          onImageClick={handleImageClick}
                          onRemoveImage={handleRemoveTempImage}
                          fileInputRef={(el) =>
                            (fileInputRefs.current[itemKey] = el)
                          }
                          onImageUpload={handleImageUpload}
                        />
                      );
                    })}
                  </>
                ))}
              </>
            ))}

            {/* Tổng cộng */}
            <tr className="bg-gray-100 font-bold">
              <td className="px-4 py-3 text-left border-r border-gray-300">
                TỔNG CỘNG
              </td>
              <td className="px-4 py-3 text-center border-r border-gray-300">
                {totals.max}
              </td>
              <td className="px-4 py-3 text-center border-r border-gray-300">
                {totals.self}
              </td>
              <td className="px-4 py-3 text-center border-r border-gray-300">
                {totals.reviewer}
              </td>
              <td className="px-4 py-3 text-center"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreTableDesktop;
