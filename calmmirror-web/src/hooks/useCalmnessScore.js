import { useEffect, useState } from 'react'
import useTremorDetection from './useTremorDetection'
import useFaceDetection from './useFaceDetection'
import { calcCalmness, getZone } from '../utils/calmnessEngine'

export default function useCalmnessScore(videoRef) {
  const { tremorScore } = useTremorDetection()
  const { facialTensionScore } = useFaceDetection(videoRef)

  const [calmnessScore, setCalmnessScore] = useState(() => {
    return calcCalmness(facialTensionScore || 0, tremorScore || 0)
  })
  const [zone, setZone] = useState(() => getZone(calmnessScore))

  useEffect(() => {
    function compute() {
      const score = calcCalmness(facialTensionScore || 0, tremorScore || 0)
      setCalmnessScore(score)
      setZone(getZone(score))
    }

    compute()
    const id = setInterval(compute, 2000)
    return () => clearInterval(id)
  }, [facialTensionScore, tremorScore])

  return { calmnessScore, zone }
}
