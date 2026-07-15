import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '@/lib/supabaseClient'
import { buttonClasses } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'

interface MissGroup {
  ref: string
  count: number
  lastScannedAt: string
}

export function AdminScanMissesPage() {
  const [misses, setMisses] = useState<MissGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      // Group client-side: supabase-js has no group-by without an RPC, and an
      // admin worklist is small enough that pulling recent miss rows is fine.
      const { data: scanData } = await supabase
        .from('scans')
        .select('metrc_reference_scanned, scanned_at')
        .eq('found', false)
        .order('scanned_at', { ascending: false })
        .limit(1000)

      const groups = new Map<string, MissGroup>()
      for (const row of scanData ?? []) {
        const ref = row.metrc_reference_scanned
        const existing = groups.get(ref)
        if (existing) {
          existing.count += 1
        } else {
          groups.set(ref, { ref, count: 1, lastScannedAt: row.scanned_at })
        }
      }

      // Self-cleaning: drop any code that has since been added as a product,
      // so this list only ever shows work that's still outstanding.
      const refs = [...groups.keys()]
      if (refs.length > 0) {
        const { data: existingProducts } = await supabase
          .from('products')
          .select('metrc_reference')
          .in('metrc_reference', refs)
        for (const product of existingProducts ?? []) {
          groups.delete(product.metrc_reference)
        }
      }

      setMisses([...groups.values()])
      setLoading(false)
    }

    load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Products to add</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Codes people scanned that aren't in the database yet, most recent first. Higher scan
          counts mean more people are asking for that product. Rows disappear automatically
          once a product with that code is added.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : misses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing outstanding — every scan so far matched a product.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Times scanned</th>
                <th className="px-4 py-3 font-medium">Last scanned</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {misses.map((miss) => (
                <tr key={miss.ref} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{miss.ref}</td>
                  <td className="px-4 py-3">
                    <Badge variant={miss.count > 1 ? 'gold' : 'neutral'}>
                      {miss.count}×
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(miss.lastScannedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/products/new?ref=${encodeURIComponent(miss.ref)}`}
                      className={buttonClasses('outline', 'sm')}
                    >
                      Add product
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
