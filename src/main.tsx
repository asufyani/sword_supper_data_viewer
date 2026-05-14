import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {
  applyRandomPageBackground,
  installPageBackgroundScaleSync,
} from './utils/pageBackground'
import { installAppViewportWidthSync } from './utils/appViewportWidth'

const pageBackground = applyRandomPageBackground()
installAppViewportWidthSync()
installPageBackgroundScaleSync(pageBackground)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App pageBackground={pageBackground} />
  </StrictMode>
)
