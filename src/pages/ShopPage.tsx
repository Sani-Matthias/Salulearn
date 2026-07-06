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

export default function ShopPage({ progress, isPro, onShowAuth, onPurchase, onEquip }: Props) {
  const { user } = useAuth()
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
        {isPro ? (
          <div className="shop-pro-banner active">
            <span className="shop-pro-banner-icon">⭐</span>
            <span className="shop-pro-banner-text">Du bist Pro-Mitglied</span>
          </div>
        ) : isStripeConfigured() ? (
          <button className="shop-pro-banner" onClick={handleUpgradePro} disabled={checkoutLoading}>
            <span className="shop-pro-banner-icon">⭐</span>
            <span className="shop-pro-banner-text">
              <span className="shop-pro-banner-title">{checkoutLoading ? 'Wird geladen…' : 'SaluLearn Pro werden'}</span>
              <span className="shop-pro-banner-sub">Unbegrenzte Herzen, +50% XP &amp; mehr</span>
            </span>
            <span className="menu-arrow">›</span>
          </button>
        ) : (
          <div className="shop-pro-banner disabled">
            <span className="shop-pro-banner-icon">⭐</span>
            <span className="shop-pro-banner-text">
              <span className="shop-pro-banner-title">SaluLearn Pro</span>
              <span className="shop-pro-banner-sub">Bald verfügbar</span>
            </span>
          </div>
        )}

        <div className="section-hdr">Avatar-Rahmen</div>
        <div className="shop-grid">{getItemsByType('frame').map(renderCard)}</div>
        <div className="section-hdr">App-Themes</div>
        <div className="shop-grid">{getItemsByType('theme').map(renderCard)}</div>
      </div>
    </div>
  )
}
