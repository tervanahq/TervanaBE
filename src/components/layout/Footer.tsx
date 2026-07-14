import { TervanaMark } from '@/components/brand/TervanaMark'

export function Footer() {
  return (
    <footer>
      <div
        aria-hidden="true"
        className="h-px w-full bg-gradient-to-r from-gold-400/40 via-primary-500/40 to-accent-500/40"
      />
      <div className="px-4 py-8">
        <div className="mx-auto max-w-2xl space-y-3 text-xs leading-relaxed text-muted-foreground">
          <p>
            Educational content only, not medical advice. Reported effects reflect common
            consumer and industry associations, not clinical claims, and have not been
            evaluated by the FDA. Cannabis products have not been analyzed or approved by the
            FDA for the treatment, cure, or prevention of any disease.
          </p>
          <p>You must be 21+ to purchase or consume cannabis products in New York State.</p>
          <p className="flex items-center gap-1.5 pt-1 text-muted-foreground/70">
            <TervanaMark className="h-4 w-4" /> © {new Date().getFullYear()} Tervana
          </p>
        </div>
      </div>
    </footer>
  )
}
