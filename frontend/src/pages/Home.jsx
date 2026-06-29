import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Calendar, Users, Zap, ShieldCheck, Megaphone, CalendarDays, Trophy, Building2, CheckCircle2, Lock, IdCard } from 'lucide-react'


const CAT_COLOR = { activities: '#059669', general: '#d97706' }
const CAT_BG    = { activities: '#ecfdf5', general: '#fffbeb' }
const CAT_LABEL = { activities: 'Activities', general: 'General' }

function AnnouncementCard({ a }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '20px 24px',
      boxShadow: '0 2px 12px rgba(0,0,0,.06)', borderLeft: `4px solid ${CAT_COLOR[a.category]}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{
          background: CAT_BG[a.category], color: CAT_COLOR[a.category],
          fontSize: '.72rem', fontWeight: 700, padding: '3px 12px',
          borderRadius: 999, border: `1px solid ${CAT_COLOR[a.category]}30`,
        }}>
          {CAT_LABEL[a.category]}
        </span>
        <span style={{ fontSize: '.78rem', color: 'var(--gray-400)' }}>
          {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
      <div style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--primary-deep)', marginBottom: 6 }}>{a.title}</div>
      <div style={{ fontSize: '.875rem', color: 'var(--gray-600)', whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>{a.message}</div>
    </div>
  )
}

export default function Home() {
  const [announcements, setAnnouncements] = useState([])
  const [regOpen, setRegOpen] = useState(null)
  const [activityIdx, setActivityIdx] = useState(0)

  useEffect(() => {
  let cancelled = false

  function fetchData() {
    const c1 = new AbortController()
    const c2 = new AbortController()

    axios.get(`${import.meta.env.VITE_API_URL}/api/announcements`, { signal: c1.signal })
      .then(r => { if (!cancelled) setAnnouncements(Array.isArray(r.data) ? r.data : []) })
      .catch(() => {})

    axios.get(`${import.meta.env.VITE_API_URL}/api/settings/registration`, { signal: c2.signal })
      .then(r => { if (!cancelled) setRegOpen(r.data.open) })
      .catch(() => { if (!cancelled) setRegOpen(true) })
  }

  fetchData()
  const interval = setInterval(fetchData, 15000)

  return () => {
    cancelled = true
    clearInterval(interval)
  }
}, [])

const safeAnnouncements = Array.isArray(announcements) ? announcements : []
const activityAnn = safeAnnouncements.filter(a => a.category === 'activities')
const generalAnn  = safeAnnouncements.filter(a => a.category === 'general')

  useEffect(() => {
    if (activityAnn.length <= 1) return
    const t = setInterval(() => setActivityIdx(i => (i + 1) % activityAnn.length), 5000)
    return () => clearInterval(t)
  }, [activityAnn.length])

  return (
    <main>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="container">
          <div className="hero-eyebrow">Harvest House Family Church</div>
          <h1>HHFC Youth Camp<br/>2027</h1>
          <p className="subtitle">
            A week of adventure, friendship, and growing in faith.<br/>
            Register early — spots fill fast!
          </p>
          <div className="hero-badges">
            <span className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Building2 size={13} /> HHFC</span>
            <span className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Users size={13} /> Ages 13–19</span>
            {regOpen === true  && <span className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(22,163,74,.25)', border: '1px solid rgba(22,163,74,.4)', color: '#86efac' }}><CheckCircle2 size={13} /> Registration Open</span>}
            {regOpen === false && <span className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(220,38,38,.2)', border: '1px solid rgba(220,38,38,.35)', color: '#fca5a5' }}><Lock size={13} /> Registration Closed</span>}
          </div>
          <div className="hero-actions">
            {regOpen === false
              ? <span className="btn btn-white btn-lg" style={{ opacity: .45, cursor: 'not-allowed', pointerEvents: 'none' }}>Registration Closed</span>
              : <Link to="/register" className="btn btn-white btn-lg">Register Now →</Link>
            }
            <Link to="/my-registration" className="btn btn-outline-white btn-lg">View My Profile</Link>
          </div>
        </div>
      </section>

      <div className="container">
        {/* ── Closed banner ── */}
        {regOpen === false && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 14, padding: '18px 24px', margin: '28px 0 0', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <Lock size={20} style={{ flexShrink: 0, color: '#dc2626', marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>Registration is Currently Closed</div>
              <div style={{ fontSize: '.875rem', color: '#b91c1c' }}>
                Registration for HHFC Youth Camp 2027 is not accepting new sign-ups at this time. Check back later or contact us at{' '}
                <a href="mailto:duo.vision3128@gmail.com" style={{ color: '#991b1b', fontWeight: 600, textDecoration: 'underline' }}>duo.vision3128@gmail.com</a>.
              </div>
            </div>
          </div>
        )}

        {/* ── Info cards ── */}
        <div className="info-grid">
          {/* Ages 13-19 — static */}
          <div className="info-card">
            <div className="icon-wrap"><Users size={28} color="var(--primary)" strokeWidth={1.75} /></div>
            <h3>Ages 13–19</h3>
            <p>All participants join every activity as one group — no separations, just one unforgettable camp experience.</p>
          </div>

          {/* Activities — dynamic, cycling */}
          <div className="info-card">
            <div className="icon-wrap"><Trophy size={28} color="var(--primary)" strokeWidth={1.75} /></div>
            <h3>Activities</h3>
            {activityAnn.length > 0 ? (
              <div style={{ minHeight: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div
                  key={activityIdx}
                  className="activity-pop"
                  style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--primary-deep)', textAlign: 'center' }}
                >
                  {activityAnn[activityIdx % activityAnn.length].title}
                </div>
                {activityAnn.length > 1 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                    {activityAnn.map((_, i) => (
                      <span
                        key={i}
                        style={{
                          width: i === activityIdx % activityAnn.length ? 16 : 6,
                          height: 6, borderRadius: 999,
                          background: i === activityIdx % activityAnn.length ? 'var(--primary)' : 'var(--gray-300)',
                          transition: 'all .3s',
                          display: 'inline-block',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p>Activities to be announced. Stay tuned for updates!</p>
            )}
          </div>

          {/* Safe & Supervised — static */}
          <div className="info-card">
            <div className="icon-wrap"><ShieldCheck size={28} color="var(--primary)" strokeWidth={1.75} /></div>
            <h3>Safe & Supervised</h3>
            <p>Certified staff, medical personnel on-site, 24/7 supervision.</p>
          </div>
        </div>

        {/* ── Already Registered card ── */}
        <div className="reg-lookup-card">
          <div>
            <div className="reg-lookup-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IdCard size={18} /> Already Registered?</div>
            <div className="reg-lookup-sub">View your registration profile and check your confirmation status.</div>
          </div>
          <Link to="/my-registration" className="btn btn-white">View My Profile →</Link>
        </div>

        {/* ── General announcements ── */}
        {generalAnn.length > 0 && (
          <section style={{ marginBottom: 52 }}>
            <div className="section-label"><Megaphone size={12} /> Announcements</div>
            <h2 className="section-title">General Updates</h2>
            <p className="section-sub">Stay tuned for the latest from HHFC Youth Camp.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {generalAnn.map(a => <AnnouncementCard key={a.id} a={a} />)}
            </div>
          </section>
        )}

        {/* ── Activities ── */}
        <section style={{ marginBottom: 52 }}>
          <div className="section-label"><Zap size={12} /> Activities</div>
          <h2 className="section-title">Camp Activities</h2>
          <p className="section-sub">Activity lineup will be revealed soon. Get excited!</p>
          {activityAnn.length > 0
            ? <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{activityAnn.map(a => <AnnouncementCard key={a.id} a={a} />)}</div>
            : (
              <div className="tba-block">
                <div className="tba-icon"><Trophy size={36} color="var(--primary)" strokeWidth={1.5} /></div>
                <div className="tba-title">To Be Announced</div>
                <div className="tba-sub">Activity details will be posted here soon. Stay tuned!</div>
              </div>
            )
          }
        </section>

        {/* ── CTA ── */}
        <div className="cta-section">
          <h2>Ready to join us?</h2>
          <p>
            Complete the registration form in under 5 minutes. Questions? Email us at{' '}
            <a href="mailto:duo.vision3128@gmail.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              duo.vision3128@gmail.com
            </a>
          </p>
          {regOpen === false
            ? <span className="btn btn-primary btn-lg" style={{ opacity: .5, cursor: 'not-allowed', pointerEvents: 'none' }}>Registration Closed</span>
            : <Link to="/register" className="btn btn-primary btn-lg">Start Registration →</Link>
          }
        </div>
      </div>
    </main>
  )
}
