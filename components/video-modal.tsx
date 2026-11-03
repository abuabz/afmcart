"use client"

import * as React from "react"
import { X, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoSrc: string
  title: string
}

export function VideoModal({ isOpen, onClose, videoSrc, title }: VideoModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
        <Button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
        >
          <X className="w-5 h-5" />
        </Button>
        <video src={videoSrc} controls autoPlay className="w-full h-full " title={title}>
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  )
}

interface VideoThumbnailProps {
  videoSrc: string
  thumbnailSrc: string
  title: string
  onClick: () => void
}

export function VideoThumbnail({ videoSrc, thumbnailSrc, title, onClick }: VideoThumbnailProps) {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-500 hover:scale-105"
    >
      <Image
        src={thumbnailSrc || "/placeholder.svg"}
        alt={title}
        width={300}
        height={300}
        className="w-full h-48 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Play className="w-8 h-8 text-white ml-1" />
        </div>
      </div>
      <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
    </div>
  )
}
