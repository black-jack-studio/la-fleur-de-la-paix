import { RoseMark } from "./RoseMark";

export function Footer() {
  return (
    <footer className="mt-8 border-t border-hairline py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-4">
          <RoseMark className="h-10 w-10 text-carmine" strokeWidth={1} />
          <div>
            <p className="font-display text-2xl text-ink">La Fleur de la Paix</p>
            <p className="text-[0.72rem] uppercase tracking-[0.1em] text-ink-faint">
              Atelier floral · Paris · Projet pédagogique
            </p>
          </div>
        </div>
        <p className="max-w-[36ch] text-[0.72rem] leading-relaxed text-ink-faint">
          Maison, tarifs et contenus fictifs, conçus dans un cadre scolaire à
          des fins de démonstration.
        </p>
      </div>
    </footer>
  );
}
