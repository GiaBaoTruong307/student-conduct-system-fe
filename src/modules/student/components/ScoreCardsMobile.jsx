const ScoreCardsMobile = ({
  scoreData,
  totals,
  isEditing,
  uploadedImages,
  tempImages,
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
                <div className="font-bold text-[#3d2f6b]">
                  {section.maxScore}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">SV đánh giá</div>
                <div className="font-bold text-[#3d2f6b]">
                  {calculateSectionScore(sectionIdx)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">GVCN đánh giá</div>
                <div className="font-bold text-[#3d2f6b]">
                  {section.reviewerScore}
                </div>
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
                {/* Criterion Title */}
                <div className="flex gap-2">
                  <span className="font-semibold text-gray-700 italic text-sm">
                    {criterion.id}
                  </span>
                  <div className="text-sm text-gray-800 font-medium">
                    {criterion.title}
                  </div>
                </div>

                {/* Items */}
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
                      {/* Description */}
                      <div className="text-sm text-gray-700 whitespace-pre-line">
                        <span className="mr-1">-</span>
                        {item.description}
                      </div>

                      {/* Scores Grid */}
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
                                  handleScoreChange(
                                    itemKey,
                                    e.target.value,
                                    item.maxScore,
                                  )
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
                            {item.reviewerScore !== null &&
                            item.reviewerScore !== undefined
                              ? item.reviewerScore
                              : "-"}
                          </div>
                        </div>
                      </div>

                      {/* Proof/Note */}
                      {item.note ? (
                        <div className="text-xs text-gray-500 italic">
                          {item.note}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {isEditing && (
                            <div>
                              <button
                                onClick={() => handleUploadClick(itemKey)}
                                className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
                              >
                                {item.proof}
                              </button>
                              <input
                                ref={(el) =>
                                  (fileInputRefs.current[itemKey] = el)
                                }
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleImageUpload(e, itemKey)}
                                className="hidden"
                              />
                            </div>
                          )}

                          {currentImages.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {currentImages.map((img, imgIdx) => (
                                <div key={imgIdx} className="relative group">
                                  <img
                                    src={img}
                                    alt={`Preview ${imgIdx + 1}`}
                                    className={`w-16 h-16 object-cover rounded border border-gray-300 ${
                                      !isEditing
                                        ? "cursor-pointer hover:opacity-80 transition-opacity"
                                        : ""
                                    }`}
                                    onClick={() => handleImageClick(img)}
                                  />
                                  {isEditing && (
                                    <button
                                      onClick={() =>
                                        handleRemoveTempImage(itemKey, imgIdx)
                                      }
                                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer text-sm font-bold"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
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
            <div className="font-bold text-[#3d2f6b] text-lg">
              {totals.self}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 text-xs">GVCN đánh giá</div>
            <div className="font-bold text-[#3d2f6b] text-lg">
              {totals.reviewer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCardsMobile;
