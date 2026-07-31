/**
 * Biopeak event lead capture — Google Apps Script
 *
 * Setup:
 * 1. Create a Google Sheet with header row: Time | Name | Phone
 * 2. Extensions → Apps Script → paste this file
 * 3. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the /exec URL into .env as VITE_GAS_URL=...
 */

var SHEET_NAME = 'Sheet1' // change if your tab is renamed

function doGet() {
  return json_({ ok: true, service: 'biopeak-event' })
}

function doPost(e) {
  var lock = LockService.getScriptLock()
  try {
    lock.waitLock(10000)
  } catch (err) {
    return json_({ ok: false, error: 'busy' })
  }

  try {
    var raw = (e && e.postData && e.postData.contents) || '{}'
    var data = JSON.parse(raw)

    var name = String(data.name || '').trim()
    var phone = normalizePhone_(data.phone)

    if (!name || name.length > 80) {
      return json_({ ok: false, error: 'invalid_name' })
    }
    if (!phone || phone.length < 8 || phone.length > 15) {
      return json_({ ok: false, error: 'invalid_phone' })
    }

    var sheet = getSheet_()
    ensureHeader_(sheet)

    if (phoneExists_(sheet, phone)) {
      return json_({ ok: true, duplicate: true })
    }

    var when = data.time ? String(data.time) : new Date().toISOString()
    sheet.appendRow([when, name, phone])

    return json_({ ok: true, duplicate: false })
  } catch (err) {
    return json_({ ok: false, error: String(err) })
  } finally {
    lock.releaseLock()
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0]
  return sheet
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Time', 'Name', 'Phone'])
  }
}

function normalizePhone_(value) {
  return String(value || '').replace(/\D/g, '')
}

function phoneExists_(sheet, phone) {
  var last = sheet.getLastRow()
  if (last < 2) return false

  var values = sheet.getRange(2, 3, last, 3).getValues()
  for (var i = 0; i < values.length; i++) {
    if (normalizePhone_(values[i][0]) === phone) return true
  }
  return false
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
