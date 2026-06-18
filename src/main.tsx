import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import { router } from './router'
import './index.css'

// AuthProvider wraps RouterProvider so that AuthContext is available
// to every route, guard, and component in the tree — including the
// ones rendered at the root level before any layout mounts.
// This is the correct pattern with createBrowserRouter.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
)