import { useEffect, useState } from 'react'
import useTremorDetection from './useTremorDetection'
import useFaceDetection from './useFaceDetection'
import { calcCalmness, getZone } from '../utils/calmnessEngine'

const READY_THRESHOLD = 85
const READY_STREAK_SECS = 10

export default function useCalmnessScore(videoRef) {
  const { tremorScore } = useTremorDetection()
  const { facialTensionScore } = useFaceDetection(videoRef)

  const [calmnessScore, setCalmnessScore] = useState(() => {
    return calcCalmness(facialTensionScore || 0, tremorScore || 0)
  })
  const [zone, setZone] = useState(() => getZone(calmnessScore))
  const [readyStreak, setReadyStreak] = useState(0)
  const [readyTriggered, setReadyTriggered] = useState(false)

  useEffect(() => {
    function compute() {
      const score = calcCalmness(facialTensionScore || 0, tremorScore || 0)
      setCalmnessScore(score)
      setZone(getZone(score))

      // Track ready streak (score >= 85 for 10 consecutive seconds)
      if (score >= READY_THRESHOLD) {
        setReadyStreak(prev => {
          const newStreak = prev + 2 // 2s intervals
          if (newStreak >= READY_STREAK_SECS && !readyTriggered) {
            setReadyTriggered(true)
          }
          return Math.min(newStreak, READY_STREAK_SECS)
        })
      } else {
        setReadyStreak(0)
      }
    }

    compute()
    const id = setInterval(compute, 2000)
    return () => clearInterval(id)
  }, [facialTensionScore, tremorScore, readyTriggered])

  return { calmnessScore, zone, readyTriggered }
}

