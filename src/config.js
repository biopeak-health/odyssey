/**
 * Paste your Google Apps Script web app URL after deploy.
 * Example: https://script.google.com/macros/s/XXXX/exec
 */
export const GAS_URL = import.meta.env.VITE_GAS_URL || ''

export const BROCHURE_PATH = `${import.meta.env.BASE_URL}assets/${encodeURIComponent('CXO brochure.pdf')}`
export const SPLASH_PATH = `${import.meta.env.BASE_URL}assets/splashscreen.json`

export const STORAGE_PREFIX = 'biopeak:submitted:'
export const RATE_LIMIT_MS = 3000
