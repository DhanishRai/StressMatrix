import { useEffect, useRef, useState } from 'react'
import { FaceMesh } from '@mediapipe/face_mesh'

function distance(a, b) {
  if (!a || !b) return 0
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = (a.z || 0) - (b.z || 0)
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export default function useFaceDetection(videoRef) {
  const [facialTensionScore, setFacialTensionScore] = useState(0)
  const faceMeshRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!videoRef || !videoRef.current) return undefined

    let mounted = true

    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    })

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    faceMesh.onResults((results) => {
      if (!mounted) return
      const landmarks = results.multiFaceLandmarks && results.multiFaceLandmarks[0]
      if (!landmarks || landmarks.length === 0) {
        setFacialTensionScore(0)
        return
      }

      // compute reference face width using outer eye landmarks (33, 263)
      const leftEye = landmarks[33]
      const rightEye = landmarks[263]
      const faceWidth = Math.max(distance(leftEye, rightEye), 1e-6)

      // eyebrow gap and jaw gap as requested
      const eyebrowGap = distance(landmarks[105], landmarks[334])
      const jawGap = distance(landmarks[152], landmarks[10])

      // normalize relative to face width and clamp to 0..1
      const normEyebrow = Math.min(1, Math.max(0, eyebrowGap / faceWidth))
      const normJaw = Math.min(1, Math.max(0, jawGap / faceWidth))

      // facial tension score: average of normalized features
      const score = (normEyebrow + normJaw) / 2
      setFacialTensionScore(Number(score.toFixed(3)))
    })

    faceMeshRef.current = faceMesh

    // detection loop
    const detect = async () => {
      if (!mounted) return
      try {
        const video = videoRef.current
        if (video && video.readyState >= 2) {
          await faceMesh.send({ image: video })
        }
      } catch (err) {
        // ignore per-frame errors
      }
      rafRef.current = requestAnimationFrame(detect)
    }

    rafRef.current = requestAnimationFrame(detect)

    return () => {
      mounted = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      try {
        faceMesh.close && faceMesh.close()
      } catch (_) {}
    }
  }, [videoRef])

  return { facialTensionScore }
}
