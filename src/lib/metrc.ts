// Parsing for the Metrc/1a4 QR payload.
//
// Confirmed against a real physical package's QR code (2026-07-14): it encodes
//   https://1a4.com/{code}
// e.g. https://1a4.com/5LO1I9DSO0DPBE65C2DC -- no "app." subdomain, no
// "/landingpage/" path segment, and the code itself doesn't follow a fixed
// prefix/length (the real sample is 20 chars, no "1a4" prefix). This replaced
// an earlier assumption (app.1a4.com/landingpage/{id}/{index}, id = 24 chars
// starting with "1a4") that turned out not to match reality. Matching below
// is intentionally lenient on the code's exact shape, and still tolerant of
// the earlier assumed app./landingpage//index variants in case some packaging
// uses those instead -- we only have one confirmed real sample to go on.
//
// The 1a4.com page itself is a client-side app with nothing to scrape
// server-side, so we only ever parse the URL text -- we never fetch it.

const LANDING_PAGE_URL_PATTERN = /(?:app\.)?1a4\.com\/(?:landingpage\/)?([a-z0-9]+)(?:\/([a-z0-9]+))?/i
const RETAIL_ID_PATTERN = /^[a-z0-9]{10,32}$/i

export interface ParsedScan {
  retailId: string
  index?: string
}

/**
 * Accepts either a full scanned 1a4.com URL or a bare code (useful for manual
 * entry/testing) and returns the parsed retailId + optional index. A URL
 * match is trusted on the domain match alone (lenient on code shape); a bare,
 * non-URL input still needs to pass a loose alphanumeric-length heuristic
 * since there's no domain to anchor validity against.
 */
export function parseScanInput(raw: string): ParsedScan | null {
  const input = raw.trim()
  if (!input) return null

  const urlMatch = input.match(LANDING_PAGE_URL_PATTERN)
  if (urlMatch) {
    return { retailId: urlMatch[1], index: urlMatch[2] }
  }

  if (!RETAIL_ID_PATTERN.test(input)) return null
  return { retailId: input }
}

export function isValidRetailId(value: string): boolean {
  return RETAIL_ID_PATTERN.test(value.trim())
}

/** Reconstructs the original compliance-page URL for the "view raw 1a4.com" fallback link. */
export function build1a4Url(retailId: string, index?: string): string {
  return `https://1a4.com/${retailId}${index ? `/${index}` : ''}`
}

/**
 * Best-effort normalization for admin data entry: strips the 1a4.com URL
 * wrapper if one was pasted in, without enforcing a strict code shape.
 * Admins pasting the full URL (the natural thing to copy off a compliance
 * sheet or QR result) should still end up with just the reference stored,
 * not the whole link.
 */
export function extractMetrcReference(raw: string): string {
  const trimmed = raw.trim()
  const match = trimmed.match(/(?:app\.)?1a4\.com\/(?:landingpage\/)?([^/?#\s]+)/i)
  return match ? match[1] : trimmed
}
