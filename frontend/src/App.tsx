import React, { useState } from 'react'

export default function App() {
  const [text, setText] = useState('')

  return (
    <div className="app">
      <header>
        <h1>Hash Generator</h1>
        <p>🔒 Your data never leaves your browser.</p>
      </header>

      <main>
        <section className="input">
          <label htmlFor="inputText">Input</label>
          <textarea id="inputText" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste your text here..." />
          <div className="controls">
            <button onClick={() => setText('')}>Clear</button>
            <button onClick={() => { /* TODO: trigger hashing */ }}>Generate Hashes</button>
          </div>
        </section>

        <section className="results">
          <h2>Results</h2>
          <div className="result-card">
            <h3>SHA-256</h3>
            <pre className="hash">—</pre>
            <button>📋 Copy</button>
          </div>
        </section>
      </main>
    </div>
  )
}
