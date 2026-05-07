import React from "react";
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
                            {item.note ? (
                              <AutoScoreCell mssv={mssv} />
                            ) : selfScore !== undefined && selfScore !== "" ? (
                              <span className="font-medium text-[#3d2f6b]">{selfScore}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-center border-r border-gray-200">
                            {item.note ? <span className="text-gray-400 italic text-sm">-</span>
                              : reviewerScore !== "" ? <span className="font-medium text-green-700">{reviewerScore}</span>
                                : <span className="text-gray-400 text-sm">-</span>}
                          </td>
                          <td className="px-4 py-2 text-center border-r border-gray-200">
                            {item.note ? (
                              <AutoNoteCell mssv={mssv} note={item.note} />
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
                          {item.note ? (
                            <AutoScoreCell mssv={mssv} />
                          ) : selfScore !== undefined && selfScore !== "" ? (
                            <span className="font-medium text-[#3d2f6b]">{selfScore}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center border-r border-gray-200">
                          {item.note ? <span className="text-gray-400 italic text-sm">-</span>
                            : reviewerScore !== "" ? <span className="font-medium text-green-700">{reviewerScore}</span>
                              : <span className="text-gray-400 text-sm">-</span>}
                        </td>
                        <td className="px-4 py-2 text-center border-r border-gray-200">
                          {item.note ? (
                            <AutoNoteCell mssv={mssv} note={item.note} />
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