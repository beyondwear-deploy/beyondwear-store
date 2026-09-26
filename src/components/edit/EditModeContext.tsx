"use client";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface EditModeValue {
  isAdmin: boolean;
  editMode: boolean;
  toggleEditMode: () => void;
  overrides: Record<string, string>;
  setOverride: (key: string, value: string) => void;
}

const EditModeCtx = createContext<EditModeValue | null>(null);

export function EditModeProvider({ isAdmin, initialOverrides, children }: { isAdmin: boolean; initialOverrides: Record<string, string>; children: ReactNode }) {
  const [editMode, setEditMode] = useState(false);
  const [overrides, setOverrides] = useState(initialOverrides);

  const toggleEditMode = useCallback(() => setEditMode((v) => !v), []);
  const setOverride = useCallback((key: string, value: string) => setOverrides((prev) => ({ ...prev, [key]: value })), []);

  const value = useMemo(
    () => ({ isAdmin, editMode: isAdmin && editMode, toggleEditMode, overrides, setOverride }),
    [isAdmin, editMode, toggleEditMode, overrides, setOverride],
  );

  return <EditModeCtx.Provider value={value}>{children}</EditModeCtx.Provider>;
}

export function useEditMode(): EditModeValue {
  const ctx = useContext(EditModeCtx);
  if (!ctx) return { isAdmin: false, editMode: false, toggleEditMode: () => {}, overrides: {}, setOverride: () => {} };
  return ctx;
}

/** Returns the live value for one editable field (saved override, or the site's default). */
export function useOverride(key: string, fallback: string): string {
  const { overrides } = useEditMode();
  return overrides[key] ?? fallback;
}
