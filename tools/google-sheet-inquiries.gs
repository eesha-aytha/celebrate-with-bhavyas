// Records every website quote request as a new row in this Google Sheet.
// Paste this into the sheet's Extensions > Apps Script. The secret is not in the code: add it under
// Project Settings > Script Properties as SHEET_TOKEN (same value as in Netlify), then
// Deploy > New deployment > Web app (see README).

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const token = PropertiesService.getScriptProperties().getProperty('SHEET_TOKEN');
  if (!token || data.token !== token) return ContentService.createTextOutput('wrong token');

  const lock = LockService.getScriptLock();   // two requests at once still get their own rows
  lock.waitLock(20000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    const fields = data.fields || [];   // [["Name", "Priya Shah"], ["Email", "..."], ...]

    // Header row grows by itself when the form gets a new question
    const headers = sheet.getLastColumn() ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : ['Received'];
    fields.forEach(([label]) => { if (!headers.includes(label)) headers.push(label); });
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);

    // A leading = + - @ would make Sheets treat a typed answer as a formula
    const safe = value => /^[=+\-@]/.test(value) ? "'" + value : value;
    const row = headers.map(h => h === 'Received' ? new Date() : safe(String((fields.find(([label]) => label === h) || [])[1] || '')));
    sheet.appendRow(row);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}
