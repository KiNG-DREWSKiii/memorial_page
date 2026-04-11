export type SubmissionStatus = "pending" | "approved" | "flagged" | "rejected";
export type SubmissionMode = "open" | "locked";

export type MediaKind = "image" | "video";

export type MediaAsset = {
  url: string;
  thumbnailUrl: string | null;
  kind: MediaKind;
  mimeType: string;
  fileName: string;
};

export type Submission = {
  id: string;
  memorialKey: string;
  name: string | null;
  message: string;
  files: MediaAsset[];
  status: SubmissionStatus;
  createdAt: string;
  aiConfidence?: number;
  aiReason?: string;
};

export type SiteSettings = {
  memorialKey?: string;
  submissionMode: SubmissionMode;
};

export type Photo = {
  id: string;
  memorialKey: string;
  sourceSubmissionId?: string | null;
  imageUrl: string;
  caption: string | null;
  name: string | null;
  approved: boolean;
  featured: boolean;
  createdAt: string;
};

export type SlideshowItem = {
  id: string;
  imageUrl: string;
  alt: string;
};

export type Story = {
  id: string;
  memorialKey: string;
  sourceSubmissionId?: string | null;
  title: string | null;
  body: string;
  coverImage: string | null;
  authorName: string | null;
  approved: boolean;
  featured: boolean;
  createdAt: string;
};

export type ModerationDecision = "APPROVE" | "FLAG" | "REJECT";

export type ModerationResult = {
  decision: ModerationDecision;
  reason: string;
  confidence: number;
};
