const STEPS = ['Camper Info', 'Parent / Guardian', 'Medical & Health', 'Transaction', 'Review']

export default function StepIndicator({ current }) {
  return (
    <div className="step-indicator">
      {STEPS.map((label, i) => {
        const num = i + 1
        const isDone = num < current
        const isActive = num === current
        return (
          <div key={label} className="step">
            <div className="step-content">
              <div className={`step-circle ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                {isDone ? '✓' : num}
              </div>
              <div className={`step-label ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                {label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-line ${isDone ? 'done' : ''}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
