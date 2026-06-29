import { useEffect, useRef, useState, useCallback } from 'react'
import { useBlocker, Link } from 'react-router-dom'
import axios from 'axios'
import { Lock, Eye, EyeOff, UserCircle, RefreshCw, Download, Unlock, LogOut, List, Bell, Loader2, Inbox, Search, Megaphone, AlertTriangle, Info, MessageCircle, Send } from 'lucide-react'

function AdminLogin({ onSuccess }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  async function attempt(e) {
    e.preventDefault()
    if (!input.trim()) return
    setLoading(true)
    setError('')
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/login`, { password: input })
      sessionStorage.setItem('admin_auth', '1')
      onSuccess()
    } catch (err) {
      const msg = err.response?.data?.error || 'Incorrect password.'
      setError(msg)
      setInput('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Lock size={30} color="var(--primary)" strokeWidth={1.75} />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>Admin Access</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '.875rem', marginBottom: 28 }}>Enter the admin password to continue.</p>

            <form onSubmit={attempt} style={{ textAlign: 'left' }}>
              <div className="form-group">
                <label className="form-label">Password<span className="required">*</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    className={`form-control ${error ? 'error' : ''}`}
                    type={show ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={input}
                    autoFocus
                    onChange={e => { setInput(e.target.value); setError('') }}
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', alignItems: 'center' }}
                  >
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {error && <span className="form-error">{error}</span>}
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Unlock Dashboard →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}

function AdminChat({ registrationId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const chatRef = useRef(null)

  function fetchMessages() {
    axios.get(`${import.meta.env.VITE_API_URL}/api/messages/${registrationId}`)
      .then(r => setMessages(Array.isArray(r.data) ? r.data : [])).catch(() => {})
  }

  useEffect(() => {
    fetchMessages()
    const t = setInterval(fetchMessages, 6000)
    return () => clearInterval(t)
  }, [registrationId])

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, [messages])

  async function send(e) {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/messages`, {
        registration_id: registrationId, sender: 'admin', text: input.trim(),
      })
      setMessages(prev => [...prev, res.data])
      setInput('')
    } catch (_) {}
    setSending(false)
  }

  function fmt(ts) {
    return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div style={{ marginTop: 20, border: '1px solid var(--gray-200)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', background: 'var(--primary-deep)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <MessageCircle size={16} color="#fff" />
        <span style={{ fontWeight: 700, fontSize: '.875rem', color: '#fff' }}>Chat with Camper</span>
      </div>
      <div ref={chatRef} style={{ height: 240, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--gray-50)' }}>
        {messages.length === 0 && (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--gray-400)', fontSize: '.82rem' }}>
            No messages yet.
          </div>
        )}
        {messages.map(m => {
          const isAdmin = m.sender === 'admin'
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isAdmin ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '78%', padding: '8px 12px',
                borderRadius: isAdmin ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                background: isAdmin ? 'var(--primary)' : '#fff',
                color: isAdmin ? '#fff' : 'var(--gray-800)',
                fontSize: '.845rem', lineHeight: 1.5,
                boxShadow: '0 1px 3px rgba(0,0,0,.07)',
              }}>
                {m.text}
              </div>
              <div style={{ fontSize: '.68rem', color: 'var(--gray-400)', marginTop: 2, paddingInline: 3 }}>
                {isAdmin ? 'You (Admin)' : 'Camper'} · {fmt(m.created_at)}
              </div>
            </div>
          )
        })}
      </div>
      <form onSubmit={send} style={{ padding: '10px 12px', borderTop: '1px solid var(--gray-100)', display: 'flex', gap: 8, background: '#fff' }}>
        <input
          className="form-control"
          style={{ flex: 1, borderRadius: 20, padding: '7px 14px', fontSize: '.875rem' }}
          placeholder="Reply to camper..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          style={{
            width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
            background: input.trim() ? 'var(--primary)' : 'var(--gray-200)',
            color: input.trim() ? '#fff' : 'var(--gray-400)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
          }}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  )
}

