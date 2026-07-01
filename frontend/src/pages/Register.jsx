import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { Eye, EyeOff, Upload, Paperclip, Lock, Info, Calendar, Zap, CreditCard, FileText, Clock, Copy, Check, Hash } from 'lucide-react'
import StepIndicator from '../components/StepIndicator'


const EMPTY = {
  camper_first_name: '', camper_last_name: '', camper_dob: '', camper_age: '', camper_gender: '', church: '',
  parent_name: '', parent_relationship: '', parent_phone: '', parent_email: '',
  allergies: '', medications: '', special_needs: '', emergency_contact_name: '', emergency_contact_phone: '',
  session: '', tshirt_size: '', activities: [], dietary_restrictions: '',
  gcash_reference: '', gcash_receipt: null, parent_consent: null,
  password: '', confirm_password: '',
}

function Field({ label, required, hint, error, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{required && <span className="required">*</span>}</label>
      {children}
      {hint && <span className="form-hint">{hint}</span>}
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

function FileUpload({ label, required, hint, error, accept, value, onChange }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{required && <span className="required">*</span>}</label>
      <label className={`file-upload-box ${error ? 'error' : ''} ${value ? 'has-file' : ''}`}>
        <input
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          onChange={e => onChange(e.target.files[0] || null)}
        />
        {value ? (
          <div className="file-upload-selected">
            <Paperclip size={16} style={{ flexShrink: 0, color: 'var(--success)' }} />
            <span className="file-upload-name">{value.name}</span>
            <span className="file-upload-change">Change</span>
          </div>
        ) : (
          <div className="file-upload-placeholder">
            <Upload size={22} style={{ color: 'var(--gray-400)', marginBottom: 2 }} />
            <span>Click to upload</span>
            <span className="file-upload-sub">{accept?.replace(/,/g, ' / ') || 'Any file'}</span>
          </div>
        )}
      </label>
      {hint && <span className="form-hint">{hint}</span>}
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

// ---------- Step 1 ----------
function Step1({ data, onChange, errors }) {
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  return (
    <>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>Camper Information</h2>
      <p style={{ color: 'var(--gray-500)', fontSize: '.875rem', marginBottom: 24 }}>Tell us about the camper joining us in 2027.</p>

      <div className="form-row">
        <Field label="First Name" required error={errors.camper_first_name}>
          <input className={`form-control ${errors.camper_first_name ? 'error' : ''}`} placeholder="e.g. Maria" value={data.camper_first_name} onChange={e => onChange('camper_first_name', e.target.value)} />
        </Field>
        <Field label="Last Name" required error={errors.camper_last_name}>
          <input className={`form-control ${errors.camper_last_name ? 'error' : ''}`} placeholder="e.g. Santos" value={data.camper_last_name} onChange={e => onChange('camper_last_name', e.target.value)} />
        </Field>
      </div>

      <div className="form-row">
        <Field label="Date of Birth" required error={errors.camper_dob}>
          <input type="date" className={`form-control ${errors.camper_dob ? 'error' : ''}`} value={data.camper_dob} onChange={e => onChange('camper_dob', e.target.value)} />
        </Field>
        <Field label="Age" required error={errors.camper_age}>
          <input type="number" className={`form-control ${errors.camper_age ? 'error' : ''}`} placeholder="e.g. 15" min="1" value={data.camper_age} onChange={e => onChange('camper_age', e.target.value)} />
        </Field>
      </div>

      <Field label="Gender" required error={errors.camper_gender}>
        <select className={`form-control ${errors.camper_gender ? 'error' : ''}`} value={data.camper_gender} onChange={e => onChange('camper_gender', e.target.value)}>
          <option value="">Select gender</option>
          <option>Male</option>
          <option>Female</option>
        </select>
      </Field>

      <Field label="Church" required error={errors.church}>
        <input className={`form-control ${errors.church ? 'error' : ''}`} placeholder="e.g. Harvest House Family Church" value={data.church} onChange={e => onChange('church', e.target.value)} />
      </Field>

      <div style={{ borderTop: '1px solid var(--gray-200)', margin: '20px 0 20px' }} />
      <p style={{ fontSize: '.85rem', color: 'var(--gray-500)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Lock size={14} style={{ flexShrink: 0, color: 'var(--primary)' }} />
        Create a password to protect and access your registration profile later.
      </p>

      <div className="form-row">
        <Field label="Password" required error={errors.password}>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'}
              className={`form-control ${errors.password ? 'error' : ''}`}
              placeholder="Create a password"
              value={data.password}
              onChange={e => onChange('password', e.target.value)}
              style={{ paddingRight: 44 }}
            />
            <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', alignItems: 'center' }}>
              {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>
        <Field label="Confirm Password" required error={errors.confirm_password}>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirm ? 'text' : 'password'}
              className={`form-control ${errors.confirm_password ? 'error' : ''}`}
              placeholder="Repeat your password"
              value={data.confirm_password}
              onChange={e => onChange('confirm_password', e.target.value)}
              style={{ paddingRight: 44 }}
            />
            <button type="button" onClick={() => setShowConfirm(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', alignItems: 'center' }}>
              {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>
      </div>

      {/* Password reminder notice */}
      <div style={{
        marginTop: 8,
        background: 'linear-gradient(135deg, #fefce8, #fef9c3)',
        border: '1.5px solid #fde047',
        borderRadius: 12,
        padding: '16px 18px',
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: '#fbbf24',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Lock size={18} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '.9rem', color: '#78350f', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.03em' }}>
            Camper — Take Note!
          </div>
          <div style={{ fontSize: '.84rem', color: '#92400e', lineHeight: 1.6 }}>
            <strong>Save your password</strong> or take a screenshot of this page. You will need your{' '}
            <strong>Registration ID</strong> and this <strong>password</strong> to access your profile on the{' '}
            <em>Profile</em> page. We cannot recover lost passwords.
          </div>
        </div>
      </div>
    </>
  )
}

// ---------- Step 2 ----------
function Step2({ data, onChange, errors }) {
  return (
    <>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>Parent / Guardian Information</h2>
      <p style={{ color: 'var(--gray-500)', fontSize: '.875rem', marginBottom: 24 }}>Primary contact for all camp communications.</p>

      <div className="form-row">
        <Field label="Full Name" required error={errors.parent_name}>
          <input className={`form-control ${errors.parent_name ? 'error' : ''}`} placeholder="e.g. Juan Santos" value={data.parent_name} onChange={e => onChange('parent_name', e.target.value)} />
        </Field>
        <Field label="Relationship to Camper" required error={errors.parent_relationship}>
          <select className={`form-control ${errors.parent_relationship ? 'error' : ''}`} value={data.parent_relationship} onChange={e => onChange('parent_relationship', e.target.value)}>
            <option value="">Select relationship</option>
            <option>Parent</option>
            <option>Guardian</option>
            <option>Grandparent</option>
            <option>Other</option>
          </select>
        </Field>
      </div>

      <div className="form-row">
        <Field label="Phone Number" required error={errors.parent_phone}>
          <input type="tel" className={`form-control ${errors.parent_phone ? 'error' : ''}`} placeholder="e.g. 09171234567" value={data.parent_phone} onChange={e => onChange('parent_phone', e.target.value)} />
        </Field>
        <Field label="Email Address" error={errors.parent_email}>
          <input type="email" className={`form-control ${errors.parent_email ? 'error' : ''}`} placeholder="e.g. parent@email.com (optional)" value={data.parent_email} onChange={e => onChange('parent_email', e.target.value)} />
        </Field>
      </div>
    </>
  )
}

// ---------- Step 3 ----------
function Step3({ data, onChange, errors }) {
  return (
    <>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>Medical & Health Information</h2>
      <p style={{ color: 'var(--gray-500)', fontSize: '.875rem', marginBottom: 24 }}>Kept confidential. Helps our staff keep your camper safe.</p>

      <div className="alert alert-info" style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} /> All medical information is stored securely and only shared with on-site medical staff.
      </div>

      <Field label="Allergies" hint="List any food, medication, or environmental allergies. Write 'None' if not applicable.">
        <textarea className="form-control" placeholder="e.g. Peanuts, penicillin..." value={data.allergies} onChange={e => onChange('allergies', e.target.value)} />
      </Field>

      <Field label="Current Medications" hint="Include dosage and schedule if relevant.">
        <textarea className="form-control" placeholder="e.g. Salbutamol inhaler as needed..." value={data.medications} onChange={e => onChange('medications', e.target.value)} />
      </Field>

      <Field label="Special Needs or Conditions" hint="Physical, cognitive, dietary, or behavioral considerations.">
        <textarea className="form-control" placeholder="e.g. Mild asthma, requires accommodation..." value={data.special_needs} onChange={e => onChange('special_needs', e.target.value)} />
      </Field>

      <div className="form-row">
        <Field label="Emergency Contact Name" required error={errors.emergency_contact_name}>
          <input className={`form-control ${errors.emergency_contact_name ? 'error' : ''}`} placeholder="e.g. Ana Reyes" value={data.emergency_contact_name} onChange={e => onChange('emergency_contact_name', e.target.value)} />
        </Field>
        <Field label="Emergency Contact Phone" required error={errors.emergency_contact_phone}>
          <input type="tel" className={`form-control ${errors.emergency_contact_phone ? 'error' : ''}`} placeholder="e.g. 09281234567" value={data.emergency_contact_phone} onChange={e => onChange('emergency_contact_phone', e.target.value)} />
        </Field>
      </div>
    </>
  )
}

// ---------- Step 4 ----------
function Step4({ data, onChange, errors }) {
  return (
    <>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>Transaction</h2>
      <p style={{ color: 'var(--gray-500)', fontSize: '.875rem', marginBottom: 24 }}>Complete all required fields to proceed with registration.</p>

      <Field label="T-Shirt Size" required error={errors.tshirt_size}>
        <select className={`form-control ${errors.tshirt_size ? 'error' : ''}`} value={data.tshirt_size} onChange={e => onChange('tshirt_size', e.target.value)}>
          <option value="">Select size</option>
          {['XS (Youth)', 'S (Youth)', 'M (Youth)', 'L (Youth)', 'XL (Youth)', 'S (Adult)', 'M (Adult)', 'L (Adult)', 'XL (Adult)'].map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--gray-200)', margin: '28px 0 24px' }} />
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 7 }}><CreditCard size={16} color="var(--primary)" /> GCash Payment</h3>
      <p style={{ color: 'var(--gray-500)', fontSize: '.875rem', marginBottom: 20 }}>Send payment via GCash and upload the receipt below. Registration cannot proceed without it.</p>

      <div className="alert alert-info" style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <Clock size={15} style={{ flexShrink: 0, marginTop: 1 }} /> <span><strong>Note:</strong> Receipt verification takes up to <strong>24–48 hours</strong>. Your camper will be officially registered once the payment is confirmed by our team.</span>
      </div>

      <Field label="GCash Reference Number" required error={errors.gcash_reference}>
        <input
          className={`form-control ${errors.gcash_reference ? 'error' : ''}`}
          placeholder="e.g. 1234567890"
          value={data.gcash_reference}
          onChange={e => onChange('gcash_reference', e.target.value)}
        />
      </Field>

      <FileUpload
        label="Upload GCash Receipt"
        hint="Optional — Accepted formats: JPG, PNG, PDF — max 10 MB"
        error={errors.gcash_receipt}
        accept=".jpg,.jpeg,.png,.pdf"
        value={data.gcash_receipt}
        onChange={file => onChange('gcash_receipt', file)}
      />

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--gray-200)', margin: '28px 0 24px' }} />
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 7 }}><FileText size={16} color="var(--primary)" /> Parent's Consent Form</h3>
      <p style={{ color: 'var(--gray-500)', fontSize: '.875rem', marginBottom: 20 }}>Upload a signed copy of the parent's consent form. Registration cannot proceed without it.</p>

      <FileUpload
        label="Upload Parent's Consent"
        hint="Optional — Accepted formats: JPG, PNG, PDF — max 10 MB"
        error={errors.parent_consent}
        accept=".jpg,.jpeg,.png,.pdf"
        value={data.parent_consent}
        onChange={file => onChange('parent_consent', file)}
      />
    </>
  )
}

// ---------- Step 5 Review ----------
function Step5({ data }) {
  const [showPw, setShowPw] = useState(false)
  const [copiedPw, setCopiedPw] = useState(false)

  function copyPw() {
    navigator.clipboard.writeText(data.password).then(() => {
      setCopiedPw(true)
      setTimeout(() => setCopiedPw(false), 2000)
    })
  }

  return (
    <>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>Review Your Registration</h2>
      <p style={{ color: 'var(--gray-500)', fontSize: '.875rem', marginBottom: 24 }}>Please check all details before submitting.</p>

      {/* Profile credentials callout */}
      <div style={{
        background: 'linear-gradient(135deg, #022c22 0%, #14532d 100%)',
        border: '2px solid #22c55e',
        borderRadius: 14,
        padding: '18px 20px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -24, right: -24, width: 90, height: 90, borderRadius: '50%', background: 'rgba(34,197,94,.12)' }} />
        <div style={{ fontSize: '.7rem', fontWeight: 700, color: '#4ade80', letterSpacing: '.09em', textTransform: 'uppercase', marginBottom: 12 }}>
          🔐 Save Your Profile Login Credentials
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {/* Registration ID — assigned on submit */}
          <div style={{ flex: '1 1 160px', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Hash size={13} color="#4ade80" />
              <span style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Registration ID</span>
            </div>
            <div style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.45)', fontStyle: 'italic' }}>
              Assigned after you submit →
            </div>
          </div>

          {/* Password — copy now */}
          <div style={{ flex: '1 1 160px', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Lock size={13} color="#4ade80" />
              <span style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Password</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ flex: 1, fontSize: '.92rem', fontWeight: 700, color: '#fff', letterSpacing: showPw ? '.03em' : '.2em', fontFamily: 'monospace' }}>
                {showPw ? data.password : '•'.repeat(Math.min(data.password.length, 10))}
              </span>
              <button type="button" onClick={() => setShowPw(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)', padding: 2, display: 'flex', alignItems: 'center' }}>
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                type="button"
                onClick={copyPw}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: copiedPw ? '#16a34a' : 'rgba(255,255,255,.12)',
                  color: copiedPw ? '#fff' : 'rgba(255,255,255,.7)',
                  border: '1px solid rgba(255,255,255,.2)',
                  borderRadius: 6, padding: '4px 10px',
                  fontSize: '.72rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'all .2s', whiteSpace: 'nowrap',
                }}
              >
                {copiedPw ? <Check size={12} /> : <Copy size={12} />}
                {copiedPw ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
        <p style={{ margin: '12px 0 0', fontSize: '.76rem', color: 'rgba(255,255,255,.4)', lineHeight: 1.5 }}>
          Your <strong style={{ color: 'rgba(255,255,255,.65)' }}>Registration ID</strong> will appear on the next page after submission. Copy your password now — you'll need both to log in at <em>Profile → My Registration</em>.
        </p>
      </div>

      <div className="review-section">
        <h3>Camper Information</h3>
        <div className="review-grid">
          <div className="review-item"><div className="label">Full Name</div><div className="value">{data.camper_first_name} {data.camper_last_name}</div></div>
          <div className="review-item"><div className="label">Date of Birth</div><div className="value">{data.camper_dob}</div></div>
          <div className="review-item"><div className="label">Age</div><div className="value">{data.camper_age} years old</div></div>
          <div className="review-item"><div className="label">Gender</div><div className="value">{data.camper_gender}</div></div>
          <div className="review-item"><div className="label">Church</div><div className="value">{data.church || '—'}</div></div>
        </div>
      </div>

      <div className="review-section">
        <h3>Parent / Guardian</h3>
        <div className="review-grid">
          <div className="review-item"><div className="label">Name</div><div className="value">{data.parent_name}</div></div>
          <div className="review-item"><div className="label">Relationship</div><div className="value">{data.parent_relationship}</div></div>
          <div className="review-item"><div className="label">Phone</div><div className="value">{data.parent_phone}</div></div>
          <div className="review-item"><div className="label">Email</div><div className="value">{data.parent_email}</div></div>
        </div>
      </div>

      <div className="review-section">
        <h3>Medical & Health</h3>
        <div className="review-grid">
          <div className="review-item"><div className="label">Allergies</div><div className="value">{data.allergies || '—'}</div></div>
          <div className="review-item"><div className="label">Medications</div><div className="value">{data.medications || '—'}</div></div>
          <div className="review-item"><div className="label">Special Needs</div><div className="value">{data.special_needs || '—'}</div></div>
          <div className="review-item"><div className="label">Emergency Contact</div><div className="value">{data.emergency_contact_name} — {data.emergency_contact_phone}</div></div>
        </div>
      </div>

      <div className="review-section">
        <h3>Camp Preferences</h3>
        <div className="review-grid">
          <div className="review-item"><div className="label">T-Shirt Size</div><div className="value">{data.tshirt_size}</div></div>
        </div>
      </div>

      <div className="review-section">
        <h3>Payment & Consent</h3>
        <div className="review-grid">
          <div className="review-item"><div className="label">GCash Reference #</div><div className="value">{data.gcash_reference}</div></div>
          <div className="review-item"><div className="label">GCash Receipt</div><div className="value">{data.gcash_receipt?.name}</div></div>
          <div className="review-item"><div className="label">Parent's Consent</div><div className="value">{data.parent_consent?.name}</div></div>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginTop: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <Clock size={16} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>After submitting, your receipt will be verified within <strong>24–48 hours</strong>. Check the confirmation page for your registration status.</span>
      </div>
    </>
  )
}

// ---------- Validators ----------
function validate(step, data) {
  const e = {}
  if (step === 1) {
    if (!data.camper_first_name.trim()) e.camper_first_name = 'First name is required'
    if (!data.camper_last_name.trim()) e.camper_last_name = 'Last name is required'
    if (!data.camper_dob) e.camper_dob = 'Date of birth is required'
    if (!data.camper_age) e.camper_age = 'Age is required'
    if (!data.camper_gender) e.camper_gender = 'Please select a gender'
    if (!data.church.trim()) e.church = 'Church name is required'
    if (!data.password) e.password = 'Password is required'
    else if (data.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (!data.confirm_password) e.confirm_password = 'Please confirm your password'
    else if (data.password !== data.confirm_password) e.confirm_password = 'Passwords do not match'
  }
  if (step === 2) {
    if (!data.parent_name.trim()) e.parent_name = 'Parent/Guardian name is required'
    if (!data.parent_relationship) e.parent_relationship = 'Please select a relationship'
    if (!data.parent_phone.trim()) e.parent_phone = 'Phone number is required'
    else if (!/^(09\d{9}|\+639\d{9})$/.test(data.parent_phone.replace(/[\s\-]/g, ''))) e.parent_phone = 'Enter a valid PH number (e.g. 09171234567)'
    if (data.parent_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.parent_email)) e.parent_email = 'Enter a valid email'
  }
  if (step === 3) {
    if (!data.emergency_contact_name.trim()) e.emergency_contact_name = 'Emergency contact name is required'
    if (!data.emergency_contact_phone.trim()) e.emergency_contact_phone = 'Emergency contact phone is required'
    else if (!/^(09\d{9}|\+639\d{9})$/.test(data.emergency_contact_phone.replace(/[\s\-]/g, ''))) e.emergency_contact_phone = 'Enter a valid PH number (e.g. 09171234567)'
  }
  if (step === 4) {
    if (!data.tshirt_size) e.tshirt_size = 'Please select a t-shirt size'
    if (!data.gcash_reference.trim()) e.gcash_reference = 'GCash reference number is required'
  }
  return e
}

// ---------- Main Register Component ----------
export default function Register() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [regOpen, setRegOpen] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/settings/registration`)
      .then(r => setRegOpen(r.data.open))
      .catch(() => setRegOpen(true))
  }, [])

  if (regOpen === null) return (
    <main style={{ padding: '80px 0', textAlign: 'center' }}>
      <div style={{ color: 'var(--gray-400)' }}>Loading...</div>
    </main>
  )

  if (!regOpen) return (
    <main style={{ padding: '80px 0' }}>
      <div className="container" style={{ maxWidth: 540 }}>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Lock size={36} color="var(--primary)" strokeWidth={1.75} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>Registration is Closed</h1>
            <p style={{ color: 'var(--gray-500)', marginBottom: 28 }}>
              Registration for HHFC Youth Camp 2027 is currently closed. Please check back later or contact us for more information.
            </p>
            <p style={{ color: 'var(--gray-400)', fontSize: '.875rem', marginBottom: 28 }}>
              Questions? Email us at{' '}
              <a href="mailto:duo.vision3128@gmail.com" style={{ color: 'var(--primary)' }}>
                duo.vision3128@gmail.com
              </a>
            </p>
            <Link to="/" className="btn btn-primary">← Back to Home</Link>
          </div>
        </div>
      </div>
    </main>
  )

  function onChange(field, value) {
    setData(d => ({ ...d, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function next() {
    const errs = validate(step, data)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStep(s => s + 1)
    window.scrollTo(0, 0)
  }

  function back() {
    setStep(s => s - 1)
    window.scrollTo(0, 0)
  }

  async function submit() {
    setLoading(true)
    setSubmitError('')
    try {
      const formData = new FormData()
      const skip = ['gcash_receipt', 'parent_consent', 'activities', 'camper_age', 'confirm_password']
      Object.entries(data).forEach(([key, val]) => {
        if (!skip.includes(key)) formData.append(key, val)
      })
      formData.append('camper_age', data.camper_age)
      formData.append('activities', JSON.stringify(data.activities))
      if (data.gcash_receipt) formData.append('gcash_receipt', data.gcash_receipt)
      if (data.parent_consent) formData.append('parent_consent', data.parent_consent)

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/registrations`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      sessionStorage.setItem(`profile_auth_${res.data.id}`, '1')
      sessionStorage.setItem(`reg_pw_${res.data.id}`, data.password)
      navigate(`/confirmation/${res.data.id}`)
    } catch {
      setSubmitError('Submission failed. Please check your connection and try again.')
      setLoading(false)
    }
  }

  const stepProps = { data, onChange, errors }

  return (
    <main style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="page-header" style={{ textAlign: 'left', paddingTop: 0 }}>
          <h1 style={{ fontSize: '1.75rem' }}>Youth Camp 2027 Registration</h1>
          <p>Complete all steps to secure your camper's spot.</p>
        </div>

        <StepIndicator current={step} />

        <div className="card">
          <div className="card-body">
            {step === 1 && <Step1 {...stepProps} />}
            {step === 2 && <Step2 {...stepProps} />}
            {step === 3 && <Step3 {...stepProps} />}
            {step === 4 && <Step4 {...stepProps} />}
            {step === 5 && <Step5 data={data} />}

            {submitError && (
              <div className="alert alert-danger" style={{ marginTop: 20 }}>⚠️ {submitError}</div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, flexWrap: 'wrap', gap: 12 }}>
              {step > 1
                ? <button className="btn btn-outline" onClick={back}>← Back</button>
                : <div />
              }
              {step < 5
                ? <button className="btn btn-primary" onClick={next}>Next →</button>
                : (
                  <button className="btn btn-success" onClick={submit} disabled={loading}>
                    {loading ? <span className="spinner" /> : null}
                    {loading ? 'Submitting...' : '✓ Submit Registration'}
                  </button>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
