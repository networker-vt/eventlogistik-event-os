import { cn } from '../../lib/utils'

const base = () => import.meta.env.BASE_URL

export function BrandMark({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  const src = compact ? `${base()}icons/icon-192.png` : `${base()}icons/loadin-wordmark.png`
  if (compact) {
    return (
      <span className={cn('flex items-center gap-2', className)}>
        <img src={src} alt="" className="h-8 w-8 rounded-lg border border-cyan/25 object-cover" />
        <span className="leading-tight">
          <span className="block font-bold tracking-tight text-white">LoadIn</span>
          <span className="hidden text-[10px] uppercase tracking-wider text-cyan sm:block">
            Crew · Gigs · Gear
          </span>
        </span>
      </span>
    )
  }
  return (
    <img
      src={src}
      alt="LoadIn"
      className={cn('h-9 w-auto max-w-[9.5rem] object-contain object-left md:h-10 md:max-w-[11rem]', className)}
    />
  )
}

export function BrandIcon({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <img
      src={`${base()}icons/icon-192.png`}
      alt="LoadIn"
      width={size}
      height={size}
      className={cn('rounded-xl border border-cyan/25 object-cover shadow-[0_0_18px_rgba(0,240,255,0.18)]', className)}
    />
  )
}
