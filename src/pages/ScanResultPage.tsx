import { useEffect, useState, type ReactNode } from 'react'
import { useParams } from 'react-router'
import { supabase } from '@/lib/supabaseClient'
import { isValidRetailId, build1a4Url } from '@/lib/metrc'
import type { ProductWithProfile } from '@/types/database'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProfileMeter } from '@/components/scan/ProfileMeter'

type Status = 'loading' | 'invalid' | 'found' | 'not-found' | 'error'

const TOP_TERPENE_COUNT = 4

const PRODUCT_SELECT = `*,
  brand:brands(*),
  terpene_profile:product_terpene_profile(percentage, terpene:terpenes(*)),
  cannabinoid_profile:product_cannabinoid_profile(percentage, cannabinoid:cannabinoids(*)),
  lab_results(*)`

export function ScanResultPage() {
  const { retailId = '', index } = useParams<{ retailId: string; index?: string }>()
  const [status, setStatus] = useState<Status>('loading')
  const [product, setProduct] = useState<ProductWithProfile | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [showAllTerpenes, setShowAllTerpenes] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function run() {
      setStatus('loading')
      setProduct(null)

      if (!isValidRetailId(retailId)) {
        if (isMounted) setStatus('invalid')
        return
      }

      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('metrc_reference', retailId)
        .eq('is_active', true)
        .maybeSingle()

      if (!isMounted) return

      if (error) {
        setStatus('error')
        return
      }

      const found = !!data
      const typedProduct = found ? (data as unknown as ProductWithProfile) : null
      setStatus(found ? 'found' : 'not-found')
      setProduct(typedProduct)

      // Log the scan (including misses, so we know what to add) without
      // blocking the render on it. Supabase query builders are lazy
      // thenables -- `void` alone never triggers `.then()`, so the request
      // never actually fires. Attaching .then() (even just for the error)
      // is what dispatches it.
      const { data: authData } = await supabase.auth.getUser()
      supabase
        .from('scans')
        .insert({
          product_id: typedProduct?.id ?? null,
          metrc_reference_scanned: retailId,
          found,
          source: 'qr_scan',
          user_id: authData.user?.id ?? null,
        })
        .then(({ error: insertError }) => {
          if (insertError) console.error('Failed to log scan:', insertError.message)
        })
    }

    run()

    return () => {
      isMounted = false
    }
  }, [retailId, attempt])

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <ScanEmptyState
        heading="That doesn't look like a product code"
        body="This link doesn't match the format Tervana expects from a Metrc/1a4 QR code. Try scanning the code on the package again."
      />
    )
  }

  if (status === 'error') {
    return (
      <ScanEmptyState heading="Something went wrong" body="We couldn't look up this product just now.">
        <Button size="sm" onClick={() => setAttempt((n) => n + 1)}>
          Try again
        </Button>
      </ScanEmptyState>
    )
  }

  if (status === 'not-found') {
    return (
      <ScanEmptyState
        heading="Not yet in our database"
        body="We don't have terpene or cannabinoid data for this product yet — we've logged it so our team can add it soon."
      >
        <a
          href={build1a4Url(retailId, index)}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-primary-400 underline underline-offset-4"
        >
          View the official compliance page on 1a4.com →
        </a>
      </ScanEmptyState>
    )
  }

  const p = product as ProductWithProfile
  const sortedTerpenes = [...p.terpene_profile].sort((a, b) => b.percentage - a.percentage)
  const sortedCannabinoids = [...p.cannabinoid_profile].sort((a, b) => b.percentage - a.percentage)
  const maxTerpene = Math.max(...sortedTerpenes.map((t) => t.percentage), 0.0001)
  const maxCannabinoid = Math.max(...sortedCannabinoids.map((c) => c.percentage), 0.0001)
  const totalTerpenePct = sortedTerpenes.reduce((sum, t) => sum + t.percentage, 0)
  const visibleTerpenes = showAllTerpenes ? sortedTerpenes : sortedTerpenes.slice(0, TOP_TERPENE_COUNT)
  const hiddenTerpeneCount = sortedTerpenes.length - visibleTerpenes.length
  const verifiedLab = p.lab_results.find((lab) => lab.is_verified_partner)

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="animate-fade-up">
        <div className="flex items-start gap-4">
          {p.image_url && (
            <img
              src={p.image_url}
              alt={p.name}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
              className="h-24 w-24 shrink-0 rounded-2xl border border-border bg-surface object-cover sm:h-32 sm:w-32"
            />
          )}
          <div className="min-w-0 flex-1">
            {p.brand && <p className="text-sm font-medium text-gold-400">{p.brand.name}</p>}
            <h1 className="text-2xl font-bold tracking-tight text-balance">{p.name}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="primary">{formatCategory(p.category)}</Badge>
              {p.strain_type && <Badge variant="neutral">{capitalize(p.strain_type)}</Badge>}
              {verifiedLab && <Badge variant="gold">✓ Verified lab partner</Badge>}
            </div>
          </div>
          {p.brand?.logo_url && (
            <img
              src={p.brand.logo_url}
              alt={p.brand.name}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
              className="h-14 w-14 shrink-0 rounded-full border border-border bg-white object-contain p-2 sm:h-16 sm:w-16"
            />
          )}
        </div>
        {p.description && <p className="mt-3 text-sm text-muted-foreground">{p.description}</p>}
      </div>

      {sortedCannabinoids.length > 0 && (
        <Card className="animate-fade-up [animation-delay:0.1s]">
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-gold-400 uppercase">
            Cannabinoids
          </h2>
          <div className="space-y-4">
            {sortedCannabinoids.map(({ percentage, cannabinoid }) => (
              <ProfileMeter
                key={cannabinoid.id}
                label={`${cannabinoid.name} (${cannabinoid.abbreviation})`}
                percentage={percentage}
                fillRatio={percentage / maxCannabinoid}
                tone="gold"
              />
            ))}
          </div>
        </Card>
      )}

      {sortedTerpenes.length > 0 && (
        <Card className="animate-fade-up [animation-delay:0.2s]">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-primary-400 uppercase">
              Terpene Profile
            </h2>
            <span className="text-sm font-semibold text-foreground">
              Total: {totalTerpenePct.toFixed(2)}%
            </span>
          </div>
          <div className="space-y-5">
            {visibleTerpenes.map(({ percentage, terpene }) => (
              <div key={terpene.id}>
                <ProfileMeter
                  label={terpene.name}
                  percentage={percentage}
                  fillRatio={percentage / maxTerpene}
                  tone="primary"
                />
                {terpene.reported_effects.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {terpene.reported_effects.map((effect) => (
                      <Badge key={effect} variant="neutral">
                        {effect}
                      </Badge>
                    ))}
                  </div>
                )}
                {terpene.description && (
                  <p className="mt-1.5 text-xs text-muted-foreground">{terpene.description}</p>
                )}
              </div>
            ))}
          </div>
          {hiddenTerpeneCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAllTerpenes(true)}
              className="mt-4 w-full text-center text-xs font-medium text-primary-400 hover:underline"
            >
              Show {hiddenTerpeneCount} more terpene{hiddenTerpeneCount === 1 ? '' : 's'} ▾
            </button>
          )}
          {showAllTerpenes && sortedTerpenes.length > TOP_TERPENE_COUNT && (
            <button
              type="button"
              onClick={() => setShowAllTerpenes(false)}
              className="mt-4 w-full text-center text-xs font-medium text-primary-400 hover:underline"
            >
              Show less ▴
            </button>
          )}
        </Card>
      )}

      {p.lab_results.length > 0 && (
        <Card className="animate-fade-up [animation-delay:0.3s]">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Lab Results
          </h2>
          <ul className="space-y-2">
            {p.lab_results.map((lab) => (
              <li key={lab.id} className="flex items-center justify-between text-sm">
                <span>
                  {lab.lab_name}
                  {lab.is_verified_partner && (
                    <Badge variant="gold" className="ml-2">
                      Verified
                    </Badge>
                  )}
                </span>
                {lab.coa_url && (
                  <a
                    href={lab.coa_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-primary-400 underline underline-offset-4"
                  >
                    View COA
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <p className="text-center text-xs text-muted-foreground">
        <a
          href={build1a4Url(retailId, index)}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          View official compliance data on 1a4.com
        </a>
      </p>
    </div>
  )
}

function ScanEmptyState({
  heading,
  body,
  children,
}: {
  heading: string
  body: string
  children?: ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-bold">{heading}</h1>
      <p className="text-sm text-muted-foreground">{body}</p>
      {children}
    </div>
  )
}

function formatCategory(category: string) {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
