import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Scanner, type IDetectedBarcode, type IScannerError } from '@yudiel/react-qr-scanner'
import { parseScanInput } from '@/lib/metrc'
import { Button } from '@/components/ui/Button'

const ERROR_MESSAGES: Partial<Record<IScannerError['kind'], string>> = {
  'permission-denied': 'Camera access was denied.',
  'no-camera': "Couldn't find a camera on this device.",
  'insecure-context': 'Camera access needs a secure (https) connection.',
  unsupported: "This browser doesn't support camera scanning.",
}

interface QrScannerProps {
  onCancel: () => void
  onUnavailable: (message: string) => void
}

export function QrScanner({ onCancel, onUnavailable }: QrScannerProps) {
  const navigate = useNavigate()
  const [scanError, setScanError] = useState<string | null>(null)
  const [paused, setPaused] = useState(false)

  function handleScan(detectedCodes: IDetectedBarcode[]) {
    const rawValue = detectedCodes[0]?.rawValue
    if (!rawValue) return

    const parsed = parseScanInput(rawValue)
    if (!parsed) {
      setScanError("That QR code doesn't look like a product code. Try again.")
      return
    }

    setScanError(null)
    setPaused(true)
    navigate(`/scan/${parsed.retailId}${parsed.index ? `/${parsed.index}` : ''}`)
  }

  function handleError(error: IScannerError) {
    onUnavailable(
      ERROR_MESSAGES[error.kind] ?? "Couldn't access your camera. You can still enter the code manually below.",
    )
  }

  return (
    <div className="space-y-3">
      <Scanner
        onScan={handleScan}
        onError={handleError}
        paused={paused}
        constraints={{ facingMode: 'environment' }}
        components={{ finder: true, torch: true, zoom: false, onOff: false }}
        classNames={{
          container: 'aspect-square w-full overflow-hidden rounded-2xl border border-border bg-black',
          video: 'object-cover',
        }}
      />
      {scanError && <p className="text-sm text-red-400">{scanError}</p>}
      <Button type="button" variant="outline" onClick={onCancel} className="w-full">
        Cancel
      </Button>
    </div>
  )
}
