import React from 'react'

export default function Ready({ setScreen }) {
  return (
    <div style={{textAlign:'center'}}>
      <h2>Ready</h2>
      <p>All set — start your session.</p>
      <div style={{marginTop:16}}>
        <button onClick={() => setScreen('session')}>Start Session</button>
      </div>
    </div>
  )
}
