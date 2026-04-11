import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import { memorialConfig } from "@/lib/config";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { createId } from "@/lib/utils";
import type { Photo, SiteSettings, Story, Submission, SubmissionMode, SubmissionStatus } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const submissionsPath = path.join(dataDir, "submissions.json");
const photosPath = path.join(dataDir, "photos.json");
const storiesPath = path.join(dataDir, "stories.json");
const settingsPath = path.join(dataDir, "settings.json");

async function ensureStore(filePath: string) {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(filePath, "utf8");
  } catch {
    await writeFile(filePath, "[]", "utf8");
  }
}

async function readData<T>(filePath: string): Promise<T[]> {
  await ensureStore(filePath);
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T[];
}

async function writeData<T>(filePath: string, data: T[]) {
  await ensureStore(filePath);
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

type SubmissionRow = {
  id: string;
  memorial_key: string;
  name: string | null;
  message: string;
  files: Submission["files"];
  status: SubmissionStatus;
  created_at: string;
  ai_confidence: number | null;
  ai_reason: string | null;
};

type PhotoRow = {
  id: string;
  memorial_key: string;
  source_submission_id: string | null;
  image_url: string;
  caption: string | null;
  name: string | null;
  approved: boolean;
  featured: boolean;
  created_at: string;
};

type StoryRow = {
  id: string;
  memorial_key: string;
  source_submission_id: string | null;
  title: string | null;
  body: string;
  cover_image: string | null;
  author_name: string | null;
  approved: boolean;
  featured: boolean;
  created_at: string;
};

type SiteSettingsRow = {
  memorial_key: string;
  submission_mode: SubmissionMode;
};

function mapSubmissionRow(row: SubmissionRow): Submission {
  return {
    id: row.id,
    memorialKey: row.memorial_key,
    name: row.name,
    message: row.message,
    files: row.files ?? [],
    status: row.status,
    createdAt: row.created_at,
    aiConfidence: row.ai_confidence ?? undefined,
    aiReason: row.ai_reason ?? undefined
  };
}

function mapPhotoRow(row: PhotoRow): Photo {
  return {
    id: row.id,
    memorialKey: row.memorial_key,
    sourceSubmissionId: row.source_submission_id,
    imageUrl: row.image_url,
    caption: row.caption,
    name: row.name,
    approved: row.approved,
    featured: row.featured,
    createdAt: row.created_at
  };
}

function mapStoryRow(row: StoryRow): Story {
  return {
    id: row.id,
    memorialKey: row.memorial_key,
    sourceSubmissionId: row.source_submission_id,
    title: row.title,
    body: row.body,
    coverImage: row.cover_image,
    authorName: row.author_name,
    approved: row.approved,
    featured: row.featured,
    createdAt: row.created_at
  };
}

async function ensureSettings() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(settingsPath, "utf8");
  } catch {
    await writeFile(settingsPath, JSON.stringify({ submissionMode: "locked" }, null, 2), "utf8");
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("memorial_key, submission_mode")
      .eq("memorial_key", memorialConfig.key)
      .maybeSingle<SiteSettingsRow>();

    if (error) {
      throw error;
    }

    return {
      memorialKey: memorialConfig.key,
      submissionMode: data?.submission_mode === "open" ? "open" : "locked"
    };
  }

  await ensureSettings();
  const raw = await readFile(settingsPath, "utf8");
  const parsed = JSON.parse(raw) as Partial<SiteSettings>;

  return {
    memorialKey: memorialConfig.key,
    submissionMode: parsed.submissionMode === "open" ? "open" : "locked"
  };
}

export async function updateSiteSettings(mode: SubmissionMode): Promise<SiteSettings> {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("site_settings").upsert(
      {
        memorial_key: memorialConfig.key,
        submission_mode: mode
      },
      {
        onConflict: "memorial_key"
      }
    );

    if (error) {
      throw error;
    }

    return { memorialKey: memorialConfig.key, submissionMode: mode };
  }

  const nextSettings: SiteSettings = { submissionMode: mode };
  await ensureSettings();
  await writeFile(settingsPath, JSON.stringify(nextSettings, null, 2), "utf8");
  return nextSettings;
}

