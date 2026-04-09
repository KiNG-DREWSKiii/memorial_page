export const memorialConfig = {
  name: process.env.MEMORIAL_NAME ?? "Jaylyn Reese Fehr",
  dates: process.env.MEMORIAL_DATES ?? "2008 – April 6, 2026",
  message:
    process.env.MEMORIAL_MESSAGE ??
    "A bright light that touched so many lives. We invite friends and loved ones to share their favorite memories, photos, and stories as we honor Jaylyn's beautiful spirit."
};

export const rejectionMessage =
  "Your message couldn’t be posted at this time. Please ensure it reflects a respectful and relevant memory.";

export const adminKey = process.env.ADMIN_ACCESS_KEY ?? "admin-password123";
export const moderationModel = process.env.CEREBRAS_MODERATION_MODEL ?? "gpt-oss-120b";
export const cerebrasBaseUrl = process.env.CEREBRAS_BASE_URL ?? "https://api.cerebras.ai";
