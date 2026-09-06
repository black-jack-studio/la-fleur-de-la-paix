/**
 * Thin server-side wrapper around the Gemini API. Imported only from route
 * handlers under src/app/api — the API key never leaves the server. Both the
 * chatbot and the bouquet preview go through those handlers.
 */

const BASE = "https://generativelanguage.googleapis.com/v1beta";

export class GeminiError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "GeminiError";
    this.status = status;
  }
}

function apiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new GeminiError(
      "Clé GEMINI_API_KEY absente. Ajoutez-la dans .env.local.",
      500
    );
  }
  return key;
}

const MAX_RATE_LIMIT_RETRIES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function call(model: string, body: unknown): Promise<unknown> {
  for (let attempt = 0; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(`${BASE}/models/${model}:generateContent?key=${apiKey()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      throw new GeminiError("Le service Gemini est injoignable pour le moment.");
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
        throw new GeminiError(
          `Gemini a limité la requête (429). ${detail.slice(0, 300)}`.trim(),
          429
        );
      }
      throw new GeminiError(
        `Gemini a répondu ${res.status}. ${detail.slice(0, 300)}`.trim(),
        502
      );
    }
    return res.json();
  }
}

/**
 * Gemini has no "function"/"tool" role — a function-call result is sent back
 * as a "user" turn whose parts are functionResponse entries.
 */
export type GeminiRole = "user" | "model";

export type GeminiPart = {
  text?: string;
  functionCall?: { name: string; args: Record<string, unknown> };
  functionResponse?: { name: string; response: Record<string, unknown> };
  /** Echoed back verbatim by Gemini on function-call parts; required on the
   * follow-up turn or the API rejects the request. Never set this ourselves. */
  thoughtSignature?: string;
};

export type GeminiContent = { role: GeminiRole; parts: GeminiPart[] };

export type FunctionDeclaration = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export type FunctionCall = { name: string; args: Record<string, unknown> };

export type GenerateContentResult = {
  text: string;
  functionCalls: FunctionCall[];
  /** The raw model turn (parts as returned, thoughtSignature included). Feed
   * this back verbatim as the next "model" turn when following up on a
   * function call — reconstructing the parts by hand drops thoughtSignature
   * and Gemini rejects the request. */
  content: GeminiContent;
};

/**
 * Text/tool-calling chat turn. `contents` is the full conversation so far
 * (including any prior function-call/function-response turns).
 */
export async function generateContent(params: {
  model?: string;
  systemInstruction?: string;
  contents: GeminiContent[];
  tools?: FunctionDeclaration[];
  temperature?: number;
}): Promise<GenerateContentResult> {
  const body: Record<string, unknown> = {
    contents: params.contents,
    generationConfig: { temperature: params.temperature ?? 0.4 },
  };
  if (params.systemInstruction) {
    body.systemInstruction = { parts: [{ text: params.systemInstruction }] };
  }
  if (params.tools && params.tools.length > 0) {
    body.tools = [{ functionDeclarations: params.tools }];
  }

  const data = (await call(params.model ?? "gemini-3.6-flash", body)) as {
    candidates?: Array<{ content?: GeminiContent }>;
  };

  const content = data.candidates?.[0]?.content;
  if (!content?.parts) throw new GeminiError("Réponse Gemini vide.");

  const text = content.parts
    .filter((p) => p.text !== undefined)
    .map((p) => p.text)
    .join("");
  const functionCalls = content.parts
    .filter((p): p is GeminiPart & { functionCall: FunctionCall } => p.functionCall !== undefined)
    .map((p) => p.functionCall);

  return { text, functionCalls, content };
}
