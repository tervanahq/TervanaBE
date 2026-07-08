import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { supabase } from '@/lib/supabaseClient'
import { slugify } from '@/lib/slug'
import type { BrandInsert, BrandRow, SponsorshipTier } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Field, inputClass } from '@/components/ui/Field'

const SPONSORSHIP_OPTIONS: Array<{ value: SponsorshipTier; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'featured', label: 'Featured' },
  { value: 'premium', label: 'Premium' },
]

export function AdminBrandFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEditing = !!id
  const navigate = useNavigate()

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [website, setWebsite] = useState('')
  const [isSponsored, setIsSponsored] = useState(false)
  const [sponsorshipTier, setSponsorshipTier] = useState<SponsorshipTier>('none')

  const slugEdited = useRef(false)

  useEffect(() => {
    if (!id) return

    async function load() {
      const { data } = await supabase.from('brands').select('*').eq('id', id).single()
      if (data) {
        const brand = data as BrandRow
        setName(brand.name)
        setSlug(brand.slug)
        setDescription(brand.description ?? '')
        setLogoUrl(brand.logo_url ?? '')
        setWebsite(brand.website ?? '')
        setIsSponsored(brand.is_sponsored)
        setSponsorshipTier(brand.sponsorship_tier)
        slugEdited.current = true
      }
      setLoading(false)
    }

    load()
  }, [id])

  function handleNameChange(value: string) {
    setName(value)
    if (!slugEdited.current) {
      setSlug(slugify(value))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload: BrandInsert = {
      name,
      slug: slug || slugify(name),
      description: description || null,
      logo_url: logoUrl || null,
      website: website || null,
      is_sponsored: isSponsored,
      sponsorship_tier: sponsorshipTier,
    }

    const { error: saveError } = isEditing
      ? await supabase.from('brands').update(payload).eq('id', id)
      : await supabase.from('brands').insert(payload)

    setSaving(false)

    if (saveError) {
      setError(saveError.message)
      return
    }

    navigate('/admin/brands')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-bold">{isEditing ? 'Edit brand' : 'New brand'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-4">
          <Field label="Name">
            <input
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Slug">
            <input
              required
              value={slug}
              onChange={(e) => {
                slugEdited.current = true
                setSlug(e.target.value)
              }}
              className={`${inputClass} font-mono`}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Logo URL">
              <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Website">
              <input value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Sponsored placement">
              <label className="mt-2.5 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isSponsored}
                  onChange={(e) => setIsSponsored(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                Sponsored
              </label>
            </Field>

            <Field label="Sponsorship tier">
              <select
                value={sponsorshipTier}
                onChange={(e) => setSponsorshipTier(e.target.value as SponsorshipTier)}
                disabled={!isSponsored}
                className={`${inputClass} disabled:opacity-50`}
              >
                {SPONSORSHIP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Card>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save brand'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/brands')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
