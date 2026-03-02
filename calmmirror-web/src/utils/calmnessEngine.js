export function calcCalmness(facialTension = 0, tremor = 0) {
  // facialTension and tremor are expected in 0..1
  const calmness = 100 - ((facialTension * 50) + (tremor * 50))
  const clamped = Math.max(0, Math.min(100, calmness))
  return Math.round(clamped)
}

export function getZone(score = 100) {
  // Determine zone from score: higher = calmer
  if (score >= 70) return 'calm'
  if (score >= 40) return 'mild'
  return 'stress'
}
