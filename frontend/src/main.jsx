import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Register from './pages/Register.jsx'
import Confirmation from './pages/Confirmation.jsx'
import Profile from './pages/Profile.jsx'
import Lookup from './pages/Lookup.jsx'
import Admin from './pages/Admin.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'register', element: <Register /> },
      { path: 'confirmation/:id', element: <Confirmation /> },
      { path: 'profile/:id', element: <Profile /> },
      { path: 'my-registration', element: <Lookup /> },
      { path: 'admin', element: <Admin /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
