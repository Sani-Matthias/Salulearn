import { Link } from 'react-router-dom'
import type { ProgressState } from '../App'

type HomePageProps = {
  progress: ProgressState
  onStartMission: () => void
  onWrongTry: () => void
}

const pathNodes = [
  { id: 'n1', title: 'Notruf 112', status: 'done', icon: '📞' },
  { id: 'n2', title: 'Seitenlage', status: 'done', icon: '🛏️' },
  { id: 'n3', title: 'Herzdruck', status: 'active', icon: '❤️' },
  { id: 'n4', title: 'Verbrennung', status: 'locked', icon: '🔥' },
  { id: 'n5', title: 'Allergie', status: 'locked', icon: '💊' },
]

function HomePage({ progress, onStartMission, onWrongTry }: HomePageProps) {
  return (
    <div className="home-layout single">
      <section className="card path-hero">
        <div className="path-header">
          <div>
            <p className="eyebrow">Stufe 1, Abschnitt 1</p>
            <h2>Starte deine Mission</h2>
          </div>
          <button className="cta tiny ghost" onClick={onWrongTry}>
            Hinweise
          </button>
        </div>
        <div className="path-track">
          {pathNodes.map((node) => (
            <div key={node.id} className={`path-step ${node.status}`}>
              <div className="path-badge">{node.status === 'done' ? '✓' : node.icon}</div>
              <div className="path-label-wide">{node.title}</div>
              {node.status === 'active' && <div className="path-current">▶</div>}
              {node.status === 'locked' && <div className="path-locked">🔒</div>}
            </div>
          ))}
          <div className="path-chest">🎁</div>
        </div>
        <div className="path-footer">
          <p className="mission-meta">Schliesse die aktuelle Mission ab um fortzufahren</p>
          <div className="pill-row">
            <span className="pill streak">🔥 {progress.streak} Tage</span>
            <span className="pill hearts">❤️ {progress.hearts}/5</span>
            <span className="pill xp">⭐ {progress.points} XP</span>
          </div>
          <div className="action-row">
            <button className="cta primary" onClick={onStartMission}>
              Continue
            </button>
            <Link to="/learn" className="cta ghost">
              Alle Missionen
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
