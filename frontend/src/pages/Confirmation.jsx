import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { Copy, Check } from 'lucide-react'

export default function Confirmation() {
  const { id } = useParams()
  const [reg, setReg] = useState(null)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)

  function copyId() {
    navigator.clipboard.writeText(String(reg.id)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/registrations/${id}`)
      .then(r => setReg(r.data))
      .catch(() => setError(true))
  }, [id])

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
            <p style={{ color: 'var(--gray-500)', marginBottom: 28 }}>
              Thank you! <strong>{reg.camper_first_name} {reg.camper_last_name}</strong> has been registered for HHFC Youth Camp 2027.
            </p>

            {/* Registration ID highlight */}
            <div style={{
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              border: '2px solid #22c55e',
              borderRadius: 14,
              padding: '20px 24px',
              marginBottom: 20,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: -18, right: -18,
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(34,197,94,.15)',
              }} />
              <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#15803d', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                ⚠️ Save Your Registration ID
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#14532d', letterSpacing: '.02em', lineHeight: 1 }}>
                  #{reg.id}
                </span>
                <button
                  onClick={copyId}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: copied ? '#16a34a' : '#fff',
                    color: copied ? '#fff' : '#15803d',
                    border: '1.5px solid #22c55e',
                    borderRadius: 8, padding: '7px 14px',
                    fontWeight: 600, fontSize: '.8rem', cursor: 'pointer',
                    transition: 'all .2s',
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy ID'}
                </button>
              </div>
              <p style={{ margin: '10px 0 0', fontSize: '.78rem', color: '#166534' }}>
                You'll need this ID to view your profile at <strong>Profile → My Registration</strong>. Please note it down.
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
