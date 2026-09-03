import { NextResponse } from "next/server";
import {
  COMPOSITION_TYPES,
  SIZES,
  catalogueForPrompt,
  type SizeKey,
} from "@/lib/pricing";
import {
  chatCompletion,
  MistralError,
  type ChatMessage,
  type ToolCall,
} from "@/lib/mistral";
import type { QuoteAction } from "@/lib/quote-store";

export const runtime = "nodejs";

const COMPO_KEYS = COMPOSITION_TYPES.map((t) => t.key);
const SIZE_KEYS = SIZES.map((s) => s.key);

const TOOLS = [
  {
    type: "function",
    function: {
      name: "add_composition",
      description:
        "Ajoute une composition au devis du visiteur. Utilise-le dès que le visiteur veut chiffrer ou ajouter un élément.",
      parameters: {
        type: "object",
        properties: {
          composition: { type: "string", enum: COMPO_KEYS },
          format: {
            type: "string",
            enum: SIZE_KEYS,
            description: "s = Discrète, m = Généreuse, l = Cérémonielle",
          },
          quantity: { type: "integer", minimum: 1, maximum: 20 },
        },
        required: ["composition", "format", "quantity"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "remove_composition",
      description: "Retire du devis toutes les lignes d'une composition donnée.",
      parameters: {
        type: "object",
        properties: { composition: { type: "string", enum: COMPO_KEYS } },
        required: ["composition"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "reset_quote",
      description: "Vide entièrement le devis.",
      parameters: { type: "object", properties: {} },
    },
  },
];

function systemPrompt(quoteSummary: string): string {
  return `Tu es le conseiller floral de « La Fleur de la Paix », un atelier de fleuriste événementiel et mariage à Paris (14 rue des Rosiers, 75004). Le nom vient de la rose « La Paix » : cœur ivoire, bord des pétales rose carminé — c'est la palette de la maison.

Ton rôle : renseigner les visiteurs (couples, organisateurs) sur les compositions, les formats, les tarifs, et les aider à préparer leur devis. Tu peux modifier leur devis directement grâce aux outils fournis.

Règles :
- Réponds en français, ton élégant, chaleureux et sobre. Sois concis (2-4 phrases), jamais de listes à puces interminables.
- Tarifs et compositions ci-dessous : ce sont les seules données valables. N'invente aucun prix.
- Quand le visiteur veut ajouter, retirer ou chiffrer quelque chose, appelle l'outil correspondant plutôt que de seulement décrire. Après l'action, confirme en une phrase et donne le nouveau total si pertinent.
- Le devis est une estimation ; la proposition définitive vient de l'atelier sous 48h via la section Contact.
- Tu ne prends pas de commande ferme, tu ne gères ni paiement ni livraison. Pour finaliser, invite à envoyer le devis via la section Contact.
- Si on te demande autre chose que la floristerie de la maison, recadre poliment.

${catalogueForPrompt()}

État actuel du devis :
${quoteSummary || "Le devis est vide."}`;
}

type IncomingMessage = { role: "user" | "assistant"; content: string };

function parseArgs(call: ToolCall): Record<string, unknown> {
  try {
    return JSON.parse(call.function.arguments || "{}");
  } catch {
    return {};
  }
}

function toAction(call: ToolCall): QuoteAction | null {
  const args = parseArgs(call);
  switch (call.function.name) {
    case "add_composition": {
      const composition = String(args.composition ?? "");
      const format = String(args.format ?? "");
      const quantity = Number(args.quantity ?? 1);
      if (!COMPO_KEYS.includes(composition)) return null;
      if (!SIZE_KEYS.includes(format as SizeKey)) return null;
      return {
        type: "add",
        composition,
        format: format as SizeKey,
        quantity: Number.isFinite(quantity) ? quantity : 1,
      };
    }
    case "remove_composition": {
      const composition = String(args.composition ?? "");
      if (!COMPO_KEYS.includes(composition)) return null;
      return { type: "remove", composition };
    }
    case "reset_quote":
      return { type: "reset" };
    default:
      return null;
  }
}

export async function POST(req: Request) {
  let body: { messages?: IncomingMessage[]; quoteSummary?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const history: ChatMessage[] = incoming
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-16)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  if (history.length === 0) {
    return NextResponse.json({ error: "Aucun message." }, { status: 400 });
  }

  const quoteSummary = (body.quoteSummary ?? "").toString().slice(0, 2000);

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt(quoteSummary) },
    ...history,
  ];

  try {
    const first = await chatCompletion({ messages, tools: TOOLS, toolChoice: "auto" });

    const toolCalls = first.message.tool_calls ?? [];
    if (toolCalls.length === 0) {
      return NextResponse.json({
        reply: first.message.content?.trim() || "…",
        actions: [],
      });
    }

    const actions = toolCalls
      .map(toAction)
      .filter((a): a is QuoteAction => a !== null);

    const followUp: ChatMessage[] = [
      ...messages,
      {
        role: "assistant",
        content: first.message.content ?? "",
        tool_calls: toolCalls,
      },
      ...toolCalls.map((call) => ({
        role: "tool" as const,
        name: call.function.name,
        tool_call_id: call.id,
        content: JSON.stringify({ ok: true }),
      })),
    ];

    const second = await chatCompletion({
      messages: followUp,
      temperature: 0.4,
    });

    return NextResponse.json({
      reply: second.message.content?.trim() || "C'est noté, votre devis est à jour.",
      actions,
    });
  } catch (err) {
    const status = err instanceof MistralError ? err.status : 500;
    const message =
      err instanceof MistralError
        ? err.message
        : "Le conseiller est momentanément indisponible.";
    return NextResponse.json({ error: message }, { status });
  }
}
