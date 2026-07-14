import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { parseScanInput } from '@/lib/metrc'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { QrScanner } from '@/components/scan/QrScanner'
import { TervanaMark } from '@/components/brand/TervanaMark'

export function HomePage() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [cameraNotice, setCameraNotice] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = parseScanInput(value)
    if (!parsed) {
      setFormError("That doesn't look like a 1a4.com link or product code.")
      return
    }
    setFormError(null)
    navigate(`/scan/${parsed.retailId}${parsed.index ? `/${parsed.index}` : ''}`)
  }

  function handleCameraUnavailable(message: string) {
    setScannerOpen(false)
    setCameraNotice(`${message} Enter the code manually below.`)
  }

  return (
    <div className="relative mx-auto flex max-w-2xl flex-col gap-10 overflow-x-clip px-4 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent-500/15 blur-3xl" />
        <div className="absolute top-28 left-[10%] h-44 w-44 rounded-full bg-primary-500/15 blur-3xl" />
        <div className="absolute top-16 right-[8%] h-48 w-48 rounded-full bg-gold-400/10 blur-3xl" />
      </div>

      <div className="space-y-4 text-center">
        <TervanaMark className="animate-fade-up mx-auto h-24 w-24" />
        <p className="animate-fade-up text-sm font-semibold tracking-wide text-primary-400 uppercase [animation-delay:0.08s]">
          Know what you're smoking
        </p>
        <h1 className="animate-fade-up text-3xl font-bold tracking-tight text-balance [animation-delay:0.16s] sm:text-4xl">
          Scan a NY cannabis product to see its{' '}
          <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-gold-400 bg-clip-text text-transparent">
            real terpene profile
          </span>
        </h1>
        <p className="animate-fade-up mx-auto max-w-md text-sm text-muted-foreground [animation-delay:0.24s]">
          Point your camera at the QR code on any Metrc-tracked package. Instead of raw
          compliance data, Tervana shows you the terpenes, cannabinoids, and likely effects in
          plain language.
        </p>
      </div>

      {scannerOpen ? (
        <QrScanner
          onDecode={(parsed) => navigate(`/scan/${parsed.retailId}${parsed.index ? `/${parsed.index}` : ''}`)}
          onCancel={() => setScannerOpen(false)}
          onUnavailable={handleCameraUnavailable}
        />
      ) : (
        <div className="animate-fade-up [animation-delay:0.32s]">
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => {
              setCameraNotice(null)
              setScannerOpen(true)
            }}
          >
            Scan Product
          </Button>
        </div>
      )}

      {cameraNotice && <p className="text-center text-sm text-gold-400">{cameraNotice}</p>}

      <Card className="animate-fade-up space-y-4 [animation-delay:0.4s]">
        <h2 className="text-sm font-semibold text-foreground">Have a code already?</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste a 1a4.com link or product code"
            className="h-11 flex-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none"
          />
          <Button type="submit">Look up</Button>
        </form>
        {formError && <p className="text-sm text-red-400">{formError}</p>}
      </Card>

      <div className="animate-fade-up grid grid-cols-1 gap-4 [animation-delay:0.48s] sm:grid-cols-3">
        <HowItWorksStep n="1" title="Scan">
          Use your phone's camera on the QR code on the package label.
        </HowItWorksStep>
        <HowItWorksStep n="2" title="See the profile">
          We match it against our database of terpene and cannabinoid data.
        </HowItWorksStep>
        <HowItWorksStep n="3" title="Learn as you go">
          Plain-language effects and aroma notes, not a lab data sheet.
        </HowItWorksStep>
      </div>
    </div>
  )
}

function HowItWorksStep({
  n,
  title,
  children,
}: {
  n: string
  title: string
  children: string
}) {
  return (
    <div className="space-y-1.5 rounded-xl border border-border bg-surface p-4 transition duration-300 hover:-translate-y-1 hover:border-primary-800">
      <span className="bg-gradient-to-r from-primary-400 to-gold-400 bg-clip-text font-mono text-xs font-bold text-transparent">
        {n}
      </span>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{children}</p>
    </div>
  )
}
