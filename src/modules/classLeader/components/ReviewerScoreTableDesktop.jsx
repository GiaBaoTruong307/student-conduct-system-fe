import React from "react";

const ReviewerScoreTableDesktop = ({
  scoreData,
  selfScores = {},
  uploadedImages = {},
  isEditing,
  getItemKey,
  calculateReviewerSectionScore,
  getReviewerDisplayScore,
  handleImageClick,
  getNote,
  openNoteModal,
  selfTotal,
  reviewerTotals,
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
              <th className="px-4 py-3 text-center text-sm font-bold border-r border-gray-300 w-20">Điểm tối đa</th>
              <th className="px-4 py-3 text-center text-sm font-bold border-r border-gray-300 w-24">Điểm SV đánh giá</th>
              <th className="px-4 py-3 text-center text-sm font-bold border-r border-gray-300 w-28">Điểm GVCN đánh giá</th>
              <th className="px-4 py-3 text-center text-sm font-bold border-r border-gray-300 w-44">Minh chứng kèm theo</th>
              <th className="px-4 py-3 text-center text-sm font-bold w-32">Ghi chú của BCS</th>
            </tr>
          </thead>
          <tbody>
            {scoreData.map((section, sectionIdx) => (
              <React.Fragment key={sectionIdx}>
                <tr className="bg-gray-100">
                  <td colSpan={2} className="px-4 py-3 font-bold text-gray-800 border-r border-gray-300">{section.section}</td>
                  <td className="px-4 py-3 text-center font-bold border-r border-gray-300">{section.maxScore}</td>
                  <td className="px-4 py-3 text-center font-bold border-r border-gray-300 text-[#3d2f6b]">{getSelfSectionScore(sectionIdx, section)}</td>
                  <td className="px-4 py-3 text-center font-bold border-r border-gray-300 text-green-700">{calculateReviewerSectionScore(sectionIdx)}</td>
                  <td className="px-4 py-3 border-r border-gray-300"></td>
                  <td className="px-4 py-3"></td>
                </tr>

                {section.criteria.map((criterion, criterionIdx) => {
                  const hasSubs = criterion.title !== null;
                  const hasTitle = hasSubs && criterion.title !== "";

                  if (!hasSubs) {
                    return criterion.items.map((item, itemIdx) => {
                      const itemKey = getItemKey(sectionIdx, criterionIdx, itemIdx);
                      const images = (uploadedImages && uploadedImages[itemKey]) || [];
                      const reviewerScore = getReviewerDisplayScore(itemKey);
                      const selfScore = selfScores ? selfScores[itemKey] : undefined;
                      const note = getNote(itemKey);
                      return (
                        <tr key={itemKey} className="border-t border-gray-100">
                          {idCell(criterion.id)}
                          <td className="px-4 py-2 border-r border-gray-200 text-sm whitespace-pre-line text-gray-700">{item.description}</td>
                          <td className="px-4 py-2 text-center border-r border-gray-200 text-sm">{item.maxScore}</td>
                          <td className="px-4 py-2 text-center border-r border-gray-200 text-sm">
                            {item.note ? <span className="text-gray-400 italic">-</span>
                              : selfScore !== undefined && selfScore !== "" ? <span className="font-medium text-[#3d2f6b]">{selfScore}</span>
                                : <span className="text-gray-400">-</span>}
                          </td>
                          <td className="px-4 py-2 text-center border-r border-gray-200">
                            {item.note ? <span className="text-gray-400 italic text-sm">-</span>
                              : reviewerScore !== "" ? <span className="font-medium text-green-700">{reviewerScore}</span>
                                : <span className="text-gray-400 text-sm">-</span>}
                          </td>
                          <td className="px-4 py-2 text-center border-r border-gray-200">
                            {item.note ? (
                              <span className="text-xs text-gray-400 italic">{item.note}</span>
                            ) : images.length > 0 ? (
                              <div className="flex flex-wrap gap-2 justify-center">
                                {images.map((img, imgIdx) => (
                                  <div key={imgIdx} className="flex flex-col items-center cursor-pointer" onClick={() => handleImageClick(img)}>
                                    <img src={img.url} alt={`Minh chứng ${imgIdx + 1}`} className="w-14 h-14 object-cover rounded border border-gray-300 hover:opacity-80 transition-opacity" />
                                    <div className="text-xs text-gray-700 mt-1 max-w-[56px] truncate" title={img.description}>{img.description}</div>
                                    <div className="text-xs text-gray-500">{img.date}</div>
                                  </div>
                                ))}
                              </div>
                            ) : <span className="text-gray-400 text-xs italic">Không có</span>}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {!item.note && (isEditing ? (
                              <button onClick={() => openNoteModal(itemKey)} className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer">
                                {note ? "Sửa" : "Thêm"}
                              </button>
                            ) : note ? (
                              <button onClick={() => openNoteModal(itemKey)} className="text-xs text-[#3d2f6b] hover:underline cursor-pointer font-medium">Xem</button>
                            ) : null)}
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
                        <td colSpan={6} className="px-4 py-2 text-sm font-medium text-gray-700">{criterion.title}</td>
                      </tr>
                    );
                  }

                  criterion.items.forEach((item, itemIdx) => {
                    const itemKey = getItemKey(sectionIdx, criterionIdx, itemIdx);
                    const isFirst = itemIdx === 0;
                    const images = (uploadedImages && uploadedImages[itemKey]) || [];
                    const reviewerScore = getReviewerDisplayScore(itemKey);
                    const selfScore = selfScores ? selfScores[itemKey] : undefined;
                    const note = getNote(itemKey);

                    rows.push(
                      <tr key={itemKey} className="border-t border-gray-100">
                        {!hasTitle && isFirst && idCell(criterion.id, criterion.items.length)}
                        <td className="px-4 py-2 border-r border-gray-200 text-sm whitespace-pre-line text-gray-700">{item.description}</td>
                        <td className="px-4 py-2 text-center border-r border-gray-200 text-sm">{item.maxScore}</td>
                        <td className="px-4 py-2 text-center border-r border-gray-200 text-sm">
                          {item.note ? <span className="text-gray-400 italic">-</span>
                            : selfScore !== undefined && selfScore !== "" ? <span className="font-medium text-[#3d2f6b]">{selfScore}</span>
                              : <span className="text-gray-400">-</span>}
                        </td>
                        <td className="px-4 py-2 text-center border-r border-gray-200">
                          {item.note ? <span className="text-gray-400 italic text-sm">-</span>
                            : reviewerScore !== "" ? <span className="font-medium text-green-700">{reviewerScore}</span>
                              : <span className="text-gray-400 text-sm">-</span>}
                        </td>
                        <td className="px-4 py-2 text-center border-r border-gray-200">
                          {item.note ? (
                            <span className="text-xs text-gray-400 italic">{item.note}</span>
                          ) : images.length > 0 ? (
                            <div className="flex flex-wrap gap-2 justify-center">
                              {images.map((img, imgIdx) => (
                                <div key={imgIdx} className="flex flex-col items-center cursor-pointer" onClick={() => handleImageClick(img)}>
                                  <img src={img.url} alt={`Minh chứng ${imgIdx + 1}`} className="w-14 h-14 object-cover rounded border border-gray-300 hover:opacity-80 transition-opacity" />
                                  <div className="text-xs text-gray-700 mt-1 max-w-[56px] truncate" title={img.description}>{img.description}</div>
                                  <div className="text-xs text-gray-500">{img.date}</div>
                                </div>
                              ))}
                            </div>
                          ) : <span className="text-gray-400 text-xs italic">Không có</span>}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {!item.note && (isEditing ? (
                            <button onClick={() => openNoteModal(itemKey)} className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer">
                              {note ? "Sửa" : "Thêm"}
                            </button>
                          ) : note ? (
                            <button onClick={() => openNoteModal(itemKey)} className="text-xs text-[#3d2f6b] hover:underline cursor-pointer font-medium">Xem</button>
                          ) : null)}
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
              <td className="px-4 py-3 text-center border-r border-gray-300">{reviewerTotals.max}</td>
              <td className="px-4 py-3 text-center border-r border-gray-300 text-[#3d2f6b]">{selfTotal}</td>
              <td className="px-4 py-3 text-center border-r border-gray-300 text-green-700">{reviewerTotals.reviewer}</td>
              <td className="px-4 py-3 border-r border-gray-300"></td>
              <td className="px-4 py-3"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewerScoreTableDesktop;