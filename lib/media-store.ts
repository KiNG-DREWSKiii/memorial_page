import { mkdir, rm, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

import { memorialConfig, supabaseStorageBucket } from "@/lib/config";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import type { MediaAsset } from "@/lib/types";
import { createId } from "@/lib/utils";

const uploadDir = path.join(process.cwd(), "public", "uploads");

function getExtension(fileName: string) {
  const extension = path.extname(fileName).slice(1).toLowerCase();
  return extension || "bin";
}

function getPublicUploadPath(fileName: string) {
  return path.join(uploadDir, fileName);
}

async function optimizeImage(bytes: Buffer) {
  const full = await sharp(bytes)
    .rotate()
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const thumb = await sharp(bytes)
    .rotate()
    .resize({ width: 700, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toBuffer();

  return { full, thumb };
}

async function uploadToSupabase(pathName: string, body: Buffer, contentType: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(supabaseStorageBucket).upload(pathName, body, {
    contentType,
    upsert: false
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(supabaseStorageBucket).getPublicUrl(pathName);
  return data.publicUrl;
}

export async function saveMediaFiles(files: File[], captions: string[] = []) {
  await mkdir(uploadDir, { recursive: true });

  const assets = await Promise.all(
    files.map(async (file, index) => {
      const bytes = Buffer.from(await file.arrayBuffer());
      const kind = file.type.startsWith("video/") ? "video" : "image";
      const caption = captions[index]?.trim() || null;

      if (kind === "image") {
        const assetId = createId();
        const { full, thumb } = await optimizeImage(bytes);
        const imagePath = `${memorialConfig.key}/images/${assetId}.webp`;
        const thumbPath = `${memorialConfig.key}/thumbs/${assetId}.webp`;

        let url: string;
        let thumbnailUrl: string;

        if (isSupabaseConfigured()) {
          url = await uploadToSupabase(imagePath, full, "image/webp");
          thumbnailUrl = await uploadToSupabase(thumbPath, thumb, "image/webp");
        } else {
          const localImageName = `${assetId}.webp`;
          const localThumbName = `${assetId}.thumb.webp`;
          await writeFile(getPublicUploadPath(localImageName), full);
          await writeFile(getPublicUploadPath(localThumbName), thumb);
          url = `/uploads/${localImageName}`;
          thumbnailUrl = `/uploads/${localThumbName}`;
        }

        const asset: MediaAsset = {
          url,
          thumbnailUrl,
          kind,
          mimeType: "image/webp",
          fileName: file.name,
          caption
        };

        return asset;
      }

      const extension = getExtension(file.name);
      const fileName = `${createId()}.${extension}`;
      let url: string;

      if (isSupabaseConfigured()) {
        const videoPath = `${memorialConfig.key}/videos/${fileName}`;
        url = await uploadToSupabase(videoPath, bytes, file.type || "application/octet-stream");
      } else {
        await writeFile(getPublicUploadPath(fileName), bytes);
        url = `/uploads/${fileName}`;
      }

      const asset: MediaAsset = {
        url,
        thumbnailUrl: null,
        kind,
        mimeType: file.type || "application/octet-stream",
        fileName: file.name,
        caption
      };

      return asset;
    })
  );

  return assets;
}

export async function removeMediaFiles(media: MediaAsset[]) {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdminClient();
    const paths = media.flatMap((asset) => [asset.url, asset.thumbnailUrl].filter(Boolean) as string[]);
    const bucketPrefix = `/storage/v1/object/public/${supabaseStorageBucket}/`;
    const storagePaths = paths
      .map((url) => {
        const index = url.indexOf(bucketPrefix);
        return index >= 0 ? decodeURIComponent(url.slice(index + bucketPrefix.length)) : null;
      })
      .filter((value): value is string => Boolean(value));

    if (storagePaths.length > 0) {
      await supabase.storage.from(supabaseStorageBucket).remove(storagePaths);
    }
    return;
  }

  await Promise.all(
    media.flatMap((asset) => [asset.url, asset.thumbnailUrl].filter(Boolean) as string[]).map(async (url) => {
      const fileName = path.basename(url);
      const targetPath = path.join(uploadDir, fileName);
      await rm(targetPath, { force: true });
    })
  );
}
