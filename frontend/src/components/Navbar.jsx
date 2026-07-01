import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import axios from 'axios'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [regOpen, setRegOpen] = useState(null)

  useEffect(() => {
  let cancelled = false
  axios.get(`${import.meta.env.VITE_API_URL}/api/settings/registration`)
    .then(r => { if (!cancelled) setRegOpen(r.data.open) })
    .catch(() => {})
  return () => { cancelled = true }
}, [])

  function close() { setOpen(false) }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <NavLink to="/" className="navbar-brand" onClick={close}>
            <img src="/LogoHHFC.png" alt="HHFC Logo" style={{ height: 44, width: 44, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 1px 4px rgba(0,0,0,.3))' }} />
            <span className="navbar-brand-text">HHFC Youth Camp 2027</span>
            {regOpen === true && (
              <span style={{
                fontSize: '.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                background: '#dcfce7', color: '#15803d', border: '1px solid #86efac',
              }}>● Open</span>
            )}
            {regOpen === false && (
              <span style={{
                fontSize: '.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5',
              }}>● Closed</span>
            )}
          </NavLink>

          <div className={`navbar-links ${open ? 'open' : ''}`}>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} onClick={close}>
              Home
            </NavLink>
            <NavLink to="/my-registration" className={({ isActive }) => isActive ? 'active' : ''} onClick={close}>
              Profile
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''} onClick={close}>
              Admin
            </NavLink>
            <NavLink to="/register" className={({ isActive }) => `btn-nav ${isActive ? 'active' : ''}`} onClick={close}>
              Register Now
            </NavLink>
          </div>

          <button
            className={`navbar-hamburger ${open ? 'open' : ''}`}
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </nav>
  )
}
