/**
 * Thin server-side wrapper around the Mistral API. Imported only from route
 * handlers under src/app/api — the API key never leaves the server. Both the
 * chatbot and the bouquet preview go through those handlers.
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

async function call(path: string, body: unknown): Promise<unknown> {
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
    throw new MistralError(
      `Mistral a répondu ${res.status}. ${detail.slice(0, 300)}`.trim(),
      res.status === 429 ? 429 : 502
    );
  }
  return res.json();
}

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type ChatChoice = {
  message: {
    role: "assistant";
    content: string | null;
    tool_calls?: ToolCall[];
  };
  finish_reason: string;
};

export async function chatCompletion(params: {
  messages: ChatMessage[];
  tools?: unknown[];
  toolChoice?: "auto" | "none" | "any";
  temperature?: number;
  model?: string;
}): Promise<ChatChoice> {
  const data = (await call("/chat/completions", {
    model: params.model ?? "mistral-small-latest",
    temperature: params.temperature ?? 0.4,
    messages: params.messages,
    ...(params.tools ? { tools: params.tools, tool_choice: params.toolChoice ?? "auto" } : {}),
  })) as { choices?: ChatChoice[] };

  const choice = data.choices?.[0];
  if (!choice) throw new MistralError("Réponse Mistral vide.");
  return choice;
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
