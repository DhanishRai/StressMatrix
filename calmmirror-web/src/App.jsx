import React, { useEffect, useRef, useState } from 'react'
import Landing from './screens/LandingScreen'
import Setup from './screens/SetupScreen'
import Session from './screens/SessionScreen'
import Ready from './screens/Ready'
import { VideoProvider } from './context/VideoContext'

export default function App() {
  const cursorRef = useRef(null)
  const [screen, setScreen] = useState('landing')

  useEffect(() => {
    const el = cursorRef.current
    if (!el) return

    function onMove(e) {
      const { clientX: x, clientY: y } = e
      el.style.left = x + 'px'
      el.style.top = y + 'px'
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div className="app">
      <div className="blob blob1" aria-hidden />
      <div className="blob blob2" aria-hidden />
      <div className="blob blob3" aria-hidden />
      <header>
        <h1>CalmMirror</h1>
        <p>Vite + React starter with MediaPipe + TensorFlow deps</p>
      </header>

      <main className="screens">
        <VideoProvider>
          <ScreenManager screen={screen} setScreen={setScreen} />
        </VideoProvider>
      </main>

      <div ref={cursorRef} className="cursor" aria-hidden />
    </div>
  )
}

function ScreenManager({ screen, setScreen }) {
  return (
    <div className="screen-wrapper">
      <div className={`screen ${screen === 'landing' ? 'visible' : 'hidden'}`}>
        <Landing setScreen={setScreen} />
      </div>

      <div className={`screen ${screen === 'setup' ? 'visible' : 'hidden'}`}>
        <Setup setScreen={setScreen} />
      </div>

      <div className={`screen ${screen === 'session' ? 'visible' : 'hidden'}`}>
        <Session setScreen={setScreen} />
      </div>

      <div className={`screen ${screen === 'ready' ? 'visible' : 'hidden'}`}>
        <Ready setScreen={setScreen} />
      </div>
    </div>
  )
}
