import { useCallback, useEffect, useRef, useState } from "react";
import { api, isApiConfigured, auth } from "@/lib/api";

const LOCAL_KEY = "pm_checklist_progress";

function readLocal(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}"); }
  catch { return {}; }
}

function writeLocal(p: Record<string, boolean>) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(p));
}

/**
 * Хук прогресса чек-листа.
 * - Если есть JWT и API — синхронизирует с сервером (debounce 600ms).
 * - Иначе — fallback в localStorage.
 */
export function useChecklistProgress() {
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const pendingRef = useRef<Record<string, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = readLocal();
      if (isApiConfigured() && auth.getToken() && auth.getToken() !== "demo-token") {
        try {
          const { progress: server } = await api.getProgress();
          if (!cancelled) setProgress({ ...local, ...server });
        } catch {
          if (!cancelled) setProgress(local);
        }
      } else {
        setProgress(local);
      }
      if (!cancelled) setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []);

  const flush = useCallback(async () => {
    const batch = pendingRef.current;
    pendingRef.current = {};
    if (!Object.keys(batch).length) return;
    if (isApiConfigured() && auth.getToken() && auth.getToken() !== "demo-token") {
      try { await api.saveProgress(batch); } catch (e) { console.warn("save failed", e); }
    }
  }, []);

  const toggle = useCallback((itemId: string) => {
    setProgress((prev) => {
      const next = { ...prev, [itemId]: !prev[itemId] };
      writeLocal(next);
      pendingRef.current[itemId] = next[itemId];
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, 600);
      return next;
    });
  }, [flush]);

  return { progress, toggle, loaded };
}

/** Стабильный id для пункта чек-листа (этап + категория + индекс). */
export function itemId(stageId: string, categoryTitle: string, index: number) {
  return `${stageId}::${categoryTitle}::${index}`;
}