// --- Submissions ---

export async function listSubmissions(status?: SubmissionStatus) {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("submissions")
      .select("*")
      .eq("memorial_key", memorialConfig.key)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.returns<SubmissionRow[]>();

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapSubmissionRow);
  }

  const submissions = await readData<Submission>(submissionsPath);
  const sorted = submissions
    .filter((s) => (s.memorialKey ?? memorialConfig.key) === memorialConfig.key)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return status ? sorted.filter((s) => s.status === status) : sorted;
}

export async function getSubmissionById(id: string) {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", id)
      .eq("memorial_key", memorialConfig.key)
      .maybeSingle<SubmissionRow>();

    if (error) {
      throw error;
    }

    return data ? mapSubmissionRow(data) : null;
  }

  const submissions = await readData<Submission>(submissionsPath);
  return submissions.find((s) => s.id === id && (s.memorialKey ?? memorialConfig.key) === memorialConfig.key) ?? null;
}

export async function createSubmission(input: Omit<Submission, "id" | "createdAt">) {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    const row: Omit<SubmissionRow, "created_at"> & { created_at?: string } = {
      id: createId(),
      memorial_key: input.memorialKey,
      name: input.name,
      message: input.message,
      files: input.files,
      status: input.status,
      ai_confidence: input.aiConfidence ?? null,
      ai_reason: input.aiReason ?? null
    };

    const { data, error } = await supabase.from("submissions").insert(row).select("*").single<SubmissionRow>();

    if (error) {
      throw error;
    }

    return mapSubmissionRow(data);
  }

  const submissions = await readData<Submission>(submissionsPath);
  const submission: Submission = {
    ...input,
    id: createId(),
    createdAt: new Date().toISOString()
  };

  submissions.push(submission);
  await writeData(submissionsPath, submissions);
  return submission;
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus, aiReason?: string, aiConfidence?: number) {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("submissions")
      .update({
        status,
        ai_reason: aiReason,
        ai_confidence: aiConfidence
      })
      .eq("id", id)
      .eq("memorial_key", memorialConfig.key)
      .select("*")
      .maybeSingle<SubmissionRow>();

    if (error) {
      throw error;
    }

    return data ? mapSubmissionRow(data) : null;
  }

  const submissions = await readData<Submission>(submissionsPath);
  const index = submissions.findIndex((s) => s.id === id);

  if (index === -1) return null;

  submissions[index] = {
    ...submissions[index],
    status,
    aiReason: aiReason ?? submissions[index].aiReason,
    aiConfidence: aiConfidence ?? submissions[index].aiConfidence
  };

  await writeData(submissionsPath, submissions);
  return submissions[index];
}

export async function deleteSubmission(id: string) {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    const { error, count } = await supabase
      .from("submissions")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("memorial_key", memorialConfig.key);

    if (error) {
      throw error;
    }

    return Boolean(count);
  }

  const submissions = await readData<Submission>(submissionsPath);
  const nextSubmissions = submissions.filter((submission) => submission.id !== id);

  if (nextSubmissions.length === submissions.length) {
    return false;
  }

  await writeData(submissionsPath, nextSubmissions);
  return true;
}

// --- Photos ---

export async function listPhotos(onlyApproved = true) {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("photos")
      .select("*")
      .eq("memorial_key", memorialConfig.key)
      .order("created_at", { ascending: false });

    if (onlyApproved) {
      query = query.eq("approved", true);
    }

    const { data, error } = await query.returns<PhotoRow[]>();

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapPhotoRow);
  }

  const photos = await readData<Photo>(photosPath);
  const sorted = photos
    .filter((p) => (p.memorialKey ?? memorialConfig.key) === memorialConfig.key)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return onlyApproved ? sorted.filter((p) => p.approved) : sorted;
}

