import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  localStorage.setItem(LOCAL_KEY, JSON.stringify(p));
}

/**
 * Чек-лист прогресса:
 * - При наличии сессии — синхронизируется с таблицей checklist_progress (debounce 500ms).
 * - Локальная копия в localStorage даёт мгновенный отклик при перезагрузке.
 */
export function useChecklistProgress() {
  const [progress, setProgress] = useState<Record<string, boolean>>(() => readLocal());
  const [loaded, setLoaded] = useState(false);
  const userIdRef = useRef<string | null>(null);
  const pendingRef = useRef<Record<string, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track session + initial fetch
  useEffect(() => {
    let cancelled = false;

    const load = async (uid: string | null) => {
      userIdRef.current = uid;
      const local = readLocal();
      if (!uid) {
        if (!cancelled) {
          setProgress(local);
          setLoaded(true);
        }
        return;
      }
      const { data, error } = await supabase
        .from("checklist_progress")
        .select("item_id, checked")
        .eq("user_id", uid);
      if (cancelled) return;
      if (error) {
        console.warn("progress load failed", error);
        setProgress(local);
      } else {
        const server: Record<string, boolean> = {};
        for (const row of data ?? []) server[row.item_id] = row.checked;
        const merged = { ...local, ...server };
        setProgress(merged);
        writeLocal(merged);
      }
      setLoaded(true);
    };

    supabase.auth.getSession().then(({ data }) => {
      load(data.session?.user.id ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      load(session?.user.id ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const flush = useCallback(async () => {
    const uid = userIdRef.current;
    const batch = pendingRef.current;
    pendingRef.current = {};
    const entries = Object.entries(batch);
    if (!entries.length || !uid) return;
    const rows = entries.map(([item_id, checked]) => ({
      user_id: uid,
      item_id,
      checked,
    }));
    const { error } = await supabase
      .from("checklist_progress")
      .upsert(rows, { onConflict: "user_id,item_id" });
    if (error) console.warn("progress save failed", error);
  }, []);

  const toggle = useCallback(
    (id: string) => {
      setProgress((prev) => {
        const next = { ...prev, [id]: !prev[id] };
        writeLocal(next);
        pendingRef.current[id] = next[id];
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(flush, 500);
        return next;
      });
    },
    [flush],
  );

  return { progress, toggle, loaded };
}

/** Стабильный id для пункта чек-листа (этап + категория + индекс). */
export function itemId(stageId: string, categoryTitle: string, index: number) {
  return `${stageId}::${categoryTitle}::${index}`;
}
