import { useCallback, useEffect, useState } from "react";

const LOCAL_KEY = "pm_checklist_progress";

function readLocal(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeLocal(p: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(p));
}

/**
 * Чек-лист прогресса.
 * Хранится только локально в браузере (localStorage).
 * Без авторизации — каждый посетитель видит свой прогресс на своём устройстве.
 */
export function useChecklistProgress() {
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProgress(readLocal());
    setLoaded(true);
  }, []);

  const toggle = useCallback((id: string) => {
    setProgress((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      writeLocal(next);
      return next;
    });
  }, []);

  return { progress, toggle, loaded };
}

/** Стабильный id для пункта чек-листа (этап + категория + индекс). */
export function itemId(stageId: string, categoryTitle: string, index: number) {
  return `${stageId}::${categoryTitle}::${index}`;
}
