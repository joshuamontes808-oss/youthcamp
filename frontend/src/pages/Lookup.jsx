import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { Eye, EyeOff, ClipboardList } from 'lucide-react'

export default function Lookup() {
  const [regId, setRegId] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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
      // Store verified access in sessionStorage
      sessionStorage.setItem(`profile_auth_${regId.trim()}`, '1')
      navigate(`/profile/${regId.trim()}`)
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong.'
      setError(msg === 'Incorrect password' ? 'Incorrect password. Please try again.' : 'No registration found with that ID.')
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', background: 'var(--gray-50)' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <ClipboardList size={36} color="var(--primary)" strokeWidth={1.5} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>Profile</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '.9rem' }}>
            Enter your Registration ID and password to view your profile.
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Registration ID <span className="required">*</span></label>
                <input
                  className="form-control"
                  placeholder="e.g. 12"
                  value={regId}
                  onChange={e => { setRegId(e.target.value); setError('') }}
                  type="number"
                  min="1"
                />
                <span className="form-hint">Given to you after completing registration.</span>
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Password <span className="required">*</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', alignItems: 'center' }}
                  >{showPass ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
              </div>

              {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? <span className="spinner" /> : 'View My Profile →'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--gray-100)' }}>
              <p style={{ fontSize: '.85rem', color: 'var(--gray-400)' }}>
                Not registered yet?{' '}
                <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register here →</Link>
              </p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <p style={{ fontSize: '.825rem', color: 'var(--gray-400)' }}>
            Forgot your password? Contact us at{' '}
            <a href="mailto:duo.vision3128@gmail.com" style={{ color: 'var(--primary)' }}>
              duo.vision3128@gmail.com
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
