import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text',
        'placeholder:text-text-muted transition-colors',
        'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
}
