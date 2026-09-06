/**
 * Thin server-side wrapper around the Mistral API. Used only for the bouquet
 * preview's image generation — the chatbot runs on Gemini (see gemini.ts)
 * because this Mistral account has no chat/completions quota, but it does
 * have a working image-generation quota via the conversations/agents API.
 * Imported only from route handlers under src/app/api — the API key never
 * leaves the server.
 */

const BASE = "https://api.mistral.ai/v1";

export class MistralError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "MistralError";
    this.status = status;
  }
}

function apiKey(): string {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) {
    throw new MistralError(
      "Clé MISTRAL_API_KEY absente. Ajoutez-la dans .env.local.",
      500
    );
  }
  return key;
}

const MAX_RATE_LIMIT_RETRIES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function call(path: string, body: unknown): Promise<unknown> {
  for (let attempt = 0; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(`${BASE}${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch {
      throw new MistralError("Le service Mistral est injoignable pour le moment.");
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      if (res.status === 429) {
        if (attempt < MAX_RATE_LIMIT_RETRIES) {
          const retryAfter = Number(res.headers.get("retry-after"));
          const delay = Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : 500 * 2 ** attempt;
          await sleep(delay);
          continue;
        }
        throw new MistralError(
          `Mistral a limité la requête (429). ${detail.slice(0, 300)}`.trim(),
          429
        );
      }
      throw new MistralError(
        `Mistral a répondu ${res.status}. ${detail.slice(0, 300)}`.trim(),
        502
      );
    }
    return res.json();
  }
}

type ConversationOutput = {
  type: string;
  content?: Array<
    | { type: "text"; text: string }
    | { type: "tool_file"; tool: string; file_id: string; file_name: string; file_type: string }
  >;
};

/**
 * Runs the built-in `image_generation` tool (Black Forest Labs FLUX behind
 * Mistral's Agents API) and returns the generated image as raw bytes plus its
 * mime type.
 */
export async function generateImage(prompt: string): Promise<{
  bytes: Buffer;
  mime: string;
}> {
  const data = (await call("/conversations", {
    model: "mistral-medium-latest",
    tools: [{ type: "image_generation" }],
    inputs: prompt,
  })) as { outputs?: ConversationOutput[] };

  let fileId: string | undefined;
  for (const out of data.outputs ?? []) {
    for (const chunk of out.content ?? []) {
      if (chunk.type === "tool_file" && chunk.tool === "image_generation") {
        fileId = chunk.file_id;
      }
    }
  }
  if (!fileId) {
    throw new MistralError("Aucune image n'a été produite. Reformulez la demande.");
  }

  const fileRes = await fetch(`${BASE}/files/${fileId}/content`, {
    headers: { Authorization: `Bearer ${apiKey()}` },
  });
  if (!fileRes.ok) {
    throw new MistralError("Impossible de récupérer l'image générée.");
  }
  const mime = fileRes.headers.get("content-type") || "image/jpeg";
  const bytes = Buffer.from(await fileRes.arrayBuffer());
  return {
    bytes,
    mime: mime.startsWith("image/") ? mime : "image/jpeg",
  };
}
