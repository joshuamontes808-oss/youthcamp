import { useEffect, useRef, useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { User, Users, HeartPulse, Tent, CreditCard, Link2, Printer, Clock, CheckCircle2, XCircle, MessageCircle, Send, Bell } from 'lucide-react'

const STATUS_COLOR = { pending: '#d97706', confirmed: '#16a34a', cancelled: '#dc2626' }
const STATUS_BG    = { pending: '#fffbeb', confirmed: '#f0fdf4', cancelled: '#fef2f2' }

function Avatar({ name }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: 80, height: 80, borderRadius: '50%',
      background: 'linear-gradient(135deg, #15803d, #059669)',
      color: '#fff', fontSize: '1.75rem', fontWeight: 800,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>{initials}</div>
  )
}

function Section({ title, icon, children }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-body">
        <h3 style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--primary-deep)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)' }}>{icon}</span>
          {title}
        </h3>
        {children}
      </div>
    </div>
  )
}

// ── Status banner ──────────────────────────────────────────────
function StatusBanner({ status }) {
  const cfg = {
    pending: {
      bg:        'linear-gradient(135deg, #78350f 0%, #92400e 60%, #b45309 100%)',
      border:    'rgba(245,158,11,.35)',
      glowBg:    'rgba(245,158,11,.08)',
      iconBg:    'rgba(245,158,11,.18)',
      iconColor: '#fbbf24',
      accent:    '#fbbf24',
      accentDim: 'rgba(251,191,36,.35)',
      tag:       'Awaiting Payment Verification',
      title:     'Payment Under Review',
      body:      'Your GCash receipt has been received and is being reviewed by our team. This usually takes 24–48 hours.',
      icon:      <Clock size={30} />,
      pulse:     true,
    },
    confirmed: {
      bg:        'linear-gradient(135deg, #052e16 0%, #14532d 60%, #166534 100%)',
      border:    'rgba(34,197,94,.35)',
      glowBg:    'rgba(34,197,94,.08)',
      iconBg:    'rgba(34,197,94,.18)',
      iconColor: '#4ade80',
      accent:    '#4ade80',
      accentDim: 'rgba(74,222,128,.3)',
      tag:       'Registration Active',
      title:     "You're In! See You at Camp 🎉",
      body:      'Your registration has been confirmed and your payment has been verified. Pack your bags!',
      icon:      <CheckCircle2 size={30} />,
      pulse:     false,
    },
    cancelled: {
      bg:        'linear-gradient(135deg, #450a0a 0%, #7f1d1d 60%, #991b1b 100%)',
      border:    'rgba(220,38,38,.35)',
      glowBg:    'rgba(220,38,38,.08)',
      iconBg:    'rgba(220,38,38,.18)',
      iconColor: '#f87171',
      accent:    '#f87171',
      accentDim: 'rgba(248,113,113,.3)',
      tag:       'Registration Inactive',
      title:     'Registration Cancelled',
      body:      'This registration has been cancelled. If you believe this is a mistake, please contact us.',
      icon:      <XCircle size={30} />,
      pulse:     false,
    },
  }

  const c = cfg[status] || cfg.pending

  const steps = [
    { label: 'Submitted',  done: true },
    { label: 'Verifying',  done: status === 'pending' || status === 'confirmed' },
    { label: 'Confirmed',  done: status === 'confirmed' },
  ]

  return (
    <div id="profile-status" style={{
      background: c.bg, border: `1.5px solid ${c.border}`,
      borderRadius: 16, padding: '22px 22px 20px', marginBottom: 16,
      color: '#fff', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 8% 50%, ${c.glowBg} 0%, transparent 65%)`, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', position: 'relative' }}>
        {/* Icon */}
        <div style={{
          width: 60, height: 60, borderRadius: 14,
          background: c.iconBg, border: `1.5px solid ${c.accentDim}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: c.iconColor, flexShrink: 0,
          animation: c.pulse ? 'status-icon-pulse 2.4s ease-in-out infinite' : 'none',
        }}>
          {c.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: c.accent, marginBottom: 5 }}>
            {c.tag}
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 6, lineHeight: 1.2 }}>{c.title}</div>
          <div style={{ fontSize: '.855rem', color: 'rgba(255,255,255,.7)', lineHeight: 1.65 }}>{c.body}</div>

          {/* Pending: step progress */}
          {status === 'pending' && (
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center' }}>
              {steps.map((s, i) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: s.done ? c.accent : 'rgba(255,255,255,.12)',
                      border: `2px solid ${s.done ? c.accent : 'rgba(255,255,255,.2)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '.65rem', fontWeight: 800,
                      color: s.done ? '#78350f' : 'rgba(255,255,255,.35)',
                    }}>
                      {s.done ? '✓' : (i + 1)}
                    </div>
                    <span style={{ fontSize: '.66rem', fontWeight: 600, color: s.done ? c.accent : 'rgba(255,255,255,.3)', whiteSpace: 'nowrap' }}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ flex: 1, height: 2, margin: '0 6px', marginBottom: 18, background: i === 0 ? c.accent : 'rgba(255,255,255,.12)' }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Confirmed: verified badge */}
          {status === 'confirmed' && (
            <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.3)', borderRadius: 8, padding: '5px 12px', fontSize: '.78rem', color: '#86efac', fontWeight: 600 }}>
              <CheckCircle2 size={12} /> Payment verified · Spot secured
            </div>
          )}

          {/* Cancelled: contact */}
          {status === 'cancelled' && (
            <div style={{ marginTop: 10, fontSize: '.82rem', color: 'rgba(255,255,255,.5)' }}>
              Contact us at{' '}
              <a href="mailto:duo.vision3128@gmail.com" style={{ color: '#fca5a5', fontWeight: 600 }}>duo.vision3128@gmail.com</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const isMobileScreen = () => window.innerWidth < 540

function Row({ label, value }) {
  const [mobile, setMobile] = useState(isMobileScreen)
  useEffect(() => {
    const h = () => setMobile(isMobileScreen())
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  if (!value || value === '—') return null
  return mobile ? (
    <div style={{ padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
      <div style={{ fontSize: '.75rem', color: 'var(--gray-500)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--gray-800)' }}>{value}</div>
    </div>
  ) : (
    <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
      <div style={{ width: 160, flexShrink: 0, fontSize: '.8rem', color: 'var(--gray-500)', paddingTop: 1 }}>{label}</div>
      <div style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--gray-800)', flex: 1 }}>{value}</div>
    </div>
  )
}

const COOLDOWN_SEC = 5
const MAX_PER_MIN = 5

function ChatBox({ registrationId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [spamMsg, setSpamMsg] = useState('')
  const chatRef = useRef(null)
  const lastText = useRef('')
  const msgTimes = useRef([])
  const cooldownTimer = useRef(null)

  function fetchMessages() {
    axios.get(`${import.meta.env.VITE_API_URL}/api/messages/${registrationId}`)
      .then(r => setMessages(r.data))
      .catch(() => {})
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 8000)
    return () => clearInterval(interval)
  }, [registrationId])



  useEffect(() => {
    if (cooldown <= 0) return
    cooldownTimer.current = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(cooldownTimer.current)
  }, [cooldown])

  async function send(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending || cooldown > 0) return

    if (text === lastText.current) {
      setSpamMsg('Please don\'t send the same message twice.')
      return
    }

    const now = Date.now()
    msgTimes.current = msgTimes.current.filter(t => now - t < 60000)
    if (msgTimes.current.length >= MAX_PER_MIN) {
      setSpamMsg(`Slow down! Max ${MAX_PER_MIN} messages per minute.`)
      return
    }

    setSpamMsg('')
    setSending(true)
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/messages`, {
        registration_id: registrationId,
        sender: 'camper',
        text,
      })
      setMessages(prev => [...prev, res.data])
      setInput('')
      lastText.current = text
      msgTimes.current.push(Date.now())
      setCooldown(COOLDOWN_SEC)
    } catch (_) {}
    setSending(false)
  }

  function fmt(ts) {
    return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-body" style={{ padding: 0 }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--gray-100)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MessageCircle size={18} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--primary-deep)' }}>Message Admin</div>
            <div style={{ fontSize: '.75rem', color: 'var(--gray-400)' }}>Ask questions about your registration</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: '.75rem', color: 'var(--success)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
            Online
          </div>
        </div>

        {/* Messages */}
        <div ref={chatRef} style={{
          height: 300, overflowY: 'auto', padding: '16px 20px',
          display: 'flex', flexDirection: 'column', gap: 10,
          background: 'var(--gray-50)',
        }}>
          {messages.length === 0 && (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--gray-400)', fontSize: '.85rem' }}>
              <MessageCircle size={32} style={{ marginBottom: 8, opacity: .4 }} />
              <div>No messages yet.</div>
              <div style={{ fontSize: '.78rem', marginTop: 4 }}>Send a message to contact the admin.</div>
            </div>
          )}
          {messages.map(m => {
            const isMe = m.sender === 'camper'
            return (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%', padding: '9px 13px', borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: isMe ? 'var(--primary)' : '#fff',
                  color: isMe ? '#fff' : 'var(--gray-800)',
                  fontSize: '.875rem', lineHeight: 1.5,
                  boxShadow: '0 1px 4px rgba(0,0,0,.08)',
                }}>
                  {m.text}
                </div>
                <div style={{ fontSize: '.7rem', color: 'var(--gray-400)', marginTop: 3, paddingInline: 4 }}>
                  {isMe ? 'You' : 'Admin'} · {fmt(m.created_at)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Spam warning */}
        {spamMsg && (
          <div style={{ padding: '6px 16px', background: '#fef2f2', color: '#dc2626', fontSize: '.78rem', borderTop: '1px solid #fca5a5' }}>
            {spamMsg}
          </div>
        )}

        {/* Input */}
        <form onSubmit={send} style={{ padding: '12px 16px', borderTop: '1px solid var(--gray-100)', display: 'flex', gap: 8 }}>
          <input
            className="form-control"
            style={{ flex: 1, borderRadius: 20, padding: '8px 16px', fontSize: '.875rem' }}
            placeholder={cooldown > 0 ? `Please wait ${cooldown}s...` : 'Type your message...'}
            value={input}
            onChange={e => { setInput(e.target.value); setSpamMsg('') }}
            disabled={sending || cooldown > 0}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending || cooldown > 0}
            style={{
              width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: input.trim() && cooldown === 0 ? 'var(--primary)' : 'var(--gray-200)',
              color: input.trim() && cooldown === 0 ? '#fff' : 'var(--gray-400)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all .15s', fontSize: '.75rem', fontWeight: 700,
            }}
          >
            {cooldown > 0 ? cooldown : <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [reg, setReg] = useState(null)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [isMobile, setIsMobile] = useState(isMobileScreen)
  const notifRef = useRef(null)

  useEffect(() => {
    const h = () => setIsMobile(isMobileScreen())
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  const lastReadRef = useRef(localStorage.getItem(`camper_notif_read_${id}`) || new Date(0).toISOString())
  const lastStatusRef = useRef(localStorage.getItem(`camper_last_status_${id}`) || '')

  useEffect(() => {
    const verified = sessionStorage.getItem(`profile_auth_${id}`) === '1'
    if (!verified) { navigate(`/my-registration`, { replace: true }); return }
    axios.get(`${import.meta.env.VITE_API_URL}/api/registrations/${id}`)
      .then(r => { setReg(r.data); lastStatusRef.current = r.data.status; localStorage.setItem(`camper_last_status_${id}`, r.data.status) })
      .catch(() => setError(true))
  }, [id, navigate])

  useEffect(() => {
    if (!reg) return
    async function checkNotifs() {
      try {
        const lastRead = lastReadRef.current
        const notifs = []
        const [msgsRes, regRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/messages/${id}`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/registrations/${id}`),
        ])
        msgsRes.data.filter(m => m.sender === 'admin' && m.created_at > lastRead).forEach(m => {
          notifs.push({ id: `msg_${m.id}`, type: 'message', text: 'New message from Admin', time: m.created_at })
        })
        const currentStatus = regRes.data.status
        const prevStatus = lastStatusRef.current
        if (prevStatus && prevStatus !== currentStatus) {
          const label = currentStatus === 'confirmed' ? 'Registration Confirmed!' : currentStatus === 'cancelled' ? 'Registration Cancelled' : `Status updated to ${currentStatus}`
          notifs.push({ id: `status_${currentStatus}`, type: 'status', text: label, time: new Date().toISOString() })
          lastStatusRef.current = currentStatus
          localStorage.setItem(`camper_last_status_${id}`, currentStatus)
        }
        notifs.sort((a, b) => b.time.localeCompare(a.time))
        setNotifications(notifs)
      } catch (_) {}
    }
    checkNotifs()
    const t = setInterval(checkNotifs, 15000)
    return () => clearInterval(t)
  }, [reg, id])

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleNotifClick(n) {
    if (n.type === 'message') {
      document.getElementById('profile-chatbox')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else if (n.type === 'status') {
      document.getElementById('profile-status')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    markNotifsRead()
  }

  function markNotifsRead() {
    const now = new Date().toISOString()
    localStorage.setItem(`camper_notif_read_${id}`, now)
    lastReadRef.current = now
    setNotifications([])
    setNotifOpen(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handlePrint() { window.print() }

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
      <div style={{ color: 'var(--gray-400)' }}>Loading profile...</div>
    </main>
  )

  const fullName = `${reg.camper_first_name} ${reg.camper_last_name}`
  const status = reg.status || 'pending'

  let activities = '—'
  try {
    const parsed = JSON.parse(reg.activities)
    activities = parsed.length ? parsed.join(', ') : '—'
  } catch { activities = reg.activities || '—' }

  return (
    <main style={{ padding: 'clamp(16px, 4vw, 40px) 0 80px', background: 'var(--gray-50)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 720 }}>

        {/* Status banner */}
        <StatusBanner status={status} />

        {/* Profile header card */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <Avatar name={fullName} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                  <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{fullName}</h1>
                  <span style={{
                    fontSize: '.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                    background: STATUS_BG[status], color: STATUS_COLOR[status],
                    border: `1px solid ${STATUS_COLOR[status]}40`,
                  }}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
                <div style={{ fontSize: '.875rem', color: 'var(--gray-500)', marginBottom: 6 }}>
                  {reg.camper_gender} · {reg.camper_age} years old · {reg.church || 'HHFC'}
                </div>
                <div style={{ fontSize: '.8rem', color: 'var(--gray-400)' }}>
                  Registration ID: <strong style={{ color: 'var(--gray-700)' }}>#{reg.id}</strong>
                  &nbsp;·&nbsp;
                  Registered {new Date(reg.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <button className="btn btn-outline btn-sm" onClick={copyLink} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Link2 size={14} /> {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button className="btn btn-outline btn-sm" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Printer size={14} /> Print
                </button>
                {/* Notification Bell */}
                <div ref={notifRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setNotifOpen(o => !o)}
                    style={{
                      position: 'relative', background: notifOpen ? 'var(--primary-light)' : '#fff',
                      border: '1.5px solid var(--gray-200)', borderRadius: 8,
                      padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    }}
                  >
                    <Bell size={16} color={notifications.length > 0 ? 'var(--primary)' : 'var(--gray-500)'} />
                    {notifications.length > 0 && (
                      <span style={{
                        position: 'absolute', top: -6, right: -6,
                        background: '#dc2626', color: '#fff', borderRadius: '50%',
                        width: 16, height: 16, fontSize: '.6rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {notifications.length > 9 ? '9+' : notifications.length}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div style={{
                      position: 'fixed', right: 12, top: 72, zIndex: 200,
                      width: 'min(300px, calc(100vw - 24px))', background: '#fff', borderRadius: 12,
                      boxShadow: '0 8px 32px rgba(0,0,0,.15)', border: '1px solid var(--gray-200)',
                    }}>
                      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, fontSize: '.9rem' }}>Notifications</span>
                        {notifications.length > 0 && (
                          <button onClick={markNotifsRead} style={{ fontSize: '.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--gray-400)', fontSize: '.875rem' }}>
                            No new notifications
                          </div>
                        ) : notifications.map(n => (
                          <div key={n.id} onClick={() => handleNotifClick(n)} style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-50)', display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', transition: 'background .15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                          >
                            <div style={{
                              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                              background: n.type === 'status' ? (reg.status === 'confirmed' ? '#f0fdf4' : '#fef2f2') : '#eff6ff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {n.type === 'message'
                                ? <MessageCircle size={15} color="#2563eb" />
                                : n.type === 'status' && reg.status === 'confirmed'
                                  ? <CheckCircle2 size={15} color="#16a34a" />
                                  : <XCircle size={15} color="#dc2626" />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '.825rem', fontWeight: 600, color: 'var(--gray-800)' }}>{n.text}</div>
                              <div style={{ fontSize: '.72rem', color: 'var(--gray-400)', marginTop: 2 }}>
                                {new Date(n.time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                              </div>
                              <div style={{ fontSize: '.7rem', color: 'var(--primary)', marginTop: 3, fontWeight: 600 }}>Click to view →</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Camper Info */}
        <Section title="Camper Information" icon={<User size={15} />}>
          <Row label="Full Name" value={fullName} />
          <Row label="Date of Birth" value={reg.camper_dob} />
          <Row label="Age" value={`${reg.camper_age} years old`} />
          <Row label="Gender" value={reg.camper_gender} />
          <Row label="Church" value={reg.church || '—'} />
        </Section>

        {/* Parent / Guardian */}
        <Section title="Parent / Guardian" icon={<Users size={15} />}>
          <Row label="Name" value={reg.parent_name} />
          <Row label="Relationship" value={reg.parent_relationship} />
          <Row label="Phone" value={reg.parent_phone} />
          <Row label="Email" value={reg.parent_email} />
        </Section>

        {/* Medical */}
        <Section title="Medical & Health" icon={<HeartPulse size={15} />}>
          <Row label="Allergies" value={reg.allergies || 'None'} />
          <Row label="Medications" value={reg.medications || 'None'} />
          <Row label="Special Needs" value={reg.special_needs || 'None'} />
          <Row label="Emergency Contact" value={reg.emergency_contact_name} />
          <Row label="Emergency Phone" value={reg.emergency_contact_phone} />
        </Section>

        {/* Camp Preferences */}
        <Section title="Camp Preferences" icon={<Tent size={15} />}>
          <Row label="T-Shirt Size" value={reg.tshirt_size} />
          <Row label="Activities" value={activities} />
          <Row label="Dietary Restrictions" value={reg.dietary_restrictions || 'None'} />
        </Section>

        {/* Payment */}
        <Section title="Payment & Consent" icon={<CreditCard size={15} />}>
          <Row label="GCash Reference #" value={reg.gcash_reference} />
          <Row label="GCash Receipt" value={reg.gcash_receipt_path ? 'Uploaded' : '—'} />
          <Row label="Parent Consent" value={reg.parent_consent_path ? 'Uploaded' : '—'} />
        </Section>

        {/* Chat */}
        <div id="profile-chatbox">
          <ChatBox registrationId={reg.id} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
          <Link to="/" className="btn btn-outline">← Back to Home</Link>
        </div>
      </div>
    </main>
  )
}
