export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-3 text-xs leading-relaxed text-muted-foreground">
        <p>
          Educational content only, not medical advice. Reported effects reflect common
          consumer and industry associations, not clinical claims, and have not been
          evaluated by the FDA. Cannabis products have not been analyzed or approved by the
          FDA for the treatment, cure, or prevention of any disease.
        </p>
        <p>You must be 21+ to purchase or consume cannabis products in New York State.</p>
        <p className="pt-1 text-muted-foreground/70">© {new Date().getFullYear()} Tervana</p>
      </div>
    </footer>
  )
}
