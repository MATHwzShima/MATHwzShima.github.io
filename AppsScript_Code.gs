const SECRET_KEY = 'shimaa2026';
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
    return HtmlService.createHtmlOutput(
      '<html><body style="font-family:sans-serif;text-align:center;padding:80px 20px;background:#f0f4ff;">' +
      '<div style="background:#fff;border-radius:20px;padding:40px;max-width:400px;margin:0 auto;">' +
      '<div style="font-size:3em;">🔒</div>' +
      '<h1 style="color:#667eea;">Wrong Password</h1>' +
      '<p style="color:#888;">Go to <b>teacher.html</b> on the site and log in there.</p>' +
      '</div></body></html>'
    ).setTitle('Access Denied');
  }

  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((h, j) => { row[h] = data[i][j]; });
    if (row['Answers JSON'] && typeof row['Answers JSON'] === 'string') {
      try { row['Answers JSON'] = JSON.parse(row['Answers JSON']); } catch(e) {}
    }
    rows.push(row);
  }

  const submissionsJson = JSON.stringify(rows);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Memory Book Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Comic+Neue:wght@400;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Comic Neue',sans-serif;background:#f0f4ff;color:#333}
.hdr{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:20px 30px}
.hdr h1{font-family:'Fredoka One',cursive;font-size:1.4em}
.hdr p{font-size:.9em;opacity:.8;margin-top:2px}
.stats{display:flex;gap:16px;padding:20px 30px;flex-wrap:wrap}
.stat{background:#fff;border-radius:16px;padding:18px 24px;flex:1;min-width:150px;text-align:center;border-left:5px solid #667eea}
.stat .num{font-family:'Fredoka One',cursive;font-size:2em;color:#667eea}
.stat .lbl{font-size:.9em;color:#888;margin-top:2px}
.main{padding:0 30px 30px}
.main h2{font-family:'Fredoka One',cursive;font-size:1.3em;color:#444;margin-bottom:14px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
.card{background:#fff;border-radius:16px;padding:18px 20px;cursor:pointer;border:3px solid transparent}
.card:hover{border-color:#667eea}
.card.active{border-color:#667eea}
.card .name{font-family:'Fredoka One',cursive;font-size:1.15em;color:#333}
.card .meta{font-size:.85em;color:#999;margin-top:4px}
.card .bar{height:6px;background:#f0f0f0;border-radius:3px;overflow:hidden;margin-top:8px}
.card .bar .fill{height:100%;background:linear-gradient(90deg,#6bcb77,#4d96ff)}
.empty{text-align:center;padding:60px 20px;color:#bbb}
.empty .big{font-size:4em;margin-bottom:14px}
.empty h3{font-family:'Fredoka One',cursive;color:#999}
.viewer{display:none;background:#fff;border-radius:24px;overflow:hidden;margin-top:20px}
.viewer.show{display:block}
.vhdr{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:20px 24px;display:flex;align-items:center;justify-content:space-between}
.vhdr h3{font-family:'Fredoka One',cursive;font-size:1.3em}
.vhdr .close{background:rgba(255,255,255,.2);border:none;color:#fff;width:36px;height:36px;border-radius:50%;font-size:1.2em;cursor:pointer}
.vtabs{display:flex;overflow-x:auto;background:#f8f9ff;border-bottom:3px solid #e8eaff}
.vtabs button{padding:14px 22px;border:none;background:transparent;cursor:pointer;font-family:'Fredoka One',cursive;font-size:.95em;color:#999;white-space:nowrap;border-bottom:3px solid transparent;margin-bottom:-3px}
.vtabs button:hover{color:#667eea}
.vtabs button.active{color:#667eea;border-color:#667eea}
.vcontent{padding:24px;max-height:70vh;overflow-y:auto}
.vsec{display:none}
.vsec.active{display:block}
.vsec h3{font-family:'Fredoka One',cursive;font-size:1.2em;color:#667eea;margin-bottom:16px}
.ai{background:#f8f9ff;border-radius:12px;padding:14px 18px;margin-bottom:10px;border-left:4px solid #667eea}
.ai .q{font-weight:700;color:#444;font-size:.95em;margin-bottom:4px}
.ai .a{color:#667eea;font-size:1.05em}
.ai .stars{color:#fbbf24;font-size:1.3em;letter-spacing:3px}
.ai .pick{display:inline-block;background:#dbeafe;color:#2563eb;padding:6px 16px;border-radius:20px;font-weight:700}
.ai .chk{display:inline-block;background:#d1fae5;color:#059669;padding:4px 14px;border-radius:20px}
.none{color:#ccc;text-align:center;padding:40px}
</style>
</head>
<body>

<div class="hdr">
  <h1>📊 Memory Book Dashboard</h1>
  <p>Mrs. Shimaa's 5th Grade Class</p>
</div>

<div class="stats" id="stats"></div>

<div class="main">
  <h2>👥 Student Submissions</h2>
  <div id="list"></div>
  <div class="viewer" id="viewer"></div>
</div>

<script>
var DATA = ${submissionsJson};

// Stats
var total = DATA.length;
var avg = total ? Math.round(DATA.reduce(function(s,r){return s+(parseInt(r['Completion %'])||0);},0)/total) : 0;
var done = DATA.filter(function(r){return parseInt(r['Completion %'])>=100;}).length;
document.getElementById('stats').innerHTML =
  '<div class="stat"><div class="num">'+total+'</div><div class="lbl">Total Submissions</div></div>' +
  '<div class="stat" style="border-left-color:#6bcb77"><div class="num">'+avg+'%</div><div class="lbl">Avg Completion</div></div>' +
  '<div class="stat" style="border-left-color:#fbbf24"><div class="num">'+done+'</div><div class="lbl">100% Complete</div></div>';

// Submissions list
if (!total) {
  document.getElementById('list').innerHTML = '<div class="empty"><div class="big">📄</div><h3>No submissions yet</h3><p>Waiting for students...</p></div>';
} else {
  var html = '<div class="grid">';
  DATA.forEach(function(sub, i) {
    var pct = parseInt(sub['Completion %']) || 0;
    var date = sub['Timestamp'] ? new Date(sub['Timestamp']).toLocaleDateString() : '';
    html += '<div class="card" onclick="showSubmission('+i+')" id="c'+i+'">';
    html += '<div class="name">' + escapeHtml(sub['Student Name'] || 'Anonymous') + '</div>';
    html += '<div class="meta">' + date + ' · ' + pct + '% complete</div>';
    html += '<div class="bar"><div class="fill" style="width:'+pct+'%"></div></div>';
    html += '</div>';
  });
  html += '</div>';
  document.getElementById('list').innerHTML = html;
}

function escapeHtml(s) {
  if (!s) return '';
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function showSubmission(idx) {
  var sub = DATA[idx];
  document.querySelectorAll('.card').forEach(function(c){c.classList.remove('active');});
  var card = document.getElementById('c'+idx);
  if (card) card.classList.add('active');

  var name = sub['Student Name'] || 'Anonymous';
  var pct = parseInt(sub['Completion %']) || 0;
  var date = sub['Timestamp'] ? new Date(sub['Timestamp']).toLocaleString() : '';
  var answers = sub['Answers JSON'] || {};

  var viewer = document.getElementById('viewer');
  viewer.classList.add('show');

  var html = '<div class="vhdr">';
  html += '<div><h3>' + escapeHtml(name) + "'s Memory Book</h3>";
  html += '<div style="font-size:.9em;opacity:.85">Submitted ' + date + ' · ' + pct + '% complete</div></div>';
  html += '<button class="close" onclick="closeViewer()">&times;</button></div>';

  var keys = Object.keys(answers);
  if (keys.length === 0) {
    html += '<div class="empty" style="padding:40px"><div class="big">📄</div><h3>No answers</h3></div>';
    viewer.innerHTML = html;
    return;
  }

  // Tab buttons
  html += '<div class="vtabs">';
  keys.forEach(function(key, i) {
    html += '<button class="' + (i===0?'active':'') + '" onclick="switchTab(this,\\'vs'+i+'\\')">' + escapeHtml(key) + '</button>';
  });
  html += '</div>';

  // Tab content
  html += '<div class="vcontent">';
  keys.forEach(function(key, i) {
    html += '<div class="vsec' + (i===0?' active':'') + '" id="vs'+i+'">';
    html += '<h3>' + escapeHtml(key) + '</h3>';
    var items = answers[key];
    if (!items || (Array.isArray(items) && items.length === 0)) {
      html += '<div class="none">Nothing filled in</div>';
    } else if (typeof items === 'string') {
      html += '<div class="ai"><div class="a">' + escapeHtml(items) + '</div></div>';
    } else if (Array.isArray(items) && typeof items[0] === 'string') {
      items.forEach(function(item) {
        html += '<div class="ai"><div class="a">' + escapeHtml(item) + '</div></div>';
      });
    } else if (Array.isArray(items)) {
      items.forEach(function(item) {
        if (item.type === 'rating') {
          html += '<div class="ai"><div class="q">' + escapeHtml(item.label||'') + '</div>';
          html += '<div class="a"><span class="stars">' + (item.stars||'⭐'.repeat(item.value||0)) + '</span></div></div>';
        } else if (item.type === 'choice') {
          html += '<div class="ai"><div class="q">' + escapeHtml(item.label||'') + '</div>';
          html += '<div class="a"><span class="pick">' + escapeHtml(item.value||'') + '</span></div></div>';
        } else if (item.type === 'checkbox') {
          html += '<div class="ai"><div class="a"><span class="chk">✓ ' + escapeHtml(item.value||'') + '</span></div></div>';
        } else {
          html += '<div class="ai"><div class="q">' + escapeHtml(item.label||'') + '</div>';
          html += '<div class="a">' + escapeHtml(item.value||'') + '</div></div>';
        }
      });
    }
    html += '</div>';
  });
  html += '</div>';

  viewer.innerHTML = html;
}

function switchTab(btn, secId) {
  document.querySelectorAll('.vtabs button').forEach(function(b){b.classList.remove('active');});
  document.querySelectorAll('.vsec').forEach(function(s){s.classList.remove('active');});
  btn.classList.add('active');
  document.getElementById(secId).classList.add('active');
}

function closeViewer() {
  document.getElementById('viewer').classList.remove('show');
  document.getElementById('viewer').innerHTML = '';
  document.querySelectorAll('.card').forEach(function(c){c.classList.remove('active');});
}
</script>
</body>
</html>`;

  return HtmlService.createHtmlOutput(html).setTitle('Memory Book Dashboard').addMetaTag('viewport', 'width=device-width, initial-scale=1');
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
