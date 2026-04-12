import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { PCTSV_FACULTIES, PCTSV_CLASSES } from "../constants/studentAffairs.constants";

const ADMIN_LS_KEYS = {
    YEARS: "admin_academic_years",
    SEMESTERS: "admin_academic_semesters",
};

const CLASSIFICATION_ROWS = [
    { label: "Xuất sắc", rowBg: "bg-green-100", textCls: "text-green-800 font-semibold" },
    { label: "Tốt", rowBg: "bg-blue-100", textCls: "text-blue-700 font-semibold" },
    { label: "Khá", rowBg: "bg-yellow-100", textCls: "text-yellow-700 font-semibold" },
    { label: "Yếu", rowBg: "bg-pink-100", textCls: "text-pink-700 font-semibold" },
    { label: "Trung bình", rowBg: "bg-red-500", textCls: "text-white font-bold" },
];

const readLS = (key, def) => {
    try { const r = localStorage.getItem(key); return r !== null ? JSON.parse(r) : def; }
    catch { return def; }
};

const mockStatsForClass = (classId, yearId = "", semId = "") => {
    if (classId === "48K21.2") return { xs: 3, tot: 20, kha: 30, yeu: 7, tb: 4 };
    const seed = (classId + yearId + semId)
        .split("")
        .reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 0);
    const total = 22 + (seed % 26);
    const xs = Math.max(1, Math.round(total * (0.04 + (seed % 5) * 0.012)));
    const tot = Math.round(total * (0.26 + (seed % 7) * 0.012));
    const kha = Math.round(total * (0.38 + (seed % 6) * 0.012));
    const yeu = Math.round(total * (0.09 + (seed % 4) * 0.010));
    const tb = Math.max(0, total - xs - tot - kha - yeu);
    return { xs, tot, kha, yeu, tb };
};

const aggregateStats = (classIds, yearId, semId) =>
    classIds.reduce(
        (acc, id) => {
            const s = mockStatsForClass(id, yearId, semId);
            return { xs: acc.xs + s.xs, tot: acc.tot + s.tot, kha: acc.kha + s.kha, yeu: acc.yeu + s.yeu, tb: acc.tb + s.tb };
        },
        { xs: 0, tot: 0, kha: 0, yeu: 0, tb: 0 }
    );

// ── Xuất bảng điểm – mock data ───────────────────────────────────────────────
const MOCK_STUDENTS = [
    { mssv: "221121521254", hoTen: "Trần Mai Thu Trang", ngaySinh: "29/04/2004", lopId: "48K21.2", khoaId: "tkth" },
    { mssv: "221121521255", hoTen: "Nguyễn Văn An", ngaySinh: "15/03/2004", lopId: "48K21.2", khoaId: "tkth" },
    { mssv: "221121521256", hoTen: "Lê Thị Bình", ngaySinh: "20/07/2004", lopId: "48K21.1", khoaId: "tkth" },
    { mssv: "221121521257", hoTen: "Phạm Minh Châu", ngaySinh: "11/11/2003", lopId: "48K21.1", khoaId: "tkth" },
    { mssv: "221122143001", hoTen: "Hoàng Thị Dung", ngaySinh: "05/02/2004", lopId: "21K21.1", khoaId: "qtkd" },
    { mssv: "221122143002", hoTen: "Đặng Quốc Hưng", ngaySinh: "28/09/2003", lopId: "21K21.2", khoaId: "qtkd" },
    { mssv: "221123214001", hoTen: "Võ Thị Kim Linh", ngaySinh: "03/06/2004", lopId: "22K14.1", khoaId: "cntt" },
    { mssv: "221123214002", hoTen: "Trương Văn Minh", ngaySinh: "17/08/2003", lopId: "22K14.2", khoaId: "cntt" },
    { mssv: "221124512001", hoTen: "Bùi Thị Ngọc", ngaySinh: "22/01/2004", lopId: "32K14.1", khoaId: "tcnh" },
    { mssv: "221124512002", hoTen: "Phan Hoàng Phúc", ngaySinh: "09/12/2003", lopId: "32K14.2", khoaId: "tcnh" },
];

const ALL_SEM_ROWS = [
    { yearId: "2022-2023", semId: "ky1", label: "Kỳ I năm học 2022 - 2023" },
    { yearId: "2022-2023", semId: "ky2", label: "Kỳ II năm học 2022 - 2023" },
    { yearId: "2023-2024", semId: "ky1", label: "Kỳ I năm học 2023 - 2024" },
    { yearId: "2023-2024", semId: "ky2", label: "Kỳ II năm học 2023 - 2024" },
    { yearId: "2024-2025", semId: "ky1", label: "Kỳ I năm học 2024 - 2025" },
    { yearId: "2024-2025", semId: "ky2", label: "Kỳ II năm học 2024 - 2025" },
    { yearId: "2025-2026", semId: "ky1", label: "Kỳ I năm học 2025 - 2026" },
    { yearId: "2025-2026", semId: "ky2", label: "Kỳ II năm học 2025 - 2026" },
];

const getClassification = (score) => {
    if (score >= 90) return "Xuất sắc";
    if (score >= 80) return "Tốt";
    if (score >= 65) return "Khá";
    if (score >= 50) return "Trung bình";
    return "Yếu";
};

const mockStudentScores = (mssv) => {
    const seed = mssv.split("").reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 0);
    return ALL_SEM_ROWS.map((sem, i) => {
        const score = 65 + ((seed * (i + 3) + i * 7) % 28);
        return { ...sem, diem: score, xepLoai: getClassification(score) };
    });
};

