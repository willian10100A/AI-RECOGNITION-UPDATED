export interface Person {
  id: number
  name: string
  email: string | null
  phone: string | null
  address: string | null
  date_of_birth: string | null
  notes: string | null
  photo_base64: string | null
  face_descriptor: number[] | null
  created_at: string
  updated_at: string
}

export interface PersonFormData {
  name: string
  email: string
  phone: string
  address: string
  date_of_birth: string
  notes: string
  photo_base64: string
}

export interface RecognitionMatch {
  person: Person
  distance: number
  confidence: number
}

export interface RecognitionLog {
  id: number
  person_id: number
  confidence: number
  recognized_at: string
  person_name?: string
}
