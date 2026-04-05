import { useState, useRef } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { LS_KEYS, COURSES, genId } from "../constants/admin.constants";

const EMPTY_FORM = {
  academicYearId: "", semesterId: "", courses: [],
  studentFrom: "", studentTo: "",
  facultyFrom: "", facultyTo: "",
  classLeaderFrom: "", classLeaderTo: "",
  teacherFrom: "", teacherTo: "",
};

export function useTimeSettings(years, allSemesters) {
  const [settings, setSettings] = useLocalStorage(LS_KEYS.TIME_SETTINGS, []);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [formErr, setFormErr]   = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [viewTarget, setViewTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const formRef = useRef(null);

  const semestersForYear = form.academicYearId
    ? (allSemesters[form.academicYearId] ?? [])
    : [];

  const selectedYear = years.find((y) => y.id === form.academicYearId) ?? null;
  const editingRecord = editingId ? settings.find((s) => s.id === editingId) : null;

  const setField = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleYearChange = (e) =>
    setForm((p) => ({ ...p, academicYearId: e.target.value, semesterId: "" }));

  const toggleCourse = (c) => {
    if (c === "Tất cả") {
      setForm((p) => ({
        ...p,
        courses: p.courses.length === COURSES.length ? [] : [...COURSES],
      }));
    } else {
      setForm((p) => ({
        ...p,
        courses: p.courses.includes(c)
          ? p.courses.filter((x) => x !== c)
          : [...p.courses, c],
      }));
    }
  };

  const startEdit = (s) => {
    setForm({
      academicYearId: s.academicYearId, semesterId: s.semesterId,
      courses: [...s.courses],
      studentFrom: s.studentFrom,       studentTo: s.studentTo,
      facultyFrom: s.facultyFrom,       facultyTo: s.facultyTo,
      classLeaderFrom: s.classLeaderFrom, classLeaderTo: s.classLeaderTo,
      teacherFrom: s.teacherFrom,       teacherTo: s.teacherTo,
    });
    setEditingId(s.id);
    setFormErr("");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cancelEdit = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormErr("");
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.academicYearId) return setFormErr("Vui lòng chọn năm học.");
    if (!form.semesterId)     return setFormErr("Vui lòng chọn học kỳ.");
    if (form.courses.length === 0) return setFormErr("Vui lòng chọn ít nhất một khóa.");

    const duplicate = settings.find(
      (s) => s.academicYearId === form.academicYearId &&
             s.semesterId === form.semesterId &&
             s.id !== editingId
    );
    if (duplicate)
      return setFormErr(`Đã có cài đặt cho ${duplicate.academicYearName} — ${duplicate.semesterName}.`);

    const year = years.find((y) => y.id === form.academicYearId);
    const sem  = (allSemesters[form.academicYearId] ?? []).find((s) => s.id === form.semesterId);
    const isEditing = !!editingId;

    const record = {
      id: editingId ?? genId(),
      academicYearId: form.academicYearId, academicYearName: year?.name ?? "",
      semesterId: form.semesterId,         semesterName: sem?.name ?? "",
      courses: [...form.courses],
      studentFrom: form.studentFrom,       studentTo: form.studentTo,
      facultyFrom: form.facultyFrom,       facultyTo: form.facultyTo,
      classLeaderFrom: form.classLeaderFrom, classLeaderTo: form.classLeaderTo,
      teacherFrom: form.teacherFrom,       teacherTo: form.teacherTo,
    };

    setSettings((prev) =>
      isEditing ? prev.map((s) => (s.id === editingId ? record : s)) : [...prev, record]
    );
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormErr("");
    showToast(isEditing ? "Cập nhật thành công!" : "Cài đặt thành công!");
  };

  const confirmDelete = () => {
    setSettings((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    setDeleteTarget(null);
    showToast("Đã xóa cài đặt.");
  };

  return {
    settings, form, editingId, editingRecord, formErr, toastMsg,
    viewTarget, setViewTarget, deleteTarget, setDeleteTarget,
    semestersForYear, selectedYear, formRef,
    setField, handleYearChange, toggleCourse,
    startEdit, cancelEdit, handleSave, confirmDelete,
  };
}