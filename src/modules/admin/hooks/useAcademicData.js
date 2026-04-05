import { useState } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { LS_KEYS, genId } from "../constants/admin.constants";

export function useAcademicData() {
  const [years, setYears]         = useLocalStorage(LS_KEYS.YEARS, []);
  const [semesters, setSemesters] = useLocalStorage(LS_KEYS.SEMESTERS, {});
  const [tab, setTab]             = useLocalStorage(LS_KEYS.ACADEMIC_TAB, "year");
  const [selectedYearId, setSelectedYearId] = useLocalStorage(LS_KEYS.SELECTED_YEAR, null);

  const selectedYear = years.find((y) => y.id === selectedYearId) ?? null;
  const currentSems  = selectedYear ? (semesters[selectedYear.id] ?? []) : [];

  const saveYear = (year, onDone) => {
    setYears((prev) =>
      prev.find((y) => y.id === year.id)
        ? prev.map((y) => (y.id === year.id ? year : y))
        : [...prev, year]
    );
    onDone?.();
  };

  const deleteYear = (id) => {
    setYears((prev) => prev.filter((y) => y.id !== id));
    setSemesters((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (selectedYearId === id) setSelectedYearId(null);
  };

  const selectYear = (y) => {
    setSelectedYearId(y.id);
    setTab("semester");
  };

  const saveSem = (sem, yearId, onDone) => {
    setSemesters((prev) => {
      const list = prev[yearId] ?? [];
      return {
        ...prev,
        [yearId]: list.find((s) => s.id === sem.id)
          ? list.map((s) => (s.id === sem.id ? sem : s))
          : [...list, sem],
      };
    });
    onDone?.();
  };

  const deleteSem = (semId, yearId) => {
    setSemesters((prev) => ({
      ...prev,
      [yearId]: (prev[yearId] ?? []).filter((s) => s.id !== semId),
    }));
  };

  return {
    years, semesters, tab, setTab,
    selectedYearId, setSelectedYearId,
    selectedYear, currentSems,
    saveYear, deleteYear, selectYear,
    saveSem, deleteSem,
  };
}