"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  COMPOSITION_TYPES,
  SIZES,
  formatEUR,
  lineTotal,
  registerTotal,
  unitPrice,
  type LedgerEntry,
  type SizeKey,
} from "@/lib/pricing";
import { Button } from "./Button";

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function QuoteExperience() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [typeKey, setTypeKey] = useState(COMPOSITION_TYPES[0].key);
  const [size, setSize] = useState<SizeKey>("m");
  const [quantity, setQuantity] = useState(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");

  const selectedType = COMPOSITION_TYPES.find((t) => t.key === typeKey)!;
  const currentUnitPrice = unitPrice(typeKey, size);
  const total = useMemo(() => registerTotal(entries), [entries]);

  function addEntry() {
    setEntries((prev) => [...prev, { id: newId(), typeKey, size, quantity }]);
    setQuantity(1);
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function summaryText() {
    if (entries.length === 0) return "";
    const lines = entries.map((e) => {
      const t = COMPOSITION_TYPES.find((c) => c.key === e.typeKey)!;
      const s = SIZES.find((s) => s.key === e.size)!;
      return `— ${t.label} (${s.label}) × ${e.quantity} — ${formatEUR(
        lineTotal(e)
      )}`;
    });
    return `Mon devis (${formatEUR(total)} au total) :\n${lines.join("\n")}`;
  }

  function handleOpenContact() {
    setMessage(summaryText());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ref = `LFP-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;
    setReference(ref);
    setSubmitted(true);
  }

  return (
    <>
      <section id="devis" className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <p className="text-[0.8rem] font-medium uppercase tracking-[0.24em] text-carmine">
            Mon devis
          </p>
          <h2 className="mt-4 max-w-[22ch] font-copy text-4xl font-medium leading-[1.1] text-ink sm:text-5xl">
            Composez, le total s&apos;actualise
          </h2>

          <div className="mt-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            {/* Entry form */}
            <div className="rounded-3xl border border-hairline bg-paper-deep/40 p-6 sm:p-8">
              <p className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
                1 — Choisir la composition
              </p>
              <div className="mt-3 flex flex-col divide-y divide-hairline">
                {COMPOSITION_TYPES.map((type) => (
                  <label
                    key={type.key}
                    className="flex cursor-pointer items-start gap-3 py-3"
                  >
                    <input
                      type="radio"
                      name="composition-type"
                      value={type.key}
                      checked={typeKey === type.key}
                      onChange={() => setTypeKey(type.key)}
                      className="mt-1.5 h-3.5 w-3.5 accent-[var(--carmine)]"
                    />
                    <span>
                      <span className="block text-[0.98rem] text-ink">
                        {type.label}
                      </span>
                      <span className="block text-[0.78rem] text-ink-faint">
                        {type.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>

              <p className="mt-8 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
                2 — Choisir le format
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2.5">
                {SIZES.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSize(s.key)}
                    aria-pressed={size === s.key}
                    className={`flex flex-col items-start gap-1 rounded-2xl border px-3.5 py-3 text-left transition-colors ${
                      size === s.key
                        ? "border-carmine/60 bg-rose-wash"
                        : "border-hairline hover:border-carmine/40"
                    }`}
                  >
                    <span className="text-[0.78rem] font-medium text-ink">
                      {s.label}
                    </span>
                    <span className="text-[0.7rem] text-ink-faint">
                      {s.note}
                    </span>
                  </button>
                ))}
              </div>

              <p className="mt-8 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
                3 — Quantité
              </p>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center rounded-full border border-hairline">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-2 text-lg text-ink transition-colors hover:text-carmine"
                    aria-label="Diminuer la quantité"
                  >
                    −
                  </button>
                  <span className="tabular min-w-8 px-1 text-center text-sm text-ink">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="px-4 py-2 text-lg text-ink transition-colors hover:text-carmine"
                    aria-label="Augmenter la quantité"
                  >
                    +
                  </button>
                </div>
                <p className="tabular text-sm text-ink-soft">
                  {formatEUR(currentUnitPrice)} × {quantity} ={" "}
                  <span className="font-medium text-ink">
                    {formatEUR(currentUnitPrice * quantity)}
                  </span>
                </p>
              </div>

              <Button type="button" onClick={addEntry} className="mt-8 w-full">
                Ajouter au devis
              </Button>
              <p className="mt-2.5 text-center text-[0.75rem] text-ink-faint">
                « {selectedType.label} » sera ajouté à votre sélection.
              </p>
            </div>

            {/* Selection summary */}
            <div className="rounded-3xl border border-hairline bg-paper p-6 shadow-[0_1px_2px_rgba(37,20,22,0.04),0_24px_48px_-32px_rgba(37,20,22,0.25)] sm:p-8">
              <div className="flex items-center justify-between text-[0.72rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
                <span>Votre sélection</span>
                <span>{entries.length} élément{entries.length > 1 ? "s" : ""}</span>
              </div>

              {entries.length === 0 ? (
                <p className="mt-10 mb-6 text-center italic text-ink-faint">
                  Rien pour l&apos;instant. Ajoutez une première composition
                  depuis le formulaire.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-hairline">
                  {entries.map((entry) => {
                    const type = COMPOSITION_TYPES.find(
                      (t) => t.key === entry.typeKey
                    )!;
                    const sizeInfo = SIZES.find((s) => s.key === entry.size)!;
                    return (
                      <li
                        key={entry.id}
                        className="entry-in flex items-start justify-between gap-4 py-4"
                      >
                        <div>
                          <p className="text-[0.98rem] text-ink">
                            {type.label}
                          </p>
                          <p className="text-[0.78rem] text-ink-faint">
                            Format {sizeInfo.label.toLowerCase()} · × {entry.quantity}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeEntry(entry.id)}
                            className="mt-1 text-[0.72rem] font-medium text-carmine/80 transition-colors hover:text-carmine"
                          >
                            Retirer
                          </button>
                        </div>
                        <p className="tabular whitespace-nowrap text-sm font-medium text-ink">
                          {formatEUR(lineTotal(entry))}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="mt-6 flex items-center justify-between border-t border-hairline pt-5">
                <p className="text-[0.8rem] font-medium uppercase tracking-[0.1em] text-ink">
                  Total estimé
                </p>
                <p className="tabular text-3xl font-medium text-carmine">
                  {formatEUR(total)}
                </p>
              </div>

              {entries.length > 0 && (
                <Button
                  href="#contact"
                  onClick={handleOpenContact}
                  variant="outline"
                  className="mt-6 w-full"
                >
                  Envoyer ce devis à l&apos;atelier
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-paper-deep/60 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-[0.8rem] font-medium uppercase tracking-[0.24em] text-carmine">
                Contact
              </p>
              <h2 className="mt-4 font-copy text-4xl font-medium leading-[1.1] text-ink sm:text-5xl">
                Confiez-nous ce projet
              </h2>
              <p className="mt-6 max-w-[42ch] text-[1.05rem] leading-relaxed text-ink-soft">
                Envoyez votre devis tel quel, ou repartez de zéro : nous
                répondons sous 48h avec une proposition définitive et les
                disponibilités de l&apos;atelier.
              </p>

              <dl className="mt-10 space-y-5 text-[0.92rem] text-ink-soft">
                <div>
                  <dt className="text-[0.72rem] uppercase tracking-[0.1em] text-ink-faint">
                    Atelier
                  </dt>
                  <dd className="mt-1 text-ink">14 rue des Rosiers, 75004 Paris</dd>
                </div>
                <div>
                  <dt className="text-[0.72rem] uppercase tracking-[0.1em] text-ink-faint">
                    Téléphone
                  </dt>
                  <dd className="mt-1 text-ink">01 42 00 00 00</dd>
                </div>
                <div>
                  <dt className="text-[0.72rem] uppercase tracking-[0.1em] text-ink-faint">
                    Courriel
                  </dt>
                  <dd className="mt-1 text-ink">atelier@lafleurdelapaix.fr</dd>
                </div>
                <div>
                  <dt className="text-[0.72rem] uppercase tracking-[0.1em] text-ink-faint">
                    Ouverture
                  </dt>
                  <dd className="mt-1 text-ink">Mardi–samedi, 9h30–19h</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl border border-hairline bg-paper p-6 shadow-[0_1px_2px_rgba(37,20,22,0.04),0_24px_48px_-32px_rgba(37,20,22,0.25)] sm:p-9">
              {submitted ? (
                <div className="entry-in py-8 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-wash text-carmine">
                    <RoseCheck />
                  </div>
                  <p className="font-copy text-2xl font-medium text-ink">
                    Votre demande est envoyée
                  </p>
                  <p className="mt-3 text-[0.85rem] uppercase tracking-[0.1em] text-ink-faint">
                    Dossier {reference}
                  </p>
                  <p className="mx-auto mt-4 max-w-[42ch] text-ink-soft">
                    Un membre de l&apos;atelier revient vers vous sous 48h
                    ouvrées pour affiner ce devis.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Nom & prénom">
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClasses}
                        placeholder="Camille Durand"
                      />
                    </Field>
                    <Field label="Date de l'événement">
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className={inputClasses}
                      />
                    </Field>
                    <Field label="Courriel">
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClasses}
                        placeholder="vous@exemple.fr"
                      />
                    </Field>
                    <Field label="Téléphone">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={inputClasses}
                        placeholder="06 00 00 00 00"
                      />
                    </Field>
                  </div>
                  <Field label="Votre devis / message">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                      className={`${inputClasses} resize-none text-[0.88rem] leading-relaxed`}
                      placeholder="Décrivez votre événement, ou composez votre devis ci-dessus pour le remplir automatiquement."
                    />
                  </Field>
                  <Button type="submit" className="w-full">
                    Envoyer à l&apos;atelier
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const inputClasses =
  "w-full rounded-xl border border-hairline bg-paper px-4 py-3 text-[0.95rem] text-ink placeholder:text-ink-faint focus:border-carmine focus:outline-none";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.72rem] font-medium uppercase tracking-[0.1em] text-ink-faint">
        {label}
      </span>
      {children}
    </label>
  );
}

function RoseCheck() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
      <path
        d="M5 12.5 10 17l9-10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
