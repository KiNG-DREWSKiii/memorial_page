import { clampConfidence } from "@/lib/utils";
import { moderationModel, ollamaBaseUrl } from "@/lib/config";
import type { MediaAsset, ModerationResult } from "@/lib/types";

const rejectPatterns = [
  /\b(?:kill yourself|hate(?:ful)?|nazi|slur)\b/i,
  /\b(?:scam|bitcoin giveaway|click here|buy now)\b/i,
  /\b(?:liar|criminal|cheated|stole|abused)\b/i
];

const flagPatterns = [/\b(?:maybe|rumor|heard that|not sure)\b/i, /\b(?:politics|lawsuit|inheritance)\b/i];

function fallbackModeration(content: string): ModerationResult {
  if (rejectPatterns.some((pattern) => pattern.test(content))) {
    return {
      decision: "REJECT",
      reason: "Contains harmful, defamatory, or clearly unsafe language.",
      confidence: 0.95
    };
  }

  if (flagPatterns.some((pattern) => pattern.test(content))) {
    return {
      decision: "FLAG",
      reason: "Needs human review because the message may be speculative or sensitive.",
      confidence: 0.66
    };
  }

  return {
    decision: "APPROVE",
    reason: "Respectful and relevant memorial message.",
    confidence: 0.91
  };
}

function buildInput(name: string | null, content: string, media: MediaAsset[]) {
  const mediaSummary =
    media.length === 0
      ? "No media attached."
      : media
          .map((asset) => `${asset.kind}:${asset.fileName} (${asset.mimeType})`)
          .join(", ");

  return `You are the guardian of a memorial site for one deceased person.
Protect the family and visitors. Approve respectful, relevant memories. Flag uncertainty. Reject clear harm.
Never approve hate speech, slander, misinformation, spam, trolling, harassment, or content likely to cause pain later.
Err on the side of protection, not censorship.

Review this submission:
Optional name: ${name ?? "Anonymous"}
Message: ${content}
Attached media: ${mediaSummary}

Return only valid minified JSON with this exact schema:
{"decision":"APPROVE|FLAG|REJECT","reason":"short explanation","confidence":0.0}`;
}

export async function moderateMemorialPost(
  name: string | null,
  content: string,
  media: MediaAsset[]
): Promise<ModerationResult> {
  if (!process.env.OLLAMA_BASE_URL && !process.env.OLLAMA_MODERATION_MODEL) {
    return fallbackModeration(content);
  }

  try {
    const response = await fetch(`${ollamaBaseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: moderationModel,
        prompt: buildInput(name, content, media),
        format: "json",
        stream: false,
        options: {
          temperature: 0.1
        }
      })
    });

    if (!response.ok) {
      return fallbackModeration(content);
    }

    const payload = (await response.json()) as { response?: string };
    const parsed = JSON.parse(payload.response ?? "{}") as ModerationResult;

    return {
      decision:
        parsed.decision === "APPROVE" || parsed.decision === "FLAG" || parsed.decision === "REJECT"
          ? parsed.decision
          : "FLAG",
      reason: parsed.reason || "Needs human review.",
      confidence: clampConfidence(parsed.confidence)
    };
  } catch {
    return fallbackModeration(content);
  }
}
