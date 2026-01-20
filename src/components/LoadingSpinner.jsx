import './LoadingSpinner.css'

export function LoadingSpinner({ size = 'medium', message = 'Loading...' }) {
  return (
    <div className={`loading-container loading-${size}`}>
      <div className="luxury-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-center">
          <div className="center-glow"></div>
          <div className="center-core"></div>
        </div>
        <div className="spinner-particles">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="particle" style={{ animationDelay: `${i * 0.1}s` }}></div>
          ))}
        </div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  )
}