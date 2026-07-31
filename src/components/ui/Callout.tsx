import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { CheckIcon, InfoIcon, WarningIcon } from './icons'

export interface CalloutProps {
  variant?: 'info' | 'warning' | 'success'
  children: ReactNode
  className?: string
}

const variantConfig = {
  info: {
    icon: InfoIcon,
    className: 'border-accent/30 bg-accent/8 text-text-secondary [&_svg]:text-accent',
  },
  warning: {
    icon: WarningIcon,
    className: 'border-warning/30 bg-warning/8 text-text-secondary [&_svg]:text-warning',
  },
  success: {
    icon: CheckIcon,
    className: 'border-success/30 bg-success/8 text-text-secondary [&_svg]:text-success',
  },
} as const

export function Callout({ variant = 'info', children, className }: CalloutProps) {
  const { icon: Icon, className: variantClassName } = variantConfig[variant]
  return (
    <div
      role="note"
      className={cn(
        'flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm leading-relaxed',
        variantClassName,
        className,
      )}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
