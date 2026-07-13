import Papa from 'papaparse'
import { extractMetrcReference } from './metrc'
import type { ProductCategory, StrainType } from '@/types/database'

export const PRODUCT_IMPORT_HEADERS = [
  'name',
  'brand',
  'category',
  'strain_type',
  'metrc_reference',
  'description',
  'image_url',
  'terpenes',
  'cannabinoids',
] as const

const REQUIRED_HEADERS = ['name', 'category', 'metrc_reference'] as const

export const VALID_CATEGORIES: ProductCategory[] = [
  'flower',
  'pre_roll',
  'vape',
  'concentrate',
  'edible',
  'tincture',
  'topical',
  'other',
]

export const VALID_STRAIN_TYPES: StrainType[] = ['sativa', 'indica', 'hybrid']

/** Generates the downloadable CSV template, with two example rows showing the delimited terpene/cannabinoid format. */
export function buildTemplateCsv(): string {
  return Papa.unparse({
    fields: [...PRODUCT_IMPORT_HEADERS],
    data: [
      [
        'Blue Dream 3.5g',
        'Example Farms',
        'flower',
        'hybrid',
        '5LO1I9DSO0DPBE65C2DC',
        'A classic hybrid with a sweet berry aroma.',
        'https://example.com/images/blue-dream.jpg',
        'Myrcene:0.45;Limonene:0.32;Pinene:0.08',
        'THC:22.5;CBD:0.8',
      ],
      [
        'Strawberry Guava 1g Pre-Roll',
        '',
        'pre_roll',
        'sativa',
        '13U2YPUQ3XWICZKLFH6Y2P',
        '',
        '',
        'Limonene:0.6',
        'THC:24.1',
      ],
    ],
  })
}

export function findMissingRequiredHeaders(fields: string[] | undefined): string[] {
  const present = new Set((fields ?? []).map((f) => f.trim().toLowerCase()))
  return REQUIRED_HEADERS.filter((h) => !present.has(h))
}

export interface ReferenceLookup {
  id: string
  name: string
}

export interface ResolvedProfileEntry {
  referenceId: string
  name: string
  percentage: number
}

function parseProfileCell(
  cell: string | undefined,
  label: string,
  referenceMap: Map<string, ReferenceLookup>,
): { resolved: ResolvedProfileEntry[]; issues: string[] } {
  const resolved: ResolvedProfileEntry[] = []
  const issues: string[] = []
  const trimmedCell = (cell ?? '').trim()
  if (!trimmedCell) return { resolved, issues }

  for (const rawEntry of trimmedCell.split(';')) {
    const entry = rawEntry.trim()
    if (!entry) continue

    const [rawName, rawPct] = entry.split(':')
    const name = (rawName ?? '').trim()
    const pctText = (rawPct ?? '').trim().replace(/%$/, '')

    if (!name || rawPct === undefined) {
      issues.push(`${label} entry "${entry}" isn't in "Name:percentage" format -- skipped`)
      continue
    }

    const match = referenceMap.get(name.toLowerCase())
    if (!match) {
      issues.push(`${label} "${name}" isn't a recognized name -- skipped`)
      continue
    }

    const percentage = Number(pctText)
    if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
      issues.push(`${label} "${name}" has an invalid percentage ("${rawPct}") -- skipped`)
      continue
    }

    resolved.push({ referenceId: match.id, name: match.name, percentage })
  }

  return { resolved, issues }
}

export type ImportRowStatus = 'valid' | 'warning' | 'error'

export interface ParsedImportRow {
  rowIndex: number
  raw: Record<string, string>

  name: string
  brandId: string | null
  brandNameInput: string
  category: ProductCategory | null
  strainType: StrainType | null
  metrcReference: string
  description: string | null
  imageUrl: string | null
  terpenes: ResolvedProfileEntry[]
  cannabinoids: ResolvedProfileEntry[]

  status: ImportRowStatus
  errors: string[]
  warnings: string[]
}

export interface ValidationContext {
  brandsByName: Map<string, ReferenceLookup>
  terpenesByName: Map<string, ReferenceLookup>
  cannabinoidsByName: Map<string, ReferenceLookup>
  existingDbRefs: Set<string>
}

