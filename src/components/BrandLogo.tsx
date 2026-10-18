/** Logo San Gabriel: canasta verde con fruta y hojas */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {/* asa */}
      <path d="M17 30c0-13 30-13 30 0" fill="none" stroke="#22a05b" strokeWidth="4" strokeLinecap="round" />
      {/* hojas */}
      <path d="M33 19c-1.5-7 3.5-12.5 10.5-13 .3 7-4 12.3-10.5 13z" fill="#4ade80" />
      <path d="M31.5 19.5c-3.5-5.5-9-7-13-5.2 2.6 5 7.6 6.8 13 5.2z" fill="#22c55e" />
      {/* fruta */}
      <circle cx="23.5" cy="28" r="7" fill="#f59e0b" />
      <circle cx="33.5" cy="26" r="7.5" fill="#fb923c" />
      <circle cx="43" cy="28.5" r="6" fill="#f97316" />
      {/* borde y cuerpo */}
      <rect x="8" y="30" width="48" height="7" rx="3.5" fill="#15803d" />
      <path d="M12.5 37h39l-4 17.6a4 4 0 0 1-3.9 3.1H20.4a4 4 0 0 1-3.9-3.1z" fill="#16a34a" />
      <path d="M24 41v13M32 41v13M40 41v13M15 47h34" stroke="#0b4d2a" strokeOpacity=".35" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

/** Par de hojas decorativas */
export function Hojas({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M26 44C20 30 28 12 46 6c3 18-6 34-20 38z" fill="#4ade80" />
      <path d="M22 44C21 34 12 26 2 26c0 10 9 18 20 18z" fill="#22c55e" />
    </svg>
  )
}
