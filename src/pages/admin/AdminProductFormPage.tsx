import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { supabase } from '@/lib/supabaseClient'
import { extractMetrcReference } from '@/lib/metrc'
import type {
  BrandRow,
  CannabinoidRow,
  ProductCategory,
  ProductInsert,
  ProductRow,
  StrainType,
  TerpeneRow,
} from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Field, inputClass } from '@/components/ui/Field'
import { QrScanner } from '@/components/scan/QrScanner'
import { ProfileRowsEditor, type ProfileRowValue } from './ProfileRowsEditor'

const CATEGORY_OPTIONS: Array<{ value: ProductCategory; label: string }> = [
  { value: 'flower', label: 'Flower' },
  { value: 'pre_roll', label: 'Pre-Roll' },
  { value: 'vape', label: 'Vape' },
  { value: 'concentrate', label: 'Concentrate' },
  { value: 'edible', label: 'Edible' },
  { value: 'tincture', label: 'Tincture' },
  { value: 'topical', label: 'Topical' },
  { value: 'other', label: 'Other' },
]

const STRAIN_OPTIONS: Array<{ value: StrainType | ''; label: string }> = [
  { value: '', label: 'Not specified' },
  { value: 'sativa', label: 'Sativa' },
  { value: 'indica', label: 'Indica' },
  { value: 'hybrid', label: 'Hybrid' },
]

interface ProductWithRawProfiles extends ProductRow {
  terpene_profile: Array<{ id: string; terpene_id: string; percentage: number }>
  cannabinoid_profile: Array<{ id: string; cannabinoid_id: string; percentage: number }>
}

