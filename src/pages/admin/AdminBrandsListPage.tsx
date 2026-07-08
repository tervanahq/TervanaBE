import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '@/lib/supabaseClient'
import type { BrandRow } from '@/types/database'
import { buttonClasses } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'

export function AdminBrandsListPage() {
  const [brands, setBrands] = useState<BrandRow[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('brands').select('*').order('name')
    setBrands((data as BrandRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this brand? Products using it will keep their record but lose the brand link.')) {
      return
    }
    await supabase.from('brands').delete().eq('id', id)
    setBrands((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Brands</h1>
        <Link to="/admin/brands/new" className={buttonClasses()}>
          New brand
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : brands.length === 0 ? (
        <p className="text-sm text-muted-foreground">No brands yet. Add the first one.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Sponsorship</th>
                <th className="px-4 py-3 font-medium">Website</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{brand.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{brand.slug}</td>
                  <td className="px-4 py-3">
                    {brand.is_sponsored ? (
                      <Badge variant="gold">{brand.sponsorship_tier}</Badge>
                    ) : (
                      <Badge variant="neutral">none</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {brand.website ? (
                      <a href={brand.website} target="_blank" rel="noreferrer" className="text-primary-400 hover:underline">
                        {brand.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Link
                        to={`/admin/brands/${brand.id}/edit`}
                        className="font-medium text-primary-400 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="font-medium text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
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
