"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  COMPOSITION_TYPES,
  SIZES,
  formatEUR,
  lineTotal,
} from "@/lib/pricing";
import { useQuote } from "@/lib/quote-store";
import { RoseMark } from "./RoseMark";

type Bubble = {
  id: string;
  role: "user" | "assistant" | "note";
  content: string;
};

const GREETING: Bubble = {
  id: "greeting",
  role: "assistant",
  content:
    "Bonjour, je suis le conseiller floral de La Fleur de la Paix. Dites-moi votre événement et vos envies — je peux aussi remplir votre devis au fil de l'échange.",
};

const SUGGESTIONS = [
  "Quelles fleurs pour un mariage de 80 invités ?",
  "Ajoute un bouquet de mariée cérémoniel",
  "Combien coûte une arche de cérémonie ?",
];

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  const { entries, total, applyActions } = useQuote();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [bubbles, loading, open]);

  function quoteSummary(): string {
    if (entries.length === 0) return "";
    const lines = entries.map((e) => {
      const t = COMPOSITION_TYPES.find((c) => c.key === e.typeKey);
      const s = SIZES.find((s) => s.key === e.size);
      return `- ${t?.label ?? e.typeKey} (${s?.label ?? e.size}) × ${e.quantity} = ${formatEUR(lineTotal(e))}`;
    });
    return `${lines.join("\n")}\nTotal estimé : ${formatEUR(total)}`;
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;

    const userBubble: Bubble = { id: uid(), role: "user", content };
    const nextBubbles = [...bubbles, userBubble];
    setBubbles(nextBubbles);
    setDraft("");
    setLoading(true);

    const history = nextBubbles
      .filter((b) => b.role === "user" || b.role === "assistant")
      .map((b) => ({ role: b.role as "user" | "assistant", content: b.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, quoteSummary: quoteSummary() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Réponse indisponible.");

      const added: Bubble[] = [];
      if (Array.isArray(data.actions) && data.actions.length > 0) {
        const notes = applyActions(data.actions);
        for (const note of notes) {
          added.push({ id: uid(), role: "note", content: note });
        }
      }
      added.push({ id: uid(), role: "assistant", content: data.reply || "…" });
      setBubbles((prev) => [...prev, ...added]);
    } catch (err) {
      setBubbles((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content:
            err instanceof Error
              ? err.message
              : "Le conseiller est momentanément indisponible.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(draft);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 print:hidden">
      {open && (
        <div className="entry-in flex h-[min(30rem,calc(100dvh-8rem))] w-[min(23rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-hairline bg-paper shadow-[0_1px_2px_rgba(37,20,22,0.06),0_32px_64px_-24px_rgba(37,20,22,0.42)]">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-hairline px-5 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-wash text-carmine">
              <RoseMark className="h-5 w-5" strokeWidth={1.3} />
            </span>
            <span className="flex flex-col">
              <span className="text-[0.9rem] font-medium text-ink">
                Conseiller floral
              </span>
              <span className="text-[0.66rem] uppercase tracking-[0.12em] text-ink-faint">
                La Fleur de la Paix
              </span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer le conseiller"
              className="ml-auto text-ink-faint transition-colors hover:text-carmine"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            role="log"
            aria-live="polite"
          >
            {bubbles.map((b) =>
              b.role === "note" ? (
                <p
                  key={b.id}
                  className="mx-auto max-w-[92%] text-center text-[0.72rem] text-carmine/85"
                >
                  ✦ {b.content}
                </p>
              ) : (
                <div
                  key={b.id}
                  className={
                    b.role === "user"
                      ? "ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-rose-wash px-3.5 py-2.5 text-[0.88rem] text-ink"
                      : "mr-auto max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-paper-deep/70 px-3.5 py-2.5 text-[0.88rem] leading-relaxed text-ink"
                  }
                >
                  {b.content}
                </div>
              )
            )}

            {loading && (
              <div className="mr-auto flex gap-1 rounded-2xl rounded-bl-sm bg-paper-deep/70 px-3.5 py-3">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-faint"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )}

            {bubbles.length <= 1 && !loading && (
              <div className="space-y-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="block w-full rounded-xl border border-hairline px-3 py-2 text-left text-[0.8rem] text-ink-soft transition-colors hover:border-carmine/40 hover:text-carmine"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="flex items-end gap-2 border-t border-hairline p-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Votre message…"
              className="max-h-28 min-h-[2.5rem] flex-1 resize-none rounded-xl border border-hairline bg-paper px-3.5 py-2.5 text-[0.88rem] text-ink placeholder:text-ink-faint focus:border-carmine focus:outline-none"
            />
            <button
              type="button"
              onClick={() => send(draft)}
              disabled={loading || !draft.trim()}
              aria-label="Envoyer"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-carmine text-paper transition-colors hover:bg-carmine-deep disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path
                  d="M4 12h14M12 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le conseiller floral" : "Ouvrir le conseiller floral"}
        aria-expanded={open}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-carmine text-paper shadow-[0_1px_2px_rgba(37,20,22,0.12),0_14px_30px_-10px_rgba(156,43,63,0.65)] transition-all duration-300 hover:bg-carmine-deep hover:-translate-y-px"
    >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <RoseMark className="h-7 w-7" strokeWidth={1.2} />
        )}
      </button>
    </div>
  );
}