function MessagesTab({ regs, jumpToId, onJumped }) {
  const [allMessages, setAllMessages] = useState({})
  const [selectedReg, setSelectedReg] = useState(null)
  const [readCounts, setReadCounts] = useState({})
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const msgListRef = useRef(null)

  useEffect(() => {
    if (!jumpToId || !regs.length) return
    const reg = regs.find(r => r.id === jumpToId)
    if (reg) { setSelectedReg(reg); onJumped?.() }
  }, [jumpToId, regs])

  function fetchAll() {
    axios.get(`${import.meta.env.VITE_API_URL}/api/messages/all/list`)
      .then(r => {
          const map = {}
          const list = Array.isArray(r.data) ? r.data : []
      list.forEach(m => {
          if (!map[m.registration_id]) map[m.registration_id] = []
          map[m.registration_id].push(m)
        })
        setAllMessages(map)
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchAll()
    const t = setInterval(fetchAll, 6000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => { if (msgListRef.current) msgListRef.current.scrollTop = msgListRef.current.scrollHeight }, [allMessages, selectedReg])

  async function send(e) {
    e.preventDefault()
    if (!input.trim() || !selectedReg || sending) return
    setSending(true)
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/messages`, {
        registration_id: selectedReg.id, sender: 'admin', text: input.trim(),
      })
      setAllMessages(prev => ({ ...prev, [selectedReg.id]: [...(prev[selectedReg.id] || []), res.data] }))
      setInput('')
    } catch (_) {}
    setSending(false)
  }

  function fmt(ts) {
    return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const currentMsgs = selectedReg ? (allMessages[selectedReg.id] || []) : []

  return (
    <div style={{ display: 'flex', gap: 0, border: '1px solid var(--gray-200)', borderRadius: 14, overflow: 'hidden', minHeight: 520 }}>
      {/* Left: inbox list */}
      <div style={{ width: 260, flexShrink: 0, borderRight: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', background: '#fff' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-100)', fontWeight: 700, fontSize: '.875rem', color: 'var(--primary-deep)' }}>
          Conversations
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {regs.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--gray-400)', fontSize: '.82rem' }}>No registrations yet.</div>
          )}
          {regs.map(r => {
            const msgs = allMessages[r.id] || []
            const last = msgs[msgs.length - 1]
            const camperMsgs = msgs.filter(m => m.sender === 'camper').length
            const unread = camperMsgs - (readCounts[r.id] ?? 0)
            const isActive = selectedReg?.id === r.id
            return (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedReg(r)
                  setReadCounts(prev => ({ ...prev, [r.id]: camperMsgs }))
                }}
                style={{
                  width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', cursor: 'pointer',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  borderBottom: '1px solid var(--gray-100)',
                  transition: 'background .1s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                  <div style={{ fontWeight: unread > 0 ? 800 : 700, fontSize: '.85rem', color: unread > 0 ? 'var(--gray-900)' : 'var(--gray-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                    {r.camper_first_name} {r.camper_last_name}
                  </div>
                  {unread > 0 && (
                    <span style={{ background: 'var(--primary)', color: '#fff', fontSize: '.65rem', fontWeight: 700, borderRadius: 999, padding: '1px 6px', flexShrink: 0, marginLeft: 6 }}>
                      {unread}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '.75rem', color: unread > 0 ? 'var(--gray-600)' : 'var(--gray-400)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: unread > 0 ? 600 : 400 }}>
                  {last ? last.text : 'No messages yet'}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right: chat window */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--gray-50)' }}>
        {!selectedReg ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--gray-400)' }}>
            <MessageCircle size={40} style={{ marginBottom: 12, opacity: .3 }} />
            <div style={{ fontWeight: 600, fontSize: '.9rem' }}>Select a camper to view messages</div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{ padding: '12px 20px', background: '#fff', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#15803d,#059669)', color: '#fff', fontWeight: 800, fontSize: '.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {selectedReg.camper_first_name[0]}{selectedReg.camper_last_name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--gray-800)' }}>{selectedReg.camper_first_name} {selectedReg.camper_last_name}</div>
                <div style={{ fontSize: '.75rem', color: 'var(--gray-400)' }}>Registration #{selectedReg.id}</div>
              </div>
            </div>

            {/* Messages */}
            <div ref={msgListRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentMsgs.length === 0 && (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--gray-400)', fontSize: '.82rem' }}>
                  No messages yet. Camper hasn't sent anything.
                </div>
              )}
              {currentMsgs.map(m => {
                const isAdmin = m.sender === 'admin'
                return (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isAdmin ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '75%', padding: '9px 13px',
                      borderRadius: isAdmin ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: isAdmin ? 'var(--primary)' : '#fff',
                      color: isAdmin ? '#fff' : 'var(--gray-800)',
                      fontSize: '.875rem', lineHeight: 1.5,
                      boxShadow: '0 1px 4px rgba(0,0,0,.07)',
                    }}>
                      {m.text}
                    </div>
                    <div style={{ fontSize: '.68rem', color: 'var(--gray-400)', marginTop: 2, paddingInline: 4 }}>
                      {isAdmin ? 'You (Admin)' : 'Camper'} · {fmt(m.created_at)}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input */}
            <form onSubmit={send} style={{ padding: '12px 16px', borderTop: '1px solid var(--gray-200)', display: 'flex', gap: 8, background: '#fff' }}>
              <input
                className="form-control"
                style={{ flex: 1, borderRadius: 20, padding: '8px 16px', fontSize: '.875rem' }}
                placeholder={`Reply to ${selectedReg.camper_first_name}...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                style={{
                  width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
                  background: input.trim() ? 'var(--primary)' : 'var(--gray-200)',
                  color: input.trim() ? '#fff' : 'var(--gray-400)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function DetailModal({ reg, onClose, onStatusChange }) {
  if (!reg) return null

  function fmt(v) { return v || '—' }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Registration #{reg.id} — {reg.camper_first_name} {reg.camper_last_name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to={`/profile/${reg.id}`} className="btn btn-sm btn-outline" onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><UserCircle size={14} /> View Profile</Link>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '.875rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Status</label>
            <select
              className="form-control"
              style={{ maxWidth: 200 }}
              value={reg.status}
              onChange={e => onStatusChange(reg.id, e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {[
            ['Camper Info', [['Name', `${reg.camper_first_name} ${reg.camper_last_name}`], ['DOB', reg.camper_dob], ['Age', `${reg.camper_age}`], ['Gender', reg.camper_gender], ['Church', fmt(reg.church)]]],
            ['Parent / Guardian', [['Name', reg.parent_name], ['Relationship', reg.parent_relationship], ['Phone', reg.parent_phone], ['Email', reg.parent_email]]],
            ['Medical & Health', [['Allergies', fmt(reg.allergies)], ['Medications', fmt(reg.medications)], ['Special Needs', fmt(reg.special_needs)], ['Emergency Contact', `${fmt(reg.emergency_contact_name)} — ${fmt(reg.emergency_contact_phone)}`]]],
            ['Camp Preferences', [['T-Shirt Size', reg.tshirt_size], ['Activities', (() => { try { const a = JSON.parse(reg.activities); return a.length ? a.join(', ') : '—' } catch { return fmt(reg.activities) } })()], ['Dietary', fmt(reg.dietary_restrictions)]]],
            ['Payment & Consent', [['GCash Reference #', fmt(reg.gcash_reference)], ['GCash Receipt', reg.gcash_receipt_path ? 'uploaded' : '—'], ['Parent\'s Consent', reg.parent_consent_path ? 'uploaded' : '—']]],
          ].map(([title, fields]) => (
            <div key={title} className="review-section">
              <h3>{title}</h3>
              <div className="review-grid">
                {fields.map(([label, value]) => (
                  <div key={label} className="review-item">
                    <div className="label">{label}</div>
                    <div className="value">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ fontSize: '.8rem', color: 'var(--gray-400)', marginTop: 16 }}>
            Registered: {new Date(reg.created_at).toLocaleString()}
          </div>

          <AdminChat registrationId={reg.id} />
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === '1')
  const [regs, setRegs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [tab, setTab] = useState('registrations')
  const [announcements, setAnnouncements] = useState([])
  const [annForm, setAnnForm] = useState({ category: 'general', title: '', message: '' })
  const [annError, setAnnError] = useState('')
  const [regOpen, setRegOpen] = useState(true)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [msgJumpId, setMsgJumpId] = useState(null)
  const notifRef = useRef(null)
  const lastReadRef = useRef(localStorage.getItem('admin_notif_read') || new Date(0).toISOString())

  useEffect(() => {
    if (!authed) return
    async function checkNotifs() {
      try {
        const lastRead = lastReadRef.current
        const [regsRes, msgsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/registrations`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/messages/all/list`),
        ])
        const notifs = []
        regsRes.data.forEach(r => {
          if (r.created_at > lastRead)
            notifs.push({ id: `reg_${r.id}`, type: 'registration', text: `New camper registered: ${r.camper_first_name} ${r.camper_last_name}`, time: r.created_at })
        })
        msgsRes.data.filter(m => m.sender === 'camper').forEach(m => {
          if (m.created_at > lastRead)
            notifs.push({ id: `msg_${m.id}`, type: 'message', text: `New message from Camper #${m.registration_id}`, time: m.created_at })
        })
        notifs.sort((a, b) => b.time.localeCompare(a.time))
        setNotifications(notifs)
      } catch (_) {}
    }
    checkNotifs()
    const t = setInterval(checkNotifs, 15000)
    return () => clearInterval(t)
  }, [authed])

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function markNotifsRead() {
    const now = new Date().toISOString()
    localStorage.setItem('admin_notif_read', now)
    lastReadRef.current = now
    setNotifications([])
    setNotifOpen(false)
  }

  function handleNotifClick(n) {
    if (n.type === 'registration') {
      const reg = regs.find(r => `reg_${r.id}` === n.id)
      if (reg) setSelected(reg)
      setTab('registrations')
    } else if (n.type === 'message') {
      const regId = parseInt(n.id.replace('msg_', ''))
      setMsgJumpId(regId)
      setTab('messages')
    }
    markNotifsRead()
  }

  const blocker = useBlocker(
    useCallback(({ currentLocation, nextLocation }) =>
      authed && currentLocation.pathname !== nextLocation.pathname,
    [authed])
  )

  useEffect(() => {
    if (!authed) return
    const handler = e => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [authed])

  function logout() {
    sessionStorage.removeItem('admin_auth')
    setAuthed(false)
  }

  function load() {
    setLoading(true)
    setRefreshKey(k => k + 1)
  }

  useEffect(() => {
    if (!authed) return
    let active = true
    axios.get(`${import.meta.env.VITE_API_URL}/api/registrations`)
      .then(r => { if (active) setRegs(Array.isArray(r.data) ? r.data : []) })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey, authed])

 useEffect(() => {
  if (!authed) return
  axios.get(`${import.meta.env.VITE_API_URL}/api/announcements`)
    .then(r => setAnnouncements(Array.isArray(r.data) ? r.data : []))
    .catch(() => setAnnouncements([]))
}, [authed])

  useEffect(() => {
    if (!authed) return
    axios.get(`${import.meta.env.VITE_API_URL}/api/settings/registration`)
      .then(r => setRegOpen(r.data.open))
      .catch(() => {})
  }, [authed])

  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />

async function toggleRegistration() {
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/settings/registration`, { open: !regOpen })
    setRegOpen(res.data.open)
  } catch (err) {
    alert('Failed to update registration status. Check the console for details.')
    console.error(err)
  }
}

  async function postAnnouncement(e) {
    e.preventDefault()
    if (!annForm.title.trim() || !annForm.message.trim()) { setAnnError('Title and message are required.'); return }
    setAnnError('')
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/announcements`, annForm)
    setAnnouncements(prev => [{ ...annForm, id: res.data.id, created_at: new Date().toISOString() }, ...prev])
    setAnnForm({ category: 'general', title: '', message: '' })
  }

  async function deleteAnnouncement(id) {
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/announcements/${id}`)
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  async function updateStatus(id, status) {
    await axios.patch(`${import.meta.env.VITE_API_URL}/api/registrations/${id}/status`, { status })
    setRegs(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    if (selected?.id === id) setSelected(s => ({ ...s, status }))
  }

  async function deleteReg(id) {
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/registrations/${id}`)
    setRegs(prev => prev.filter(r => r.id !== id))
    setDeleteId(null)
    if (selected?.id === id) setSelected(null)
  }

  const filtered = (Array.isArray(regs) ? regs : []).filter(r => {
    const matchFilter = filter === 'all' || r.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || `${r.camper_first_name} ${r.camper_last_name} ${r.parent_email}`.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  const counts = {
  all: regs.length,
  pending: (Array.isArray(regs) ? regs : []).filter(r => r.status === 'pending').length,
  confirmed: (Array.isArray(regs) ? regs : []).filter(r => r.status === 'confirmed').length,
  cancelled: (Array.isArray(regs) ? regs : []).filter(r => r.status === 'cancelled').length,
}

  async function exportCSV() {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/registrations/export/csv`, {
      responseType: 'blob',
    })
    const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8;' }))
    const filename = `YouthCamp2027_Registrations_${new Date().toISOString().slice(0, 10)}.csv`
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--gray-500)' }}>HHFC Youth Camp 2027</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn btn-outline" onClick={load} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><RefreshCw size={15} /> Refresh</button>
            <button className="btn btn-success" onClick={exportCSV} disabled={regs.length === 0} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Download size={15} /> Export CSV</button>
            <button
              onClick={toggleRegistration}
              style={{
                padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '.875rem',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: regOpen ? '#fef2f2' : '#f0fdf4',
                color: regOpen ? 'var(--danger)' : 'var(--success)',
                border: `1.5px solid ${regOpen ? '#fca5a5' : '#86efac'}`,
              }}
            >
              {regOpen ? <><Lock size={14} /> Close Registration</> : <><Unlock size={14} /> Open Registration</>}
            </button>
            {/* Notification Bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                style={{
                  position: 'relative', background: notifOpen ? 'var(--primary-light)' : '#fff',
                  border: '1.5px solid var(--gray-200)', borderRadius: 8,
                  padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                }}
              >
                <Bell size={18} color={notifications.length > 0 ? 'var(--primary)' : 'var(--gray-500)'} />
                {notifications.length > 0 && (
                  <span style={{
                    position: 'absolute', top: -6, right: -6,
                    background: '#dc2626', color: '#fff', borderRadius: '50%',
                    width: 18, height: 18, fontSize: '.65rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '110%', zIndex: 200,
                  width: 320, background: '#fff', borderRadius: 12,
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
                  <div style={{ maxHeight: 360, overflowY: 'auto' }}>
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
                          background: n.type === 'registration' ? '#f0fdf4' : '#eff6ff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {n.type === 'registration'
                            ? <UserCircle size={16} color="#16a34a" />
                            : <MessageCircle size={16} color="#2563eb" />}
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
            <button className="btn btn-danger" onClick={logout} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><LogOut size={15} /> Logout</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid var(--gray-200)', marginBottom: 28 }}>
          {[
            ['registrations', <><List size={15} /> Registrations</>],
            ['announcements', <><Bell size={15} /> Announcements</>],
            ['messages',      <><MessageCircle size={15} /> Messages</>],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '.9rem', display: 'inline-flex', alignItems: 'center', gap: 6,
                color: tab === key ? 'var(--primary)' : 'var(--gray-500)',
                borderBottom: tab === key ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom: -2,
              }}
            >{label}</button>
          ))}
        </div>

        {tab === 'registrations' && <>
          {/* Stats */}
          <div className="stats-row">
            {[['Total', counts.all, '#2563eb'], ['Pending', counts.pending, '#d97706'], ['Confirmed', counts.confirmed, '#16a34a'], ['Cancelled', counts.cancelled, '#dc2626']].map(([label, num, color]) => (
              <div key={label} className="stat-card">
                <div className="stat-num" style={{ color }}>{num}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              className="form-control"
              style={{ maxWidth: 280 }}
              placeholder="Search by name, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
                <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="empty-state"><div className="icon"><Loader2 size={36} color="var(--primary)" /></div><p>Loading registrations...</p></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="icon"><Inbox size={36} color="var(--gray-400)" /></div><p>No registrations found.</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Camper</th><th>Age</th><th>Church</th>
                    <th>Parent</th><th>Email</th><th>Status</th><th>Registered</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td style={{ color: 'var(--gray-400)', fontWeight: 600 }}>#{r.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.camper_first_name} {r.camper_last_name}</div>
                        <div style={{ fontSize: '.78rem', color: 'var(--gray-400)' }}>{r.camper_gender}</div>
                      </td>
                      <td>{r.camper_age}</td>
                      <td style={{ fontSize: '.82rem' }}>{r.church || '—'}</td>
                      <td style={{ fontSize: '.85rem' }}>{r.parent_name}</td>
                      <td style={{ fontSize: '.82rem', color: 'var(--gray-500)' }}>{r.parent_email}</td>
                      <td>
                        <span className={`badge badge-${r.status}`}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ fontSize: '.8rem', color: 'var(--gray-400)' }}>
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-sm btn-outline" onClick={() => setSelected(r)}>View</button>
                          <button className="btn btn-sm btn-danger" onClick={() => setDeleteId(r.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>}

        {tab === 'announcements' && <>
          {/* Post form */}
          <div className="card" style={{ marginBottom: 28 }}>
            <div className="card-body">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Megaphone size={18} color="var(--primary)" /> Post New Announcement</h2>
              <form onSubmit={postAnnouncement}>
                <div className="form-row" style={{ marginBottom: 14 }}>
                  <div>
                    <label className="form-label">Category <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <select className="form-control" value={annForm.category} onChange={e => setAnnForm(f => ({ ...f, category: e.target.value }))}>
                      <option value="activities">Activities</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Title <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input className="form-control" placeholder="Announcement title" value={annForm.title} onChange={e => setAnnForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label className="form-label">Message <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <textarea className="form-control" rows={3} placeholder="Write your announcement here..." value={annForm.message} onChange={e => setAnnForm(f => ({ ...f, message: e.target.value }))} style={{ resize: 'vertical' }} />
                </div>
                {annError && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{annError}</div>}
                <button type="submit" className="btn btn-primary">Post Announcement</button>
              </form>
            </div>
          </div>

          {/* Existing announcements */}
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14, color: 'var(--gray-700)' }}>Posted Announcements</h2>
          {announcements.length === 0 ? (
            <div className="empty-state"><div className="icon"><Inbox size={36} color="var(--gray-400)" /></div><p>No announcements yet.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {announcements.map(a => {
                const catColor = a.category === 'activities' ? '#16a34a' : '#d97706'
                const catLabel = a.category === 'activities' ? 'Activities' : 'General'
                return (
                  <div key={a.id} className="card">
                    <div className="card-body" style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                            <span style={{ background: catColor, color: '#fff', fontSize: '.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: 999 }}>{catLabel}</span>
                            <span style={{ fontSize: '.78rem', color: 'var(--gray-400)' }}>{new Date(a.created_at).toLocaleDateString()}</span>
                          </div>
                          <div style={{ fontWeight: 700, marginBottom: 4 }}>{a.title}</div>
                          <div style={{ fontSize: '.875rem', color: 'var(--gray-600)', whiteSpace: 'pre-wrap' }}>{a.message}</div>
                        </div>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteAnnouncement(a.id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>}

        {tab === 'messages' && <MessagesTab regs={regs} jumpToId={msgJumpId} onJumped={() => setMsgJumpId(null)} />}
      </div>

      {/* Detail Modal */}
      {selected && (
        <DetailModal
          reg={selected}
          onClose={() => setSelected(null)}
          onStatusChange={updateStatus}
        />
      )}

      {/* Exit Confirmation Modal */}
      {blocker.state === 'blocked' && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={18} /> Exit Admin?</h2>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 24, color: 'var(--gray-600)' }}>
                Are you sure you want to exit the admin dashboard? You will be <strong>logged out</strong> and will need to enter the password again to return.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-outline" onClick={() => blocker.reset()}>Stay</button>
                <button className="btn btn-danger" onClick={() => { logout(); blocker.proceed() }}>Yes, Logout & Exit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Registration</h2>
              <button className="modal-close" onClick={() => setDeleteId(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 24, color: 'var(--gray-600)' }}>
                Are you sure you want to delete registration <strong>#{deleteId}</strong>? This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => deleteReg(deleteId)}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}