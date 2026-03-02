import { useEffect, useRef, useState } from 'react'

export default function useTremorDetection() {
  const [tremorScore, setTremorScore] = useState(0)
  const lastAccel = useRef({ x: 0, y: 0, z: 0 })
  const samples = useRef([])
  const intervalRef = useRef(null)

  const supported = typeof window !== 'undefined' && 'DeviceMotionEvent' in window

  useEffect(() => {
    if (!supported) {
      setTremorScore(0)
      return
    }

    function handleMotion(e) {
      const a = e.acceleration || e.accelerationIncludingGravity || { x: 0, y: 0, z: 0 }
      lastAccel.current = {
        x: typeof a.x === 'number' ? a.x : 0,
        y: typeof a.y === 'number' ? a.y : 0,
        z: typeof a.z === 'number' ? a.z : 0,
      }
    }

    window.addEventListener('devicemotion', handleMotion)

    intervalRef.current = setInterval(() => {
      const { x, y, z } = lastAccel.current
      const mag = Math.sqrt(x * x + y * y + z * z)

      // Normalize magnitude to 0..1 using a reasonable max (picked 30 m/s^2)
      const MAX_MAG = 30
      let norm = mag / MAX_MAG
      if (norm < 0) norm = 0
      if (norm > 1) norm = 1

      samples.current.push(norm)
      if (samples.current.length > 5) samples.current.shift()

      const avg = samples.current.reduce((s, v) => s + v, 0) / samples.current.length
      setTremorScore(Number((isFinite(avg) ? avg : 0).toFixed(3)))
    }, 500)

    return () => {
      window.removeEventListener('devicemotion', handleMotion)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [supported])

  // On non-mobile/desktop where DeviceMotion isn't available, return 0
  return { tremorScore: supported ? tremorScore : 0 }
}
