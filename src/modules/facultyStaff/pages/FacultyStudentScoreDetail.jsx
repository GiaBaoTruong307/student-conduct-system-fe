import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { classMembers } from "../../classLeader/constants/classMembers";
import { useScoreContext } from "../../../context/ScoreContext";
import GVCNScoreTableDesktop from "../../homeroomTeacher/components/GVCNScoreTableDesktop";
import GVCNScoreCardsMobile from "../../homeroomTeacher/components/GVCNScoreCardsMobile";
import GhiChuViewModal from "../../homeroomTeacher/components/GhiChuViewModal";
import ImageViewer from "../../classLeader/components/ImageViewer";

const ADMIN_LS_KEYS = {
  YEARS: "admin_academic_years",
  SEMESTERS: "admin_academic_semesters",
  CRITERIA: "admin_criteria_sections",
};

const GVCN_ALL_DATA_KEY = "gvcnAllData";

const readLS = (key, def) => {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : def;
  } catch {
    return def;
  }
};

const transformToScoreData = (adminSections) =>
  [...adminSections]
    .sort((a, b) => {
      if (a.number && b.number) return a.number - b.number;
      if (a.number) return -1;
      if (b.number) return 1;
      return 0;
    })
    .map((sec) => {
      const criteria = (sec.criteria || []).map((cr, idx) => {
        const subs = cr.subCriteria || [];
        const items =
          subs.length > 0
            ? subs.map((sub) => ({
                description: sub.content,
                maxScore: sub.maxScore,
                selfScore: 0,
                reviewerScore: 0,
                proof: "Tải minh chứng lên",
                note: sub.isAutoUpdate
                  ? "Hệ thống của trường sẽ tự động cập nhật"
                  : undefined,
              }))
            : [
                {
                  description: cr.content,
                  maxScore: cr.maxScore,
                  selfScore: 0,
                  reviewerScore: 0,
                  proof: "Tải minh chứng lên",
                  note: cr.isAutoUpdate
                    ? "Hệ thống của trường sẽ tự động cập nhật"
                    : undefined,
                },
              ];
        return {
          id: String.fromCharCode(97 + idx),
          title: subs.length > 0 ? cr.content : "",
          items,
        };
      });

      const maxScore = (sec.criteria || []).reduce(
        (s, c) => s + (c.maxScore || 0),
        0
      );

      return {
        section: sec.number ? `Điều ${sec.number}. ${sec.name}` : sec.name,
        maxScore,
        selfScore: 0,
        reviewerScore: 0,
        criteria,
      };
    });