export function AdminProductFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEditing = !!id
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [brands, setBrands] = useState<BrandRow[]>([])
  const [terpenes, setTerpenes] = useState<TerpeneRow[]>([])
  const [cannabinoids, setCannabinoids] = useState<CannabinoidRow[]>([])

  const [name, setName] = useState('')
  const [brandId, setBrandId] = useState('')
  const [category, setCategory] = useState<ProductCategory>('flower')
  const [strainType, setStrainType] = useState<StrainType | ''>('')
  const [metrcReference, setMetrcReference] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isActive, setIsActive] = useState(true)

  const [terpeneRows, setTerpeneRows] = useState<ProfileRowValue[]>([])
  const [cannabinoidRows, setCannabinoidRows] = useState<ProfileRowValue[]>([])

  const [scannerOpen, setScannerOpen] = useState(false)
  const [cameraNotice, setCameraNotice] = useState<string | null>(null)

  const selectedBrand = brands.find((b) => b.id === brandId) ?? null

  useEffect(() => {
    async function load() {
      setLoading(true)

      const [{ data: brandData }, { data: terpeneData }, { data: cannabinoidData }] = await Promise.all([
        supabase.from('brands').select('*').order('name'),
        supabase.from('terpenes').select('*').order('name'),
        supabase.from('cannabinoids').select('*').order('name'),
      ])
      setBrands((brandData as BrandRow[]) ?? [])
      setTerpenes((terpeneData as TerpeneRow[]) ?? [])
      setCannabinoids((cannabinoidData as CannabinoidRow[]) ?? [])

      if (id) {
        const { data } = await supabase
          .from('products')
          .select(
            `*,
            terpene_profile:product_terpene_profile(id, terpene_id, percentage),
            cannabinoid_profile:product_cannabinoid_profile(id, cannabinoid_id, percentage)`,
          )
          .eq('id', id)
          .single()

        if (data) {
          const product = data as unknown as ProductWithRawProfiles
          setName(product.name)
          setBrandId(product.brand_id ?? '')
          setCategory(product.category)
          setStrainType(product.strain_type ?? '')
          setMetrcReference(product.metrc_reference)
          setDescription(product.description ?? '')
          setImageUrl(product.image_url ?? '')
          setIsActive(product.is_active)
          setTerpeneRows(
            product.terpene_profile.map((row) => ({
              key: row.id,
              referenceId: row.terpene_id,
              percentage: String(row.percentage),
            })),
          )
          setCannabinoidRows(
            product.cannabinoid_profile.map((row) => ({
              key: row.id,
              referenceId: row.cannabinoid_id,
              percentage: String(row.percentage),
            })),
          )
        }
      }

      setLoading(false)
    }

    load()
  }, [id])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload: ProductInsert = {
      name,
      brand_id: brandId || null,
      dispensary_id: null,
      category,
      strain_type: strainType || null,
      metrc_reference: extractMetrcReference(metrcReference),
      description: description || null,
      image_url: imageUrl || null,
      is_active: isActive,
    }

    let productId = id

    if (isEditing && id) {
      const { error: updateError } = await supabase.from('products').update(payload).eq('id', id)
      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('products')
        .insert(payload)
        .select('id')
        .single()
      if (insertError || !inserted) {
        setError(insertError?.message ?? 'Failed to create product')
        setSaving(false)
        return
      }
      productId = (inserted as { id: string }).id
    }

    if (!productId) {
      setError('Missing product id after save')
      setSaving(false)
      return
    }

    const validTerpeneRows = terpeneRows.filter((r) => r.referenceId && r.percentage !== '')
    const validCannabinoidRows = cannabinoidRows.filter((r) => r.referenceId && r.percentage !== '')

    // Simplest correct approach for a small admin-managed list: replace wholesale
    // rather than diffing individual rows.
    await supabase.from('product_terpene_profile').delete().eq('product_id', productId)
    if (validTerpeneRows.length > 0) {
      const { error: terpeneError } = await supabase.from('product_terpene_profile').insert(
        validTerpeneRows.map((r) => ({
          product_id: productId,
          terpene_id: r.referenceId,
          percentage: Number(r.percentage),
        })),
      )
      if (terpeneError) {
        setError(terpeneError.message)
        setSaving(false)
        return
      }
    }

    await supabase.from('product_cannabinoid_profile').delete().eq('product_id', productId)
    if (validCannabinoidRows.length > 0) {
      const { error: cannabinoidError } = await supabase.from('product_cannabinoid_profile').insert(
        validCannabinoidRows.map((r) => ({
          product_id: productId,
          cannabinoid_id: r.referenceId,
          percentage: Number(r.percentage),
        })),
      )
      if (cannabinoidError) {
        setError(cannabinoidError.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    navigate('/admin/products')
  }

  async function handleDelete() {
    if (!id) return
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    await supabase.from('products').delete().eq('id', id)
    navigate('/admin/products')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{isEditing ? 'Edit product' : 'New product'}</h1>
        {isEditing && (
          <button onClick={handleDelete} className="text-sm font-medium text-red-400 hover:underline">
            Delete
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-4">
          <Field label="Name">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Metrc reference (the code from the product's QR, or paste the full 1a4.com link)">
            {scannerOpen ? (
              <QrScanner
                onDecode={(parsed) => {
                  setMetrcReference(parsed.retailId)
                  setScannerOpen(false)
                  setCameraNotice(null)
                }}
                onCancel={() => setScannerOpen(false)}
                onUnavailable={(message) => {
                  setScannerOpen(false)
                  setCameraNotice(message)
                }}
              />
            ) : (
              <div className="flex gap-2">
                <input
                  required
                  value={metrcReference}
                  onChange={(e) => setMetrcReference(e.target.value)}
                  placeholder="5LO1I9DSO0DPBE65C2DC"
                  className={`${inputClass} font-mono`}
                />
                <Button type="button" variant="outline" onClick={() => setScannerOpen(true)}>
                  Scan
                </Button>
              </div>
            )}
            {cameraNotice && <p className="mt-1 text-xs text-gold-400">{cameraNotice}</p>}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Brand">
              <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className={inputClass}>
                <option value="">No brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className={inputClass}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Strain type">
              <select
                value={strainType}
                onChange={(e) => setStrainType(e.target.value as StrainType | '')}
                className={inputClass}
              >
                {STRAIN_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status">
              <label className="mt-2.5 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                Active (visible to scans)
              </label>
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={inputClass}
            />
          </Field>

          <Field label="Image URL">
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={inputClass} />
          </Field>

          {(imageUrl || selectedBrand?.logo_url) && (
            <div className="flex items-center gap-4">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Product preview"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                  className="h-20 w-20 shrink-0 rounded-2xl border border-border bg-surface object-cover"
                />
              )}
              {selectedBrand?.logo_url && (
                <img
                  src={selectedBrand.logo_url}
                  alt={`${selectedBrand.name} logo`}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                  className="h-14 w-14 shrink-0 rounded-full border border-border bg-white object-contain p-2"
                />
              )}
            </div>
          )}
        </Card>

        <Card>
          <ProfileRowsEditor
            title="Terpenes"
            options={terpenes.map((t) => ({ id: t.id, label: t.name }))}
            rows={terpeneRows}
            onChange={setTerpeneRows}
          />
        </Card>

        <Card>
          <ProfileRowsEditor
            title="Cannabinoids"
            options={cannabinoids.map((c) => ({ id: c.id, label: `${c.name} (${c.abbreviation})` }))}
            rows={cannabinoidRows}
            onChange={setCannabinoidRows}
          />
        </Card>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save product'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
