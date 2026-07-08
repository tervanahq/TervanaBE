// Hand-written to match supabase/migrations/20260707120000_init_schema.sql.
// Once the project is linked, prefer regenerating with:
//   supabase gen types typescript --linked > src/types/database.ts
// (re-add the domain union types below if you do, the generator emits `string`.)

export type ProductCategory =
  | 'flower'
  | 'pre_roll'
  | 'vape'
  | 'concentrate'
  | 'edible'
  | 'tincture'
  | 'topical'
  | 'other'

export type StrainType = 'sativa' | 'indica' | 'hybrid'
export type ProfileRole = 'user' | 'admin'
export type SubscriptionTier = 'free' | 'plus'
export type SponsorshipTier = 'none' | 'featured' | 'premium'
export type ScanSource = 'qr_scan' | 'manual_search' | 'admin_preview'

export interface ProfileRow {
  id: string
  email: string | null
  display_name: string | null
  role: ProfileRole
  subscription_tier: SubscriptionTier
  created_at: string
  updated_at: string
}
export type ProfileUpdate = Partial<Omit<ProfileRow, 'id' | 'role' | 'subscription_tier'>>

export interface BrandRow {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  website: string | null
  is_sponsored: boolean
  sponsorship_tier: SponsorshipTier
  created_at: string
  updated_at: string
}
export type BrandInsert = Omit<BrandRow, 'id' | 'created_at' | 'updated_at' | 'is_sponsored' | 'sponsorship_tier'> &
  Partial<Pick<BrandRow, 'id' | 'created_at' | 'updated_at' | 'is_sponsored' | 'sponsorship_tier'>>
export type BrandUpdate = Partial<BrandInsert>

export interface DispensaryRow {
  id: string
  name: string
  license_number: string
  address: string | null
  region: string | null
  website: string | null
  is_white_label_partner: boolean
  owner_user_id: string | null
  created_at: string
  updated_at: string
}
export type DispensaryInsert = Omit<
  DispensaryRow,
  'id' | 'created_at' | 'updated_at' | 'is_white_label_partner'
> &
  Partial<Pick<DispensaryRow, 'id' | 'created_at' | 'updated_at' | 'is_white_label_partner'>>
export type DispensaryUpdate = Partial<DispensaryInsert>

export interface ProductRow {
  id: string
  name: string
  brand_id: string | null
  dispensary_id: string | null
  category: ProductCategory
  strain_type: StrainType | null
  metrc_reference: string
  description: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
export type ProductInsert = Omit<ProductRow, 'id' | 'created_at' | 'updated_at' | 'is_active'> &
  Partial<Pick<ProductRow, 'id' | 'created_at' | 'updated_at' | 'is_active'>>
export type ProductUpdate = Partial<ProductInsert>

export interface TerpeneRow {
  id: string
  name: string
  slug: string
  aroma_profile: string[]
  reported_effects: string[]
  boiling_point_c: number | null
  also_found_in: string[]
  description: string | null
  created_at: string
  updated_at: string
}

export interface CannabinoidRow {
  id: string
  name: string
  abbreviation: string
  slug: string
  description: string | null
  reported_effects: string[]
  is_psychoactive: boolean
  created_at: string
  updated_at: string
}

export interface ProductTerpeneProfileRow {
  id: string
  product_id: string
  terpene_id: string
  percentage: number
  created_at: string
}
export type ProductTerpeneProfileInsert = Omit<ProductTerpeneProfileRow, 'id' | 'created_at'> &
  Partial<Pick<ProductTerpeneProfileRow, 'id' | 'created_at'>>

export interface ProductCannabinoidProfileRow {
  id: string
  product_id: string
  cannabinoid_id: string
  percentage: number
  created_at: string
}
export type ProductCannabinoidProfileInsert = Omit<ProductCannabinoidProfileRow, 'id' | 'created_at'> &
  Partial<Pick<ProductCannabinoidProfileRow, 'id' | 'created_at'>>

export interface LabResultRow {
  id: string
  product_id: string
  lab_name: string
  test_date: string | null
  coa_url: string | null
  is_verified_partner: boolean
  created_at: string
  updated_at: string
}
export type LabResultInsert = Omit<LabResultRow, 'id' | 'created_at' | 'updated_at' | 'is_verified_partner'> &
  Partial<Pick<LabResultRow, 'id' | 'created_at' | 'updated_at' | 'is_verified_partner'>>

export interface ScanRow {
  id: string
  user_id: string | null
  product_id: string | null
  metrc_reference_scanned: string
  found: boolean
  source: ScanSource
  scanned_at: string
}
export type ScanInsert = Omit<ScanRow, 'id' | 'scanned_at' | 'found' | 'source'> &
  Partial<Pick<ScanRow, 'id' | 'scanned_at' | 'found' | 'source'>>

// Convenience shape for the scan result page: a product with its nested profiles.
export interface ProductWithProfile extends ProductRow {
  brand: BrandRow | null
  terpene_profile: Array<{ percentage: number; terpene: TerpeneRow }>
  cannabinoid_profile: Array<{ percentage: number; cannabinoid: CannabinoidRow }>
  lab_results: LabResultRow[]
}
