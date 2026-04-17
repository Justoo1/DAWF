import fs from "fs/promises"
import path from "path"

const RELATIVE_PREFIX = path.posix.join("uploads", "policies")

function uploadsDirAbsolute() {
  return path.join(process.cwd(), "uploads", "policies")
}

export function isAllowedPolicyAttachmentPath(relativePath: string): boolean {
  const norm = path.posix.normalize(relativePath.replace(/\\/g, "/"))
  if (norm.includes("..")) return false
  return norm.startsWith(`${RELATIVE_PREFIX}/`)
}

function absoluteFromRelative(relativePath: string): string | null {
  if (!isAllowedPolicyAttachmentPath(relativePath)) return null
  return path.join(process.cwd(), ...relativePath.split("/"))
}

export async function ensurePolicyUploadsDir() {
  await fs.mkdir(uploadsDirAbsolute(), { recursive: true })
}

/** Writes PDF bytes and returns a POSIX relative path stored in the DB (e.g. uploads/policies/cuid.pdf). */
export async function writePolicyAttachment(policyId: string, buffer: Buffer): Promise<string> {
  await ensurePolicyUploadsDir()
  const fileName = `${policyId}.pdf`
  const abs = path.join(uploadsDirAbsolute(), fileName)
  await fs.writeFile(abs, buffer)
  return path.posix.join(RELATIVE_PREFIX, fileName)
}

export async function removePolicyAttachmentFile(relativePath: string | null | undefined) {
  if (!relativePath) return
  const abs = absoluteFromRelative(relativePath)
  if (!abs) return
  await fs.unlink(abs).catch(() => {})
}

export async function readPolicyAttachment(relativePath: string): Promise<Buffer | null> {
  const abs = absoluteFromRelative(relativePath)
  if (!abs) return null
  try {
    return await fs.readFile(abs)
  } catch {
    return null
  }
}
