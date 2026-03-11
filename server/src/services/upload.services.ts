import { promises as fs } from "fs";
import path from "path";

export async function saveImage(file: File, prefix: string, userId: string) {
  const ext = path.extname(file.name);
  const filename = `${prefix}_${userId}_${Date.now()}${ext}`;
  const uploadPath = path.join(process.cwd(), "uploads", filename);

  await fs.writeFile(uploadPath, Buffer.from(await file.arrayBuffer()));

  return `/uploads/${filename}`;
}