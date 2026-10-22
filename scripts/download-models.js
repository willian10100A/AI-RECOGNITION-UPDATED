import fs from 'fs'
import path from 'path'

const MODELS_DIR = path.join(process.cwd(), 'public', 'models')

// source for the face-api weights; the files are downloaded at build time
// DO NOT change this to a third-party host as fetching models from untrusted
// domains may introduce security or privacy risks.
const MODEL_BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'

const MODEL_FILES = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
]

async function downloadModels() {
  if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true })
  }

  for (const file of MODEL_FILES) {
    const filePath = path.join(MODELS_DIR, file)
    if (fs.existsSync(filePath)) {
      console.log(`Skipping ${file} (already exists)`)
      continue
    }

    console.log(`Downloading ${file}...`)
    try {
      const response = await fetch(`${MODEL_BASE_URL}/${file}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const buffer = Buffer.from(await response.arrayBuffer())
      fs.writeFileSync(filePath, buffer)
      console.log(`  Downloaded ${file} (${(buffer.length / 1024).toFixed(1)} KB)`)
    } catch (err) {
      console.error(`  Failed to download ${file}:`, err)
    }
  }

  console.log('Model download complete!')
}

downloadModels()
