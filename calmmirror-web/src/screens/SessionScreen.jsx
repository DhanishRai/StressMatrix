import React from 'react'
import { useVideo } from '../context/VideoContext'
import useCalmnessScore from '../hooks/useCalmnessScore'

export default function SessionScreen({ setScreen }) {
  const { videoRef } = useVideo() || { videoRef: { current: null } }
  const { calmnessScore, zone } = useCalmnessScore(videoRef)

  const radius = 36
  const circumference = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(1, calmnessScore / 100))
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
        <div className="calmness-label">{calmnessScore}</div>
      </div>

      <div className="breathing-orb-wrap">
        <div className="breathing-orb" />
        <div className="breathing-text">Breathe in… Breathe out…</div>
      </div>

    </div>
  )
}
