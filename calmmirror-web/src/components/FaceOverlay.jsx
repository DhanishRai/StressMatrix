import React, { useRef, useEffect, useState } from 'react'
import useFaceDetection from '../hooks/useFaceDetection'

export default function FaceOverlay({ videoRef }) {
  const canvasRef = useRef(null)
  const { facialTensionScore } = useFaceDetection(videoRef)
  const [particles, setParticles] = useState([])
  const lastRelaxedRef = useRef(false)

  // Ideal calm face landmark positions (normalized)
  const IDEAL_CALM = {
    leftBrow: { x: 0.24, y: 0.28 },
    rightBrow: { x: 0.76, y: 0.28 },
    jawCenter: { x: 0.5, y: 0.62 },
    jawTip: { x: 0.5, y: 0.7 },
    leftEye: { x: 0.2, y: 0.35 },
    rightEye: { x: 0.8, y: 0.35 },
  }

  const RELAXATION_THRESHOLD = 0.15
  const isRelaxed = facialTensionScore < RELAXATION_THRESHOLD

  // Trigger particle burst on relaxation
  useEffect(() => {
    if (isRelaxed && !lastRelaxedRef.current) {
      // Transition to relaxed state - spawn particles
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        angle: (i / 12) * Math.PI * 2,
        delay: i * 30,
      }))
      setParticles(newParticles)
      lastRelaxedRef.current = true

      // Clear particles after animation
      setTimeout(() => setParticles([]), 1200)
    } else if (!isRelaxed && lastRelaxedRef.current) {
      lastRelaxedRef.current = false
    }
  }, [isRelaxed])

  // Draw canvas overlay
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !videoRef?.current) return

    const video = videoRef.current
    const rect = video.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw calm face outline
    const w = canvas.width
    const h = canvas.height

    // Stroke style based on relaxation
    ctx.strokeStyle = isRelaxed ? 'rgba(34, 197, 94, 0.8)' : 'rgba(200, 200, 200, 0.4)'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Glow effect when relaxed
    if (isRelaxed) {
      ctx.shadowBlur = 20
      ctx.shadowColor = 'rgba(34, 197, 94, 0.6)'
    } else {
      ctx.shadowBlur = 0
    }

    // Draw relaxed eyebrows (arc paths)
    const browHeight = h * 0.08
    const browWidth = w * 0.12

    // Left brow
    ctx.beginPath()
    ctx.arc(w * 0.25, h * 0.28, browWidth / 2, Math.PI * 0.2, Math.PI * 0.8, false)
    ctx.stroke()

    // Right brow
    ctx.beginPath()
    ctx.arc(w * 0.75, h * 0.28, browWidth / 2, Math.PI * 0.2, Math.PI * 0.8, false)
    ctx.stroke()

    // Draw soft eyes (circles)
    const eyeRadius = w * 0.04
    ctx.beginPath()
    ctx.arc(w * 0.2, h * 0.35, eyeRadius, 0, Math.PI * 2)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(w * 0.8, h * 0.35, eyeRadius, 0, Math.PI * 2)
    ctx.stroke()

    // Draw relaxed jaw (bezier curve)
    ctx.beginPath()
    ctx.moveTo(w * 0.15, h * 0.48)
    ctx.bezierCurveTo(
      w * 0.15, h * 0.62,
      w * 0.5, h * 0.72,
      w * 0.85, h * 0.48
    )
    ctx.stroke()

    // Draw soft mouth (small arc)
    ctx.beginPath()
    ctx.arc(w * 0.5, h * 0.58, w * 0.08, 0, Math.PI, false)
    ctx.stroke()
  }, [videoRef, isRelaxed])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="face-overlay-canvas"
        aria-hidden="true"
      />
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            '--angle': `${p.angle}rad`,
            '--delay': `${p.delay}ms`,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  )
}
