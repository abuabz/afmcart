"use client"

import { useState } from "react"

interface DropZoneProps {
  onFiles: (files: File[]) => void
  multiple?: boolean
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

// Accepts dragged image files only; ignores internal drags (e.g. gallery reordering)
export function DropZone({ onFiles, multiple = false, disabled, className = "", children }: DropZoneProps) {
  const [active, setActive] = useState(false)
  const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer.types).includes("Files")

  return (
    <div
      className={`${className} ${active ? "ring-2 ring-indigo-500 ring-offset-2 bg-indigo-50/50" : ""} transition-all`}
      onDragOver={(e) => {
        if (!hasFiles(e)) return
        e.preventDefault()
        if (!disabled) setActive(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setActive(false)
      }}
      onDrop={(e) => {
        if (!hasFiles(e)) return
        e.preventDefault()
        setActive(false)
        if (disabled) return
        const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"))
        if (files.length) onFiles(multiple ? files : files.slice(0, 1))
      }}
    >
      {children}
    </div>
  )
}
