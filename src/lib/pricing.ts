export type SizeKey = "s" | "m" | "l";

export const SIZES: { key: SizeKey; label: string; note: string }[] = [
  { key: "s", label: "Discrète", note: "1 à 3 tiges dominantes" },
  { key: "m", label: "Généreuse", note: "volume affirmé, pièce centrale" },
  { key: "l", label: "Cérémonielle", note: "grand volume, effet d'entrée" },
];

export type CompositionType = {
  key: string;
  label: string;
  latin: string;
  description: string;
  unit: string;
  prices: Record<SizeKey, number>;
};

export const COMPOSITION_TYPES: CompositionType[] = [
  {
    key: "bouquet-mariee",
    label: "Bouquet de mariée",
    latin: "Rosa 'La Paix', ronde de saison",
    description:
      "Pièce maîtresse de la journée, montée à la main, tenue en ruban de soie.",
    unit: "la pièce",
    prices: { s: 130, m: 195, l: 275 },
  },
  {
    key: "bouquet-temoin",
    label: "Bouquet de témoin",
    latin: "Rosa & fleurs d'accompagnement",
    description: "Décliné du bouquet principal, format resserré.",
    unit: "la pièce",
    prices: { s: 48, m: 68, l: 92 },
  },
  {
    key: "centre-table",
    label: "Centre de table",
    latin: "Composition basse, vue à 360°",
    description: "Posée ou surélevée, pensée pour la conversation à table.",
    unit: "par table",
    prices: { s: 58, m: 88, l: 135 },
  },
  {
    key: "arche-ceremonie",
    label: "Arche de cérémonie",
    latin: "Structure florale suspendue ou montée",
    description: "Habillage végétal de l'autel ou du point de photos.",
    unit: "la structure",
    prices: { s: 360, m: 560, l: 890 },
  },
  {
    key: "boutonniere",
    label: "Boutonnière & corsage",
    latin: "Pièce courte sur tige piquée",
    description: "Pour les témoins, parents et invités d'honneur.",
    unit: "la pièce",
    prices: { s: 16, m: 22, l: 32 },
  },
  {
    key: "composition-accueil",
    label: "Composition d'accueil",
    latin: "Vasque d'entrée ou de vestiaire",
    description: "Premier geste floral perçu par les invités.",
    unit: "la pièce",
    prices: { s: 65, m: 105, l: 160 },
  },
];

export type LedgerEntry = {
  id: string;
  typeKey: string;
  size: SizeKey;
  quantity: number;
};

export function unitPrice(typeKey: string, size: SizeKey): number {
  const type = COMPOSITION_TYPES.find((t) => t.key === typeKey);
  if (!type) return 0;
  return type.prices[size];
}

export function lineTotal(entry: LedgerEntry): number {
  return unitPrice(entry.typeKey, entry.size) * entry.quantity;
}

export function registerTotal(entries: LedgerEntry[]): number {
  return entries.reduce((sum, e) => sum + lineTotal(e), 0);
}

export function formatEUR(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
