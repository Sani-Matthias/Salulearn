import type { ReactNode } from 'react'

type Props = {
  frameId: string | null
  size?: 'sm' | 'lg'
  children: ReactNode
}

export default function AvatarFrame({ frameId, size = 'sm', children }: Props) {
  const className = [
    'avatar-frame',
    `avatar-frame--${size}`,
    frameId ? 'avatar-frame--framed' : '',
    frameId ? `avatar-frame--${frameId}` : '',
  ].filter(Boolean).join(' ')

  return <div className={className}>{children}</div>
}
