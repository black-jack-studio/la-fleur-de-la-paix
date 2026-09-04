import Image from "next/image";
import { COMPOSITION_TYPES, formatEUR } from "@/lib/pricing";

const IMAGES: Record<string, string> = {
  "bouquet-mariee": "/bouquet-mariee.png",
  "bouquet-temoin": "/gallery/bouquet-temoin.jpg",
  "centre-table": "/gallery/centre-table.jpg",
  "arche-ceremonie": "/gallery/arche-ceremonie.jpg",
  boutonniere: "/gallery/boutonniere.jpg",
  "composition-accueil": "/gallery/composition-accueil.jpg",
};

export function Catalogue() {
  return (
    <section id="compositions" className="bg-paper-deep/60 py-16 sm:py-20">
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

        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3">
          {COMPOSITION_TYPES.map((type) => (
            <div key={type.key} className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-paper">
                <Image
                  src={IMAGES[type.key]}
                  alt={type.label}
                  fill
                  sizes="(min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 text-[0.98rem] text-ink">{type.label}</p>
              <p className="mt-0.5 text-[0.85rem] text-ink-soft">
                À partir de{" "}
                <span className="font-medium text-carmine">
                  {formatEUR(type.prices.s)}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
