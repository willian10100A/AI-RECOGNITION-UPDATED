'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Camera, Upload, X, RotateCcw } from 'lucide-react'

interface PhotoCaptureProps {
  value: string
  onChange: (base64: string) => void
}

export function PhotoCapture({ value, onChange }: PhotoCaptureProps) {
  const [mode, setMode] = useState<'idle' | 'camera' | 'preview'>(() =>
    value ? 'preview' : 'idle'
  )
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    try {
      stopCamera()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setMode('camera')
    } catch (err) {
      console.error('Camera access failed:', err)
    }
  }, [stopCamera])

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  const capturePhoto = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    onChange(dataUrl)
    stopCamera()
    setMode('preview')
  }, [onChange, stopCamera])

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        onChange(base64)
        setMode('preview')
      }
      reader.readAsDataURL(file)
    },
    [onChange]
  )

  const clearPhoto = useCallback(() => {
    onChange('')
    setMode('idle')
  }, [onChange])

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-foreground">
        Photo <span className="text-muted-foreground">(for face recognition)</span>
      </label>

      {mode === 'idle' && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={startCamera}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/50 px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Camera className="h-5 w-5" />
            Use Camera
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/50 px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Upload className="h-5 w-5" />
            Upload Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {mode === 'camera' && (
        <div className="relative overflow-hidden rounded-lg border border-border">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 bg-gradient-to-t from-black/70 to-transparent px-4 py-4">
            <button
              type="button"
              onClick={() => {
                stopCamera()
                setMode('idle')
              }}
              className="rounded-full bg-secondary p-2 text-foreground transition-colors hover:bg-secondary/80"
              aria-label="Cancel"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-black/50 transition-transform hover:scale-105"
              aria-label="Capture photo"
            >
              <Camera className="h-6 w-6 text-primary-foreground" />
            </button>
            <div className="w-9" />
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {mode === 'preview' && value && (
        <div className="relative overflow-hidden rounded-lg border border-border">
          <img
            src={value}
            alt="Captured photo"
            className="w-full object-cover"
          />
          <div className="absolute right-2 top-2 flex gap-1">
            <button
              type="button"
              onClick={startCamera}
              className="rounded-full bg-black/60 p-1.5 text-foreground backdrop-blur transition-colors hover:bg-black/80"
              aria-label="Retake photo"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={clearPhoto}
              className="rounded-full bg-black/60 p-1.5 text-foreground backdrop-blur transition-colors hover:bg-black/80"
              aria-label="Remove photo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
