import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { Lock, Eye, EyeOff, ClipboardList, Hash } from 'lucide-react'

export default function Lookup() {
  const [regId, setRegId] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedId, setFocusedId] = useState(false)
  const [focusedPw, setFocusedPw] = useState(false)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const cardRef = useRef(null)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!regId.trim()) { setError('Please enter your Registration ID.'); return }
    if (!password) { setError('Please enter your password.'); return }
    setLoading(true)
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/registrations/verify`, {
        id: regId.trim(),
        password,
      })
      sessionStorage.setItem(`profile_auth_${regId.trim()}`, '1')
      navigate(`/profile/${regId.trim()}`)
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong.'
      setError(msg === 'Incorrect password' ? 'Incorrect password. Please try again.' : 'No registration found with that ID.')
      setLoading(false)
    }
  }

  function handleMouseMove(e) {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setRotation({
      x: (y / (rect.height / 2)) * -10,
      y: (x / (rect.width / 2)) * 10,
    })
  }

  function handleMouseLeave() {
    setRotation({ x: 0, y: 0 })
  }

  return (
    <div className="admin-login-bg">
      <div className="admin-bg-gradient" />
      <div className="admin-bg-noise" />
      <div className="admin-bg-glow-top" />
      <div className="admin-orb admin-orb-top" />
      <div className="admin-orb admin-orb-bottom" />
      <div className="admin-ambient admin-ambient-left" />
      <div className="admin-ambient admin-ambient-right" />

      <div
        ref={cardRef}
        className="admin-card-perspective"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="admin-card-tilt"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: rotation.x === 0 && rotation.y === 0
              ? 'transform .6s cubic-bezier(.4,0,.2,1)'
              : 'transform .08s linear',
          }}
        >
          <div className="admin-beams">
            <div className="admin-beam admin-beam-top" />
            <div className="admin-beam admin-beam-right" />
            <div className="admin-beam admin-beam-bottom" />
            <div className="admin-beam admin-beam-left" />
            <div className="admin-corner admin-corner-tl" />
            <div className="admin-corner admin-corner-tr" />
            <div className="admin-corner admin-corner-br" />
            <div className="admin-corner admin-corner-bl" />
          </div>

          <div className="admin-glass-card">
            <div className="admin-card-grid" />

            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div className="admin-lock-icon">
                <ClipboardList size={22} color="#fff" strokeWidth={1.75} />
                <div className="admin-lock-shine" />
              </div>
              <h1 className="admin-card-title">Profile Access</h1>
              <p className="admin-card-sub">Enter your ID and password to view your registration.</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Registration ID */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Hash size={15} style={{ position: 'absolute', left: 12, color: focusedId ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.35)', transition: 'color .2s', pointerEvents: 'none', zIndex: 1 }} />
                  <input
                    type="number"
                    min="1"
                    placeholder="Registration ID"
                    value={regId}
                    autoFocus
                    onChange={e => { setRegId(e.target.value); setError('') }}
                    onFocus={() => setFocusedId(true)}
                    onBlur={() => setFocusedId(false)}
                    className={`admin-input${focusedId ? ' admin-input-focused' : ''}`}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 12, color: focusedPw ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.35)', transition: 'color .2s', pointerEvents: 'none', zIndex: 1 }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    onFocus={() => setFocusedPw(true)}
                    onBlur={() => setFocusedPw(false)}
                    className={`admin-input${error ? ' admin-input-error' : ''}${focusedPw ? ' admin-input-focused' : ''}`}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="admin-eye-btn">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {error && <span className="admin-error-msg">{error}</span>}
              </div>

              <button type="submit" disabled={loading} className="admin-submit-btn">
                {loading
                  ? <div className="spinner" style={{ borderColor: 'rgba(0,0,0,.25)', borderTopColor: '#000' }} />
                  : 'View My Profile →'
                }
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.08)' }}>
              <p style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.4)' }}>
                Not registered yet?{' '}
                <Link to="/register" style={{ color: 'rgba(134,239,172,.85)', fontWeight: 600 }}>Register here →</Link>
              </p>
              <p style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.25)', marginTop: 6 }}>
                Forgot your password?{' '}
                <a href="mailto:duo.vision3128@gmail.com" style={{ color: 'rgba(134,239,172,.6)' }}>Contact us</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
