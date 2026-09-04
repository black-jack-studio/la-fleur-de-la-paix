"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  COMPOSITION_TYPES,
  SIZES,
  registerTotal,
  type LedgerEntry,
  type SizeKey,
} from "@/lib/pricing";

/**
 * The quote selection lives here rather than inside <QuoteExperience /> so the
 * chatbot can add or remove compositions on the visitor's behalf. Both the
 * quote section and the chat widget read and write the same list.
 */

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export type QuoteAction =
  | { type: "add"; composition: string; format: SizeKey; quantity: number }
  | { type: "remove"; composition: string }
  | { type: "reset" };

type QuoteContextValue = {
  entries: LedgerEntry[];
  total: number;
  addComposition: (typeKey: string, size: SizeKey, quantity: number) => void;
  removeEntry: (id: string) => void;
  removeByType: (typeKey: string) => void;
  reset: () => void;
  /** Applies a batch of chatbot tool calls; returns human-readable confirmations. */
  applyActions: (actions: QuoteAction[]) => string[];
};

const QuoteContext = createContext<QuoteContextValue | null>(null);

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);

  const addComposition = useCallback(
    (typeKey: string, size: SizeKey, quantity: number) => {
      setEntries((prev) => [
        ...prev,
        { id: newId(), typeKey, size, quantity },
      ]);
    },
    []
  );

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const removeByType = useCallback((typeKey: string) => {
    setEntries((prev) => prev.filter((e) => e.typeKey !== typeKey));
  }, []);

  const reset = useCallback(() => setEntries([]), []);

  const applyActions = useCallback((actions: QuoteAction[]) => {
    const notes: string[] = [];
    setEntries((prev) => {
      let next = [...prev];
      for (const action of actions) {
        if (action.type === "reset") {
          next = [];
          notes.push("Devis réinitialisé.");
          continue;
        }
        const type = COMPOSITION_TYPES.find((t) => t.key === action.composition);
        if (!type) continue;

        if (action.type === "remove") {
          next = next.filter((e) => e.typeKey !== action.composition);
          notes.push(`Retiré du devis : ${type.label}.`);
          continue;
        }

        const size = SIZES.find((s) => s.key === action.format);
        if (!size) continue;
        const quantity = Math.min(20, Math.max(1, Math.round(action.quantity)));
        next.push({ id: newId(), typeKey: type.key, size: size.key, quantity });
        notes.push(
          `Ajouté au devis : ${quantity} × ${type.label} (${size.label}).`
        );
      }
      return next;
    });
    return notes;
  }, []);

  const total = useMemo(() => registerTotal(entries), [entries]);

  const value = useMemo(
    () => ({
      entries,
      total,
      addComposition,
      removeEntry,
      removeByType,
      reset,
      applyActions,
    }),
    [entries, total, addComposition, removeEntry, removeByType, reset, applyActions]
  );

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuote(): QuoteContextValue {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote doit être utilisé dans <QuoteProvider>");
  return ctx;
}