// ── SVG Icons ────────────────────────────────────────────────────────────────
const IconTyLe = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const IconSoSanh = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18" />
    </svg>
);

const IconXuat = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 10h18M3 14h18M3 6h18M3 18h18" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 3v6m0 0l-2-2m2 2l2-2" />
    </svg>
);

const TABS = [
    { id: "ty-le", label: "Báo cáo tỷ lệ", Icon: IconTyLe },
    { id: "so-sanh", label: "Báo cáo so sánh", Icon: IconSoSanh },
    { id: "xuat", label: "Xuất bảng điểm", Icon: IconXuat },
];

// ── Bar chart colors ──────────────────────────────────────────────────────────
const C1 = "#2d6a4f";
const C2 = "#F97316";

// ── SoSanhBarChart ────────────────────────────────────────────────────────────
const SoSanhBarChart = ({ chartData, label1, label2 }) => {
    const [tooltip, setTooltip] = useState(null);

    const SVG_W = 700;
    const SVG_H = 310;
    const ML = 56, MR = 24, MT = 14, MB = 56;
    const cW = SVG_W - ML - MR;
    const cH = SVG_H - MT - MB;

    const maxVal = Math.max(1, ...chartData.flatMap((d) => [d.val1, d.val2]));
    const niceMax =
        maxVal <= 5 ? 5 :
            maxVal <= 10 ? 10 :
                maxVal <= 15 ? 15 :
                    maxVal <= 20 ? 20 :
                        maxVal <= 25 ? 25 :
                            maxVal <= 30 ? 30 :
                                maxVal <= 35 ? 35 :
                                    Math.ceil(maxVal / 10) * 10;

    const tickStep = niceMax / 7;
    const yTicks = Array.from({ length: 8 }, (_, i) => Math.round(tickStep * i));

    const groupW = cW / chartData.length;
    const barW = Math.max(20, Math.min(38, (groupW - 18) / 2));
    const gap = 6;
    const blockW = barW * 2 + gap;
    const gPad = (groupW - blockW) / 2;

    const yPos = (val) => MT + cH * (1 - val / niceMax);
    const barHt = (val) => Math.max(0, cH * (val / niceMax));

    return (
        <div className="select-none">
            <div className="text-center mb-3">
                <p className="font-bold text-[15px] text-gray-800">Biểu đồ so sánh số lượng</p>
                <p className="text-xs text-gray-500 italic mt-0.5">Điểm rèn luyện 2 lớp theo xếp loại</p>
            </div>

            <div className="flex justify-end items-center gap-5 pr-4 mb-2">
                <div className="flex items-center gap-1.5">
                    <span className="inline-block w-3.5 h-3.5 rounded-sm" style={{ background: C1 }} />
                    <span className="text-xs font-medium text-gray-700">{label1}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="inline-block w-3.5 h-3.5 rounded-sm" style={{ background: C2 }} />
                    <span className="text-xs font-medium text-gray-700">{label2}</span>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <div
                    className="flex-shrink-0 text-[11px] text-gray-500 whitespace-nowrap"
                    style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", height: SVG_H }}
                >
                    Số lượng sinh viên
                </div>

                <svg
                    viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                    className="w-full overflow-visible"
                    style={{ height: 280 }}
                    onMouseLeave={() => setTooltip(null)}
                >
                    {yTicks.map((tick) => {
                        const yy = yPos(tick);
                        return (
                            <g key={tick}>
                                <line
                                    x1={ML} y1={yy} x2={ML + cW} y2={yy}
                                    stroke={tick === 0 ? "#9ca3af" : "#e5e7eb"}
                                    strokeWidth={tick === 0 ? 1.5 : 1}
                                    strokeDasharray={tick === 0 ? undefined : "3,3"}
                                />
                                <text x={ML - 6} y={yy + 4} textAnchor="end" fontSize={11} fill="#6b7280">
                                    {tick}
                                </text>
                            </g>
                        );
                    })}

                    <line x1={ML} y1={MT} x2={ML} y2={MT + cH} stroke="#9ca3af" strokeWidth={1.5} />

                    {chartData.map((d, gi) => {
                        const gx = ML + gi * groupW;
                        const x1 = gx + gPad;
                        const x2 = x1 + barW + gap;
                        const y1 = yPos(d.val1);
                        const y2 = yPos(d.val2);
                        const h1 = barHt(d.val1);
                        const h2 = barHt(d.val2);
                        return (
                            <g key={d.label}>
                                <rect
                                    x={x1} y={y1} width={barW} height={h1}
                                    fill={C1} rx={2} ry={2}
                                    style={{ cursor: "pointer" }}
                                    onMouseEnter={() =>
                                        setTooltip({ x: x1 + barW / 2, y: y1, val: d.val1, pct: d.pct1, cls: label1 })
                                    }
                                />
                                <rect
                                    x={x2} y={y2} width={barW} height={h2}
                                    fill={C2} rx={2} ry={2}
                                    style={{ cursor: "pointer" }}
                                    onMouseEnter={() =>
                                        setTooltip({ x: x2 + barW / 2, y: y2, val: d.val2, pct: d.pct2, cls: label2 })
                                    }
                                />
                                <text
                                    x={gx + groupW / 2}
                                    y={MT + cH + 20}
                                    textAnchor="middle"
                                    fontSize={12}
                                    fill="#374151"
                                >
                                    {d.label}
                                </text>
                            </g>
                        );
                    })}

                    {tooltip && (() => {
                        const TW = 136, TH = 50;
                        let tx = tooltip.x - TW / 2;
                        let ty = tooltip.y - TH - 10;
                        if (tx < ML) tx = ML;
                        if (tx + TW > ML + cW) tx = ML + cW - TW;
                        if (ty < 0) ty = tooltip.y + 12;
                        return (
                            <g>
                                <rect x={tx} y={ty} width={TW} height={TH} fill="rgba(17,24,39,0.82)" rx={6} />
                                <text
                                    x={tx + TW / 2} y={ty + 17}
                                    textAnchor="middle" fontSize={11} fill="white" fontWeight="bold"
                                >
                                    {tooltip.cls}
                                </text>
                                <text
                                    x={tx + TW / 2} y={ty + 36}
                                    textAnchor="middle" fontSize={12} fill="white"
                                >
                                    {tooltip.val} SV · {tooltip.pct}
                                </text>
                            </g>
                        );
                    })()}
                </svg>
            </div>

            <div className="text-center text-[11px] text-gray-500 mt-1">Xếp loại điểm</div>
        </div>
    );
};

