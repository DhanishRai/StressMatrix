import React from 'react'

export default function LandingScreen({ setScreen }) {
  return (
    <div className="landing-screen">
      <h1 className="landing-heading">CalmMirror</h1>
      <p className="landing-sub">Calm before your interview. No typing. No thinking.</p>

      <button className="landing-button" onClick={() => setScreen('setup')}>Begin Session</button>

      <div className="grain" aria-hidden />
    </div>
  )
}
