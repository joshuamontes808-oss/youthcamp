import { useState, useEffect, useRef, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import axios from 'axios'
import { CalendarDays, Settings, Plus, Edit2, ChevronLeft, ChevronRight } from 'lucide-react'

// ── Date helpers ───────────────────────────────────────────────
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
function fmtDayLetter(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)
}
function fmtMonthYear(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
function getWeekStart(date) {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// ── Day button shared ──────────────────────────────────────────
function DayBtn({ date, selected, onClick, grid }) {
  const today = isToday(date)
  const sel = selected && isSameDay(date, selected)
  return (
    <button
      className={`cal-day-btn${sel ? ' cal-day-selected' : ''}${grid ? ' cal-grid-btn' : ''}`}
      onClick={() => onClick(date)}
    >
      {today && !sel && <span className="cal-today-dot" />}
      {date.getDate()}
    </button>
  )
}

// ── Glass Calendar ─────────────────────────────────────────────
function GlassCalendar() {
  const [view, setView] = useState('weekly')
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Weekly: 7 days of the current week (Sun–Sat)
  const weekDays = useMemo(() => {
    const sun = getWeekStart(viewDate)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sun)
      d.setDate(sun.getDate() + i)
      return d
    })
  }, [viewDate])

  // Monthly: grid cells (null = empty leading cell)
  const monthGrid = useMemo(() => {
    const firstDow = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()
    const total = getDaysInMonth(viewDate)
    const cells = Array(firstDow).fill(null)
    for (let i = 1; i <= total; i++) {
      cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), i))
    }
    return cells
  }, [viewDate])

  function prevPeriod() {
    if (view === 'weekly') {
      setViewDate(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n })
    } else {
      setViewDate(d => subMonths(d, 1))
    }
  }
  function nextPeriod() {
    if (view === 'weekly') {
      setViewDate(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n })
    } else {
      setViewDate(d => addMonths(d, 1))
    }
  }

  const headerKey = view + viewDate.getFullYear() + viewDate.getMonth() + Math.floor(viewDate.getDate() / 7)

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

      {/* Header + nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '16px 0 12px' }}>
        <p key={headerKey} className="cal-month-name">{fmtMonthYear(viewDate)}</p>
        <div style={{ display: 'flex', gap: 2 }}>
          <button className="cal-icon-btn" onClick={prevPeriod}><ChevronLeft size={17} /></button>
          <button className="cal-icon-btn" onClick={nextPeriod}><ChevronRight size={17} /></button>
        </div>
      </div>

      {/* Day-of-week labels row */}
      <div className="cal-dow-row">
        {DAY_LABELS.map((l, i) => <span key={i} className="cal-day-letter">{l}</span>)}
      </div>

      {/* ── WEEKLY view ── */}
      {view === 'weekly' && (
        <div className="cal-weekly-row">
          {weekDays.map((date, i) => (
            <div key={i} className="cal-day-col">
              <DayBtn date={date} selected={selectedDate} onClick={setSelectedDate} />
            </div>
          ))}
        </div>
      )}

      {/* ── MONTHLY grid ── */}
      {view === 'monthly' && (
        <div className="cal-month-grid">
          {monthGrid.map((date, i) =>
            date
              ? <DayBtn key={i} date={date} selected={selectedDate} onClick={setSelectedDate} grid />
              : <span key={i} />
          )}
        </div>
      )}

      <div style={{ height: 1, background: 'rgba(255,255,255,.12)', margin: '14px 0' }} />

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
