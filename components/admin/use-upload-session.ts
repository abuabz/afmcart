"use client"

import { useRef } from "react"

// Tracks files uploaded while a form is open so unsaved ones can be removed from disk.
// The server only deletes files no saved record references, so this is safe to over-call.
export function useUploadSession() {
  const uploaded = useRef<string[]>([])

  const track = (url: string) => {
    uploaded.current.push(url)
  }

  const discard = (keep: string[] = []) => {
    const urls = uploaded.current.filter((u) => !keep.includes(u))
    uploaded.current = []
    if (urls.length === 0) return
    fetch("/api/admin/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls }),
      keepalive: true,
    }).catch(() => {})
  }

  return { track, discard }
}
