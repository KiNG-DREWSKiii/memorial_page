import { mkdir, rm, writeFile } from "fs/promises";
import path from "path";

import type { MediaAsset } from "@/lib/types";
import { createId } from "@/lib/utils";

const uploadDir = path.join(process.cwd(), "public", "uploads");

function getExtension(fileName: string) {
  const extension = path.extname(fileName).slice(1).toLowerCase();
  return extension || "bin";
}

export async function saveMediaFiles(files: File[]) {
  await mkdir(uploadDir, { recursive: true });

  const assets = await Promise.all(
    files.map(async (file) => {
      const bytes = Buffer.from(await file.arrayBuffer());
      const extension = getExtension(file.name);
      const fileName = `${createId()}.${extension}`;
      const targetPath = path.join(uploadDir, fileName);
      await writeFile(targetPath, bytes);

      const kind = file.type.startsWith("video/") ? "video" : "image";
      const url = `/uploads/${fileName}`;

      const asset: MediaAsset = {
        url,
        thumbnailUrl: kind === "image" ? url : null,
        kind,
        mimeType: file.type || "application/octet-stream",
        fileName: file.name
      };

      return asset;
    })
  );

  return assets;
}

export async function removeMediaFiles(media: MediaAsset[]) {
  await Promise.all(
    media.map(async (asset) => {
      const fileName = path.basename(asset.url);
      const targetPath = path.join(uploadDir, fileName);
      await rm(targetPath, { force: true });
    })
  );
}
