import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { isStripeConfigured, startProCheckout } from '../lib/stripe'
import { getItemsByType, type ShopItem } from '../data/shopCatalog'
import type { ProgressState } from '../services/progressService'
import AvatarFrame from '../components/AvatarFrame'

type Props = {
  progress: ProgressState
  isPro: boolean
  onShowAuth: () => void
  onPurchase: (item: ShopItem) => void
  onEquip: (type: 'frame' | 'theme', itemId: string | null) => void
}

type Section = 'pro' | 'skins'

export default function ShopPage({ progress, isPro, onShowAuth, onPurchase, onEquip }: Props) {
  const { user } = useAuth()
  const [section, setSection] = useState<Section>('pro')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  const handleUpgradePro = async () => {
    if (!user) {
      onShowAuth()
      return
    }
    setCheckoutLoading(true)
    const { error } = await startProCheckout(user.id, user.email || '')
    setCheckoutLoading(false)
    if (error) showToast(error, false)
  }

  const isOwned = (item: ShopItem) => item.proOnly ? isPro : progress.inventory.includes(item.id)
  const isEquipped = (item: ShopItem) =>
    item.type === 'frame' ? progress.equippedFrame === item.id : progress.equippedTheme === item.id

  const handleCardAction = (item: ShopItem) => {
    if (isEquipped(item)) {
      onEquip(item.type, null)
      return
    }
    if (isOwned(item)) {
      onEquip(item.type, item.id)
      return
    }
    if (item.proOnly) return
    if (progress.coins < item.price) {
      showToast('Nicht genug Münzen 🪙', false)
      return
    }
    onPurchase(item)
  }

  const renderCard = (item: ShopItem) => {
    const owned = isOwned(item)
    const equipped = isEquipped(item)
    const locked = item.proOnly && !isPro

    let buttonLabel = `Kaufen · ${item.price} 🪙`
    if (equipped) buttonLabel = 'Ablegen'
    else if (owned) buttonLabel = 'Anlegen'
    else if (locked) buttonLabel = 'Nur für Pro'
    else if (progress.coins < item.price) buttonLabel = 'Zu wenig 🪙'

    return (
      <div key={item.id} className={`shop-card${owned ? ' owned' : ''}${equipped ? ' equipped' : ''}${locked ? ' locked' : ''}`}>
        <div className="shop-card-preview">
          {item.type === 'frame'
            ? <AvatarFrame frameId={item.id} size="sm"><div className="shop-avatar-preview">{item.preview}</div></AvatarFrame>
            : <div className={`shop-theme-swatch shop-theme-swatch--${item.id}`}>{item.preview}</div>}
        </div>
        <div className="shop-card-name">{item.name}</div>
        <div className="shop-card-desc">{item.description}</div>
        <button
          className={`shop-card-btn${equipped ? ' equipped' : ''}`}
          onClick={() => handleCardAction(item)}
          disabled={locked}
        >
          {buttonLabel}
        </button>
      </div>
    )
  }

  return (
    <div className="shop-page">
      {toast && (
        <div style={{
          position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, background: toast.ok ? '#58CC02' : '#FF4B4B',
          color: '#fff', borderRadius: 16, padding: '12px 20px',
          fontSize: 14, fontWeight: 700, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          maxWidth: 'calc(100% - 48px)', textAlign: 'center',
          animation: 'slide-up 0.3s ease',
        }}>
          {toast.ok ? '✅ ' : '❌ '}{toast.msg}
        </div>
      )}

      <div className="shop-hero">
        <div className="shop-hero-title">🛒 Shop</div>
        <div className="shop-hero-coins">🪙 {progress.coins} Münzen</div>
      </div>

      <div className="shop-content">
        <div className="shop-segment">
          <button className={`shop-segment-btn${section === 'pro' ? ' active' : ''}`} onClick={() => setSection('pro')}>
            ⭐ Pro
          </button>
          <button className={`shop-segment-btn${section === 'skins' ? ' active' : ''}`} onClick={() => setSection('skins')}>
            🎨 Skins
          </button>
        </div>

        {section === 'pro' && (
          <div className="pro-section">
            {isPro ? (
              <div className="pro-active-card">
                <div className="pro-active-emoji">⭐</div>
                <div className="pro-active-title">Du bist Pro-Mitglied!</div>
                <div className="pro-active-desc">Genieße alle Vorteile deines Abos.</div>
              </div>
            ) : (
              <div className="pro-card">
                <div className="pro-card-emoji">⭐</div>
                <div className="pro-card-title">SaluLearn Pro</div>
                <ul className="pro-benefits">
                  <li>❤️ Unbegrenzte Herzen</li>
                  <li>⚡ +50% XP &amp; Münzen auf jede Lektion</li>
                  <li>🖼️ Exklusiver Pro-Rahmen &amp; Abzeichen</li>
                </ul>
                {isStripeConfigured() ? (
                  <button className="pro-upgrade-btn" onClick={handleUpgradePro} disabled={checkoutLoading}>
                    {checkoutLoading ? 'Wird geladen…' : 'Pro werden'}
                  </button>
                ) : (
                  <>
                    <button className="pro-upgrade-btn" disabled>Pro werden</button>
                    <div className="pro-unavailable-note">Pro-Käufe sind bald verfügbar.</div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {section === 'skins' && (
          <>
            <div className="section-hdr">Avatar-Rahmen</div>
            <div className="shop-grid">{getItemsByType('frame').map(renderCard)}</div>
            <div className="section-hdr">App-Themes</div>
            <div className="shop-grid">{getItemsByType('theme').map(renderCard)}</div>
          </>
        )}
      </div>
    </div>
  )
}
