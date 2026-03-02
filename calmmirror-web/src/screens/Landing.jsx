import React from 'react'

export default function Landing({ setScreen }) {
  return (
    <div style={{textAlign:'center'}}>
      <h2>Welcome</h2>
      <p>Get started with CalmMirror.</p>
      <div style={{marginTop:16}}>
        <button onClick={() => setScreen('setup')}>Go to Setup</button>
      </div>
    </div>
  )
}
