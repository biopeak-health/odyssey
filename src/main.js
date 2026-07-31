import './styles.css'
import lottie from 'lottie-web'
import {
  GAS_URL,
  SPLASH_PATH,
  RATE_LIMIT_MS,
  BROCHURE_FILENAME,
} from './config.js'

const splashEl = document.getElementById('splash')
const lottieEl = document.getElementById('lottie')
const appEl = document.getElementById('app')
const formEl = document.getElementById('lead-form')
const nameInput = document.getElementById('name')
const phoneInput = document.getElementById('phone')
const companyInput = document.getElementById('company')
const submitBtn = document.getElementById('submit-btn')
const nameError = document.getElementById('name-error')
const phoneError = document.getElementById('phone-error')
const successEl = document.getElementById('success')
const successText = document.getElementById('success-text')
const pdfLink = document.getElementById('pdf-link')

let submitting = false
let lastSubmitAt = 0
let brochureObjectUrl = ''

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function revealForm() {
  splashEl.classList.add('is-done')
  splashEl.setAttribute('aria-hidden', 'true')
  appEl.hidden = false
  requestAnimationFrame(() => {
    appEl.classList.add('is-visible')
  })
  nameInput.focus({ preventScroll: true })
}

async function playSplash() {
  if (prefersReducedMotion()) {
    revealForm()
    return
  }

  const anim = lottie.loadAnimation({
    container: lottieEl,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: SPLASH_PATH,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid meet',
    },
  })

  const done = () => {
    anim.removeEventListener('complete', done)
    window.setTimeout(revealForm, 120)
  }

  anim.addEventListener('complete', done)

  // Failsafe if animation never completes
  window.setTimeout(() => {
    if (!splashEl.classList.contains('is-done')) {
      anim.destroy()
      revealForm()
    }
  }, 4000)
}

function normalizePhone(raw) {
  return String(raw || '').replace(/\D/g, '')
}

function setError(el, input, message) {
  if (message) {
    el.hidden = false
    el.textContent = message
    input.classList.add('is-invalid')
  } else {
    el.hidden = true
    el.textContent = ''
    input.classList.remove('is-invalid')
  }
}

function validate() {
  const name = nameInput.value.trim()
  const phoneRaw = phoneInput.value.trim()
  const phone = normalizePhone(phoneRaw)
  let ok = true

  if (!name) {
    setError(nameError, nameInput, 'Enter your name.')
    ok = false
  } else if (name.length > 80) {
    setError(nameError, nameInput, 'Name is too long.')
    ok = false
  } else {
    setError(nameError, nameInput, '')
  }

  if (!phone || phone.length !== 10) {
    setError(phoneError, phoneInput, 'Enter a 10-digit phone number.')
    ok = false
  } else {
    setError(phoneError, phoneInput, '')
  }

  return ok ? { name, phone, phoneRaw } : null
}

function base64ToBlob(base64, mime) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type: mime })
}

function downloadBrochureFromBase64(base64, filename = BROCHURE_FILENAME) {
  if (!base64) {
    throw new Error('Brochure missing from response')
  }

  if (brochureObjectUrl) {
    URL.revokeObjectURL(brochureObjectUrl)
  }

  const blob = base64ToBlob(base64, 'application/pdf')
  brochureObjectUrl = URL.createObjectURL(blob)

  pdfLink.href = brochureObjectUrl
  pdfLink.download = filename
  pdfLink.hidden = false

  const a = document.createElement('a')
  a.href = brochureObjectUrl
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
}

function showSuccess(message) {
  formEl.hidden = true
  successEl.hidden = false
  successText.textContent = message
}

function showSubmitError(message) {
  submitBtn.disabled = false
  submitBtn.textContent = 'Get brochure'
  setError(phoneError, phoneInput, message)
}

async function postToSheet({ name, phone }) {
  if (!GAS_URL) {
    throw new Error('VITE_GAS_URL missing — sheet write skipped')
  }

  // text/plain avoids CORS preflight with Apps Script web apps
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      name,
      phone,
      time: new Date().toISOString(),
    }),
  })

  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Apps Script returned non-JSON (bad URL or not deployed as web app)')
  }

  if (!data || data.ok !== true) {
    throw new Error(data?.error || 'Sheet write failed')
  }

  if (!data.brochure) {
    throw new Error('Brochure missing from response')
  }

  return data
}

formEl.addEventListener('submit', async (event) => {
  event.preventDefault()

  if (submitting) return

  const now = Date.now()
  if (now - lastSubmitAt < RATE_LIMIT_MS) return
  lastSubmitAt = now

  // Honeypot — fake success, no brochure
  if (companyInput.value.trim()) {
    showSuccess('Thanks — your brochure download should start automatically.')
    pdfLink.hidden = true
    return
  }

  const data = validate()
  if (!data) return

  submitting = true
  submitBtn.disabled = true
  submitBtn.textContent = 'Downloading…'
  setError(phoneError, phoneInput, '')

  try {
    const result = await postToSheet(data)
    downloadBrochureFromBase64(result.brochure, result.filename || BROCHURE_FILENAME)

    if (result.duplicate) {
      showSuccess(
        'You were already on the list. Your brochure download should start automatically.',
      )
    } else {
      showSuccess('Your brochure download should start automatically.')
    }
  } catch (err) {
    console.error('Sheet save failed:', err)
    showSubmitError('Could not check you in. Please try again.')
  } finally {
    submitting = false
  }
})

playSplash()
