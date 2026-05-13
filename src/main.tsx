import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyRandomPageBackground } from './utils/pageBackground'

const pageBackground = applyRandomPageBackground()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App pageBackground={pageBackground} />
  </StrictMode>
)
