'use client'

import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { PhotoCapture } from './photo-capture'
import type { Person, PersonFormData } from '@/lib/types'

interface PersonFormProps {
  person?: Person | null
  onSave: () => void
  onCancel: () => void
}

export function PersonForm({ person, onSave, onCancel }: PersonFormProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<PersonFormData>({
    name: person?.name || '',
    email: person?.email || '',
    phone: person?.phone || '',
    address: person?.address || '',
    date_of_birth: person?.date_of_birth
      ? person.date_of_birth.split('T')[0]
      : '',
    notes: person?.notes || '',
    photo_base64: person?.photo_base64 || '',
  })

  const updateField = (field: keyof PersonFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }

    setLoading(true)
    try {
      let faceDescriptor: number[] | null = null

      if (form.photo_base64) {
        try {
          const faceapi = await import('@vladmandic/face-api')

          const MODEL_URL = '/models' // must be hosted locally; external URLs are forbidden
          await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          ])

          const img = new Image()
          img.crossOrigin = 'anonymous'
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve()
            img.onerror = reject
            img.src = form.photo_base64
          })

          const detection = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor()

          if (detection) {
            faceDescriptor = Array.from(detection.descriptor)
            toast.success('Face detected and encoded successfully')
          } else {
            toast.warning(
              'No face detected in photo. Person saved without face data.'
            )
          }
        } catch (faceError) {
          console.error('Face detection failed:', faceError)
          toast.warning(
            'Face detection unavailable. Person saved without face data.'
          )
        }
      }

      const url = person ? `/api/persons/${person.id}` : '/api/persons'
      const method = person ? 'PUT' : 'POST'

      // log the size of the photo to aid debugging
      console.debug('submitting photo size', form.photo_base64?.length)
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          face_descriptor: faceDescriptor,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        if (res.status === 401) {
          // not authenticated any more; send user to login
          window.location.href = '/login'
          throw new Error('Unauthorized')
        }
        throw new Error(data.error || 'Failed to save person')
      }

      toast.success(person ? 'Person updated' : 'Person added')
      onSave()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save person'
      )
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 overflow-y-auto"
    >
      <PhotoCapture
        value={form.photo_base64}
        onChange={(val) => updateField('photo_base64', val)}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">
          Full Name <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="John Doe"
          required
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="john@example.com"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="+1 (555) 000-0000"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Address</label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => updateField('address', e.target.value)}
          placeholder="123 Main St, City, State"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">
          Date of Birth
        </label>
        <input
          type="date"
          value={form.date_of_birth}
          onChange={(e) => updateField('date_of_birth', e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Additional notes..."
          rows={3}
          className={inputClass + ' resize-none'}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {loading
            ? 'Processing face...'
            : person
              ? 'Update Person'
              : 'Add Person'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
