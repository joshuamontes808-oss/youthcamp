import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

export default function Confirmation() {
  const { id } = useParams()
  const [reg, setReg] = useState(null)
  const [error, setError] = useState(false)

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

            <div className="alert alert-success" style={{ textAlign: 'left', marginBottom: 28 }}>
              📧 A confirmation summary has been noted under registration <strong>#{reg.id}</strong>. Keep this for your records.
            </div>

            <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: '20px 24px', textAlign: 'left', marginBottom: 28 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  ['Registration ID', `#${reg.id}`],
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
