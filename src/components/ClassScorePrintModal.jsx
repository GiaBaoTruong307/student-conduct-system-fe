import { useEffect } from "react";

const getXepLoai = (score) => {
  const s = Number(score);
  if (isNaN(s) || score === "-" || score === null || score === undefined) return "-";
  if (s >= 90) return "Xuất sắc";
  if (s >= 80) return "Tốt";
  if (s >= 65) return "Khá";
  if (s >= 50) return "Trung bình";
  if (s >= 35) return "Yếu";
  return "Kém";
};

const ClassScorePrintModal = ({
  classId,
  semesterName = "",
  yearName = "",
  gvcnName = "",
  members = [],
  onClose,
}) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handlePrint = () => {
    const now = new Date();
    const dateStr =
      `${String(now.getDate()).padStart(2, "0")}/` +
      `${String(now.getMonth() + 1).padStart(2, "0")}/` +
      `${now.getFullYear()}`;

    const rowsHtml = members
      .map((m, idx) => {
        const fs = m.finalScore !== undefined && m.finalScore !== null && m.finalScore !== "-"
          ? m.finalScore : "-";
        const ss = m.selfScore !== undefined && m.selfScore !== null && m.selfScore !== "-"
          ? m.selfScore : "-";
        const xepLoai = getXepLoai(fs !== "-" ? fs : ss);
        return `<tr style="background:${idx % 2 === 0 ? "#fff" : "#f9fafb"}">
          <td style="border:1px solid #888;padding:5px 8px;text-align:center">${idx + 1}</td>
          <td style="border:1px solid #888;padding:5px 8px;text-align:center;font-family:monospace">${m.mssv}</td>
          <td style="border:1px solid #888;padding:5px 8px">${m.ho}</td>
          <td style="border:1px solid #888;padding:5px 8px;font-weight:600">${m.ten}</td>
          <td style="border:1px solid #888;padding:5px 8px;text-align:center">${m.ngaySinh}</td>
          <td style="border:1px solid #888;padding:5px 8px;text-align:center">${ss}</td>
          <td style="border:1px solid #888;padding:5px 8px;text-align:center;font-weight:bold">${fs}</td>
          <td style="border:1px solid #888;padding:5px 8px;text-align:center">${xepLoai}</td>
        </tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Bảng điểm rèn luyện - Lớp ${classId}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 15mm; color: #111; }
      .header { text-align: center; margin-bottom: 20px; }
      .header .school { font-size: 11pt; margin-bottom: 2px; }
      .header .title  { font-size: 15pt; font-weight: bold; text-transform: uppercase; margin: 8px 0 4px; }
      .info-row { font-size: 11pt; margin-bottom: 14px; display: flex; flex-wrap: wrap; gap: 0; }
      .info-row span { margin-right: 28px; }
      table { width: 100%; border-collapse: collapse; font-size: 10pt; }
      th { background-color: #d8cef0; border: 1px solid #555; padding: 7px 8px; text-align: center; }
      .signature { display: flex; justify-content: space-between; margin-top: 40px; }
      .sig-box { text-align: center; min-width: 180px; }
      .sig-box .t { font-weight: bold; font-size: 11pt; }
      .sig-box .n { font-size: 9pt; color: #555; margin: 4px 0 48px; }
      .sig-box .nm { font-weight: 600; }
      .print-date { text-align: center; font-size: 10pt; color: #555; align-self: flex-end; }
      @media print { body { margin: 10mm; } }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="school">ĐẠI HỌC ĐÀ NẴNG – TRƯỜNG ĐẠI HỌC KINH TẾ</div>
      <div class="title">Bảng điểm rèn luyện sinh viên</div>
    </div>
    <div class="info-row">
      <span><strong>Lớp:</strong> ${classId}</span>
      ${semesterName ? `<span><strong>Học kỳ:</strong> ${semesterName}</span>` : ""}
      ${yearName     ? `<span><strong>Năm học:</strong> ${yearName}</span>`    : ""}
      ${gvcnName     ? `<span><strong>GVCN:</strong> ${gvcnName}</span>`       : ""}
    </div>
    <table>
      <thead>
        <tr>
          <th style="width:36px">STT</th>
          <th style="width:115px">MSSV</th>
          <th>Họ</th>
          <th style="width:75px">Tên</th>
          <th style="width:88px">Ngày sinh</th>
          <th style="width:90px">Điểm SV<br/>tự đánh giá</th>
          <th style="width:90px">Điểm GVCN<br/>đánh giá</th>
          <th style="width:88px">Xếp loại</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <div class="signature">
      <div class="sig-box">
        <div class="t">GIẢNG VIÊN CHỦ NHIỆM</div>
        <div class="n">(Ký và ghi rõ họ tên)</div>
        ${gvcnName ? `<div class="nm">${gvcnName}</div>` : ""}
      </div>
      <div class="print-date">Ngày in: ${dateStr}</div>
      <div class="sig-box">
        <div class="t">PHÒNG CÔNG TÁC SINH VIÊN</div>
        <div class="n">(Ký và ghi rõ họ tên)</div>
      </div>
    </div>
  </body>
</html>`;

    const pw = window.open("", "_blank", "width=960,height=700");
    if (!pw) {
      alert("Trình duyệt đã chặn popup. Vui lòng cho phép popup cho trang này và thử lại.");
      return;
    }
    pw.document.write(html);
    pw.document.close();
    pw.focus();
    setTimeout(() => { pw.print(); pw.close(); }, 400);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-800">
              Xem trước bảng điểm — Lớp {classId}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {[semesterName, yearName && `Năm học ${yearName}`].filter(Boolean).join(" · ")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview body */}
        <div className="flex-1 overflow-auto p-5">
          <div className="text-center mb-4">
            <p className="text-xs text-gray-500">ĐẠI HỌC ĐÀ NẴNG – TRƯỜNG ĐẠI HỌC KINH TẾ</p>
            <h2 className="text-sm font-bold text-gray-800 uppercase mt-1">
              Bảng điểm rèn luyện sinh viên
            </h2>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-700 mb-3">
            <span><strong>Lớp:</strong> {classId}</span>
            {semesterName && <span><strong>Học kỳ:</strong> {semesterName}</span>}
            {yearName     && <span><strong>Năm học:</strong> {yearName}</span>}
            {gvcnName     && <span><strong>GVCN:</strong> {gvcnName}</span>}
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#c4b5e8] text-[#3d2f6b]">
                  <th className="px-3 py-2 text-center font-bold border border-gray-300 w-10">STT</th>
                  <th className="px-3 py-2 text-center font-bold border border-gray-300">MSSV</th>
                  <th className="px-3 py-2 text-left   font-bold border border-gray-300">Họ</th>
                  <th className="px-3 py-2 text-left   font-bold border border-gray-300">Tên</th>
                  <th className="px-3 py-2 text-center font-bold border border-gray-300">Ngày sinh</th>
                  <th className="px-3 py-2 text-center font-bold border border-gray-300">Điểm SV tự ĐG</th>
                  <th className="px-3 py-2 text-center font-bold border border-gray-300">Điểm GVCN ĐG</th>
                  <th className="px-3 py-2 text-center font-bold border border-gray-300">Xếp loại</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, idx) => {
                  const fs = m.finalScore !== undefined && m.finalScore !== null && m.finalScore !== "-"
                    ? m.finalScore : "-";
                  const ss = m.selfScore !== undefined && m.selfScore !== null && m.selfScore !== "-"
                    ? m.selfScore : "-";
                  const xepLoai = getXepLoai(fs !== "-" ? fs : ss);
                  return (
                    <tr key={m.mssv} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-3 py-2 text-center border border-gray-200 text-gray-500">{idx + 1}</td>
                      <td className="px-3 py-2 text-center border border-gray-200 font-mono text-xs text-gray-600">{m.mssv}</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-700">{m.ho}</td>
                      <td className="px-3 py-2 border border-gray-200 font-semibold text-gray-800">{m.ten}</td>
                      <td className="px-3 py-2 text-center border border-gray-200 text-gray-600">{m.ngaySinh}</td>
                      <td className="px-3 py-2 text-center border border-gray-200 font-semibold text-[#3d2f6b]">{ss}</td>
                      <td className="px-3 py-2 text-center border border-gray-200 font-semibold text-emerald-700">{fs}</td>
                      <td className="px-3 py-2 text-center border border-gray-200 text-gray-700">{xepLoai}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-8 text-sm text-gray-700 px-4">
            <div className="text-center min-w-[160px]">
              <p className="font-bold">GIẢNG VIÊN CHỦ NHIỆM</p>
              <p className="text-xs text-gray-400 mt-1">(Ký và ghi rõ họ tên)</p>
              {gvcnName && <p className="mt-10 font-semibold">{gvcnName}</p>}
            </div>
            <div className="text-center min-w-[160px]">
              <p className="font-bold">PHÒNG CÔNG TÁC SINH VIÊN</p>
              <p className="text-xs text-gray-400 mt-1">(Ký và ghi rõ họ tên)</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 text-sm font-medium text-white bg-[#3d2f6b] hover:bg-[#2f2454] rounded-lg cursor-pointer transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            In bảng điểm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassScorePrintModal;