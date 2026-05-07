import { getGpaFromSystemB, convertGpaToScore } from "../../../utils/gpaConvert";

const AutoGvcnCell = ({ mssv }) => {
  const gpa = getGpaFromSystemB(mssv);
  const auto = convertGpaToScore(gpa);
  if (gpa === null) {
    return <span className="text-amber-500 text-[10px] italic">⏳ Chờ HT-B</span>;
  }
  return (
    <div className="flex flex-col items-center leading-tight">
      <span className="font-bold text-blue-700">{auto}</span>
      <span className="text-[10px] text-blue-400">HT-B</span>
    </div>
  );
};

const AutoNoteCell = ({ mssv, note }) => {
  const gpa = getGpaFromSystemB(mssv);
  const auto = convertGpaToScore(gpa);
  return (
    <div className="text-xs space-y-1">
      <div className="text-gray-400 italic">{note}</div>
      {gpa !== null ? (
        <div className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap">
          🔗 HT-B · ĐTB: {gpa} → {auto}đ
        </div>
      ) : (
        <div className="text-amber-500 text-[11px] italic">⏳ Chờ Hệ thống B</div>
      )}
    </div>
  );
};

const ScoreCardsMobile = ({
  scoreData,
  totals,
  isEditing,
  uploadedImages,
  tempImages,
  getItemKey,
  calculateSectionScore,
  getDisplayScore,
  handleScoreChange,
  handleUploadClick,
  handleImageClick,
  handleRemoveTempImage,
  mssv = null,
}) => {
  return (
    <div className="lg:hidden space-y-4">
      {scoreData.map((section, sectionIdx) => (
        <div
          key={`mobile-section-${sectionIdx}`}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Section Header */}
          <div className="bg-gray-100 p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800 text-sm md:text-base">
              {section.section}
            </h3>
            <div className="grid grid-cols-3 gap-2 mt-3 text-xs md:text-sm">
              <div className="text-center">
                <div className="text-gray-600">Tối đa</div>
                <div className="font-bold text-[#3d2f6b]">{section.maxScore}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">SV đánh giá</div>
                <div className="font-bold text-[#3d2f6b]">{calculateSectionScore(sectionIdx)}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">GVCN đánh giá</div>
                <div className="font-bold text-[#3d2f6b]">{section.reviewerScore}</div>
              </div>
            </div>
          </div>

          {/* Criteria */}
          <div className="p-4 space-y-4">
            {section.criteria.map((criterion, criterionIdx) => (
              <div
                key={`mobile-criterion-${sectionIdx}-${criterionIdx}`}
                className="space-y-3"
              >
                {criterion.title && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-700 italic text-sm">
                      {criterion.id}
                    </span>
                    <div className="text-sm text-gray-800 font-medium">
                      {criterion.title}
                    </div>
                  </div>
                )}

                {criterion.items.map((item, itemIdx) => {
                  const itemKey = getItemKey(sectionIdx, criterionIdx, itemIdx);
                  const currentImages = isEditing
                    ? tempImages[itemKey] || []
                    : uploadedImages[itemKey] || [];
                  const displayScore = getDisplayScore(itemKey);

                  return (
                    <div
                      key={`mobile-item-${sectionIdx}-${criterionIdx}-${itemIdx}`}
                      className="pl-6 space-y-2 border-l-2 border-gray-200"
                    >
                      <div className="text-sm text-gray-700 whitespace-pre-line">
                        {!criterion.title && criterion.id && (
                          <span className="font-semibold italic text-gray-500 mr-1">
                            {criterion.id}
                          </span>
                        )}
                        {item.description}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 p-2 rounded">
                        <div className="text-center">
                          <div className="text-gray-600">Tối đa</div>
                          <div className="font-semibold">{item.maxScore}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600">SV</div>
                          <div className="font-semibold">
                            {item.note ? (
                              <span className="text-gray-400 italic">-</span>
                            ) : isEditing ? (
                              <input
                                type="number"
                                min="0"
                                max={item.maxScore}
                                value={displayScore}
                                onChange={(e) =>
                                  handleScoreChange(itemKey, e.target.value, item.maxScore)
                                }
                                className="w-12 px-1 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] focus:border-transparent"
                                placeholder="0"
                              />
                            ) : displayScore !== "" ? (
                              displayScore
                            ) : (
                              "-"
                            )}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600">GVCN</div>
                          <div className="font-semibold">
                            {item.note ? (
                              <AutoGvcnCell mssv={mssv} />
                            ) : (
                              item.reviewerScore !== null && item.reviewerScore !== undefined
                                ? item.reviewerScore
                                : "-"
                            )}
                          </div>
                        </div>
                      </div>

                      {item.note ? (
                        <AutoNoteCell mssv={mssv} note={item.note} />
                      ) : (
                        <div className="space-y-2">
                          {isEditing && (
                            <button
                              onClick={() => handleUploadClick(itemKey)}
                              className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
                            >
                              {item.proof}
                            </button>
                          )}

                          {currentImages.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {currentImages.map((img, imgIdx) => (
                                <div key={imgIdx} className="relative group">
                                  <div
                                    className="relative w-16 h-16 cursor-pointer"
                                    onClick={() => handleImageClick(img, itemKey, imgIdx)}
                                  >
                                    <img
                                      src={img.url}
                                      alt={`Preview ${imgIdx + 1}`}
                                      className="w-16 h-16 object-cover rounded border border-gray-300 hover:opacity-80 transition-opacity"
                                    />
                                    {isEditing && (
                                      <div className="absolute inset-0 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 pointer-events-none">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-700 mt-1 max-w-[64px] truncate" title={img.description}>
                                    {img.description}
                                  </div>
                                  <div className="text-xs text-gray-500">{img.date}</div>
                                  {isEditing && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveTempImage(itemKey, imgIdx);
                                      }}
                                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer text-sm font-bold z-10"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {!isEditing && currentImages.length === 0 && (
                            <span className="text-xs text-gray-400 italic">Không có</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Tổng cộng - Mobile */}
      <div className="bg-gray-100 rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-bold text-gray-800 mb-3">TỔNG CỘNG</h3>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center">
            <div className="text-gray-600 text-xs">Điểm tối đa</div>
            <div className="font-bold text-[#3d2f6b] text-lg">{totals.max}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 text-xs">SV đánh giá</div>
            <div className="font-bold text-[#3d2f6b] text-lg">{totals.self}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 text-xs">GVCN đánh giá</div>
            <div className="font-bold text-[#3d2f6b] text-lg">{totals.reviewer}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCardsMobile;