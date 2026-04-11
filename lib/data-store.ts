import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

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

async function ensureSettings() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(settingsPath, "utf8");
  } catch {
    await writeFile(settingsPath, JSON.stringify({ submissionMode: "locked" }, null, 2), "utf8");
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  await ensureSettings();
  const raw = await readFile(settingsPath, "utf8");
  const parsed = JSON.parse(raw) as Partial<SiteSettings>;

  return {
    submissionMode: parsed.submissionMode === "open" ? "open" : "locked"
  };
}

export async function updateSiteSettings(mode: SubmissionMode): Promise<SiteSettings> {
  const nextSettings: SiteSettings = { submissionMode: mode };
  await ensureSettings();
  await writeFile(settingsPath, JSON.stringify(nextSettings, null, 2), "utf8");
  return nextSettings;
}

// --- Submissions ---

export async function listSubmissions(status?: SubmissionStatus) {
  const submissions = await readData<Submission>(submissionsPath);
  const sorted = submissions.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return status ? sorted.filter((s) => s.status === status) : sorted;
}

export async function getSubmissionById(id: string) {
  const submissions = await readData<Submission>(submissionsPath);
  return submissions.find((s) => s.id === id) ?? null;
}

export async function createSubmission(input: Omit<Submission, "id" | "createdAt">) {
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
  const photos = await readData<Photo>(photosPath);
  const sorted = photos.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return onlyApproved ? sorted.filter((p) => p.approved) : sorted;
}

export async function createPhoto(input: Omit<Photo, "id" | "createdAt">) {
  const photos = await readData<Photo>(photosPath);
  const photo: Photo = { ...input, id: createId(), createdAt: new Date().toISOString() };
  photos.push(photo);
  await writeData(photosPath, photos);
  return photo;
}

export async function deletePhotosBySubmissionId(submissionId: string) {
  const photos = await readData<Photo>(photosPath);
  const nextPhotos = photos.filter((photo) => photo.sourceSubmissionId !== submissionId);
  await writeData(photosPath, nextPhotos);
}

// --- Stories ---

export async function listStories(onlyApproved = true) {
  const stories = await readData<Story>(storiesPath);
  const sorted = stories.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return onlyApproved ? sorted.filter((s) => s.approved) : sorted;
}

export async function createStory(input: Omit<Story, "id" | "createdAt">) {
  const stories = await readData<Story>(storiesPath);
  const story: Story = { ...input, id: createId(), createdAt: new Date().toISOString() };
  stories.push(story);
  await writeData(storiesPath, stories);
  return story;
}

export async function deleteStoriesBySubmissionId(submissionId: string) {
  const stories = await readData<Story>(storiesPath);
  const nextStories = stories.filter((story) => story.sourceSubmissionId !== submissionId);
  await writeData(storiesPath, nextStories);
}
