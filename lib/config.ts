type MemorialThemePreset = "rose" | "sky" | "lilac" | "sage";
type MemorialEmblemPreset = "none" | "cross" | "dove" | "lily" | "rose";

function readColor(name: string, fallback: string) {
  return process.env[name]?.trim() || fallback;
}

function resolveThemePreset(preset: string | undefined): MemorialThemePreset {
  if (preset === "sky" || preset === "lilac" || preset === "sage") {
    return preset;
  }

  return "rose";
}

function resolveEmblemPreset(preset: string | undefined): MemorialEmblemPreset {
  if (preset === "cross" || preset === "dove" || preset === "lily" || preset === "rose") {
    return preset;
  }

  return "none";
}

const themePreset = resolveThemePreset(process.env.MEMORIAL_THEME);
const emblemPreset = resolveEmblemPreset(process.env.MEMORIAL_EMBLEM);

const themePresets: Record<
  MemorialThemePreset,
  {
    bg: string;
    bgSoft: string;
    panel: string;
    panelStrong: string;
    line: string;
    text: string;
    muted: string;
    warm: string;
    primary: string;
    tintStrong: string;
    tintSoft: string;
    washStrong: string;
    washSoft: string;
    washTopOpacity: string;
    washBottomOpacity: string;
    backgroundImage: string;
  }
> = {
  rose: {
    bg: "#fffafb",
    bgSoft: "#fdf2f4",
    panel: "rgba(255, 255, 255, 0.65)",
    panelStrong: "rgba(255, 255, 255, 0.88)",
    line: "rgba(233, 30, 99, 0.1)",
    text: "#4a3a35",
    muted: "#8a7570",
    warm: "#d4af37",
    primary: "#d58ea1",
    tintStrong: "244, 143, 177",
    tintSoft: "255, 248, 221",
    washStrong: "255, 250, 251",
    washSoft: "255, 250, 251",
    washTopOpacity: "0.34",
    washBottomOpacity: "0.70",
    backgroundImage: "/background-heaven.png"
  },
  sky: {
    bg: "#f7fbff",
    bgSoft: "#edf6ff",
    panel: "rgba(255, 255, 255, 0.68)",
    panelStrong: "rgba(255, 255, 255, 0.9)",
    line: "rgba(45, 127, 249, 0.12)",
    text: "#26384a",
    muted: "#6c7e91",
    warm: "#9dc3f7",
    primary: "#6a9fe8",
    tintStrong: "106, 159, 232",
    tintSoft: "221, 239, 255",
    washStrong: "247, 251, 255",
    washSoft: "237, 246, 255",
    washTopOpacity: "0.12",
    washBottomOpacity: "0.32",
    backgroundImage: "/background-heaven.png"
  },
  lilac: {
    bg: "#fcfaff",
    bgSoft: "#f4efff",
    panel: "rgba(255, 255, 255, 0.67)",
    panelStrong: "rgba(255, 255, 255, 0.9)",
    line: "rgba(147, 112, 219, 0.11)",
    text: "#463950",
    muted: "#7d6e88",
    warm: "#d6b4ff",
    primary: "#b89adf",
    tintStrong: "184, 154, 223",
    tintSoft: "242, 232, 255",
    washStrong: "252, 250, 255",
    washSoft: "244, 239, 255",
    washTopOpacity: "0.30",
    washBottomOpacity: "0.64",
    backgroundImage: "/background-heaven.png"
  },
  sage: {
    bg: "#fbfdf9",
    bgSoft: "#f0f6ef",
    panel: "rgba(255, 255, 255, 0.68)",
    panelStrong: "rgba(255, 255, 255, 0.9)",
    line: "rgba(108, 157, 127, 0.12)",
    text: "#37473d",
    muted: "#708278",
    warm: "#b8cda8",
    primary: "#7fa78d",
    tintStrong: "127, 167, 141",
    tintSoft: "233, 242, 228",
    washStrong: "251, 253, 249",
    washSoft: "240, 246, 239",
    washTopOpacity: "0.30",
    washBottomOpacity: "0.62",
    backgroundImage: "/background-heaven.png"
  }
};

const selectedTheme = themePresets[themePreset];

export const memorialConfig = {
  key: process.env.MEMORIAL_KEY ?? "jaylyn-reese-fehr",
  name: process.env.MEMORIAL_NAME ?? "Jaylyn Reese Fehr",
  emblem: emblemPreset,
  portraitUrl: process.env.MEMORIAL_PORTRAIT_URL ?? "/jaylyn-portrait-edited.png",
  dates: process.env.MEMORIAL_DATES ?? "2008 – April 6, 2026",
  message:
    process.env.MEMORIAL_MESSAGE ??
    "A bright light that touched so many lives. We invite friends and loved ones to share their favorite memories, photos, and stories as we honor Jaylyn's beautiful spirit."
};

export const memorialTheme = {
  preset: themePreset,
  bg: readColor("THEME_BG", selectedTheme.bg),
  bgSoft: readColor("THEME_BG_SOFT", selectedTheme.bgSoft),
  panel: readColor("THEME_PANEL", selectedTheme.panel),
  panelStrong: readColor("THEME_PANEL_STRONG", selectedTheme.panelStrong),
  line: readColor("THEME_LINE", selectedTheme.line),
  text: readColor("THEME_TEXT", selectedTheme.text),
  muted: readColor("THEME_MUTED", selectedTheme.muted),
  warm: readColor("THEME_WARM", selectedTheme.warm),
  primary: readColor("THEME_PRIMARY", selectedTheme.primary),
  tintStrong: readColor("THEME_TINT_STRONG", selectedTheme.tintStrong),
  tintSoft: readColor("THEME_TINT_SOFT", selectedTheme.tintSoft),
  washStrong: readColor("THEME_WASH_STRONG", selectedTheme.washStrong),
  washSoft: readColor("THEME_WASH_SOFT", selectedTheme.washSoft),
  washTopOpacity: process.env.THEME_WASH_TOP_OPACITY?.trim() || selectedTheme.washTopOpacity,
  washBottomOpacity: process.env.THEME_WASH_BOTTOM_OPACITY?.trim() || selectedTheme.washBottomOpacity,
  backgroundImage: process.env.THEME_BACKGROUND_IMAGE?.trim() || selectedTheme.backgroundImage
};

export const rejectionMessage =
  "Your message couldn’t be posted at this time. Please ensure it reflects a respectful and relevant memory.";

export const adminKey = process.env.ADMIN_ACCESS_KEY ?? "admin-password123";
export const moderationModel = process.env.CEREBRAS_MODERATION_MODEL ?? "gpt-oss-120b";
export const cerebrasBaseUrl = process.env.CEREBRAS_BASE_URL ?? "https://api.cerebras.ai";
export const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "";
export const supabaseStorageBucket = process.env.SUPABASE_STORAGE_BUCKET ?? "memorial-media";

export const uploadLimits = {
  maxMediaFiles: 4,
  maxImageFiles: 3,
  maxVideoFiles: 1,
  maxImageBytes: 12 * 1024 * 1024,
  maxVideoBytes: 35 * 1024 * 1024
} as const;
