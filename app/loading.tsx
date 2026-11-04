import React from "react"
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-yellow-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-yellow-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-500 font-bold tracking-widest uppercase text-sm animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  )
}
