import React from "react"
import { Loader2 } from "lucide-react"

export default function AdminLoading() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-indigo-500 rounded-full absolute top-0 left-0 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-slate-500 font-medium animate-pulse">Loading dashboard...</p>
    </div>
  )
}
