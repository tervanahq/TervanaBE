// Parsing for the Metrc/1a4 QR payload. The QR encodes a URL of the form
//   https://app.1a4.com/landingpage/{retailId}/{index}
// e.g. https://app.1a4.com/landingpage/1a4120300000c1f000005534/0
// retailId is a 24-char alphanumeric string starting with "1a4"; the trailing
// segment is a unit/index suffix. The 1a4.com page itself is a client-side app
// with nothing to scrape server-side, so we only ever parse the URL text --
// we never fetch it.

const RETAIL_ID_PATTERN = /^1a4[a-z0-9]{21}$/i
const LANDING_PAGE_URL_PATTERN = /1a4\.com\/landingpage\/([a-z0-9]+)(?:\/([a-z0-9]+))?/i

export interface ParsedScan {
  retailId: string
  index?: string
}

/**
 * Accepts either a full scanned 1a4.com URL or a bare retailId (useful for
 * manual entry/testing) and returns the parsed retailId + optional index.
 * Returns null if the input doesn't match the confirmed Metrc retailId shape.
 */
export function parseScanInput(raw: string): ParsedScan | null {
  const input = raw.trim()
  if (!input) return null

  const urlMatch = input.match(LANDING_PAGE_URL_PATTERN)
  const candidate = urlMatch ? urlMatch[1] : input
  const index = urlMatch?.[2]

  if (!RETAIL_ID_PATTERN.test(candidate)) return null

  return { retailId: candidate, index }
}

export function isValidRetailId(value: string): boolean {
  return RETAIL_ID_PATTERN.test(value.trim())
}

/** Reconstructs the original compliance-page URL for the "view raw 1a4.com" fallback link. */
export function build1a4Url(retailId: string, index?: string): string {
  return `https://app.1a4.com/landingpage/${retailId}${index ? `/${index}` : ''}`
}
