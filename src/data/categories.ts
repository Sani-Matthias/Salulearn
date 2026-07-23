export type CategoryId = 'lernpfad' | 'notfall' | 'szenarios' | 'spezielles'

export type Category = {
  id: CategoryId
  path: string
  label: string
  description: string
  icon: string
  color: string
  colorDark: string
  tint: string
}

export const categories: Category[] = [
  { id: 'lernpfad', path: '/', label: 'Lernpfad', description: 'Kurse & Lektionen', icon: '🗺️', color: 'var(--info)', colorDark: 'var(--info-dark)', tint: '#E5F7FE' },
  { id: 'notfall', path: '/notfall', label: 'Notfall', description: 'Schnelle Sofort-Hilfe', icon: '⚠️', color: 'var(--primary)', colorDark: 'var(--primary-dark)', tint: '#FFE5E5' },
  { id: 'szenarios', path: '/szenarios', label: 'Szenarios', description: 'Übungen zum Durchspielen', icon: '👥', color: 'var(--success)', colorDark: 'var(--success-dark)', tint: '#EAFFC4' },
  { id: 'spezielles', path: '/spezielles', label: 'Spezielles', description: 'Extra-Themen', icon: '💎', color: 'var(--gold)', colorDark: 'var(--gold-dark)', tint: '#FFF6D6' },
]

export function getCategoryByPath(pathname: string): Category {
  return categories.find(c => c.path === pathname) ?? categories[0]
}
