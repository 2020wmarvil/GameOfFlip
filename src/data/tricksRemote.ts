import { TIERS, type Tier, type Trick } from './tricks';

// ─── Configuration ──────────────────────────────────────────────────────
//
// Paste your Google Sheet's "Publish to web → CSV" URL here.
//
// To set up the sheet:
//   1. Make a Google Sheet with two columns: `name` and `tier`
//      (lowercase, in row 1).
//   2. Fill rows with tricks. `tier` must be one of:
//      beginner | intermediate | advanced | pro
//   3. File → Share → Publish to web → choose the tab → format: CSV → Publish.
//   4. Copy the published URL and replace REMOTE_TRICKS_URL below.
//
// Leave the empty string to disable remote fetching (bundled library only).

export const REMOTE_TRICKS_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR7cPCB3e8L0tOh_UuT8J-P_7CNKQtYhPVvNdR4tLmY6rlZ_KaXPLTznGMnJjxL7IQywjr-Q8fBvCbf/pub?output=csv';

// Fetch with a short timeout so a slow / hung network doesn't block startup
// for too long — the bundled or cached library is already in use by then.
const FETCH_TIMEOUT_MS = 6000;

const VALID_TIERS = new Set<string>(TIERS);

// ─── CSV parsing ────────────────────────────────────────────────────────

// Minimal CSV parser — handles quoted fields with embedded commas, line
// endings, and double-double-quote escapes. Sufficient for a trick library.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"' && field === '') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(field);
        field = '';
      } else if (c === '\n' || c === '\r') {
        // End of row (consume \r\n as one)
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field);
        field = '';
        rows.push(row);
        row = [];
      } else {
        field += c;
      }
    }
  }
  // Trailing field if file doesn't end with a newline.
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

// Convert parsed CSV rows into validated Trick[]. Skips malformed rows
// quietly and only returns the clean entries.
export function tricksFromCsv(text: string): Trick[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const nameIdx = header.indexOf('name');
  const tierIdx = header.indexOf('tier');
  if (nameIdx < 0 || tierIdx < 0) return [];

  const out: Trick[] = [];
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i];
    const name = (cells[nameIdx] ?? '').trim();
    const tier = (cells[tierIdx] ?? '').trim().toLowerCase();
    if (!name) continue;
    if (!VALID_TIERS.has(tier)) continue;
    out.push({ name, tier: tier as Tier });
  }
  return out;
}

// ─── Remote fetch ───────────────────────────────────────────────────────

export type FetchResult =
  | { ok: true; tricks: Trick[] }
  | { ok: false; reason: string };

export async function fetchRemoteTricks(): Promise<FetchResult> {
  if (!REMOTE_TRICKS_URL) {
    return { ok: false, reason: 'no remote url configured' };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(REMOTE_TRICKS_URL, { signal: controller.signal });
    if (!res.ok) return { ok: false, reason: `http ${res.status}` };
    const text = await res.text();
    const tricks = tricksFromCsv(text);
    if (tricks.length < 4) {
      // Sanity floor — a library smaller than one trick per tier is almost
      // certainly a misconfigured / empty / wrong sheet. Reject so we
      // don't replace a working library with garbage.
      return { ok: false, reason: 'parsed library too small' };
    }
    return { ok: true, tricks };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : 'fetch failed',
    };
  } finally {
    clearTimeout(timer);
  }
}
