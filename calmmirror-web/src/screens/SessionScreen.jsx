import React, { useState, useEffect } from 'react'
import { useVideo } from '../context/VideoContext'
import useCalmnessScore from '../hooks/useCalmnessScore'
import useTremorDetection from '../hooks/useTremorDetection'
import FaceOverlay from '../components/FaceOverlay'
import ReadyScreen from './ReadyScreen'

const STEADINESS_THRESHOLD = 0.2
const REQUIRED_STREAK_SECS = 3
const CALMNESS_BOOST = 10

export default function SessionScreen({ setScreen }) {
  const { videoRef } = useVideo() || { videoRef: { current: null } }
  const { calmnessScore, zone, readyTriggered } = useCalmnessScore(videoRef)
  const { tremorScore } = useTremorDetection()

  const [adjustedCalmness, setAdjustedCalmness] = useState(calmnessScore)
  const [touchActive, setTouchActive] = useState(false)
  const [steadyStreak, setSteadyStreak] = useState(0)
  const [isGolden, setIsGolden] = useState(false)
  const [hasTouchDevice] = useState(typeof window !== 'undefined' && 'ontouchstart' in window)
  const [showReady, setShowReady] = useState(false)

  // Show ready screen when readyTriggered becomes true
  useEffect(() => {
    if (readyTriggered) {
      setShowReady(true)
    }
  }, [readyTriggered])

  const handleReadyDismiss = () => {
    setShowReady(false)
  }

  // Apply boost to calmness when displaying touch orb
  useEffect(() => {
    setAdjustedCalmness(calmnessScore + (isGolden ? CALMNESS_BOOST : 0))
  }, [calmnessScore, isGolden])

  // Track tremor < 0.2 for 3 consecutive seconds
  useEffect(() => {
    if (!touchActive) {
      setSteadyStreak(0)
      return
    }

    if (tremorScore < STEADINESS_THRESHOLD) {
      setSteadyStreak(prev => {
        const newStreak = prev + 0.5 // 0.5s ticks
        if (newStreak >= REQUIRED_STREAK_SECS && !isGolden) {
          setIsGolden(true)
          // Auto-reset after 2 seconds
          setTimeout(() => {
            setIsGolden(false)
            setSteadyStreak(0)
            setTouchActive(false)
          }, 2000)
        }
        return Math.min(newStreak, REQUIRED_STREAK_SECS)
      })
    } else {
      setSteadyStreak(0)
    }
  }, [tremorScore, touchActive, isGolden])

  const handleTouchStart = () => {
    setTouchActive(true)
    setSteadyStreak(0)
    setIsGolden(false)
  }

  const handleTouchEnd = () => {
    setTouchActive(false)
    setSteadyStreak(0)
    if (!isGolden) setIsGolden(false)
  }

  const radius = 36
  const circumference = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(1, adjustedCalmness / 100))
  const dashOffset = Math.round(circumference * (1 - pct))

  return (
    <div className={`session-screen zone-${zone}`}>
      <div className="zone-blob" aria-hidden />

      <div className="calmness-meter">
        <svg width="84" height="84" viewBox="0 0 84 84">
          <g transform="translate(42,42)">
            <circle r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle r="36" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 800ms ease' }}
            />
          </g>
        </svg>
        <div className="calmness-label">{adjustedCalmness}</div>
      </div>

      <div className="breathing-orb-wrap">
        <div className="breathing-orb" />
        <div className="breathing-text">Breathe in… Breathe out…</div>
      </div>

      {hasTouchDevice && (
        <div
          className={`touch-steadiness-orb ${touchActive ? 'active' : ''} ${isGolden ? 'golden' : ''}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={() => handleTouchStart()}
          onMouseUp={() => handleTouchEnd()}
        >
          <div className="touch-orb-inner" />
          {steadyStreak > 0 && (
            <div className="streak-indicator">{steadyStreak.toFixed(1)}s</div>
          )}
        </div>
      )}

      <FaceOverlay videoRef={videoRef} />

      {showReady && <ReadyScreen onDismiss={handleReadyDismiss} />}
    </div>
  )
}
