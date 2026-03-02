import React, { createContext, useContext, useState, useRef } from 'react'
import useCalmnessScore from '../hooks/useCalmnessScore'
import { useVideo } from './VideoContext'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [screen, setScreen] = useState('landing')
  const { videoRef } = useVideo() || { videoRef: { current: null } }
  const { calmnessScore, zone, readyTriggered } = useCalmnessScore(videoRef)

  const value = {
    screen,
    setScreen,
    videoRef,
    calmnessScore,
    zone,
    readyTriggered,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider')
  }
  return context
}

export default AppContext
