import React, { createContext, useContext, useRef } from 'react'

const VideoContext = createContext(null)

export function VideoProvider({ children }) {
  const videoRef = useRef(null)
  const setVideoRef = (el) => { videoRef.current = el }
  return (
    <VideoContext.Provider value={{ videoRef, setVideoRef }}>
      {children}
    </VideoContext.Provider>
  )
}

export function useVideo() {
  return useContext(VideoContext)
}

export default VideoContext
