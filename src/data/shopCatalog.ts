export type ShopItemType = 'frame' | 'theme'

export type ShopItem = {
  id: string
  type: ShopItemType
  name: string
  description: string
  price: number // coins; ignored when proOnly is true
  proOnly?: boolean
  preview: string // emoji shown on the shop card
}

export const SHOP_ITEMS: ShopItem[] = [
  // ── Avatar-Rahmen ──────────────────────────────────────────
  {
    id: 'frame_bronze',
    type: 'frame',
    name: 'Bronze-Rahmen',
    description: 'Ein schlichter Bronze-Ring um dein Profilbild.',
    price: 200,
    preview: '🥉',
  },
  {
    id: 'frame_gold',
    type: 'frame',
    name: 'Gold-Rahmen',
    description: 'Glänzender Gold-Ring für dein Profilbild.',
    price: 500,
    preview: '🥇',
  },
  {
    id: 'frame_neon',
    type: 'frame',
    name: 'Neon-Rahmen',
    description: 'Leuchtender Neon-Ring, der ins Auge sticht.',
    price: 800,
    preview: '💠',
  },
  {
    id: 'frame_flame',
    type: 'frame',
    name: 'Flammen-Rahmen',
    description: 'Animierter Feuer-Ring für echte Streak-Helden.',
    price: 1200,
    preview: '🔥',
  },
  {
    id: 'frame_pro',
    type: 'frame',
    name: 'Pro-Rahmen',
    description: 'Exklusiver animierter Rahmen nur für Pro-Mitglieder.',
    price: 0,
    proOnly: true,
    preview: '⭐',
  },
  // ── App-Themes ─────────────────────────────────────────────
  {
    id: 'theme_forest',
    type: 'theme',
    name: 'Wald',
    description: 'Sattes Grün als neue Akzentfarbe der App.',
    price: 400,
    preview: '🌲',
  },
  {
    id: 'theme_ocean',
    type: 'theme',
    name: 'Ozean',
    description: 'Kühles Blau als neue Akzentfarbe der App.',
    price: 600,
    preview: '🌊',
  },
  {
    id: 'theme_sunset',
    type: 'theme',
    name: 'Sonnenuntergang',
    description: 'Warmes Orange-Pink als neue Akzentfarbe der App.',
    price: 600,
    preview: '🌅',
  },
]

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find(i => i.id === id)
}

export function getItemsByType(type: ShopItemType): ShopItem[] {
  return SHOP_ITEMS.filter(i => i.type === type)
}
