import { useEffect, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router'
import Papa from 'papaparse'
import { supabase } from '@/lib/supabaseClient'
import type { ParsedScan } from '@/lib/metrc'
import {
  buildTemplateCsv,
  checkMetrcReferenceIssues,
  findMissingRequiredHeaders,
  validateRows,
  type ParsedImportRow,
} from '@/lib/csvImport'
import type { BrandRow, CannabinoidRow, ProductCategory, ProductInsert, TerpeneRow } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { QrScanner } from '@/components/scan/QrScanner'

interface ImportRunResult {
  rowIndex: number
  status: 'imported' | 'partial' | 'failed'
  message?: string
}

export function AdminProductImportPage() {
  const navigate = useNavigate()

  const [loadingReferenceData, setLoadingReferenceData] = useState(true)
  const [brands, setBrands] = useState<BrandRow[]>([])
  const [terpenes, setTerpenes] = useState<TerpeneRow[]>([])
  const [cannabinoids, setCannabinoids] = useState<CannabinoidRow[]>([])

  const [fileError, setFileError] = useState<string | null>(null)
  const [validating, setValidating] = useState(false)
  const [rows, setRows] = useState<ParsedImportRow[] | null>(null)
  const [existingDbRefs, setExistingDbRefs] = useState<Set<string>>(new Set())

  const [scannerOpen, setScannerOpen] = useState(false)
  const [scannerKey, setScannerKey] = useState(0)
  const [scanNotice, setScanNotice] = useState<string | null>(null)
  const [cameraNotice, setCameraNotice] = useState<string | null>(null)

  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 })
  const [importResults, setImportResults] = useState<ImportRunResult[] | null>(null)

  useEffect(() => {
    async function load() {
      setLoadingReferenceData(true)
      const [{ data: brandData }, { data: terpeneData }, { data: cannabinoidData }] = await Promise.all([
        supabase.from('brands').select('*').order('name'),
        supabase.from('terpenes').select('*').order('name'),
        supabase.from('cannabinoids').select('*').order('name'),
      ])
      setBrands((brandData as BrandRow[]) ?? [])
      setTerpenes((terpeneData as TerpeneRow[]) ?? [])
      setCannabinoids((cannabinoidData as CannabinoidRow[]) ?? [])
      setLoadingReferenceData(false)
    }
    load()
  }, [])

  function handleDownloadTemplate() {
    const csv = buildTemplateCsv()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tervana-product-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setFileError(null)
    setRows(null)
    setImportResults(null)
    setScanNotice(null)
    setCameraNotice(null)

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const missingHeaders = findMissingRequiredHeaders(results.meta.fields)
        if (missingHeaders.length > 0) {
          setFileError(
            `Missing required column(s): ${missingHeaders.join(', ')}. Download the template to see the expected format.`,
          )
          return
        }
        if (results.errors.length > 0) {
          setFileError(results.errors.map((err) => `Row ${err.row ?? '?'}: ${err.message}`).join(' '))
          return
        }
        if (results.data.length === 0) {
          setFileError('The file has no data rows.')
          return
        }

        setValidating(true)

        const brandsByName = new Map(brands.map((b) => [b.name.toLowerCase(), { id: b.id, name: b.name }]))
        const terpenesByName = new Map(terpenes.map((t) => [t.name.toLowerCase(), { id: t.id, name: t.name }]))
        const cannabinoidsByName = new Map(
          cannabinoids.map((c) => [c.name.toLowerCase(), { id: c.id, name: c.name }]),
        )

        const normalizedRefs = [
          ...new Set(results.data.map((r) => (r.metrc_reference ?? '').trim()).filter(Boolean)),
        ]

        let existingRefs = new Set<string>()
        if (normalizedRefs.length > 0) {
          const { data: existing } = await supabase
            .from('products')
            .select('metrc_reference')
            .in('metrc_reference', normalizedRefs)
          existingRefs = new Set((existing ?? []).map((r) => r.metrc_reference))
        }
        setExistingDbRefs(existingRefs)

        const validated = validateRows(results.data, {
          brandsByName,
          terpenesByName,
          cannabinoidsByName,
          existingDbRefs: existingRefs,
        })
        setRows(validated)
        setValidating(false)
      },
      error: (err) => setFileError(err.message),
    })
  }

  function handleScanDecode(parsed: ParsedScan) {
    if (!rows) return
    const targetIndex = rows.findIndex((r) => !r.metrcReference)
    if (targetIndex === -1) {
      setScanNotice('Every row already has a code.')
      setScannerOpen(false)
      return
    }

    const code = parsed.retailId
    const target = rows[targetIndex]
    const otherRows = rows.filter((_, i) => i !== targetIndex)
    const metrcIssues = checkMetrcReferenceIssues(code, otherRows, existingDbRefs)

    const remainingErrors = target.errors.filter(
      (e) => e !== 'Missing metrc_reference' && !e.startsWith('Duplicate metrc_reference') && !e.includes('already exists in the database'),
    )
    const newErrors = [...remainingErrors, ...metrcIssues]

    const updatedRow: ParsedImportRow = {
      ...target,
      metrcReference: code,
      errors: newErrors,
      status: newErrors.length > 0 ? 'error' : target.warnings.length > 0 ? 'warning' : 'valid',
    }

    const newRows = [...rows]
    newRows[targetIndex] = updatedRow
    setRows(newRows)
    setScanNotice(`Filled row ${target.rowIndex} (${target.name || 'unnamed product'}) with ${code}`)
    setScannerKey((k) => k + 1)
  }

  async function handleImport() {
    if (!rows) return
    const importable = rows.filter((r) => r.status !== 'error')
    setImporting(true)
    setImportResults(null)
    setImportProgress({ done: 0, total: importable.length })
    const results: ImportRunResult[] = []

    for (const row of importable) {
      const payload: ProductInsert = {
        name: row.name,
        brand_id: row.brandId,
        dispensary_id: null,
        category: row.category as ProductCategory,
        strain_type: row.strainType,
        metrc_reference: row.metrcReference,
        description: row.description,
        image_url: row.imageUrl,
        is_active: true,
      }

      const { data: inserted, error: insertError } = await supabase
        .from('products')
        .insert(payload)
        .select('id')
        .single()

      if (insertError || !inserted) {
        results.push({ rowIndex: row.rowIndex, status: 'failed', message: insertError?.message ?? 'Insert failed' })
        setImportProgress((p) => ({ ...p, done: p.done + 1 }))
        continue
      }

      const productId = (inserted as { id: string }).id
      let partial = false

      if (row.terpenes.length > 0) {
        const { error: terpeneError } = await supabase.from('product_terpene_profile').insert(
          row.terpenes.map((t) => ({ product_id: productId, terpene_id: t.referenceId, percentage: t.percentage })),
        )
        if (terpeneError) partial = true
      }

      if (row.cannabinoids.length > 0) {
        const { error: cannabinoidError } = await supabase.from('product_cannabinoid_profile').insert(
          row.cannabinoids.map((c) => ({
            product_id: productId,
            cannabinoid_id: c.referenceId,
            percentage: c.percentage,
          })),
        )
        if (cannabinoidError) partial = true
      }

      results.push({ rowIndex: row.rowIndex, status: partial ? 'partial' : 'imported' })
      setImportProgress((p) => ({ ...p, done: p.done + 1 }))
    }

    setImportResults(results)
    setImporting(false)
  }

  if (loadingReferenceData) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  const missingCodeCount = rows?.filter((r) => !r.metrcReference).length ?? 0
  const errorCount = rows?.filter((r) => r.status === 'error').length ?? 0
  const warningCount = rows?.filter((r) => r.status === 'warning').length ?? 0
  const validCount = rows ? rows.length - errorCount : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Bulk import products</h1>
        <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
          Back to products
        </Button>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer">
            <span className="inline-flex h-11 items-center justify-center rounded-full bg-primary-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-600">
              Choose CSV file
            </span>
            <input type="file" accept=".csv,text/csv" onChange={handleFileSelected} className="hidden" />
          </label>
          <Button type="button" variant="outline" onClick={handleDownloadTemplate}>
            Download CSV template
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Required columns: <code className="font-mono">name</code>, <code className="font-mono">category</code>,{' '}
          <code className="font-mono">metrc_reference</code>. Optional: <code className="font-mono">brand</code>,{' '}
          <code className="font-mono">strain_type</code>, <code className="font-mono">description</code>,{' '}
          <code className="font-mono">image_url</code>, <code className="font-mono">terpenes</code>,{' '}
          <code className="font-mono">cannabinoids</code>. Terpenes/cannabinoids use{' '}
          <code className="font-mono">Name:percentage</code> pairs separated by semicolons, e.g.{' '}
          <code className="font-mono">Myrcene:0.45;Limonene:0.32</code>.
        </p>
        {fileError && <p className="text-sm text-red-400">{fileError}</p>}
        {validating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner className="h-4 w-4" /> Validating rows against the database…
          </div>
        )}
      </Card>

      {rows && (
        <>
          <Card className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm">
                <span className="font-semibold text-foreground">{validCount}</span> of {rows.length} rows ready to
                import
                {errorCount > 0 && <span className="text-red-400"> · {errorCount} have errors</span>}
                {warningCount > 0 && <span className="text-amber-400"> · {warningCount} have warnings</span>}
              </p>
              {missingCodeCount > 0 && (
                <Button type="button" variant="outline" size="sm" onClick={() => setScannerOpen(true)}>
                  Scan to fill {missingCodeCount} missing code{missingCodeCount === 1 ? '' : 's'}
                </Button>
              )}
            </div>

            {scannerOpen && (
              <div className="space-y-2">
                <QrScanner
                  key={scannerKey}
                  onDecode={handleScanDecode}
                  onCancel={() => setScannerOpen(false)}
                  onUnavailable={(message) => {
                    setScannerOpen(false)
                    setCameraNotice(message)
                  }}
                />
                <p className="text-center text-xs text-muted-foreground">
                  Scan each physical product in turn — each scan fills the next row still missing a code.
                </p>
              </div>
            )}
            {scanNotice && <p className="text-sm text-primary-400">{scanNotice}</p>}
            {cameraNotice && <p className="text-sm text-gold-400">{cameraNotice}</p>}
          </Card>

          <Card className="space-y-0 overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Row</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Brand</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Metrc reference</th>
                  <th className="px-4 py-3 font-medium">Terpenes</th>
                  <th className="px-4 py-3 font-medium">Cannabinoids</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.rowIndex} className="border-b border-border align-top last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.rowIndex}</td>
                    <td className="px-4 py-3">{row.name || <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3">
                      {row.brandId ? (
                        row.brandNameInput
                      ) : row.brandNameInput ? (
                        <span className="text-amber-400">{row.brandNameInput} (not found)</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{row.category ?? <span className="text-red-400">—</span>}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {row.metrcReference || <span className="text-red-400">missing</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{row.terpenes.length}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{row.cannabinoids.length}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <Badge variant={row.status === 'error' ? 'danger' : row.status === 'warning' ? 'gold' : 'primary'}>
                          {row.status}
                        </Badge>
                        {[...row.errors, ...row.warnings].map((issue, i) => (
                          <p
                            key={i}
                            className={`text-xs ${row.errors.includes(issue) ? 'text-red-400' : 'text-amber-400'}`}
                          >
                            {issue}
                          </p>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="flex items-center gap-4">
            <Button type="button" onClick={handleImport} disabled={importing || validCount === 0}>
              {importing
                ? `Importing ${importProgress.done} of ${importProgress.total}…`
                : `Import ${validCount} product${validCount === 1 ? '' : 's'}`}
            </Button>
            {importResults && (
              <p className="text-sm text-muted-foreground">
                {importResults.filter((r) => r.status === 'imported').length} imported cleanly,{' '}
                {importResults.filter((r) => r.status === 'partial').length} imported with a profile-row issue,{' '}
                {importResults.filter((r) => r.status === 'failed').length} failed.{' '}
                <button
                  type="button"
                  onClick={() => navigate('/admin/products')}
                  className="font-medium text-primary-400 hover:underline"
                >
                  View products
                </button>
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
