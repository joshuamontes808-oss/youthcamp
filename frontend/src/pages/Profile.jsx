import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { User, Users, HeartPulse, Tent, CreditCard, Link2, Printer, Clock, CheckCircle2, XCircle, MessageCircle, Send } from 'lucide-react'

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

function Row({ label, value }) {
  if (!value || value === '—') return null
  return (
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
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

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

  useEffect(() => {
    const verified = sessionStorage.getItem(`profile_auth_${id}`) === '1'
    if (!verified) { navigate(`/my-registration`, { replace: true }); return }
    axios.get(`${import.meta.env.VITE_API_URL}/api/registrations/${id}`)
      .then(r => setReg(r.data))
      .catch(() => setError(true))
  }, [id, navigate])

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
    <main style={{ padding: '40px 0 80px', background: 'var(--gray-50)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 720 }}>

        {/* Profile header card */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <Avatar name={fullName} />
              <div style={{ flex: 1, minWidth: 200 }}>
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
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-outline btn-sm" onClick={copyLink} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Link2 size={14} /> {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button className="btn btn-outline btn-sm" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>

            {/* Status notice */}
            {status === 'pending' && (
              <div style={{ marginTop: 16, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: '.85rem', color: '#92400e', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <Clock size={15} style={{ flexShrink: 0, marginTop: 1 }} /> <span><strong>Pending Verification</strong> — Your GCash payment is being reviewed. This usually takes up to 24 hours.</span>
              </div>
            )}
            {status === 'confirmed' && (
              <div style={{ marginTop: 16, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', fontSize: '.85rem', color: '#166534', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: 1 }} /> <span><strong>Confirmed!</strong> — Your registration has been verified. See you at camp!</span>
              </div>
            )}
            {status === 'cancelled' && (
              <div style={{ marginTop: 16, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: '.85rem', color: '#991b1b', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <XCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> <span><strong>Cancelled</strong> — This registration has been cancelled. Contact us for more info.</span>
              </div>
            )}
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
          <Row label="Session" value={reg.session || 'TBA'} />
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
        <ChatBox registrationId={reg.id} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
          <Link to="/" className="btn btn-outline">← Back to Home</Link>
        </div>
      </div>
    </main>
  )
}
