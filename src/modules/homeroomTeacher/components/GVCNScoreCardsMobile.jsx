const GVCNScoreCardsMobile = ({
  scoreData,
  selfScores = {},
  uploadedImages = {},
  isEditing,
  getItemKey,
  calculateGvcnSectionScore,
  getGvcnDisplayScore,
  handleGvcnScoreChange,
  handleImageClick,
  getBcsNote,
  openBcsNoteModal,
  selfTotal,
  gvcnTotals,
}) => {
  const getSelfSectionScore = (sectionIdx, section) => {
    if (!selfScores) return 0;
    let total = 0;
    section.criteria.forEach((criterion, ci) => {
      criterion.items.forEach((item, ii) => {
        if (item.note) return;
        const key = getItemKey(sectionIdx, ci, ii);
        const s = selfScores[key];
        if (s !== undefined && s !== "") total += Number(s);
      });
    });
    return total;
  };

  return (
    <div className="lg:hidden space-y-4">
      {scoreData.map((section, sectionIdx) => (
        <div
          key={`mob-sec-${sectionIdx}`}
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
                <div className="font-bold text-[#3d2f6b]">
                  {getSelfSectionScore(sectionIdx, section)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">GVCN đánh giá</div>
                <div className="font-bold text-emerald-700">
                  {calculateGvcnSectionScore(sectionIdx)}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {section.criteria.map((criterion, criterionIdx) => (
              <div key={`mob-cr-${sectionIdx}-${criterionIdx}`} className="space-y-3">
                {/* Criterion Title — chỉ render khi có title */}
                {criterion.title && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-700 italic text-sm flex-shrink-0">
                      {criterion.id}
                    </span>
                    <div className="text-sm text-gray-800 font-medium">
                      {criterion.title}
                    </div>
                  </div>
                )}

                {criterion.items.map((item, itemIdx) => {
                  const itemKey = getItemKey(sectionIdx, criterionIdx, itemIdx);
                  const images = (uploadedImages && uploadedImages[itemKey]) || [];
                  const gvcnScore = getGvcnDisplayScore(itemKey);
                  const selfScore = selfScores ? selfScores[itemKey] : undefined;
                  const bcsNote = getBcsNote(itemKey);

                  return (
                    <div
                      key={`mob-it-${sectionIdx}-${criterionIdx}-${itemIdx}`}
                      className="pl-6 space-y-2 border-l-2 border-gray-200"
                    >
                      <div className="text-sm text-gray-700 whitespace-pre-line">
                        {/* Khi không có criterion title → prefix chữ cái vào dòng item */}
                        {!criterion.title && criterion.id && (
                          <span className="font-semibold italic text-gray-500 mr-1">
                            {criterion.id}
                          </span>
                        )}
                        {item.description}
                      </div>

                      {/* Score grid */}
                      <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 p-2 rounded">
                        <div className="text-center">
                          <div className="text-gray-600">Tối đa</div>
                          <div className="font-semibold">{item.maxScore}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600">SV</div>
                          <div className="font-semibold text-[#3d2f6b]">
                            {item.note
                              ? "-"
                              : selfScore !== undefined && selfScore !== ""
                              ? selfScore
                              : "-"}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600">GVCN</div>
                          <div className="font-semibold">
                            {item.note ? (
                              <span className="text-gray-400">-</span>
                            ) : isEditing ? (
                              <input
                                type="number"
                                min="0"
                                max={item.maxScore}
                                value={gvcnScore}
                                onChange={(e) =>
                                  handleGvcnScoreChange(
                                    itemKey,
                                    e.target.value,
                                    item.maxScore
                                  )
                                }
                                className="w-12 px-1 py-0.5 border border-emerald-400 rounded text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="0"
                              />
                            ) : gvcnScore !== "" ? (
                              <span className="text-emerald-700">{gvcnScore}</span>
                            ) : (
                              "-"
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Student's images — view only */}
                      {images.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {images.map((img, imgIdx) => (
                            <div
                              key={imgIdx}
                              className="flex flex-col items-center cursor-pointer"
                              onClick={() => handleImageClick(img)}
                            >
                              <img
                                src={img.url}
                                alt={`Minh chứng ${imgIdx + 1}`}
                                className="w-14 h-14 object-cover rounded border border-gray-300 hover:opacity-80"
                              />
                              <div
                                className="text-xs text-gray-700 mt-1 max-w-[56px] truncate"
                                title={img.description}
                              >
                                {img.description}
                              </div>
                              <div className="text-xs text-gray-500">{img.date}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* item.note text — hiển thị khi là autoUpdate */}
                      {item.note && (
                        <div className="text-xs text-gray-400 italic">{item.note}</div>
                      )}

                      {/* Ghi chú BCS — chỉ xem */}
                      {!item.note && bcsNote && (
                        <button
                          onClick={() => openBcsNoteModal(itemKey)}
                          className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
                        >
                          Xem ghi chú BCS
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Tổng cộng */}
      <div className="bg-gray-100 rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-bold text-gray-800 mb-3">TỔNG CỘNG</h3>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center">
            <div className="text-gray-600 text-xs">Điểm tối đa</div>
            <div className="font-bold text-[#3d2f6b] text-lg">{gvcnTotals.max}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 text-xs">SV đánh giá</div>
            <div className="font-bold text-[#3d2f6b] text-lg">{selfTotal}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 text-xs">GVCN đánh giá</div>
            <div className="font-bold text-emerald-700 text-lg">{gvcnTotals.gvcn}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GVCNScoreCardsMobile;