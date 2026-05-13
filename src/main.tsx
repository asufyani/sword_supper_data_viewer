import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyRandomPageBackground } from './utils/pageBackground'
import { installAppViewportWidthSync } from './utils/appViewportWidth'

const pageBackground = applyRandomPageBackground()
installAppViewportWidthSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App pageBackground={pageBackground} />
  </StrictMode>
)
