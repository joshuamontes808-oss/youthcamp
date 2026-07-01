import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { Copy, Check, Hash, Lock, Eye, EyeOff } from 'lucide-react'

export default function Confirmation() {
  const { id } = useParams()
  const [reg, setReg] = useState(null)
  const [error, setError] = useState(false)
  const [copiedId, setCopiedId] = useState(false)
  const [copiedPw, setCopiedPw] = useState(false)
  const [showPw, setShowPw] = useState(false)

  // Read password once from sessionStorage then clear it
  const [savedPw] = useState(() => {
    const pw = sessionStorage.getItem(`reg_pw_${id}`) || ''
    sessionStorage.removeItem(`reg_pw_${id}`)
    return pw
  })

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/registrations/${id}`)
      .then(r => setReg(r.data))
      .catch(() => setError(true))
  }, [id])

  function copyId() {
    navigator.clipboard.writeText(String(id)).then(() => {
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    })
  }

  function copyPw() {
    navigator.clipboard.writeText(savedPw).then(() => {
      setCopiedPw(true)
      setTimeout(() => setCopiedPw(false), 2000)
    })
  }

  if (error) return (
    <main style={{ padding: '80px 0' }}>
      <div className="container" style={{ maxWidth: 560, textAlign: 'center' }}>
        <div className="alert alert-danger">Registration not found.</div>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>Go Home</Link>
      </div>
    </main>
  )

  if (!reg) return (
    <main style={{ padding: '80px 0', textAlign: 'center' }}>
      <div style={{ color: 'var(--gray-400)' }}>Loading...</div>
    </main>
  )

  return (
    <main style={{ padding: '60px 0 80px' }}>
      <div className="container" style={{ maxWidth: 600 }}>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div className="confirm-icon">✅</div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>Registration Confirmed!</h1>
            <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>
              Thank you! <strong>{reg.camper_first_name} {reg.camper_last_name}</strong> has been registered for HHFC Youth Camp 2027.
            </p>

            {/* Profile credentials — ID + password */}
            <div style={{
              background: 'linear-gradient(135deg, #022c22 0%, #14532d 100%)',
              border: '2px solid #22c55e',
              borderRadius: 14,
              padding: '20px 20px 18px',
              marginBottom: 20,
              position: 'relative',
              overflow: 'hidden',
              textAlign: 'left',
            }}>
              <div style={{ position: 'absolute', top: -24, right: -24, width: 90, height: 90, borderRadius: '50%', background: 'rgba(34,197,94,.12)' }} />
              <div style={{ fontSize: '.7rem', fontWeight: 700, color: '#4ade80', letterSpacing: '.09em', textTransform: 'uppercase', marginBottom: 14 }}>
                🔐 Save Your Profile Login Credentials
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {/* Registration ID */}
                <div style={{ flex: '1 1 160px', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Hash size={13} color="#4ade80" />
                    <span style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Registration ID</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ flex: 1, fontSize: '1.5rem', fontWeight: 900, color: '#fff', letterSpacing: '.02em', lineHeight: 1 }}>
                      #{id}
                    </span>
                    <button
                      onClick={copyId}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        background: copiedId ? '#16a34a' : 'rgba(255,255,255,.12)',
                        color: copiedId ? '#fff' : 'rgba(255,255,255,.7)',
                        border: '1px solid rgba(255,255,255,.2)',
                        borderRadius: 6, padding: '5px 11px',
                        fontSize: '.72rem', fontWeight: 600, cursor: 'pointer',
                        transition: 'all .2s', whiteSpace: 'nowrap',
                      }}
                    >
                      {copiedId ? <Check size={12} /> : <Copy size={12} />}
                      {copiedId ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Password */}
                {savedPw && (
                  <div style={{ flex: '1 1 160px', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Lock size={13} color="#4ade80" />
                      <span style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Password</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ flex: 1, fontSize: '.92rem', fontWeight: 700, color: '#fff', letterSpacing: showPw ? '.03em' : '.2em', fontFamily: 'monospace' }}>
                        {showPw ? savedPw : '•'.repeat(Math.min(savedPw.length, 10))}
                      </span>
                      <button type="button" onClick={() => setShowPw(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)', padding: 2, display: 'flex', alignItems: 'center' }}>
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={copyPw}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          background: copiedPw ? '#16a34a' : 'rgba(255,255,255,.12)',
                          color: copiedPw ? '#fff' : 'rgba(255,255,255,.7)',
                          border: '1px solid rgba(255,255,255,.2)',
                          borderRadius: 6, padding: '5px 11px',
                          fontSize: '.72rem', fontWeight: 600, cursor: 'pointer',
                          transition: 'all .2s', whiteSpace: 'nowrap',
                        }}
                      >
                        {copiedPw ? <Check size={12} /> : <Copy size={12} />}
                        {copiedPw ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <p style={{ margin: '14px 0 0', fontSize: '.76rem', color: 'rgba(255,255,255,.4)', lineHeight: 1.5 }}>
                Use these to log in at <strong style={{ color: 'rgba(255,255,255,.65)' }}>Profile → My Registration</strong>. This password will not be shown again.
              </p>
            </div>

            <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: '20px 24px', textAlign: 'left', marginBottom: 28 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  ['Session', reg.session],
                  ['Camper', `${reg.camper_first_name} ${reg.camper_last_name}`],
                  ['Age', `${reg.camper_age} years old`],
                  ['Parent/Guardian', reg.parent_name],
                  ['Contact Email', reg.parent_email],
                  ['T-Shirt Size', reg.tshirt_size],
                  ['Status', reg.status.charAt(0).toUpperCase() + reg.status.slice(1)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: '.78rem', color: 'var(--gray-500)' }}>{label}</div>
                    <div style={{ fontWeight: 600, fontSize: '.9rem', marginTop: 2 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/" className="btn btn-outline">← Back to Home</Link>
              <Link to="/register" className="btn btn-primary">Register Another Camper</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
