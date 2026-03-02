import React from 'react'

export default function Setup({ setScreen }) {
  return (
    <div style={{textAlign:'center'}}>
      <h2>Setup</h2>
      <p>Configure camera and options.</p>
      <div style={{marginTop:16}}>
        <button onClick={() => setScreen('ready')}>I'm Ready</button>
      </div>
    </div>
  )
}
