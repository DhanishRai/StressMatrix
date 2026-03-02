import React, { useEffect, useRef, useState } from 'react'
import { useVideo } from '../context/VideoContext'
import { useAppContext } from '../context/AppContext'

export default function SetupScreen() {
  const videoRef = useRef(null)
  const [available, setAvailable] = useState(null)
  const [message, setMessage] = useState('Checking camera...')
  const { setScreen } = useAppContext()
  const { setVideoRef } = useVideo() || {}

  useEffect(() => {
    let mounted = true
    let timer = null
    let stream = null

n    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (!mounted) return
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          // expose the video element to the app via context for session processing
          if (setVideoRef) setVideoRef(videoRef.current)
        }
        setAvailable(true)
        setMessage('Looking good. Starting scan...')
        timer = setTimeout(() => setScreen('session'), 2000)
      } catch (err) {
        if (!mounted) return
        setAvailable(false)
        setMessage('Camera unavailable — motion-only mode')
        timer = setTimeout(() => setScreen('session'), 3000)
      }
    }

    startCamera()

    return () => {
      mounted = false
      if (timer) clearTimeout(timer)
      if (stream) {
        stream.getTracks().forEach(t => t.stop())
      } else if (videoRef.current && videoRef.current.srcObject) {
        const s = videoRef.current.srcObject
        s.getTracks().forEach(t => t.stop())
      }
      // clear context videoRef on unmount
      if (setVideoRef) setVideoRef(null)
    }
  }, [setScreen, setVideoRef])

  return (
    <div className="setup-screen">
      {available === true ? (
        <div className="video-card">
          <div className="video-wrap">
            <video ref={videoRef} autoPlay muted playsInline />
          </div>
          <p className="setup-msg">{message}</p>
        </div>
      ) : available === false ? (
        <div className="fallback-card">
          <p>{message}</p>
        </div>
      ) : (
        <div className="checking">{message}</div>
      )}
    </div>
  )
}
