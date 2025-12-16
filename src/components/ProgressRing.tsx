type ProgressRingProps = {
  size?: number
  strokeWidth?: number
  progress: number
  label?: string
}

const ProgressRing = ({ size = 140, strokeWidth = 12, progress, label }: ProgressRingProps) => {
  const normalizedProgress = Math.min(Math.max(progress, 0), 1)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dash = `${normalizedProgress * circumference} ${circumference}`

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff7ab5" />
            <stop offset="100%" stopColor="#9b7bff" />
          </linearGradient>
        </defs>
        <circle
          className="ring-bg"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="ring-fg"
          strokeWidth={strokeWidth}
          strokeDasharray={dash}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="ring-content">
        <p className="ring-value">{Math.round(normalizedProgress * 100)}%</p>
        {label && <p className="ring-label">{label}</p>}
      </div>
    </div>
  )
}

export default ProgressRing
