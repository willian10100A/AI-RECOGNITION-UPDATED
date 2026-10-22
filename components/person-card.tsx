'use client'

import { User, Edit2, Trash2, Mail, Phone, MapPin, Calendar, ScanFace } from 'lucide-react'
import type { Person } from '@/lib/types'

interface PersonCardProps {
  person: Person
  onEdit: (person: Person) => void
  onDelete: (person: Person) => void
  isSelected?: boolean
  onSelect?: (selected: boolean) => void
}

export function PersonCard({ person, onEdit, onDelete, isSelected = false, onSelect }: PersonCardProps) {
  const hasFaceData = !!person.face_descriptor
  const formattedDob = person.date_of_birth
    ? new Date(person.date_of_birth).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/30">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {person.photo_base64 ? (
          <img
            src={person.photo_base64}
            alt={`Photo of ${person.name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        {hasFaceData && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground">
            <ScanFace className="h-3 w-3" />
            Face Enrolled
          </div>
        )}
        <div className="absolute right-2 top-2 flex gap-1">
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="mr-1 h-4 w-4 rounded border-border bg-white/90 text-primary focus:ring-primary"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onEdit(person)}
              className="rounded-full bg-black/60 p-1.5 text-foreground backdrop-blur transition-colors hover:bg-black/80"
              aria-label={`Edit ${person.name}`}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(person)}
              className="rounded-full bg-black/60 p-1.5 text-destructive backdrop-blur transition-colors hover:bg-black/80"
              aria-label={`Delete ${person.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3">
        <h3 className="text-pretty text-sm font-semibold text-foreground">
          {person.name}
        </h3>

        <div className="flex flex-col gap-1">
          {person.email && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{person.email}</span>
            </div>
          )}
          {person.phone && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0" />
              <span>{person.phone}</span>
            </div>
          )}
          {person.address && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{person.address}</span>
            </div>
          )}
          {formattedDob && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 shrink-0" />
              <span>{formattedDob}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
