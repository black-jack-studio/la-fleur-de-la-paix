import Image from "next/image";

export function Maison() {
  return (
    <section id="maison" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid gap-16 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-[0.8rem] font-medium uppercase tracking-[0.24em] text-carmine">
              La maison
            </p>
            <h2 className="mt-4 max-w-md font-copy text-4xl font-medium leading-[1.1] text-ink sm:text-5xl">
              Notre nom vient d&apos;une rose
            </h2>
            <p className="mt-7 max-w-[52ch] text-[1.05rem] leading-relaxed text-ink-soft">
              La rose &laquo;&nbsp;La Paix&nbsp;&raquo; fut créée en secret
              pendant la guerre par l&apos;horticulteur Francis Meilland,
              mise à l&apos;abri outre-Atlantique, puis baptisée le jour de la
              capitulation de Berlin. Ivoire au cœur, rose carminé sur le bord
              des pétales — c&apos;est en son hommage que l&apos;atelier tient
              son nom et sa palette.
            </p>
            <p className="mt-5 max-w-[52ch] text-[1.05rem] leading-relaxed text-ink-soft">
              Depuis l&apos;atelier, nous composons pour les mariages et
              réceptions d&apos;Île-de-France : bouquets, arches, centres de
              table, jusqu&apos;au dernier boutonnière — chaque commande
              suivie et chiffrée avec la même exigence.
            </p>
          </div>

          <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[2rem]">
            <Image
              src="/atelier-boutique.webp"
              alt="Intérieur de l'atelier, présentoirs de fleurs fraîches et comptoir en bois"
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent p-8 pt-20">
              <p className="font-display text-3xl leading-none text-white sm:text-4xl">
                Rosa &laquo;&nbsp;La Paix&nbsp;&raquo;
              </p>
              <p className="mt-2 text-[0.78rem] uppercase tracking-[0.1em] text-white/80">
                dite &laquo;&nbsp;Madame A. Meilland&nbsp;&raquo; · Antibes, 1945
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
