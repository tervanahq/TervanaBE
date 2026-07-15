// Tiny inline icons for the Learn feature (the app doesn't use an icon library).
// All take className so callers control size/color via Tailwind.

interface IconProps {
  className?: string
}

export function FlameIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2c.6 3.2-.6 5-2.2 6.7C8.2 10.4 6 12.2 6 15.5A6.3 6.3 0 0 0 12.3 22 6 6 0 0 0 18 15.8c0-2.8-1.5-4.4-2.7-5.6-.3 1-.8 1.9-1.7 2.4.3-3.4-1-6.5-1.6-7.4A9.5 9.5 0 0 0 12 2Zm.2 11.6c1.2 1 1.8 2 1.8 3.2a2.5 2.5 0 0 1-2.4 2.7 2.6 2.6 0 0 1-2.6-2.7c0-1 .5-1.6 1.2-2.3.5-.5 1-.9 1.3-1.6.3.2.5.5.7.7Z" />
    </svg>
  )
}

export function BoltIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M13.6 2.1a.75.75 0 0 1 .53.83L13.2 9h5.05a.75.75 0 0 1 .58 1.22l-8.4 11.4a.75.75 0 0 1-1.32-.6l.93-6.07H5a.75.75 0 0 1-.58-1.22l8.35-11.35a.75.75 0 0 1 .83-.28Z" />
    </svg>
  )
}

export function CheckIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4.5 12.8 9.6 18l9.9-12" />
    </svg>
  )
}

export function LockIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 5a3 3 0 1 1 6 0v3H9V7Zm3 7a1.5 1.5 0 0 1 .75 2.8V18a.75.75 0 0 1-1.5 0v-1.2A1.5 1.5 0 0 1 12 14Z" />
    </svg>
  )
}

export function StarIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2.5c.3 0 .58.17.71.45l2.5 5.06 5.59.81a.79.79 0 0 1 .44 1.35l-4.05 3.95.96 5.57a.79.79 0 0 1-1.15.83L12 17.9l-5 2.63a.79.79 0 0 1-1.15-.84l.96-5.56-4.05-3.95a.79.79 0 0 1 .44-1.35l5.6-.81 2.5-5.06A.79.79 0 0 1 12 2.5Z" />
    </svg>
  )
}

export function BookIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M6.5 2A2.5 2.5 0 0 0 4 4.5v15A2.5 2.5 0 0 0 6.5 22H19a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H6.5ZM6 4.5a.5.5 0 0 1 .5-.5H18v12H6.5c-.17 0-.34.02-.5.05V4.5ZM6.5 18H18v2H6.5a.5.5 0 0 1 0-2ZM8.75 6.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5h-4Z" />
    </svg>
  )
}

export function XIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}
