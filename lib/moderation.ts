import { clampConfidence } from "@/lib/utils";
import { moderationModel } from "@/lib/config";
import type { MediaAsset, ModerationResult } from "@/lib/types";

const schema = {
  name: "memorial_moderation_decision",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      decision: {
        type: "string",
        enum: ["APPROVE", "FLAG", "REJECT"]
      },
      reason: {
        type: "string"
      },
      confidence: {
        type: "number"
      }
    },
    required: ["decision", "reason", "confidence"]
  }
};

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

  return [
    {
      role: "system",
      content: [
        {
          type: "input_text",
          text:
            "You are the guardian of a memorial site for one deceased person. Protect the family and visitors. Approve respectful, relevant memories. Flag uncertainty. Reject clear harm. Never approve hate speech, slander, misinformation, spam, trolling, harassment, or content likely to cause pain later."
        }
      ]
    },
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: `Optional name: ${name ?? "Anonymous"}\nMessage: ${content}\nAttached media: ${mediaSummary}\n\nReturn only the structured moderation decision.`
        }
      ]
    }
  ];
}

export async function moderateMemorialPost(
  name: string | null,
  content: string,
  media: MediaAsset[]
): Promise<ModerationResult> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackModeration(content);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: moderationModel,
        input: buildInput(name, content, media),
        text: {
          format: {
            type: "json_schema",
            ...schema
          }
        }
      })
    });

    if (!response.ok) {
      return fallbackModeration(content);
    }

    const payload = (await response.json()) as { output_text?: string };
    const parsed = JSON.parse(payload.output_text ?? "{}") as ModerationResult;

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
