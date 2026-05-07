import { getGpaFromSystemB, convertGpaToScore } from "../../../utils/gpaConvert";

const AutoScoreCell = ({ mssv }) => {
  const auto = convertGpaToScore(getGpaFromSystemB(mssv));
  if (auto === null) return <span className="text-gray-400 italic text-sm">-</span>;
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

const ReviewerScoreCardsMobile = ({
  scoreData,
  selfScores = {},
  uploadedImages = {},
  isEditing,
  getItemKey,
  calculateReviewerSectionScore,
  getReviewerDisplayScore,
  handleReviewerScoreChange,
  handleImageClick,
  getNote,
  openNoteModal,
  selfTotal,
  reviewerTotals,
  mssv = null,
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
                <div className="font-bold text-[#3d2f6b]">
                  {section.maxScore}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">SV đánh giá</div>
                <div className="font-bold text-[#3d2f6b]">
                  {getSelfSectionScore(sectionIdx, section)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">BCS đánh giá</div>
                <div className="font-bold text-green-700">
                  {calculateReviewerSectionScore(sectionIdx)}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {section.criteria.map((criterion, criterionIdx) => (
              <div
                key={`mob-cr-${sectionIdx}-${criterionIdx}`}
                className="space-y-3"
              >
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
                  const reviewerScore = getReviewerDisplayScore(itemKey);
                  const selfScore = selfScores ? selfScores[itemKey] : undefined;
                  const note = getNote(itemKey);

                  return (
                    <div
                      key={`mob-it-${sectionIdx}-${criterionIdx}-${itemIdx}`}
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

                      {/* Score grid */}
                      <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 p-2 rounded">
                        <div className="text-center">
                          <div className="text-gray-600">Tối đa</div>
                          <div className="font-semibold">{item.maxScore}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600">SV</div>
                          <div className="font-semibold text-[#3d2f6b]">
                            {item.note ? (
                              <AutoScoreCell mssv={mssv} />
                            ) : selfScore !== undefined && selfScore !== "" ? (
                              selfScore
                            ) : (
                              "-"
                            )}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600">BCS</div>
                          <div className="font-semibold">
                            {item.note ? (
                              <span className="text-gray-400">-</span>
                            ) : isEditing && handleReviewerScoreChange ? (
                              <input
                                type="number"
                                min="0"
                                max={item.maxScore}
                                value={reviewerScore}
                                onChange={(e) =>
                                  handleReviewerScoreChange(
                                    itemKey,
                                    e.target.value,
                                    item.maxScore
                                  )
                                }
                                className="w-12 px-1 py-0.5 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-[#3d2f6b]"
                                placeholder="0"
                              />
                            ) : reviewerScore !== "" ? (
                              <span className="text-green-700">
                                {reviewerScore}
                              </span>
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
                              <div className="text-xs text-gray-500">
                                {img.date}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* item.note — AutoNoteCell khi là autoUpdate */}
                      {item.note && (
                        <AutoNoteCell mssv={mssv} note={item.note} />
                      )}

                      {/* BCS Note */}
                      {!item.note &&
                        (isEditing ? (
                          <button
                            onClick={() => openNoteModal(itemKey)}
                            className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
                          >
                            {note ? "Sửa ghi chú" : "Thêm ghi chú"}
                          </button>
                        ) : note ? (
                          <button
                            onClick={() => openNoteModal(itemKey)}
                            className="text-xs text-[#3d2f6b] hover:underline cursor-pointer font-medium"
                          >
                            Xem ghi chú
                          </button>
                        ) : null)}
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
            <div className="font-bold text-[#3d2f6b] text-lg">
              {reviewerTotals.max}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 text-xs">SV đánh giá</div>
            <div className="font-bold text-[#3d2f6b] text-lg">{selfTotal}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 text-xs">BCS đánh giá</div>
            <div className="font-bold text-green-700 text-lg">
              {reviewerTotals.reviewer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewerScoreCardsMobile;