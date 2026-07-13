import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { parseScanInput } from '@/lib/metrc'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { QrScanner } from '@/components/scan/QrScanner'

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
    <div className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-12">
      <div className="space-y-4 text-center">
        <p className="text-sm font-semibold tracking-wide text-primary-400 uppercase">
          Know what you're smoking
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Scan a NY cannabis product to see its real terpene profile
        </h1>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
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
      )}

      {cameraNotice && <p className="text-center text-sm text-gold-400">{cameraNotice}</p>}

      <Card className="space-y-4">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
    <div className="space-y-1.5 rounded-xl border border-border bg-surface p-4">
      <span className="font-mono text-xs text-primary-400">{n}</span>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{children}</p>
    </div>
  )
}
