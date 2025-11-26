import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { RuntimeConfigProvider } from './config/runtimeConfig'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RuntimeConfigProvider>
      <App />
    </RuntimeConfigProvider>
  </StrictMode>,
)
