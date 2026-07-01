import { useState, useEffect, useRef, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import axios from 'axios'
import { CalendarDays, Settings, Plus, Edit2, ChevronLeft, ChevronRight } from 'lucide-react'

// ── Date helpers (no external lib) ────────────────────────────
function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1)
}
function subMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() - n, 1)
}
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}
function isToday(date) { return isSameDay(date, new Date()) }
function getDaysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}
function fmtMonth(date) {
  return date.toLocaleDateString('en-US', { month: 'long' })
}
function fmtDayLetter(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)
}

// ── Glass Calendar dropdown ────────────────────────────────────
function GlassCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState('weekly')
  const scrollRef = useRef(null)

  const monthDays = useMemo(() => {
    const total = getDaysInMonth(currentMonth)
    const days = []
    for (let i = 0; i < total; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1)
      days.push({ date, isToday: isToday(date), isSelected: isSameDay(date, selectedDate) })
    }
    return days
  }, [currentMonth, selectedDate])

  // Scroll to today / selected on open or month change
  useEffect(() => {
    if (!scrollRef.current) return
    const idx = monthDays.findIndex(d => d.isToday) >= 0
      ? monthDays.findIndex(d => d.isToday)
      : monthDays.findIndex(d => d.isSelected)
    if (idx >= 0) {
      const colW = 44
      const left = Math.max(0, idx * colW - scrollRef.current.clientWidth / 2 + colW / 2)
      scrollRef.current.scrollTo({ left, behavior: 'smooth' })
    }
  }, [monthDays])

  return (
    <div className="cal-dropdown">
      {/* Tabs + Settings */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 2, background: 'rgba(0,0,0,.3)', borderRadius: 10, padding: 4 }}>
          {['weekly', 'monthly'].map(v => (
            <button key={v} onClick={() => setView(v)} className={`cal-tab${view === v ? ' cal-tab-active' : ''}`}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <button className="cal-icon-btn"><Settings size={17} /></button>
      </div>

      {/* Month name + nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '18px 0 14px' }}>
        <p key={fmtMonth(currentMonth)} className="cal-month-name">{fmtMonth(currentMonth)}</p>
        <div style={{ display: 'flex', gap: 2 }}>
          <button className="cal-icon-btn" onClick={() => setCurrentMonth(m => subMonths(m, 1))}><ChevronLeft size={17} /></button>
          <button className="cal-icon-btn" onClick={() => setCurrentMonth(m => addMonths(m, 1))}><ChevronRight size={17} /></button>
        </div>
      </div>

      {/* Scrollable days */}
      <div ref={scrollRef} className="cal-scroll">
        <div className="cal-days-row">
          {monthDays.map((day, i) => (
            <div key={i} className="cal-day-col">
              <span className="cal-day-letter">{fmtDayLetter(day.date)}</span>
              <button
                className={`cal-day-btn${day.isSelected ? ' cal-day-selected' : ''}`}
                onClick={() => setSelectedDate(day.date)}
              >
                {day.isToday && !day.isSelected && <span className="cal-today-dot" />}
                {day.date.getDate()}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,.12)', margin: '16px 0' }} />

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="cal-footer-note"><Edit2 size={14} /><span>Add a note...</span></button>
        <button className="cal-footer-event"><Plus size={14} /><span>New Event</span></button>
      </div>
    </div>
  )
}

// ── Navbar ─────────────────────────────────────────────────────
export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [regOpen, setRegOpen] = useState(null)
  const [calOpen, setCalOpen] = useState(false)
  const calRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    axios.get(`${import.meta.env.VITE_API_URL}/api/settings/registration`)
      .then(r => { if (!cancelled) setRegOpen(r.data.open) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (calRef.current && !calRef.current.contains(e.target)) setCalOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function close() { setOpen(false) }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <NavLink to="/" className="navbar-brand" onClick={close}>
            <img src="/LogoHHFC.png" alt="HHFC Logo" style={{ height: 44, width: 44, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 1px 4px rgba(0,0,0,.3))' }} />
            <span>HHFC Youth Camp 2027</span>
            {regOpen === true && (
              <span style={{ fontSize: '.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}>● Open</span>
            )}
            {regOpen === false && (
              <span style={{ fontSize: '.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}>● Closed</span>
            )}
          </NavLink>

          <div className={`navbar-links ${open ? 'open' : ''}`}>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} onClick={close}>Home</NavLink>
            <NavLink to="/my-registration" className={({ isActive }) => isActive ? 'active' : ''} onClick={close}>Profile</NavLink>
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''} onClick={close}>Admin</NavLink>
            <NavLink to="/register" className={({ isActive }) => `btn-nav ${isActive ? 'active' : ''}`} onClick={close}>Register Now</NavLink>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Calendar toggle */}
            <div ref={calRef} style={{ position: 'relative' }}>
              <button
                className={`cal-nav-btn${calOpen ? ' cal-nav-btn-active' : ''}`}
                onClick={() => setCalOpen(o => !o)}
                aria-label="Open calendar"
              >
                <CalendarDays size={19} />
              </button>
              {calOpen && <GlassCalendar />}
            </div>

            <button
              className={`navbar-hamburger ${open ? 'open' : ''}`}
              onClick={() => setOpen(o => !o)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
