import Image from "next/image";
import { Button } from "./Button";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-8 pb-16 sm:pt-10 sm:pb-20">
      <div className="relative mx-auto grid max-w-6xl gap-16 px-6 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-[0.8rem] font-medium uppercase tracking-[0.24em] text-carmine">
            Fleuriste événementiel &amp; mariage — Paris
          </p>

          <h1 className="mt-6 max-w-xl font-copy text-[clamp(2.6rem,5.5vw,4.2rem)] font-medium leading-[1.05] text-ink">
            Un devis floral,
            <br />
            <span className="font-display text-[1.4em] font-normal leading-none text-carmine">
              clair et immédiat
            </span>
          </h1>

          <p className="mt-7 max-w-[46ch] text-lg leading-relaxed text-ink-soft">
            Choisissez vos compositions, leur format, leur quantité : le
            montant s&apos;affiche en temps réel. Envoyez-le ensuite à
            l&apos;atelier en un geste, sans attendre un appel.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Button href="#devis">Composer mon devis</Button>
            <a
              href="#maison"
              className="text-[0.85rem] font-medium text-ink-soft underline decoration-hairline underline-offset-[6px] transition-colors hover:text-carmine hover:decoration-carmine/40"
            >
              Découvrir la maison
            </a>
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-lg items-center justify-center lg:max-w-none">
          <div className="absolute inset-[6%] rounded-[3rem] bg-rose-wash" />
          <Image
            src="/bouquet-mariee.png"
            alt="Bouquet de mariée en roses rouges et blanches, gypsophile, ruban de soie"
            width={605}
            height={679}
            priority
            className="relative h-auto w-[85%] object-contain drop-shadow-[0_28px_40px_rgba(37,20,22,0.22)]"
          />
        </div>
      </div>
    </section>
  );
}
