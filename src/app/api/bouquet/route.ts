import { NextResponse } from "next/server";
import { generateImage, MistralError } from "@/lib/mistral";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Fixed photographic direction so every preview stays on-brand. */
const STYLE_SUFFIX =
  "Photographie de produit de fleuriste, cadrage serré sur la composition, " +
  "lumière naturelle douce, fond clair uni crème, rendu photoréaliste et " +
  "élégant, esthétique classique et raffinée, aucune personne, aucun texte.";

export async function POST(req: Request) {
  let body: { prompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const brief = (body.prompt ?? "").toString().trim().slice(0, 600);
  if (brief.length < 3) {
    return NextResponse.json(
      { error: "Décrivez le bouquet souhaité." },
      { status: 400 }
    );
  }

  const prompt = `Génère UNE image d'un bouquet ou d'une composition florale pour un mariage ou un événement. ${brief}. ${STYLE_SUFFIX}`;

  try {
    const { bytes, mime } = await generateImage(prompt);
    const dataUrl = `data:${mime};base64,${bytes.toString("base64")}`;
    return NextResponse.json({ image: dataUrl });
  } catch (err) {
    const status = err instanceof MistralError ? err.status : 500;
    const message =
      err instanceof MistralError
        ? err.message
        : "La génération d'image est momentanément indisponible.";
    return NextResponse.json({ error: message }, { status });
  }
}
