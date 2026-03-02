import React, { useEffect, useState } from 'react'

export default function ReadyScreen({ onDismiss }) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Auto-fade out after 5 seconds
    const timer = setTimeout(() => {
      setIsClosing(true)
      // Wait for fade animation to complete before callback
      setTimeout(onDismiss, 600)
    }, 5000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  const handleTap = () => {
    setIsClosing(true)
    setTimeout(onDismiss, 600)
  }

  return (
    <div
      className={`ready-screen ${isClosing ? 'closing' : ''}`}
      onClick={handleTap}
      onTouchStart={handleTap}
    >
      <div className="ready-circle" aria-hidden />
      <div className="ready-text">Ready.</div>
    </div>
  )
}
