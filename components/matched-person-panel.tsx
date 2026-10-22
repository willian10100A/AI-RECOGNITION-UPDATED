'use client'

import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  ShieldCheck,
  Percent,
} from 'lucide-react'
import type { RecognitionMatch } from '@/lib/types'

interface MatchedPersonPanelProps {
  matches: RecognitionMatch[]
  scanning: boolean
}

export function MatchedPersonPanel({ matches, scanning }: MatchedPersonPanelProps) {
  if (matches.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        {scanning ? (
          <>
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-2 border-primary/30 bg-primary/5" />
              <div className="absolute inset-0 animate-ping rounded-full border-2 border-primary/20" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Scanning...</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Looking for faces in the camera feed
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-border bg-secondary/50">
              <User className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No Match</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Start the camera to begin face recognition
              </p>
            </div>
          </>
        )}
      </div>
    )
  }

  // primary match is first in list
  const primary = matches[0]
  const confidencePercent = Math.round(primary.confidence * 100)
  const person = primary.person

  const formattedDob = person.date_of_birth
    ? new Date(person.date_of_birth).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Match header */}
      <div className="flex flex-col items-center gap-4 border-b border-border p-6">
        <div className="relative">
          {person.photo_base64 ? (
            <img
              src={person.photo_base64}
              alt={`Photo of ${person.name}`}
              className="h-28 w-28 rounded-full border-3 border-primary object-cover shadow-lg shadow-primary/20"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-3 border-primary bg-secondary">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow">
            <ShieldCheck className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-balance text-xl font-bold text-foreground">
            {person.name}
          </h2>
          <div className="mt-2 flex items-center justify-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Percent className="h-3.5 w-3.5" />
            {confidencePercent}% confidence
          </div>
        </div>
      </div>

      {/* Person details */}
      <div className="flex flex-col gap-4 p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Person Details
        </h3>

        <div className="flex flex-col gap-3">
          {person.email && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">
                  {person.email}
                </p>
              </div>
            </div>
          )}

          {person.phone && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium text-foreground">
                  {person.phone}
                </p>
              </div>
            </div>
          )}

          {person.address && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm font-medium text-foreground">
                  {person.address}
                </p>
              </div>
            </div>
          )}

          {formattedDob && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date of Birth</p>
                <p className="text-sm font-medium text-foreground">
                  {formattedDob}
                </p>
              </div>
            </div>
          )}

          {person.notes && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="text-sm text-foreground">{person.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {matches.length > 1 && (
        <div className="border-t border-border p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Other Matches
          </h3>
          <ul className="mt-2 flex flex-col gap-2">
            {matches.slice(1).map((m, idx) => (
              <li key={idx} className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {m.person.name}
                </span>
                <span className="text-xs font-medium text-primary">
                  {Math.round(m.confidence * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
