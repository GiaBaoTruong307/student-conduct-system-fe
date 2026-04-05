import { useState } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { LS_KEYS, genId } from "../constants/admin.constants";

export function useCriteria() {
  const [sections, setSections] = useLocalStorage(LS_KEYS.CRITERIA, []);
  const [view, setView]         = useState("list"); // "list" | "step1" | "step2"
  const [pendingSection, setPendingSection] = useState(null);
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [showPreview, setShowPreview]       = useState(false);

  const usedNumbers = sections
    .map((s) => s.number)
    .filter(Boolean)
    .filter((n) => n !== pendingSection?.number);

  const totalScore = sections.reduce(
    (sum, s) => sum + (s.criteria || []).reduce((cs, c) => cs + (c.maxScore || 0), 0), 0
  );

  const sortedSections = [...sections].sort((a, b) => {
    if (a.number && b.number) return a.number - b.number;
    if (a.number) return -1;
    if (b.number) return 1;
    return 0;
  });

  const startCreate = () => { setPendingSection(null); setView("step1"); };

  const handleStep1Next = (sectionData) => {
    const existing = sections.find((s) => s.id === sectionData.id);
    setPendingSection({ ...sectionData, criteria: existing?.criteria ?? sectionData.criteria ?? [] });
    setView("step2");
  };

  const handleStep1SaveDirect = (sectionData) => {
    const existing = sections.find((s) => s.id === sectionData.id);
    const sec = { ...sectionData, criteria: existing?.criteria ?? [] };
    setSections((prev) =>
      prev.find((s) => s.id === sec.id) ? prev.map((s) => (s.id === sec.id ? sec : s)) : [...prev, sec]
    );
    setPendingSection(null);
    setView("list");
  };

  const handleStep2Save = (criteria) => {
    const sec = { ...pendingSection, criteria };
    setSections((prev) =>
      prev.find((s) => s.id === sec.id) ? prev.map((s) => (s.id === sec.id ? sec : s)) : [...prev, sec]
    );
    setPendingSection(null);
    setView("list");
  };

  const startEdit = (section) => { setPendingSection(section); setView("step1"); };
  const startManageCriteria = (section) => { setPendingSection(section); setView("step2"); };
  const cancelWizard = () => { setPendingSection(null); setView("list"); };
  const confirmDelete = () => {
    setSections((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return {
    sections, view, setView, pendingSection, deleteTarget, setDeleteTarget,
    showPreview, setShowPreview, usedNumbers, totalScore, sortedSections,
    startCreate, handleStep1Next, handleStep1SaveDirect, handleStep2Save,
    startEdit, startManageCriteria, cancelWizard, confirmDelete, genId,
  };
}