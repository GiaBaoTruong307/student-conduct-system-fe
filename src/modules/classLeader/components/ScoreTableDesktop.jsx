import React from "react";

const ScoreTableDesktop = ({
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
}) => {
  const idCell = (id, rowSpan) => (
    <td
      rowSpan={rowSpan}
      className="px-3 py-2 border-r border-gray-200 text-sm font-semibold italic text-gray-500 align-middle text-center"
      style={{ width: "36px" }}
    >
      {id}
    </td>
  );

  return (
    <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#c4b5e8] text-[#3d2f6b]">
              <th colSpan={2} className="px-4 py-3 text-left text-sm font-bold border-r border-gray-300">
                NỘI DUNG VÀ TIÊU CHÍ ĐÁNH GIÁ
                <div className="text-xs font-normal mt-1">
                  (theo Quyết định số 3768/QĐ-ĐHĐN ngày 29/06/2026 của Giám đốc ĐHĐN)
                </div>
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold border-r border-gray-300 w-24">Điểm tối đa</th>
              <th className="px-4 py-3 text-center text-sm font-bold border-r border-gray-300 w-24">Điểm SV đánh giá</th>
              <th className="px-4 py-3 text-center text-sm font-bold border-r border-gray-300 w-24">Điểm GVCN đánh giá</th>
              <th className="px-4 py-3 text-center text-sm font-bold w-48">Minh chứng kèm theo</th>
            </tr>
          </thead>
          <tbody>
            {scoreData.map((section, sectionIdx) => (
              <React.Fragment key={sectionIdx}>
                <tr className="bg-gray-100">
                  <td colSpan={2} className="px-4 py-3 font-bold text-gray-800 border-r border-gray-300">{section.section}</td>
                  <td className="px-4 py-3 text-center font-bold border-r border-gray-300">{section.maxScore}</td>
                  <td className="px-4 py-3 text-center font-bold border-r border-gray-300">{calculateSectionScore(sectionIdx)}</td>
                  <td className="px-4 py-3 text-center font-bold border-r border-gray-300">{section.reviewerScore}</td>
                  <td className="px-4 py-3 text-center"></td>
                </tr>

                {section.criteria.map((criterion, criterionIdx) => {
                  const hasSubs = criterion.title !== null;
                  const hasTitle = hasSubs && criterion.title !== "";

                  if (!hasSubs) {
                    return criterion.items.map((item, itemIdx) => {
                      const itemKey = getItemKey(sectionIdx, criterionIdx, itemIdx);
                      const currentImages = isEditing ? tempImages[itemKey] || [] : uploadedImages[itemKey] || [];
                      const displayScore = getDisplayScore(itemKey);
                      return (
                        <tr key={itemKey} className="border-t border-gray-100">
                          {idCell(criterion.id)}
                          <td className="px-4 py-2 border-r border-gray-200 text-sm whitespace-pre-line text-gray-700">{item.description}</td>
                          <td className="px-4 py-2 text-center border-r border-gray-200">{item.maxScore}</td>
                          <td className="px-4 py-2 text-center border-r border-gray-200">
                            {item.note ? (
                              <span className="text-gray-400 italic">-</span>
                            ) : isEditing ? (
                              <input type="number" min="0" max={item.maxScore} value={displayScore}
                                onChange={(e) => handleScoreChange(itemKey, e.target.value, item.maxScore)}
                                className="w-12 px-1 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] focus:border-transparent"
                                placeholder="0" />
                            ) : displayScore !== "" ? displayScore : "-"}
                          </td>
                          <td className="px-4 py-2 text-center border-r border-gray-200">
                            {item.reviewerScore !== null && item.reviewerScore !== undefined ? item.reviewerScore : "-"}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {item.note ? (
                              <span className="text-xs text-gray-400 italic">{item.note}</span>
                            ) : (
                              <>
                                {isEditing && (
                                  <button onClick={() => handleUploadClick(itemKey)} className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer">
                                    {item.proof}
                                  </button>
                                )}
                                {currentImages.length > 0 && (
                                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                                    {currentImages.map((img, imgIdx) => (
                                      <div key={imgIdx} className="relative group">
                                        <div className="relative w-16 h-16 cursor-pointer" onClick={() => handleImageClick(img, itemKey, imgIdx)}>
                                          <img src={img.url} alt={`Minh chứng ${imgIdx + 1}`} className="w-16 h-16 object-cover rounded border border-gray-300 hover:opacity-80 transition-opacity" />
                                          {isEditing && (
                                            <div className="absolute inset-0 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 pointer-events-none">
                                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                              </svg>
                                            </div>
                                          )}
                                        </div>
                                        <div className="text-xs text-gray-700 mt-1 max-w-[64px] truncate" title={img.description}>{img.description}</div>
                                        <div className="text-xs text-gray-500">{img.date}</div>
                                        {isEditing && (
                                          <button onClick={(e) => { e.stopPropagation(); handleRemoveTempImage(itemKey, imgIdx); }}
                                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer text-sm font-bold z-10">×</button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {!isEditing && currentImages.length === 0 && (
                                  <span className="text-xs text-gray-400 italic">Không có</span>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    });
                  }

                  const rows = [];

                  if (hasTitle) {
                    rows.push(
                      <tr key={`cr-${criterionIdx}-title`} className="border-t border-gray-100 bg-gray-50/40">
                        {idCell(criterion.id, criterion.items.length + 1)}
                        <td colSpan={5} className="px-4 py-2 text-sm font-medium text-gray-700">{criterion.title}</td>
                      </tr>
                    );
                  }

                  criterion.items.forEach((item, itemIdx) => {
                    const itemKey = getItemKey(sectionIdx, criterionIdx, itemIdx);
                    const currentImages = isEditing ? tempImages[itemKey] || [] : uploadedImages[itemKey] || [];
                    const displayScore = getDisplayScore(itemKey);
                    const isFirst = itemIdx === 0;

                    rows.push(
                      <tr key={itemKey} className="border-t border-gray-100">
                        {!hasTitle && isFirst && idCell(criterion.id, criterion.items.length)}
                        <td className="px-4 py-2 border-r border-gray-200 text-sm whitespace-pre-line text-gray-700">{item.description}</td>
                        <td className="px-4 py-2 text-center border-r border-gray-200">{item.maxScore}</td>
                        <td className="px-4 py-2 text-center border-r border-gray-200">
                          {item.note ? (
                            <span className="text-gray-400 italic">-</span>
                          ) : isEditing ? (
                            <input type="number" min="0" max={item.maxScore} value={displayScore}
                              onChange={(e) => handleScoreChange(itemKey, e.target.value, item.maxScore)}
                              className="w-12 px-1 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] focus:border-transparent"
                              placeholder="0" />
                          ) : displayScore !== "" ? displayScore : "-"}
                        </td>
                        <td className="px-4 py-2 text-center border-r border-gray-200">
                          {item.reviewerScore !== null && item.reviewerScore !== undefined ? item.reviewerScore : "-"}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {item.note ? (
                            <span className="text-xs text-gray-400 italic">{item.note}</span>
                          ) : (
                            <>
                              {isEditing && (
                                <button onClick={() => handleUploadClick(itemKey)} className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer">
                                  {item.proof}
                                </button>
                              )}
                              {currentImages.length > 0 && (
                                <div className="flex flex-wrap gap-2 justify-center mt-2">
                                  {currentImages.map((img, imgIdx) => (
                                    <div key={imgIdx} className="relative group">
                                      <div className="relative w-16 h-16 cursor-pointer" onClick={() => handleImageClick(img, itemKey, imgIdx)}>
                                        <img src={img.url} alt={`Minh chứng ${imgIdx + 1}`} className="w-16 h-16 object-cover rounded border border-gray-300 hover:opacity-80 transition-opacity" />
                                        {isEditing && (
                                          <div className="absolute inset-0 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 pointer-events-none">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-700 mt-1 max-w-[64px] truncate" title={img.description}>{img.description}</div>
                                      <div className="text-xs text-gray-500">{img.date}</div>
                                      {isEditing && (
                                        <button onClick={(e) => { e.stopPropagation(); handleRemoveTempImage(itemKey, imgIdx); }}
                                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer text-sm font-bold z-10">×</button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {!isEditing && currentImages.length === 0 && (
                                <span className="text-xs text-gray-400 italic">Không có</span>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  });

                  return rows;
                })}
              </React.Fragment>
            ))}

            <tr className="bg-gray-100 font-bold">
              <td colSpan={2} className="px-4 py-3 text-left border-r border-gray-300">TỔNG CỘNG</td>
              <td className="px-4 py-3 text-center border-r border-gray-300">{totals.max}</td>
              <td className="px-4 py-3 text-center border-r border-gray-300">{totals.self}</td>
              <td className="px-4 py-3 text-center border-r border-gray-300">{totals.reviewer}</td>
              <td className="px-4 py-3 text-center"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreTableDesktop;