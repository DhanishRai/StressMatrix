import React, { useEffect, useRef } from 'react'
import Landing from './screens/LandingScreen'
import Setup from './screens/SetupScreen'
import Session from './screens/SessionScreen'
import Ready from './screens/Ready'
import { VideoProvider } from './context/VideoContext'
import { AppProvider, useAppContext } from './context/AppContext'
import Footer from './components/Footer'

export default function App() {
  const cursorRef = useRef(null)

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
          <AppProvider>
            <AppContent cursorRef={cursorRef} />
          </AppProvider>
        </VideoProvider>
      </main>

      <div ref={cursorRef} className="cursor" aria-hidden />
    </div>
  )
}

function AppContent({ cursorRef }) {
  return (
    <>
      <ScreenManager />
      <Footer />
    </>
  )
}

function ScreenManager() {
  const { screen, zone } = useAppContext()

  // Update theme-color based on zone
  useEffect(() => {
    const zoneColors = {
      calm: '#22c55e',
      mild: '#f59e0b',
      stress: '#ef4444',
    }
    const color = zoneColors[zone] || '#050a0e'
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) metaTheme.setAttribute('content', color)
  }, [zone])

  return (
    <div className="screen-wrapper">
      <div className={`screen ${screen === 'landing' ? 'visible' : 'hidden'}`}>
        <Landing />
      </div>

      <div className={`screen ${screen === 'setup' ? 'visible' : 'hidden'}`}>
        <Setup />
      </div>

      <div className={`screen ${screen === 'session' ? 'visible' : 'hidden'}`}>
        <Session />
      </div>

      <div className={`screen ${screen === 'ready' ? 'visible' : 'hidden'}`}>
        <Ready />
      </div>
    </div>
  )
}

