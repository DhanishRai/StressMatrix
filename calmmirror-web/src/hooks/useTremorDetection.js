import { useEffect, useRef, useState, useCallback } from 'react'

export default function useTremorDetection() {
  const [motionStressScore, setMotionStressScore] = useState(0)
  const lastAccel = useRef({ x: 0, y: 0, z: 0 })
  const lastRotation = useRef({ alpha: 0, beta: 0, gamma: 0 })
  const lastMagnitude = useRef(0)
  const lastTimestamp = useRef(Date.now())
  const spikeHistory = useRef([]) // Store { delta, time } for sudden shake detection

  const supported = typeof window !== 'undefined' && 'DeviceMotionEvent' in window

  const handleMotion = useCallback((e) => {
    const accel = e.accelerationIncludingGravity || { x: 0, y: 0, z: 0 }
    const rotation = e.rotationRate || { alpha: 0, beta: 0, gamma: 0 }

    lastAccel.current = {
      x: accel.x || 0,
      y: accel.y || 0,
      z: accel.z || 0
    }
    lastRotation.current = {
      alpha: rotation.alpha || 0,
      beta: rotation.beta || 0,
      gamma: rotation.gamma || 0
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permissionState = await DeviceMotionEvent.requestPermission()
        if (permissionState === 'granted') {
          window.addEventListener('devicemotion', handleMotion)
          return true
        }
      } catch (error) {
        console.error('DeviceMotion permission request failed:', error)
      }
      return false
    }
    return true // Not iOS or permission not required
  }, [handleMotion])

  useEffect(() => {
    if (!supported) return

    // iOS requires permission on first user interaction. 
    // We add the listener if permission is already granted or not required.
    if (typeof DeviceMotionEvent.requestPermission !== 'function') {
      window.addEventListener('devicemotion', handleMotion)
    }

    const interval = setInterval(() => {
      const { x, y, z } = lastAccel.current
      const { alpha, beta, gamma } = lastRotation.current

      // 1. Compute Magnitude
      const mag = Math.sqrt(x * x + y * y + z * z)

      // 2. Compute Delta Spikes
      const now = Date.now()
      const delta = Math.abs(mag - lastMagnitude.current)

      // 3. Sudden Shake Detection (delta > threshold within 200ms)
      spikeHistory.current.push({ delta, time: now })
      spikeHistory.current = spikeHistory.current.filter(s => now - s.time < 200)

      const maxSpike = Math.max(0, ...spikeHistory.current.map(s => s.delta))
      const rotMag = (Math.abs(alpha) + Math.abs(beta) + Math.abs(gamma)) / 100 // Scale rotation

      // 4. Normalize to 0-1 as motionStressScore
      // Basic normalization: magnitude deviation from gravity (9.8) + spikes + rotation
      // Using a heuristic approach based on typical phone movement
      const gravityDev = Math.abs(mag - 9.8)
      const rawScore = (gravityDev * 0.3) + (maxSpike * 0.5) + (rotMag * 0.2)

      // Clamp to 0-1
      const normalizedScore = Math.min(1, Math.max(0, rawScore / 15)) // 15 is an arbitrary "max stress" divisor

      setMotionStressScore(Number(normalizedScore.toFixed(3)))

      lastMagnitude.current = mag
      lastTimestamp.current = now
    }, 50) // Throttle to 20 updates per second (1000ms / 20 = 50ms)

    return () => {
      window.removeEventListener('devicemotion', handleMotion)
      clearInterval(interval)
    }
  }, [supported, handleMotion])

  // Initial interaction for iOS permission
  useEffect(() => {
    const handleFirstInteraction = () => {
      requestPermission()
      window.removeEventListener('touchstart', handleFirstInteraction)
      window.removeEventListener('mousedown', handleFirstInteraction)
    }

    if (supported && typeof DeviceMotionEvent.requestPermission === 'function') {
      window.addEventListener('touchstart', handleFirstInteraction)
      window.addEventListener('mousedown', handleFirstInteraction)
    }

    return () => {
      window.removeEventListener('touchstart', handleFirstInteraction)
      window.removeEventListener('mousedown', handleFirstInteraction)
    }
  }, [supported, requestPermission])

  return {
    motionStressScore: supported ? motionStressScore : 0
  }
}
