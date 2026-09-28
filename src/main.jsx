// Preview mode (`npm run dev:preview`) — MUST be the first import.
//
// The module self-installs a stand-in Storefront API so the storefront runs
// without Shopify credentials. It has to evaluate before App.jsx, because
// src/lib/shopify/client.js builds its client at module scope and the client
// captures `fetch` at construction. Its body is guarded by
// import.meta.env.DEV, so production builds drop it entirely.
import '@/lib/dev/shopifyMock'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import { initAnalytics } from '@/lib/analytics'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// GA4: inject the gtag script once at startup (only if consent is already
// granted), then re-init when the consent banner is accepted later.
initAnalytics()
window.addEventListener('consent-change', (e) => {
  if (e.detail === true) initAnalytics()
})

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
