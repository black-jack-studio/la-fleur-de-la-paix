"use client";

import { useState } from "react";
import { COMPOSITION_TYPES } from "@/lib/pricing";
import { Button } from "./Button";
import { RoseMark } from "./RoseMark";

const PALETTES = [
  { key: "maison", label: "Carmin & ivoire", note: "la palette de la maison" },
  { key: "blanc", label: "Blanc & feuillage", note: "épuré, végétal" },
  { key: "poudre", label: "Pastel poudré", note: "rose thé, pêche, crème" },
  { key: "bordeaux", label: "Rouge profond & bordeaux", note: "dense, automnal" },
  { key: "champetre", label: "Champêtre multicolore", note: "cueillette de saison" },
];

const STYLES = [
  { key: "rond", label: "Rond & structuré", note: "monté serré, symétrique" },
  { key: "asymetrique", label: "Champêtre & asymétrique", note: "mouvement libre" },
  { key: "cascade", label: "Tombant en cascade", note: "retombée fluide" },
  { key: "minimal", label: "Minimaliste", note: "quelques tiges, beaucoup d'air" },
];

type Status = "idle" | "loading" | "done" | "error";

export function BouquetStudio() {
  const [piece, setPiece] = useState(COMPOSITION_TYPES[0].label);
  const [palette, setPalette] = useState(PALETTES[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [details, setDetails] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [caption, setCaption] = useState("");

  async function generate() {
    setStatus("loading");
    setError("");

    const brief = [
      `${piece}, style ${style.label.toLowerCase()} (${style.note})`,
      `palette ${palette.label.toLowerCase()} — ${palette.note}`,
      details.trim() ? `Détails : ${details.trim()}` : "",
    ]
      .filter(Boolean)
      .join(". ");

    try {
      const res = await fetch("/api/bouquet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: brief }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Génération impossible.");
      setImage(data.image);
      setCaption(`${piece} · ${palette.label.toLowerCase()} · ${style.label.toLowerCase()}`);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Génération impossible.");
      setStatus("error");
    }
  }

  return (
    <section id="atelier-visuel" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <p className="text-[0.8rem] font-medium uppercase tracking-[0.24em] text-carmine">
          L&apos;atelier en images
        </p>
        <h2 className="mt-4 max-w-[22ch] font-copy text-4xl font-medium leading-[1.1] text-ink sm:text-5xl">
          Imaginez votre bouquet
        </h2>
        <p className="mt-6 max-w-[60ch] text-[1.05rem] leading-relaxed text-ink-soft">
          Choisissez une pièce, une palette et un style : l&apos;atelier en
          compose un aperçu visuel pour vous aider à vous projeter avant
          d&apos;échanger avec nous.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          {/* Controls */}
          <div className="rounded-3xl border border-hairline bg-paper-deep/40 p-6 sm:p-8">
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
              1 — La pièce
            </p>
            <div className="mt-3 flex flex-col divide-y divide-hairline">
              {COMPOSITION_TYPES.map((type) => (
                <label
                  key={type.key}
                  className="flex cursor-pointer items-start gap-3 py-3"
                >
                  <input
                    type="radio"
                    name="studio-piece"
                    value={type.label}
                    checked={piece === type.label}
                    onChange={() => setPiece(type.label)}
                    className="mt-1.5 h-3.5 w-3.5 accent-[var(--carmine)]"
                  />
                  <span className="text-[0.98rem] text-ink">{type.label}</span>
                </label>
              ))}
            </div>

            <p className="mt-8 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
              2 — La palette
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {PALETTES.map((p) => (
                <ChipButton
                  key={p.key}
                  active={palette.key === p.key}
                  onClick={() => setPalette(p)}
                  label={p.label}
                  note={p.note}
                />
              ))}
            </div>

            <p className="mt-8 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
              3 — Le style
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {STYLES.map((s) => (
                <ChipButton
                  key={s.key}
                  active={style.key === s.key}
                  onClick={() => setStyle(s)}
                  label={s.label}
                  note={s.note}
                />
              ))}
            </div>

            <p className="mt-8 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
              4 — Détails (facultatif)
            </p>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 300))}
              rows={3}
              placeholder="pivoines et renoncules, ruban de soie lie-de-vin, gypsophile…"
              className="mt-3 w-full resize-none rounded-xl border border-hairline bg-paper px-4 py-3 text-[0.9rem] leading-relaxed text-ink placeholder:text-ink-faint focus:border-carmine focus:outline-none"
            />

            <Button
              type="button"
              onClick={generate}
              disabled={status === "loading"}
              className="mt-8 w-full"
            >
              {status === "loading"
                ? "Composition en cours…"
                : status === "done" || status === "error"
                  ? "Régénérer l'aperçu"
                  : "Générer l'aperçu"}
            </Button>
          </div>

          {/* Preview */}
          <div className="rounded-3xl border border-hairline bg-paper p-6 shadow-[0_1px_2px_rgba(37,20,22,0.04),0_24px_48px_-32px_rgba(37,20,22,0.25)] sm:p-8 lg:sticky lg:top-24 lg:self-start">
            <div className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
              Aperçu
            </div>

            <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-hairline bg-paper-deep/40">
              <div className="relative flex aspect-[4/3] items-center justify-center">
                {status === "done" && image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={`Aperçu — ${caption}`}
                    className="h-full w-full object-cover"
                  />
                ) : status === "loading" ? (
                  <div className="flex flex-col items-center gap-4 text-ink-faint">
                    <RoseMark className="rose-drift h-12 w-12 text-carmine-soft" />
                    <p className="text-[0.82rem] italic">
                      L&apos;atelier compose votre aperçu…
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 px-8 text-center text-ink-faint">
                    <RoseMark className="h-12 w-12 text-hairline" strokeWidth={1.4} />
                    <p className="text-[0.82rem] italic">
                      Réglez la pièce, la palette et le style, puis lancez la
                      composition.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {status === "error" && (
              <p className="mt-4 rounded-xl bg-rose-wash px-4 py-3 text-[0.85rem] text-carmine-deep">
                {error}
              </p>
            )}

            {status === "done" && image && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[0.82rem] capitalize text-ink-soft">{caption}</p>
                <a
                  href={image}
                  download="apercu-bouquet-la-fleur-de-la-paix.jpg"
                  className="text-[0.78rem] font-medium text-carmine/80 underline decoration-carmine/30 underline-offset-4 transition-colors hover:text-carmine"
                >
                  Télécharger l&apos;image
                </a>
              </div>
            )}

            <p className="mt-6 border-t border-hairline pt-4 text-[0.75rem] leading-relaxed text-ink-faint">
              Aperçu généré par intelligence artificielle, à titre
              d&apos;inspiration. Chaque composition est ensuite réalisée à la
              main par l&apos;atelier, selon les fleurs de saison.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChipButton({
  active,
  onClick,
  label,
  note,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  note: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-start gap-1 rounded-2xl border px-3.5 py-3 text-left transition-colors ${
        active
          ? "border-carmine/60 bg-rose-wash"
          : "border-hairline hover:border-carmine/40"
      }`}
    >
      <span className="text-[0.8rem] font-medium text-ink">{label}</span>
      <span className="text-[0.7rem] text-ink-faint">{note}</span>
    </button>
  );
}