// ── Shared select CSS ─────────────────────────────────────────────────────────
const SEL = "px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-default";

// ── Main Component ────────────────────────────────────────────────────────────
const PctsvBaoCaoTyLe = () => {
    const allYears = readLS(ADMIN_LS_KEYS.YEARS, []);
    const allSemesters = readLS(ADMIN_LS_KEYS.SEMESTERS, {});

    const [activeTab, setActiveTab] = useState("ty-le");

    // ── Tỷ lệ filter ─────────────────────────────────────────────────────────
    const [formNamHoc, setFormNamHoc] = useState("");
    const [formHocKy, setFormHocKy] = useState("");
    const [formKhoaId, setFormKhoaId] = useState("");
    const [formKhoaPrefix, setFormKhoaPrefix] = useState("");
    const [formLopId, setFormLopId] = useState("");
    const [formGvcn, setFormGvcn] = useState("");
    const [applied, setApplied] = useState(null);

    // ── So sánh filter – form 1 ───────────────────────────────────────────────
    const [ss1NamHoc, setSs1NamHoc] = useState("");
    const [ss1HocKy, setSs1HocKy] = useState("");
    const [ss1KhoaId, setSs1KhoaId] = useState("");
    const [ss1KhoaPrefix, setSs1KhoaPrefix] = useState("");
    const [ss1LopId, setSs1LopId] = useState("");
    const [ss1Gvcn, setSs1Gvcn] = useState("");

    // ── So sánh filter – form 2 ───────────────────────────────────────────────
    const [ss2NamHoc, setSs2NamHoc] = useState("");
    const [ss2HocKy, setSs2HocKy] = useState("");
    const [ss2KhoaId, setSs2KhoaId] = useState("");
    const [ss2KhoaPrefix, setSs2KhoaPrefix] = useState("");
    const [ss2LopId, setSs2LopId] = useState("");
    const [ss2Gvcn, setSs2Gvcn] = useState("");

    const [ssApplied, setSsApplied] = useState(null);

    // ── Xuất bảng điểm ───────────────────────────────────────────────────────
    const [xuatQuery, setXuatQuery] = useState("");
    const [xuatDropOpen, setXuatDropOpen] = useState(false);
    const [xuatStudent, setXuatStudent] = useState(null);
    const [xuatNamHoc, setXuatNamHoc] = useState("");
    const [xuatHocKy, setXuatHocKy] = useState("");
    const [xuatTatCa, setXuatTatCa] = useState(false);
    const [xuatResult, setXuatResult] = useState(null);
    const [showPrintConfirm, setShowPrintConfirm] = useState(false);
    const [showPrintSuccess, setShowPrintSuccess] = useState(false);

    const xuatDropRef = useRef(null);

    useEffect(() => {
        const handle = (e) => {
            if (xuatDropRef.current && !xuatDropRef.current.contains(e.target)) {
                setXuatDropOpen(false);
            }
        };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, []);

    // ── Tỷ lệ – derived ───────────────────────────────────────────────────────
    const hocKyOptions = useMemo(
        () => (formNamHoc ? allSemesters[formNamHoc] ?? [] : []),
        [formNamHoc, allSemesters]
    );
    const khoaPrefixOptions = useMemo(() => {
        if (!formKhoaId) return [];
        return [...new Set(PCTSV_CLASSES.filter((c) => c.khoaId === formKhoaId).map((c) => c.khoaPrefix))].sort();
    }, [formKhoaId]);
    const lopOptions = useMemo(() => {
        let l = PCTSV_CLASSES;
        if (formKhoaId) l = l.filter((c) => c.khoaId === formKhoaId);
        if (formKhoaPrefix) l = l.filter((c) => c.khoaPrefix === formKhoaPrefix);
        return l;
    }, [formKhoaId, formKhoaPrefix]);
    const gvcnOptions = useMemo(() => {
        const src = formLopId ? PCTSV_CLASSES.filter((c) => c.id === formLopId) : lopOptions;
        return [...new Set(src.map((c) => c.gvcn).filter(Boolean))].sort();
    }, [formLopId, lopOptions]);

    // ── So sánh – derived (form 1) ────────────────────────────────────────────
    const ss1HocKyOpts = useMemo(
        () => (ss1NamHoc ? allSemesters[ss1NamHoc] ?? [] : []),
        [ss1NamHoc, allSemesters]
    );
    const ss1KhoaPrefixOpts = useMemo(() => {
        if (!ss1KhoaId) return [];
        return [...new Set(PCTSV_CLASSES.filter((c) => c.khoaId === ss1KhoaId).map((c) => c.khoaPrefix))].sort();
    }, [ss1KhoaId]);
    const ss1LopList = useMemo(() => {
        let l = PCTSV_CLASSES;
        if (ss1KhoaId) l = l.filter((c) => c.khoaId === ss1KhoaId);
        if (ss1KhoaPrefix) l = l.filter((c) => c.khoaPrefix === ss1KhoaPrefix);
        return l;
    }, [ss1KhoaId, ss1KhoaPrefix]);
    const ss1GvcnOpts = useMemo(() => {
        const src = ss1LopId ? PCTSV_CLASSES.filter((c) => c.id === ss1LopId) : ss1LopList;
        return [...new Set(src.map((c) => c.gvcn).filter(Boolean))].sort();
    }, [ss1LopId, ss1LopList]);

    // ── So sánh – derived (form 2) ────────────────────────────────────────────
    const ss2HocKyOpts = useMemo(
        () => (ss2NamHoc ? allSemesters[ss2NamHoc] ?? [] : []),
        [ss2NamHoc, allSemesters]
    );
    const ss2KhoaPrefixOpts = useMemo(() => {
        if (!ss2KhoaId) return [];
        return [...new Set(PCTSV_CLASSES.filter((c) => c.khoaId === ss2KhoaId).map((c) => c.khoaPrefix))].sort();
    }, [ss2KhoaId]);
    const ss2LopList = useMemo(() => {
        let l = PCTSV_CLASSES;
        if (ss2KhoaId) l = l.filter((c) => c.khoaId === ss2KhoaId);
        if (ss2KhoaPrefix) l = l.filter((c) => c.khoaPrefix === ss2KhoaPrefix);
        return l;
    }, [ss2KhoaId, ss2KhoaPrefix]);
    const ss2GvcnOpts = useMemo(() => {
        const src = ss2LopId ? PCTSV_CLASSES.filter((c) => c.id === ss2LopId) : ss2LopList;
        return [...new Set(src.map((c) => c.gvcn).filter(Boolean))].sort();
    }, [ss2LopId, ss2LopList]);

    // ── Xuất – derived ────────────────────────────────────────────────────────
    const filteredStudents = useMemo(() => {
        const q = xuatQuery.trim().toLowerCase();
        if (!q) return MOCK_STUDENTS;
        return MOCK_STUDENTS.filter(
            (s) => s.mssv.includes(q) || s.hoTen.toLowerCase().includes(q)
        );
    }, [xuatQuery]);

    const xuatHocKyOpts = useMemo(
        () => (xuatNamHoc ? allSemesters[xuatNamHoc] ?? [] : []),
        [xuatNamHoc, allSemesters]
    );

    // ── Tỷ lệ handlers ────────────────────────────────────────────────────────
    const handleNamHocChange = (v) => { setFormNamHoc(v); setFormHocKy(""); };
    const handleKhoaChange = (v) => { setFormKhoaId(v); setFormKhoaPrefix(""); setFormLopId(""); setFormGvcn(""); };
    const handleKhoaPrefixChange = (v) => { setFormKhoaPrefix(v); setFormLopId(""); setFormGvcn(""); };
    const handleLopChange = (v) => {
        setFormLopId(v);
        setFormGvcn(v ? (PCTSV_CLASSES.find((c) => c.id === v)?.gvcn ?? "") : "");
    };
    const handleLoc = () => {
        let classes = PCTSV_CLASSES;
        if (formKhoaId) classes = classes.filter((c) => c.khoaId === formKhoaId);
        if (formKhoaPrefix) classes = classes.filter((c) => c.khoaPrefix === formKhoaPrefix);
        if (formLopId) classes = classes.filter((c) => c.id === formLopId);
        if (formGvcn) classes = classes.filter((c) => c.gvcn === formGvcn);
        const yearObj = allYears.find((y) => y.id === formNamHoc);
        const semObj = hocKyOptions.find((s) => s.id === formHocKy);
        setApplied({
            hocKy: semObj?.name ?? formHocKy,
            hocKyId: formHocKy,
            namHoc: yearObj?.name ?? formNamHoc,
            namHocId: formNamHoc,
            classIds: classes.map((c) => c.id),
        });
    };

    // ── So sánh handlers ──────────────────────────────────────────────────────
    const handleSs1KhoaChange = (v) => { setSs1KhoaId(v); setSs1KhoaPrefix(""); setSs1LopId(""); setSs1Gvcn(""); };
    const handleSs1KhoaPrefixChange = (v) => { setSs1KhoaPrefix(v); setSs1LopId(""); setSs1Gvcn(""); };
    const handleSs1LopChange = (v) => {
        setSs1LopId(v);
        setSs1Gvcn(v ? (PCTSV_CLASSES.find((c) => c.id === v)?.gvcn ?? "") : "");
    };

    const handleSs2KhoaChange = (v) => { setSs2KhoaId(v); setSs2KhoaPrefix(""); setSs2LopId(""); setSs2Gvcn(""); };
    const handleSs2KhoaPrefixChange = (v) => { setSs2KhoaPrefix(v); setSs2LopId(""); setSs2Gvcn(""); };
    const handleSs2LopChange = (v) => {
        setSs2LopId(v);
        setSs2Gvcn(v ? (PCTSV_CLASSES.find((c) => c.id === v)?.gvcn ?? "") : "");
    };

    const handleSsLoc = () => {
        const cls1 = ss1LopId
            ? PCTSV_CLASSES.find((c) => c.id === ss1LopId)
            : ss1LopList[0];
        const cls2 = ss2LopId
            ? PCTSV_CLASSES.find((c) => c.id === ss2LopId)
            : ss2LopList[0];
        if (!cls1 || !cls2) return;
        setSsApplied({
            cls1: { id: cls1.id, name: cls1.tenLop, namHocId: ss1NamHoc, hocKyId: ss1HocKy },
            cls2: { id: cls2.id, name: cls2.tenLop, namHocId: ss2NamHoc, hocKyId: ss2HocKy },
        });
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setApplied(null);
        setSsApplied(null);
        setXuatResult(null);
    };

    // ── Xuất handlers ────────────────────────────────────────────────────────
    const handleXuatSelectStudent = (student) => {
        setXuatStudent(student);
        setXuatQuery(`${student.mssv} - ${student.hoTen}`);
        setXuatDropOpen(false);
    };

    const handleXuatNamHocChange = (v) => {
        setXuatNamHoc(v);
        setXuatHocKy("");
    };

    const handleXuatTatCaChange = (checked) => {
        setXuatTatCa(checked);
        if (checked) {
            setXuatNamHoc("");
            setXuatHocKy("");
        }
    };

    const handleXuatLoc = () => {
        if (!xuatStudent) return;
        const allScores = mockStudentScores(xuatStudent.mssv);
        const rows = xuatTatCa
            ? allScores
            : allScores.filter(
                (r) =>
                    (!xuatNamHoc || r.yearId === xuatNamHoc) &&
                    (!xuatHocKy || r.semId === xuatHocKy)
            );
        const avg = rows.length
            ? (rows.reduce((a, r) => a + r.diem, 0) / rows.length).toFixed(1)
            : "0";
        const avgCls = getClassification(parseFloat(avg));
        const khoaName = PCTSV_FACULTIES.find((f) => f.id === xuatStudent.khoaId)?.name ?? "";
        setXuatResult({ student: xuatStudent, rows, avg, avgCls, khoaName });
    };

    const handlePrintConfirm = () => {
        setShowPrintConfirm(false);
        setShowPrintSuccess(true);
        setTimeout(() => setShowPrintSuccess(false), 3000);
    };

    // ── Tỷ lệ computed ────────────────────────────────────────────────────────
    const resultStats = useMemo(() => {
        if (!applied) return null;
        if (applied.classIds.length === 0) return { xs: 0, tot: 0, kha: 0, yeu: 0, tb: 0 };
        return aggregateStats(applied.classIds, applied.namHocId, applied.hocKyId);
    }, [applied]);

    const statsArray = resultStats
        ? [resultStats.xs, resultStats.tot, resultStats.kha, resultStats.yeu, resultStats.tb]
        : [];
    const total = statsArray.reduce((a, n) => a + n, 0);
    const pct = (n) => (total > 0 ? ((n / total) * 100).toFixed(1) + "%" : "0%");

    // ── So sánh computed chart data ───────────────────────────────────────────
    const ssChartData = useMemo(() => {
        if (!ssApplied) return null;
        const s1 = mockStatsForClass(ssApplied.cls1.id, ssApplied.cls1.namHocId, ssApplied.cls1.hocKyId);
        const s2 = mockStatsForClass(ssApplied.cls2.id, ssApplied.cls2.namHocId, ssApplied.cls2.hocKyId);
        const t1 = s1.xs + s1.tot + s1.kha + s1.yeu + s1.tb;
        const t2 = s2.xs + s2.tot + s2.kha + s2.yeu + s2.tb;
        const p = (n, t) => (t > 0 ? ((n / t) * 100).toFixed(1) + "%" : "0%");
        return [
            { label: "Xuất sắc", val1: s1.xs, val2: s2.xs, pct1: p(s1.xs, t1), pct2: p(s2.xs, t2) },
            { label: "Tốt", val1: s1.tot, val2: s2.tot, pct1: p(s1.tot, t1), pct2: p(s2.tot, t2) },
            { label: "Khá", val1: s1.kha, val2: s2.kha, pct1: p(s1.kha, t1), pct2: p(s2.kha, t2) },
            { label: "Yếu", val1: s1.yeu, val2: s2.yeu, pct1: p(s1.yeu, t1), pct2: p(s2.yeu, t2) },
            { label: "Trung bình", val1: s1.tb, val2: s2.tb, pct1: p(s1.tb, t1), pct2: p(s2.tb, t2) },
        ];
    }, [ssApplied]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            {/* Print confirm modal – portal to body to avoid overflow clipping */}
            {showPrintConfirm && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-80 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#3d2f6b]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-[#3d2f6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v7H6z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Xác nhận in bảng điểm</p>
                                <p className="text-sm text-gray-500">Bạn có chắc muốn in bảng điểm này?</p>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => setShowPrintConfirm(false)}
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handlePrintConfirm}
                                className="flex-1 px-4 py-2 rounded-lg bg-[#3d2f6b] text-white text-sm font-semibold hover:bg-[#4c3d84] transition-colors cursor-pointer"
                            >
                                In ngay
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Print success toast – portal to body */}
            {showPrintSuccess && createPortal(
                <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">In bảng điểm thành công!</span>
                </div>,
                document.body
            )}

            <div className="flex gap-4 md:gap-6 items-start">

                {/* Sidebar */}
                <div className="w-48 md:w-52 flex-shrink-0">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {TABS.map((tab) => {
                            const active = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold transition-all cursor-pointer border-b border-gray-100 last:border-b-0
                    ${active
                                            ? "border-l-[3px] border-l-orange-400 bg-orange-50 text-orange-500"
                                            : "border-l-[3px] border-l-transparent text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <tab.Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-orange-400" : "text-gray-400"}`} />
                                    <span className="text-left leading-tight">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0 space-y-4">

                    {/* ── Xuất bảng điểm ── */}
                    {activeTab === "xuat" && (
                        <>
                            {/* Filter bar */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex flex-wrap items-end gap-4">

                                    {/* MSSV combobox */}
                                    <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
                                        <label className="text-xs font-medium text-gray-500">Mã số sinh viên cần tra cứu điểm</label>
                                        <div className="relative" ref={xuatDropRef}>
                                            <input
                                                type="text"
                                                value={xuatQuery}
                                                placeholder="Nhập MSSV hoặc họ tên..."
                                                onChange={(e) => {
                                                    setXuatQuery(e.target.value);
                                                    setXuatStudent(null);
                                                    setXuatDropOpen(true);
                                                }}
                                                onFocus={() => setXuatDropOpen(true)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3d2f6b]"
                                            />
                                            {xuatDropOpen && (
                                                <div className="absolute z-30 mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                                                    {filteredStudents.length === 0 ? (
                                                        <div className="px-3 py-3 text-sm text-gray-400 text-center">Không tìm thấy sinh viên</div>
                                                    ) : (
                                                        filteredStudents.map((s) => (
                                                            <button
                                                                key={s.mssv}
                                                                onMouseDown={() => handleXuatSelectStudent(s)}
                                                                className="w-full text-left px-3 py-2.5 text-sm hover:bg-[#3d2f6b]/5 flex flex-col cursor-pointer border-b border-gray-100 last:border-b-0"
                                                            >
                                                                <span className="font-medium text-gray-800">{s.mssv}</span>
                                                                <span className="text-xs text-gray-500">{s.hoTen}</span>
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Năm học */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-medium text-gray-500">Năm học cần tra cứu điểm</label>
                                        <select
                                            value={xuatNamHoc}
                                            onChange={(e) => handleXuatNamHocChange(e.target.value)}
                                            disabled={xuatTatCa}
                                            className={SEL}
                                        >
                                            <option value="">Năm học</option>
                                            {allYears.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
                                        </select>
                                    </div>

                                    {/* Học kỳ */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-medium text-gray-500">Học kỳ cần tra cứu điểm</label>
                                        <select
                                            value={xuatHocKy}
                                            onChange={(e) => setXuatHocKy(e.target.value)}
                                            disabled={!xuatNamHoc || xuatTatCa}
                                            className={SEL}
                                        >
                                            <option value="">Học kỳ</option>
                                            {xuatHocKyOpts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>

                                    {/* Tất cả + print + back + Lọc */}
                                    <div className="flex items-center gap-2 pb-0.5">
                                        <div className="flex flex-col items-center gap-1">
                                            <label className="text-xs font-medium text-gray-500">Tất cả</label>
                                            <input
                                                type="checkbox"
                                                checked={xuatTatCa}
                                                onChange={(e) => handleXuatTatCaChange(e.target.checked)}
                                                className="w-5 h-5 cursor-pointer accent-[#3d2f6b]"
                                            />
                                        </div>

                                        {xuatResult && (
                                            <>
                                                <button
                                                    onClick={() => setShowPrintConfirm(true)}
                                                    title="In bảng điểm"
                                                    className="p-2 text-[#3d2f6b] hover:bg-[#3d2f6b]/10 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v7H6z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setXuatResult(null)}
                                                    title="Quay lại"
                                                    className="p-2 text-[#3d2f6b] hover:bg-[#3d2f6b]/10 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                                    </svg>
                                                </button>
                                            </>
                                        )}

                                        <button
                                            onClick={handleXuatLoc}
                                            disabled={!xuatStudent}
                                            className="px-6 py-2 bg-[#3d2f6b] hover:bg-[#4c3d84] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                                        >
                                            Lọc
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Result */}
                            {xuatResult ? (
                                xuatResult.rows.length === 0 ? (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10 text-center">
                                        <p className="text-gray-500 text-sm">Không tìm thấy dữ liệu điểm phù hợp với bộ lọc đã chọn.</p>
                                    </div>
                                ) : (
                                    <div
                                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto"
                                        style={{ fontFamily: "'Times New Roman', Times, serif" }}
                                    >
                                        {/* Header */}
                                        <div className="flex justify-between text-[13px] mb-5">
                                            <div className="text-center leading-5">
                                                <p className="font-bold">ĐẠI HỌC ĐÀ NẴNG</p>
                                                <p className="font-bold underline">TRƯỜNG ĐẠI HỌC KINH TẾ</p>
                                            </div>
                                            <div className="text-center leading-5">
                                                <p className="font-bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                                                <p className="font-bold">Độc lập – Tự do – Hạnh phúc</p>
                                                <p className="text-center">───────────</p>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-center font-bold text-[15px] uppercase mb-5 tracking-wide">
                                            KẾT QUẢ RÈN LUYỆN CỦA SINH VIÊN
                                        </h2>

                                        {/* Student info */}
                                        <div className="text-[13px] mb-5 space-y-1">
                                            <div className="flex gap-10">
                                                <span>Họ và tên: <strong>{xuatResult.student.hoTen}</strong></span>
                                                <span>Lớp: <strong>{xuatResult.student.lopId}</strong></span>
                                            </div>
                                            <div className="flex gap-10">
                                                <span>Ngày sinh: <strong>{xuatResult.student.ngaySinh}</strong></span>
                                                <span>Khoa: <strong>{xuatResult.khoaName}</strong></span>
                                            </div>
                                        </div>

                                        {/* Score table */}
                                        <table className="w-full text-[13px] border-collapse mb-8">
                                            <thead>
                                                <tr>
                                                    <th className="border border-gray-500 px-3 py-2 text-center font-semibold bg-gray-50 w-10">TT</th>
                                                    <th className="border border-gray-500 px-3 py-2 text-center font-semibold bg-gray-50">Học kỳ</th>
                                                    <th className="border border-gray-500 px-3 py-2 text-center font-semibold bg-gray-50 w-16">Điểm</th>
                                                    <th className="border border-gray-500 px-3 py-2 text-center font-semibold bg-gray-50 w-24">Xếp loại</th>
                                                    <th className="border border-gray-500 px-3 py-2 text-center font-semibold bg-gray-50 w-24">Ghi chú</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {xuatResult.rows.map((row, i) => (
                                                    <tr key={`${row.yearId}-${row.semId}`}>
                                                        <td className="border border-gray-500 px-3 py-2 text-center">{i + 1}</td>
                                                        <td className="border border-gray-500 px-3 py-2">{row.label}</td>
                                                        <td className="border border-gray-500 px-3 py-2 text-center">{row.diem}</td>
                                                        <td className="border border-gray-500 px-3 py-2 text-center">{row.xepLoai}</td>
                                                        <td className="border border-gray-500 px-3 py-2"></td>
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <td className="border border-gray-500 px-3 py-2"></td>
                                                    <td className="border border-gray-500 px-3 py-2 font-bold">Điểm trung bình</td>
                                                    <td className="border border-gray-500 px-3 py-2 text-center font-bold">{xuatResult.avg}</td>
                                                    <td className="border border-gray-500 px-3 py-2 text-center font-bold">{xuatResult.avgCls}</td>
                                                    <td className="border border-gray-500 px-3 py-2"></td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Date & authority */}
                                        <div className="flex justify-end text-[13px] mb-10">
                                            <div className="text-center leading-5">
                                                <p className="italic">Đà Nẵng, ngày 10 tháng 03 năm 2026</p>
                                                <p className="font-bold mt-1">TL. HIỆU TRƯỞNG</p>
                                                <p className="font-bold">KT. TRƯỞNG PHÒNG CÔNG TÁC SINH VIÊN,</p>
                                                <p className="font-bold">QUAN HỆ DOANH NGHIỆP VÀ TRUYỀN THÔNG</p>
                                                <p className="font-bold">PHÓ TRƯỞNG PHÒNG</p>
                                            </div>
                                        </div>

                                        {/* Signatures */}
                                        <div className="flex justify-between text-[13px]">
                                            <div>
                                                <p className="font-bold">NGƯỜI LẬP BẢNG</p>
                                                <p className="mt-14">Nguyễn Lê Duy</p>
                                            </div>
                                            <div className="text-center mr-8">
                                                <p className="mt-14">Lê Thị Thu Hiền</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-semibold text-gray-700">Chưa có dữ liệu bảng điểm</h3>
                                            <p className="text-sm text-gray-500">
                                                Vui lòng nhập MSSV, chọn năm học / học kỳ và nhấn{" "}
                                                <span className="font-semibold text-[#3d2f6b]">Lọc</span>{" "}
                                                để xem kết quả.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── Báo cáo so sánh ── */}
                    {activeTab === "so-sanh" && (
                        <>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 space-y-5">
                                <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-2">
                                        <span className="text-red-500 mr-1">*</span>Chọn thông tin lớp thứ 1:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <select value={ss1NamHoc} onChange={(e) => { setSs1NamHoc(e.target.value); setSs1HocKy(""); }} className={SEL}>
                                            <option value="">Năm học</option>
                                            {allYears.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
                                        </select>
                                        <select value={ss1HocKy} onChange={(e) => setSs1HocKy(e.target.value)} disabled={!ss1NamHoc} className={SEL}>
                                            <option value="">Học kỳ</option>
                                            {ss1HocKyOpts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                        <select value={ss1KhoaId} onChange={(e) => handleSs1KhoaChange(e.target.value)} className={SEL}>
                                            <option value="">Khoa</option>
                                            {PCTSV_FACULTIES.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                                        </select>
                                        <select value={ss1KhoaPrefix} onChange={(e) => handleSs1KhoaPrefixChange(e.target.value)} disabled={!ss1KhoaId} className={SEL}>
                                            <option value="">Khóa</option>
                                            {ss1KhoaPrefixOpts.map((p) => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                        <select value={ss1LopId} onChange={(e) => handleSs1LopChange(e.target.value)} className={SEL}>
                                            <option value="">Lớp học</option>
                                            {ss1LopList.map((c) => <option key={c.id} value={c.id}>{c.tenLop}</option>)}
                                        </select>
                                        <select value={ss1Gvcn} onChange={(e) => setSs1Gvcn(e.target.value)} className={SEL}>
                                            <option value="">GVCN</option>
                                            {ss1GvcnOpts.map((g) => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-2">
                                        <span className="text-red-500 mr-1">*</span>Chọn thông tin lớp thứ 2:
                                    </p>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <select value={ss2NamHoc} onChange={(e) => { setSs2NamHoc(e.target.value); setSs2HocKy(""); }} className={SEL}>
                                            <option value="">Năm học</option>
                                            {allYears.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
                                        </select>
                                        <select value={ss2HocKy} onChange={(e) => setSs2HocKy(e.target.value)} disabled={!ss2NamHoc} className={SEL}>
                                            <option value="">Học kỳ</option>
                                            {ss2HocKyOpts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                        <select value={ss2KhoaId} onChange={(e) => handleSs2KhoaChange(e.target.value)} className={SEL}>
                                            <option value="">Khoa</option>
                                            {PCTSV_FACULTIES.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                                        </select>
                                        <select value={ss2KhoaPrefix} onChange={(e) => handleSs2KhoaPrefixChange(e.target.value)} disabled={!ss2KhoaId} className={SEL}>
                                            <option value="">Khóa</option>
                                            {ss2KhoaPrefixOpts.map((p) => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                        <select value={ss2LopId} onChange={(e) => handleSs2LopChange(e.target.value)} className={SEL}>
                                            <option value="">Lớp học</option>
                                            {ss2LopList.map((c) => <option key={c.id} value={c.id}>{c.tenLop}</option>)}
                                        </select>
                                        <select value={ss2Gvcn} onChange={(e) => setSs2Gvcn(e.target.value)} className={SEL}>
                                            <option value="">GVCN</option>
                                            {ss2GvcnOpts.map((g) => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                        <button
                                            onClick={handleSsLoc}
                                            className="px-6 py-2 bg-[#3d2f6b] hover:bg-[#4c3d84] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                                        >
                                            Lọc
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {ssApplied && ssChartData ? (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <SoSanhBarChart chartData={ssChartData} label1={ssApplied.cls1.name} label2={ssApplied.cls2.name} />
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-semibold text-gray-700">Chưa có dữ liệu so sánh</h3>
                                            <p className="text-sm text-gray-500">
                                                Vui lòng chọn thông tin 2 lớp và nhấn{" "}
                                                <span className="font-semibold text-[#3d2f6b]">Lọc</span>{" "}
                                                để xem biểu đồ so sánh.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── Báo cáo tỷ lệ ── */}
                    {activeTab === "ty-le" && (
                        <>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <select value={formNamHoc} onChange={(e) => handleNamHocChange(e.target.value)} className={SEL}>
                                        <option value="">Năm học</option>
                                        {allYears.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
                                    </select>
                                    <select value={formHocKy} onChange={(e) => setFormHocKy(e.target.value)} disabled={!formNamHoc} className={SEL}>
                                        <option value="">Học kỳ</option>
                                        {hocKyOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    <select value={formKhoaId} onChange={(e) => handleKhoaChange(e.target.value)} className={SEL}>
                                        <option value="">Khoa</option>
                                        {PCTSV_FACULTIES.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                    <select value={formKhoaPrefix} onChange={(e) => handleKhoaPrefixChange(e.target.value)} disabled={!formKhoaId} className={SEL}>
                                        <option value="">Khóa</option>
                                        {khoaPrefixOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <select value={formLopId} onChange={(e) => handleLopChange(e.target.value)} className={SEL}>
                                        <option value="">Lớp học</option>
                                        {lopOptions.map((c) => <option key={c.id} value={c.id}>{c.tenLop}</option>)}
                                    </select>
                                    <select value={formGvcn} onChange={(e) => setFormGvcn(e.target.value)} className={SEL}>
                                        <option value="">GVCN</option>
                                        {gvcnOptions.map((g) => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                    <button
                                        onClick={handleLoc}
                                        className="px-6 py-2 bg-[#3d2f6b] hover:bg-[#4c3d84] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                                    >
                                        Lọc
                                    </button>
                                </div>
                            </div>
                            {applied && resultStats ? (
                                <div className="space-y-3">
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => setApplied(null)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#3d2f6b] font-bold text-lg transition-colors cursor-pointer"
                                            title="Xóa kết quả lọc"
                                        >
                                            ←
                                        </button>
                                    </div>
                                    {total === 0 ? (
                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10 text-center">
                                            <p className="text-gray-500 text-sm">Không tìm thấy dữ liệu phù hợp với bộ lọc đã chọn.</p>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                            <table className="w-full text-sm border-collapse">
                                                <thead>
                                                    <tr className="bg-[#3d2f6b] text-white">
                                                        <th className="px-6 py-3.5 text-center font-bold border border-[#4c3d84] w-16">TT</th>
                                                        <th className="px-6 py-3.5 text-center font-bold border border-[#4c3d84]">KẾT QUẢ XẾP LOẠI RÈN LUYỆN</th>
                                                        <th className="px-6 py-3.5 text-center font-bold border border-[#4c3d84] w-36">SỐ LƯỢNG</th>
                                                        <th className="px-6 py-3.5 text-center font-bold border border-[#4c3d84] w-36">TỶ LỆ</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {CLASSIFICATION_ROWS.map((row, idx) => (
                                                        <tr key={row.label} className={row.rowBg}>
                                                            <td className={`px-6 py-4 text-center border border-gray-200 ${row.textCls}`}>{idx + 1}</td>
                                                            <td className={`px-6 py-4 text-center border border-gray-200 ${row.textCls}`}>{row.label}</td>
                                                            <td className={`px-6 py-4 text-center border border-gray-200 ${row.textCls}`}>{statsArray[idx]}</td>
                                                            <td className={`px-6 py-4 text-center border border-gray-200 ${row.textCls}`}>{pct(statsArray[idx])}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-white">
                                                        <td className="px-6 py-4 text-center border border-gray-200"></td>
                                                        <td className="px-6 py-4 text-center font-bold text-gray-800 border border-gray-200">Tổng</td>
                                                        <td className="px-6 py-4 text-center font-bold text-gray-800 border border-gray-200">{total}</td>
                                                        <td className="px-6 py-4 text-center font-bold text-gray-800 border border-gray-200">100%</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-semibold text-gray-700">Chưa có dữ liệu thống kê</h3>
                                            <p className="text-sm text-gray-500">
                                                Vui lòng chọn bộ lọc và nhấn{" "}
                                                <span className="font-semibold text-[#3d2f6b]">Lọc</span>{" "}
                                                để xem báo cáo tỷ lệ.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default PctsvBaoCaoTyLe;