/** Re-validates a single row's metrc_reference against the same within-file/DB dupe rules used at initial upload. */
export function checkMetrcReferenceIssues(
  metrcReference: string,
  otherRows: ParsedImportRow[],
  existingDbRefs: Set<string>,
): string[] {
  const issues: string[] = []
  if (!metrcReference) return ['Missing metrc_reference']
  if (otherRows.some((r) => r.metrcReference === metrcReference)) {
    issues.push(`Duplicate metrc_reference "${metrcReference}" appears more than once in this file`)
  }
  if (existingDbRefs.has(metrcReference)) {
    issues.push(`metrc_reference "${metrcReference}" already exists in the database`)
  }
  return issues
}

function deriveStatus(errors: string[], warnings: string[]): ImportRowStatus {
  if (errors.length > 0) return 'error'
  if (warnings.length > 0) return 'warning'
  return 'valid'
}

export function validateRows(
  rawRows: Array<Record<string, string>>,
  context: ValidationContext,
): ParsedImportRow[] {
  const normalizedRefs = rawRows.map((r) => extractMetrcReference(r.metrc_reference ?? ''))
  const countMap = new Map<string, number>()
  for (const ref of normalizedRefs) {
    if (ref) countMap.set(ref, (countMap.get(ref) ?? 0) + 1)
  }
  const withinFileDupes = new Set([...countMap.entries()].filter(([, n]) => n > 1).map(([ref]) => ref))

  return rawRows.map((raw, i) => {
    const metrcReference = normalizedRefs[i]
    const errors: string[] = []
    const warnings: string[] = []

    const name = (raw.name ?? '').trim()
    if (!name) errors.push('Missing product name')

    const categoryInput = (raw.category ?? '').trim().toLowerCase()
    const category = VALID_CATEGORIES.includes(categoryInput as ProductCategory)
      ? (categoryInput as ProductCategory)
      : null
    if (!categoryInput) {
      errors.push('Missing category')
    } else if (!category) {
      errors.push(`Unrecognized category "${raw.category}" (must be one of: ${VALID_CATEGORIES.join(', ')})`)
    }

    const strainInput = (raw.strain_type ?? '').trim().toLowerCase()
    let strainType: StrainType | null = null
    if (strainInput) {
      if (VALID_STRAIN_TYPES.includes(strainInput as StrainType)) {
        strainType = strainInput as StrainType
      } else {
        warnings.push(`Unrecognized strain_type "${raw.strain_type}" -- imported without a strain type`)
      }
    }

    if (!metrcReference) {
      errors.push('Missing metrc_reference')
    } else {
      if (withinFileDupes.has(metrcReference)) {
        errors.push(`Duplicate metrc_reference "${metrcReference}" appears more than once in this file`)
      }
      if (context.existingDbRefs.has(metrcReference)) {
        errors.push(`metrc_reference "${metrcReference}" already exists in the database`)
      }
    }

    const brandNameInput = (raw.brand ?? '').trim()
    let brandId: string | null = null
    if (brandNameInput) {
      const match = context.brandsByName.get(brandNameInput.toLowerCase())
      if (match) {
        brandId = match.id
      } else {
        warnings.push(`Brand "${brandNameInput}" not found -- imported without a brand`)
      }
    }

    const { resolved: terpenes, issues: terpeneIssues } = parseProfileCell(
      raw.terpenes,
      'Terpene',
      context.terpenesByName,
    )
    const { resolved: cannabinoids, issues: cannabinoidIssues } = parseProfileCell(
      raw.cannabinoids,
      'Cannabinoid',
      context.cannabinoidsByName,
    )
    warnings.push(...terpeneIssues, ...cannabinoidIssues)

    return {
      rowIndex: i + 2, // +2: row 1 is the header, so the first data row is line 2 in the file
      raw,
      name,
      brandId,
      brandNameInput,
      category,
      strainType,
      metrcReference,
      description: (raw.description ?? '').trim() || null,
      imageUrl: (raw.image_url ?? '').trim() || null,
      terpenes,
      cannabinoids,
      status: deriveStatus(errors, warnings),
      errors,
      warnings,
    }
  })
}
