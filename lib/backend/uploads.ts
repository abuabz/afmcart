import path from "path"
import { existsSync } from "fs"
import { readdir, stat, unlink } from "fs/promises"
import mongoose from "mongoose"

export function getUploadDir(): string {
  return path.resolve(process.cwd(), "public", "uploads")
}

const UPLOAD_URL = /\/uploads\/([A-Za-z0-9._-]+)/g

// Soft-deleted records no longer count as using a file
function isSoftDeleted(doc: Record<string, any>) {
  if (doc.isDeleted === true) return true
  return Object.keys(doc).some((k) => k.endsWith("deleted_at") && doc[k])
}

// Filenames still referenced by any live record, in any collection
async function referencedFiles(): Promise<Set<string>> {
  const used = new Set<string>()
  const db = mongoose.connection.db
  if (!db) throw new Error("Database not connected")
  for (const { name } of await db.listCollections().toArray()) {
    const cursor = db.collection(name).find({})
    for await (const doc of cursor) {
      if (isSoftDeleted(doc)) continue
      for (const m of JSON.stringify(doc).matchAll(UPLOAD_URL)) used.add(m[1])
    }
  }
  return used
}

function toFilename(url?: string | null): string | null {
  if (!url) return null
  const m = /^\/uploads\/([A-Za-z0-9._-]+)$/.exec(url.trim())
  return m && !m[1].includes("..") ? m[1] : null
}

async function removeFile(filename: string) {
  const dir = getUploadDir()
  const target = path.resolve(dir, filename)
  if (!target.startsWith(dir + path.sep)) return false
  try {
    await unlink(target)
    return true
  } catch {
    return false
  }
}

// Call AFTER the database change. Deletes only files nothing else references.
export async function deleteUnusedUploads(urls: Array<string | null | undefined>) {
  try {
    const names = [...new Set(urls.map(toFilename).filter((n): n is string => !!n))]
    if (names.length === 0) return 0
    const used = await referencedFiles()
    let removed = 0
    for (const n of names) if (!used.has(n) && (await removeFile(n))) removed++
    return removed
  } catch (err) {
    console.error("Upload cleanup failed:", err)
    return 0
  }
}

// Removes unreferenced files; the age guard protects uploads from forms still open
export async function sweepOrphanUploads(minAgeMs = 60 * 60 * 1000, dryRun = false) {
  const dir = getUploadDir()
  if (!existsSync(dir)) return { removed: [] as string[], scanned: 0 }
  const used = await referencedFiles()
  const removed: string[] = []
  const files = await readdir(dir)
  for (const f of files) {
    if (used.has(f) || f.startsWith(".")) continue
    const s = await stat(path.join(dir, f))
    if (!s.isFile() || Date.now() - s.mtimeMs < minAgeMs) continue
    if (dryRun || (await removeFile(f))) removed.push(f)
  }
  return { removed, scanned: files.length }
}
