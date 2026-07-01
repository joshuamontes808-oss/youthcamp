import { useState, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { Eye, EyeOff, ClipboardList } from 'lucide-react'

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

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)
    setRotation({ x: -dy * 8, y: dx * 8 })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setRotation({ x: 0, y: 0 })
  }, [])

  return (
    <div className="admin-login-bg">
      <div className="admin-bg-gradient" />
      <div className="admin-bg-noise" />
      <div className="admin-bg-glow-top" />
      <div className="admin-orb admin-orb-top" />
      <div className="admin-orb admin-orb-bottom" />
      <div className="admin-ambient admin-ambient-left" />
      <div className="admin-ambient admin-ambient-right" />

      {/* Below-card text (outside tilt) */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px' }}>
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
                ? 'transform .6s cubic-bezier(.23,1,.32,1)'
                : 'transform .1s linear',
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

              {/* Icon */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div className="admin-lock-icon">
                  <div className="admin-lock-shine" />
                  <ClipboardList size={22} color="rgba(255,255,255,.85)" />
                </div>
                <div className="admin-card-title">Profile Access</div>
                <div className="admin-card-sub">Enter your ID and password to view your registration</div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Registration ID */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'rgba(255,255,255,.85)', marginBottom: 6 }}>
                    Registration ID <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className={`admin-input${focusedId ? ' admin-input-focused' : ''}${error && !regId ? ' admin-input-error' : ''}`}
                      style={{ paddingLeft: 12 }}
                      placeholder="e.g. 12"
                      value={regId}
                      onChange={e => { setRegId(e.target.value); setError('') }}
                      onFocus={() => setFocusedId(true)}
                      onBlur={() => setFocusedId(false)}
                      type="number"
                      min="1"
                    />
                  </div>
                  <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.35)', marginTop: 4, display: 'block' }}>Given to you after completing registration.</span>
                </div>

                {/* Password */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'rgba(255,255,255,.85)', marginBottom: 6 }}>
                    Password <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      className={`admin-input${focusedPw ? ' admin-input-focused' : ''}${error && regId ? ' admin-input-error' : ''}`}
                      style={{ paddingLeft: 12 }}
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError('') }}
                      onFocus={() => setFocusedPw(true)}
                      onBlur={() => setFocusedPw(false)}
                    />
                    <button
                      type="button"
                      className="admin-eye-btn"
                      onClick={() => setShowPass(s => !s)}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <span className="admin-error-msg" style={{ marginBottom: 14 }}>{error}</span>
                )}

                <button type="submit" className="admin-submit-btn" disabled={loading}>
                  {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderColor: 'rgba(0,0,0,.2)', borderTopColor: '#000' }} /> : 'View My Profile →'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.08)' }}>
                <p style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.4)' }}>
                  Not registered yet?{' '}
                  <Link to="/register" style={{ color: 'rgba(134,239,172,.85)', fontWeight: 600 }}>Register here →</Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.3)' }}>
            Forgot your password? Contact us at{' '}
            <a href="mailto:duo.vision3128@gmail.com" style={{ color: 'rgba(134,239,172,.7)' }}>
              duo.vision3128@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
