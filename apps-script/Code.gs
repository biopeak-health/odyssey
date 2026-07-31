/**
 * Biopeak event lead capture — Google Apps Script
 *
 * Setup:
 * 1. Create a Google Sheet with header row: Time | Name | Phone
 * 2. Upload apps-script/CXO brochure.pdf to Drive (same Google account)
 * 3. Extensions → Apps Script → paste this file
 * 4. Project Settings → Script properties → add:
 *      BROCHURE_FILE_ID = <Drive file id from the PDF URL>
 * 5. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the /exec URL into .env as VITE_GAS_URL=...
 */

var SHEET_NAME = 'Leads' // change if your tab is renamed
var BROCHURE_FILENAME = 'CXO brochure.pdf'

function doGet() {
  return json_({ ok: true, service: 'biopeak-event' })
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) || '{}'
    var data = JSON.parse(raw)

    var name = String(data.name || '').trim()
    var phone = normalizePhone_(data.phone)

    if (!name || name.length > 80) {
      return json_({ ok: false, error: 'invalid_name' })
    }
    if (!phone || phone.length !== 10) {
      return json_({ ok: false, error: 'invalid_phone' })
    }

    var brochure = getBrochureBase64_()
    if (!brochure) {
      return json_({ ok: false, error: 'brochure_unavailable' })
    }

    var duplicate = false
    var lock = LockService.getScriptLock()
    try {
      lock.waitLock(10000)
    } catch (err) {
      return json_({ ok: false, error: 'busy' })
    }

    try {
      var sheet = getSheet_()
      ensureHeader_(sheet)

      if (phoneExists_(sheet, phone)) {
        duplicate = true
      } else {
        var when = data.time ? String(data.time) : new Date().toISOString()
        sheet.appendRow([when, name, phone])
      }
    } finally {
      lock.releaseLock()
    }

    return json_({
      ok: true,
      duplicate: duplicate,
      brochure: brochure,
      filename: BROCHURE_FILENAME,
    })
  } catch (err) {
    return json_({ ok: false, error: 'server_error' })
  }
}

function getBrochureBase64_() {
  var fileId = PropertiesService.getScriptProperties().getProperty('BROCHURE_FILE_ID')
  if (!fileId) {
    throw new Error('BROCHURE_FILE_ID missing')
  }
  var blob = DriveApp.getFileById(fileId).getBlob()
  return Utilities.base64Encode(blob.getBytes())
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
