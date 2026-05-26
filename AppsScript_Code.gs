/**
 * Memory Book Submissions - Google Apps Script
 * 
 * HOW TO SET UP:
 * 1. Go to sheets.google.com and create a new Sheet named "Memory Book Submissions"
 * 2. Click Extensions > Apps Script
 * 3. Delete the default code and paste this entire file
 * 4. Change SECRET_KEY below to a password you'll remember
 * 5. Click Deploy > New Deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Click Deploy, then copy the Web app URL
 * 7. Paste that URL into memory-book.html as SUBMIT_WEBHOOK_URL
 *    AND into teacher.html as WEBHOOK_URL
 */

const SECRET_KEY = 'shimaa2026'; // CHANGE THIS to your own password
const SHEET_NAME = 'Submissions';

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Student Name', 'Completion %', 'Answers JSON']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet(e) {
  const key = e.parameter.key || e.parameter.p;
  if (key !== SECRET_KEY) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'unauthorized' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = [];

  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((h, j) => {
      row[h] = data[i][j];
    });
    if (row['Answers JSON'] && typeof row['Answers JSON'] === 'string') {
      try { row['Answers JSON'] = JSON.parse(row['Answers JSON']); } catch(e) {}
    }
    rows.push(row);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, data: rows }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    let body;

    try {
      body = JSON.parse(e.postData.contents);
    } catch (jsonErr) {
      body = {
        studentName: e.parameter.studentName,
        completion: e.parameter.completion,
        sections: JSON.parse(e.parameter.sections || '{}')
      };
    }

    sheet.appendRow([
      new Date(),
      body.studentName || 'Anonymous',
      body.completion || 0,
      JSON.stringify(body.sections || {})
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
