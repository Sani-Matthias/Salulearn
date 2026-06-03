import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function BlogPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const scriptId = 'soro-blog-script'
    if (document.getElementById(scriptId)) return

    const script = document.createElement('script')
    script.id = scriptId
    script.src = 'https://app.trysoro.com/api/embed/fe6f95ab-f40b-43ea-9afd-fcc5d2743a35'
    script.defer = true
    document.body.appendChild(script)

    return () => {
      document.getElementById(scriptId)?.remove()
    }
  }, [])

  return (
    <div className="blog-page">
      <div className="blog-header">
        <button className="blog-back-btn" onClick={() => navigate('/')} aria-label="Zurück">
          ←
        </button>
        <div className="blog-header-text">
          <h1 className="blog-title">Salulearn Blog</h1>
          <p className="blog-subtitle">Erste Hilfe Wissen · Tipps · Lernhilfen</p>
        </div>
      </div>

      <div className="blog-content">
        <div id="soro-blog"></div>
      </div>

      <footer className="blog-footer">
        <p>© 2026 Salulearn · Erste Hilfe lernen, wann immer du willst.</p>
      </footer>
    </div>
  )
}
