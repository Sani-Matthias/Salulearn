import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { categories, getCategoryByPath } from '../data/categories'

export default function CategorySwitcher() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const active = getCategoryByPath(location.pathname)

  return (
    <>
      <button
        type="button"
        className="category-pill"
        style={{ background: active.tint, color: active.colorDark }}
        onClick={() => setOpen(true)}
      >
        <span className="category-pill-icon">{active.icon}</span>
        <span className="category-pill-label">{active.label}</span>
        <span className="category-pill-chevron">⌄</span>
      </button>

      {open && createPortal(
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="modal-sheet">
            <div className="modal-handle" />
            <div className="modal-title" style={{ fontSize: 22, marginBottom: 16 }}>Menü</div>
            <div className="category-menu-list">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-menu-item${cat.id === active.id ? ' selected' : ''}`}
                  style={cat.id === active.id ? { borderColor: cat.color, background: cat.tint } : undefined}
                  onClick={() => { navigate(cat.path); setOpen(false) }}
                >
                  <span className="category-menu-icon" style={{ background: cat.tint, color: cat.colorDark }}>{cat.icon}</span>
                  <span className="category-menu-text">
                    <div className="category-menu-label">{cat.label}</div>
                    <div className="category-menu-desc">{cat.description}</div>
                  </span>
                  <span className="category-menu-arrow">›</span>
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
