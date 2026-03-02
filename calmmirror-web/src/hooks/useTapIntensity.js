import { useEffect, useRef, useState, useCallback } from 'react'

export default function useTapIntensity() {
    const [tapIntensityScore, setTapIntensityScore] = useState(0)
    const tapHistory = useRef([]) // Store { duration, pressure, time }
    const pointerDownTime = useRef(0)
    const lastPressure = useRef(0.5)

    const handlePointerDown = useCallback((e) => {
        pointerDownTime.current = Date.now()
        lastPressure.current = e.pressure > 0 ? e.pressure : 0.5
    }, [])

    const handlePointerUp = useCallback((e) => {
        const upTime = Date.now()
        const duration = upTime - pointerDownTime.current
        const pressure = e.pressure > 0 ? e.pressure : lastPressure.current

        const newTap = {
            duration,
            pressure,
            time: upTime
        }

        tapHistory.current.push(newTap)

        // Keep only last 5 taps for rolling average
        if (tapHistory.current.length > 5) {
            tapHistory.current.shift()
        }

        // Calculate metrics for the last 5 taps
        const now = Date.now()
        const recentTaps = tapHistory.current.filter(t => now - t.time < 3000)

        if (recentTaps.length === 0) {
            setTapIntensityScore(0)
            return
        }

        // 1. Duration Score (shorter is more intense/stressed)
        // Range 50ms (intense) to 500ms (calm)
        const avgDuration = recentTaps.reduce((acc, t) => acc + t.duration, 0) / recentTaps.length
        const durationScore = Math.max(0, Math.min(1, (500 - avgDuration) / 450))

        // 2. Pressure Score (direct 0-1)
        const avgPressure = recentTaps.reduce((acc, t) => acc + t.pressure, 0) / recentTaps.length
        const pressureScore = avgPressure

        // 3. Frequency Score (within 3s window)
        // 1 tap/3s = 0, 10 taps/3s = 1
        const frequencyScore = Math.max(0, Math.min(1, recentTaps.length / 10))

        // Final Formula: (duration * 0.4) + (pressure * 0.3) + (frequency * 0.3)
        const rawScore = (durationScore * 0.4) + (pressureScore * 0.3) + (frequencyScore * 0.3)

        setTapIntensityScore(Number(rawScore.toFixed(3)))
    }, [])

    useEffect(() => {
        window.addEventListener('pointerdown', handlePointerDown)
        window.addEventListener('pointerup', handlePointerUp)

        // Decay score over time if no taps occur
        const interval = setInterval(() => {
            const now = Date.now()
            const hasRecentTaps = tapHistory.current.some(t => now - t.time < 3000)
            if (!hasRecentTaps) {
                setTapIntensityScore(prev => Math.max(0, prev - 0.05))
            }
        }, 1000)

        return () => {
            window.removeEventListener('pointerdown', handlePointerDown)
            window.removeEventListener('pointerup', handlePointerUp)
            clearInterval(interval)
        }
    }, [handlePointerDown, handlePointerUp])

    return {
        tapIntensityScore
    }
}
