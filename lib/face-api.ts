import type * as FaceApi from '@vladmandic/face-api'

type FaceApiModule = typeof FaceApi

let faceApiInitialization: Promise<FaceApiModule> | undefined

export function loadFaceApiModels(): Promise<FaceApiModule> {
  if (!faceApiInitialization) {
    faceApiInitialization = (async () => {
      const faceapi = await import('@vladmandic/face-api')

      // Wait for TensorFlow.js to initialize its selected backend (often WASM)
      // before loading model weights or running inference.
      const tf = faceapi.tf as typeof faceapi.tf & {
        ready: () => Promise<void>
      }
      await tf.ready()

      const modelUrl = '/models'
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl),
        faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
        faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl),
      ])

      return faceapi
    })().catch((error) => {
      faceApiInitialization = undefined
      throw error
    })
  }

  return faceApiInitialization
}
