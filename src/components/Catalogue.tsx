import { COMPOSITION_TYPES, SIZES, formatEUR } from "@/lib/pricing";

export function Catalogue() {
  return (
    <section id="compositions" className="bg-paper-deep/60 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <p className="text-[0.8rem] font-medium uppercase tracking-[0.24em] text-carmine">
          Le tarif de l&apos;atelier
        </p>
        <h2 className="mt-4 max-w-[20ch] font-copy text-4xl font-medium leading-[1.1] text-ink sm:text-5xl">
          Des prix affichés, sans surprise
        </h2>
        <p className="mt-6 max-w-[60ch] text-[1.05rem] leading-relaxed text-ink-soft">
          Six familles de compositions, chacune déclinée en trois formats. Le
          prix indiqué est celui qui alimente votre devis ci-dessous.
        </p>

        <div className="mt-12 overflow-hidden rounded-3xl border border-hairline bg-paper">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-hairline bg-paper-deep/50 text-left text-[0.72rem] uppercase tracking-[0.1em] text-ink-faint">
                  <th className="py-4 pl-7 pr-4 font-medium">Composition</th>
                  {SIZES.map((s) => (
                    <th key={s.key} className="py-4 px-4 text-right font-medium">
                      {s.label}
                    </th>
                  ))}
                  <th className="py-4 pl-4 pr-7 text-right font-medium">Unité</th>
                </tr>
              </thead>
              <tbody>
                {COMPOSITION_TYPES.map((type) => (
                  <tr
                    key={type.key}
                    className="border-b border-hairline/70 align-top transition-colors last:border-0 hover:bg-rose-wash/30"
                  >
                    <td className="py-5 pl-7 pr-4">
                      <p className="text-base text-ink">{type.label}</p>
                      <p className="mt-0.5 text-[0.78rem] italic text-ink-faint">
                        {type.latin}
                      </p>
                    </td>
                    {SIZES.map((s) => (
                      <td key={s.key} className="tabular py-5 px-4 text-right text-ink">
                        {formatEUR(type.prices[s.key])}
                      </td>
                    ))}
                    <td className="py-5 pl-4 pr-7 text-right text-[0.75rem] text-ink-faint">
                      {type.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