export async function createPhoto(input: Omit<Photo, "id" | "createdAt">) {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    const row = {
      id: createId(),
      memorial_key: input.memorialKey,
      source_submission_id: input.sourceSubmissionId ?? null,
      image_url: input.imageUrl,
      caption: input.caption,
      name: input.name,
      approved: input.approved,
      featured: input.featured
    };

    const { data, error } = await supabase.from("photos").insert(row).select("*").single<PhotoRow>();

    if (error) {
      throw error;
    }

    return mapPhotoRow(data);
  }

  const photos = await readData<Photo>(photosPath);
  const photo: Photo = { ...input, id: createId(), createdAt: new Date().toISOString() };
  photos.push(photo);
  await writeData(photosPath, photos);
  return photo;
}

export async function deletePhotosBySubmissionId(submissionId: string) {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("photos")
      .delete()
      .eq("memorial_key", memorialConfig.key)
      .eq("source_submission_id", submissionId);

    if (error) {
      throw error;
    }

    return;
  }

  const photos = await readData<Photo>(photosPath);
  const nextPhotos = photos.filter((photo) => photo.sourceSubmissionId !== submissionId);
  await writeData(photosPath, nextPhotos);
}

// --- Stories ---

export async function listStories(onlyApproved = true) {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("stories")
      .select("*")
      .eq("memorial_key", memorialConfig.key)
      .order("created_at", { ascending: false });

    if (onlyApproved) {
      query = query.eq("approved", true);
    }

    const { data, error } = await query.returns<StoryRow[]>();

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapStoryRow);
  }

  const stories = await readData<Story>(storiesPath);
  const sorted = stories
    .filter((s) => (s.memorialKey ?? memorialConfig.key) === memorialConfig.key)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return onlyApproved ? sorted.filter((s) => s.approved) : sorted;
}

export async function createStory(input: Omit<Story, "id" | "createdAt">) {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    if (input.sourceSubmissionId) {
      const { data: existingStory, error: existingError } = await supabase
        .from("stories")
        .select("*")
        .eq("memorial_key", input.memorialKey)
        .eq("source_submission_id", input.sourceSubmissionId)
        .maybeSingle<StoryRow>();

      if (existingError) {
        throw existingError;
      }

      if (existingStory) {
        return mapStoryRow(existingStory);
      }
    }

    const row = {
      id: createId(),
      memorial_key: input.memorialKey,
      source_submission_id: input.sourceSubmissionId ?? null,
      title: input.title,
      body: input.body,
      cover_image: input.coverImage,
      author_name: input.authorName,
      approved: input.approved,
      featured: input.featured
    };

    const { data, error } = await supabase.from("stories").insert(row).select("*").single<StoryRow>();

    if (error) {
      throw error;
    }

    return mapStoryRow(data);
  }

  const stories = await readData<Story>(storiesPath);
  if (input.sourceSubmissionId) {
    const existingStory = stories.find(
      (story) =>
        (story.memorialKey ?? memorialConfig.key) === input.memorialKey &&
        story.sourceSubmissionId === input.sourceSubmissionId
    );

    if (existingStory) {
      return existingStory;
    }
  }

  const story: Story = { ...input, id: createId(), createdAt: new Date().toISOString() };
  stories.push(story);
  await writeData(storiesPath, stories);
  return story;
}

export async function deleteStoriesBySubmissionId(submissionId: string) {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("stories")
      .delete()
      .eq("memorial_key", memorialConfig.key)
      .eq("source_submission_id", submissionId);

    if (error) {
      throw error;
    }

    return;
  }

  const stories = await readData<Story>(storiesPath);
  const nextStories = stories.filter((story) => story.sourceSubmissionId !== submissionId);
  await writeData(storiesPath, nextStories);
}

export async function syncMissingStoriesFromApprovedSubmissions() {
  const approvedSubmissions = await listSubmissions("approved");

  for (const submission of approvedSubmissions) {
    if (!submission.message.trim()) {
      continue;
    }

    const coverImage = submission.files.find((file) => file.kind === "image")?.url || null;

    await createStory({
      memorialKey: submission.memorialKey,
      sourceSubmissionId: submission.id,
      title: submission.message.trim().length <= 60 ? submission.message.trim() : null,
      body: submission.message,
      coverImage,
      authorName: submission.name,
      approved: true,
      featured: false
    });
  }
}
