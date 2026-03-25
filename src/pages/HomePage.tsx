import { Link } from 'react-router-dom'
import type { ProgressState } from '../services/progressService'

type HomePageProps = {
  progress: ProgressState
}

const pathNodes = [
  { id: 'notruf-112', label: 'Notruf 112', status: 'active', icon: '📞', xp: 50, color: '#22c55e' },
  { id: 'stabile-seitenlage', label: 'Stabile Seitenlage', status: 'locked', icon: '🛏️', xp: 70, color: '#9b7bff' },
  { id: 'herzdruckmassage', label: 'Herzdruckmassage', status: 'locked', icon: '❤️', xp: 80, color: '#ef4444' },
  { id: 'verbrennung', label: 'Verbrennung', status: 'locked', icon: '🔥', xp: 75, color: '#f97316' },
  { id: 'allergie', label: 'Allergie', status: 'locked', icon: '💊', xp: 75, color: '#ff7ab5' },
]

function HomePage({ progress: _progress }: HomePageProps) {
  return (
    <div className="home-layout">
      <div className="learning-path">
        {pathNodes.map((node, index) => {
          const isClickable = node.status === 'active' || node.status === 'done'

          return (
            <div key={node.id} className="path-item">

              {/* Node Container */}
              <div className={`path-node-container ${index % 2 === 0 ? 'align-left' : 'align-right'}`}>
                {/* Node */}
                {isClickable ? (
                  <Link
                    to={`/lesson/${node.id}`}
                    className={`path-bubble ${node.status}`}
                    style={{ '--node-color': node.color } as React.CSSProperties}
                  >
                    <div className="bubble-glow" />
                    <div className="bubble-icon">
                      {node.status === 'done' ? '✓' : node.icon}
                    </div>
                    {node.status === 'active' && (
                      <div className="bubble-pulse" />
                    )}
                  </Link>
                ) : (
                  <div
                    className={`path-bubble ${node.status}`}
                    style={{ '--node-color': node.color } as React.CSSProperties}
                  >
                    <div className="bubble-icon">🔒</div>
                  </div>
                )}

                {/* Label */}
                <div className={`path-info ${node.status}`}>
                  <p className="path-title">{node.label}</p>
                  <p className="path-xp">
                    {node.status === 'done'
                      ? '✅ Abgeschlossen'
                      : node.status === 'active'
                        ? `🎯 +${node.xp} XP`
                        : `🔒 +${node.xp} XP`
                    }
                  </p>
                </div>
              </div>
            </div>
          )
        })}

        {/* Treasure Chest at the end */}
        <div className="path-item">
          <div className="path-node-container align-center">
            <div className="path-treasure">
              <span className="treasure-icon">🎁</span>
            </div>
            <div className="path-info">
              <p className="path-title">Belohnung</p>
              <p className="path-xp">🏆 Abschnitt 1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
