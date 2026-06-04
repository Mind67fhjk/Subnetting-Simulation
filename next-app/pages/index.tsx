import React from 'react'

export default function Home() {
  return (
    <main style={{fontFamily: 'Inter, system-ui, Arial, sans-serif', padding: 40}}>
      <h1>Subnetting Simulator — Next.js Migration</h1>
      <p>This scaffold preserves the existing Vite app in the repository root.</p>
      <p>To run the Next.js app:</p>
      <pre>cd next-app && npm install && npm run dev</pre>
      <p>When ready, we can migrate pages and components from the Vite app into Next.js pages or the App Router.</p>
      <p>
        <a href="/../" rel="noopener noreferrer">Open current Vite app (local dev)</a>
      </p>
    </main>
  )
}
