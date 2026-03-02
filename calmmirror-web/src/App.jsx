import React, { useEffect, useRef } from 'react'

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

      <div ref={cursorRef} className="cursor" aria-hidden />
    </div>
  )
}