const FacultyStudentScoreDetail = () => {
  const { classId, mssv } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const yearId = searchParams.get("yearId") ?? "";
  const semId  = searchParams.get("semId")  ?? "";

  const allYears      = readLS(ADMIN_LS_KEYS.YEARS, []);
  const allSemesters  = readLS(ADMIN_LS_KEYS.SEMESTERS, {});
  const adminCriteria = readLS(ADMIN_LS_KEYS.CRITERIA, []);

  const selectedYear     = allYears.find((y) => y.id === yearId) ?? null;
  const yearSemesters    = yearId ? (allSemesters[yearId] ?? []) : [];
  const selectedSemester = yearSemesters.find((s) => s.id === semId) ?? null;

  const scoreData = transformToScoreData(adminCriteria);

  const { getStudentPeriodData, getReviewerPeriodData } = useScoreContext();

  const member = classMembers.find((m) => m.mssv === mssv);

  const studentPeriodData = getStudentPeriodData(yearId, semId);

  const periodKey        = yearId && semId ? `${yearId}_${semId}` : null;
  const gvcnAll          = readLS(GVCN_ALL_DATA_KEY, {});
  const gvcnMemberData   = periodKey ? ((gvcnAll[periodKey] ?? {})[mssv] ?? {}) : {};
  const gvcnSavedScores  = gvcnMemberData.savedScores ?? {};
  const gvcnModifiedKeys = gvcnMemberData.modifiedKeys ?? {};

  const selfScores = member?.isLinkedToStudent ? (studentPeriodData.savedScores ?? {}) : {};
  const selfImages = member?.isLinkedToStudent ? (studentPeriodData.uploadedImages ?? {}) : {};
  const selfTotal  = member?.isLinkedToStudent ? (studentPeriodData.total ?? 0) : 0;

  const getBcsNote = (itemKey) => {
    const periodData = getReviewerPeriodData(yearId, semId);
    const data = periodData[mssv];
    if (!data) return "";
    return data.notes?.[itemKey] || "";
  };

  const getItemKey = (sectionIdx, criterionIdx, itemIdx) =>
    `${sectionIdx}-${criterionIdx}-${itemIdx}`;

  // Ưu tiên điểm GVCN đã lưu, fallback về điểm SV (giống hook view mode)
  const getGvcnDisplayScore = (itemKey) => {
    if (gvcnSavedScores[itemKey] !== undefined) return gvcnSavedScores[itemKey];
    return selfScores[itemKey] !== undefined ? selfScores[itemKey] : "";
  };

  // true nếu GVCN đã chủ động sửa tiêu chí này
  const isGvcnModified = (itemKey) => !!gvcnModifiedKeys[itemKey];

  const calculateGvcnSectionScore = (sectionIdx) => {
    const section = scoreData[sectionIdx];
    if (!section) return 0;
    let total = 0;
    section.criteria.forEach((criterion, ci) => {
      criterion.items.forEach((item, ii) => {
        if (item.note) return;
        const key = getItemKey(sectionIdx, ci, ii);
        // Ưu tiên GVCN saved, fallback SV
        const score =
          gvcnSavedScores[key] !== undefined
            ? gvcnSavedScores[key]
            : selfScores[key];
        if (score !== undefined && score !== "") total += Number(score);
      });
    });
    return total;
  };

  const gvcnTotals = scoreData.reduce(
    (acc, section, sectionIdx) => {
      section.criteria.forEach((criterion, ci) => {
        criterion.items.forEach((item, ii) => {
          acc.max += Number(item.maxScore || 0);
          if (item.note) return;
          const key = getItemKey(sectionIdx, ci, ii);
          const s =
            gvcnSavedScores[key] !== undefined
              ? gvcnSavedScores[key]
              : selfScores[key];
          if (s !== undefined && s !== "" && s !== null) acc.gvcn += Number(s);
        });
      });
      return acc;
    },
    { max: 0, gvcn: 0 }
  );

  const [noteModalKey, setNoteModalKey] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);

  const goBack = () =>
    navigate(
      `/faculty-staff/bang-diem-khoa/${classId}?yearId=${yearId}&semId=${semId}`
    );

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-4">
        <p className="text-gray-500">Không tìm thấy sinh viên.</p>
        <button
          onClick={goBack}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer text-sm"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {member.ten.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-gray-800 text-base md:text-lg">
                {member.ho} {member.ten}
              </div>
              <div className="text-sm text-gray-500">
                MSSV: {member.mssv} · Ngày sinh: {member.ngaySinh}
              </div>
              {(selectedSemester || selectedYear) && (
                <div className="text-xs text-emerald-700 font-medium mt-0.5">
                  {selectedSemester?.name && `${selectedSemester.name} · `}
                  {selectedYear?.name && `Năm học ${selectedYear.name}`}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={goBack}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm"
          >
            ← Quay lại
          </button>
        </div>
      </div>

      {/* Bảng điểm Desktop */}
      <GVCNScoreTableDesktop
        scoreData={scoreData}
        selfScores={selfScores}
        uploadedImages={selfImages}
        isEditing={false}
        isGvcnModified={isGvcnModified}
        getItemKey={getItemKey}
        calculateGvcnSectionScore={calculateGvcnSectionScore}
        getGvcnDisplayScore={getGvcnDisplayScore}
        handleGvcnScoreChange={() => {}}
        handleImageClick={(img) => setViewingImage(img)}
        getBcsNote={getBcsNote}
        openBcsNoteModal={(key) => setNoteModalKey(key)}
        selfTotal={selfTotal}
        gvcnTotals={gvcnTotals}
      />

      {/* Bảng điểm Mobile */}
      <GVCNScoreCardsMobile
        scoreData={scoreData}
        selfScores={selfScores}
        uploadedImages={selfImages}
        isEditing={false}
        isGvcnModified={isGvcnModified}
        getItemKey={getItemKey}
        calculateGvcnSectionScore={calculateGvcnSectionScore}
        getGvcnDisplayScore={getGvcnDisplayScore}
        handleGvcnScoreChange={() => {}}
        handleImageClick={(img) => setViewingImage(img)}
        getBcsNote={getBcsNote}
        openBcsNoteModal={(key) => setNoteModalKey(key)}
        selfTotal={selfTotal}
        gvcnTotals={gvcnTotals}
      />

      {/* Button dưới cùng */}
      <div className="flex justify-end">
        <button
          onClick={goBack}
          className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm"
        >
          ← Quay lại
        </button>
      </div>

      <ImageViewer
        imageUrl={viewingImage}
        onClose={() => setViewingImage(null)}
      />

      {noteModalKey !== null && (
        <GhiChuViewModal
          title="Ghi chú của BCS"
          text={getBcsNote(noteModalKey)}
          onClose={() => setNoteModalKey(null)}
        />
      )}
    </div>
  );
};

export default FacultyStudentScoreDetail;