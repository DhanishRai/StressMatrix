import React from 'react'

export default function Session({ setScreen }) {
  return (
    <div style={{textAlign:'center'}}>
      <h2>Session</h2>
      <p>Live session running...</p>
      <div style={{marginTop:16}}>
        <button onClick={() => setScreen('landing')}>End Session</button>
      </div>
    </div>
  )
}
