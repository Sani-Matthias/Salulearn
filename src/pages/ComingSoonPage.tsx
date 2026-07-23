import { useNavigate } from 'react-router-dom'
import type { CategoryId } from '../data/categories'
import { categories } from '../data/categories'

export default function ComingSoonPage({ category }: { category: CategoryId }) {
  const navigate = useNavigate()
  const cat = categories.find(c => c.id === category) ?? categories[0]

  return (
    <div className="coming-soon-page">
      <div className="coming-soon-icon" style={{ background: cat.tint }}>
        <span style={{ fontSize: 44 }}>{cat.icon}</span>
      </div>
      <div className="coming-soon-title">{cat.label}</div>
      <div className="coming-soon-bubble-row">
        <span className="coming-soon-mascot">🦦</span>
        <div className="coming-soon-bubble">
          Daran arbeite ich noch für dich – bald geht's los!
        </div>
      </div>
      <button className="main-btn blue" onClick={() => navigate('/')}>Zurück zum Lernpfad</button>
    </div>
  )
}
