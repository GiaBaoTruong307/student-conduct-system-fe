import { useState } from "react";

const ssGet = (key, def) => {
  try {
    const r = sessionStorage.getItem(key);
    return r !== null ? JSON.parse(r) : def;
  } catch {
    return def;
  }
};

const ssSet = (key, val) => {
  try { sessionStorage.setItem(key, JSON.stringify(val)); } catch {}
};

export const clearRoleFilter = (role) => {
  if (!role) return;
  try { sessionStorage.removeItem(`filter_${role}`); } catch {}
};

/**
 * Persists filter state in sessionStorage keyed by role.
 * Returns [filter, updateFilter] — updateFilter merges partial updates.
 */
export const useRoleFilter = (role, defaults = {}) => {
  const [filter, setFilterState] = useState(() => ({
    ...defaults,
    ...ssGet(`filter_${role}`, {}),
  }));

  const updateFilter = (updates) => {
    setFilterState((prev) => {
      const next = { ...prev, ...updates };
      ssSet(`filter_${role}`, next);
      return next;
    });
  };

  return [filter, updateFilter];
};