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
      '<div style="background:#fff;border-radius:20px;padding:40px;max-width:400px;margin:0 auto;box-shadow:0 4px 20px rgba(0,0,0,0.1);">' +
      '<div style="font-size:3em;">&#128274;</div>' +
      '<h1 style="font-size:1.4em;color:#667eea;">Wrong Password</h1>' +
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Memory Book Dashboard - Mrs. Shimaa</title>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Comic+Neue:wght@400;700&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Comic Neue',sans-serif;background:#f0f4ff;min-height:100vh;color:#333;}
    .header{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:20px 30px;box-shadow:0 4px 20px rgba(102,126,234,0.3);}
    .header h1{font-family:'Fredoka One',cursive;font-size:1.4em;}
    .header p{font-size:0.9em;opacity:0.8;margin-top:2px;}
    .stats{display:flex;gap:16px;padding:20px 30px;flex-wrap:wrap;}
    .stat{background:#fff;border-radius:16px;padding:18px 24px;flex:1;min-width:150px;box-shadow:0 2px 12px rgba(0,0,0,0.06);text-align:center;border-left:5px solid #667eea;}
    .stat .num{font-family:'Fredoka One',cursive;font-size:2em;color:#667eea;}
    .stat .lbl{font-size:0.9em;color:#888;margin-top:2px;}
    .main{padding:0 30px 30px;}
    .main h2{font-family:'Fredoka One',cursive;font-size:1.3em;color:#444;margin-bottom:14px;}
    .sub-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;margin-bottom:30px;}
    .sub-card{background:#fff;border-radius:16px;padding:18px 20px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.06);transition:transform .2s,box-shadow .2s;border:3px solid transparent;}
    .sub-card:hover{transform:translateY(-3px);box-shadow:0 8px 25px rgba(0,0,0,0.1);}
    .sub-card.active{border-color:#667eea;}
    .sub-card .name{font-family:'Fredoka One',cursive;font-size:1.15em;color:#333;}
    .sub-card .meta{font-size:0.85em;color:#999;margin-top:4px;}
    .sub-card .bar{height:6px;background:#f0f0f0;border-radius:3px;overflow:hidden;margin-top:8px;}
    .sub-card .bar .fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#6bcb77,#4d96ff);}
    .empty{text-align:center;padding:60px 20px;color:#bbb;}
    .empty .big{font-size:4em;margin-bottom:14px;}
    .empty h3{font-family:'Fredoka One',cursive;color:#999;}
    .viewer{display:none;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,0.08);margin-bottom:30px;}
    .viewer.show{display:block;}
    .vh{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;}
    .vh h3{font-family:'Fredoka One',cursive;font-size:1.3em;}
    .vh .close{background:rgba(255,255,255,0.2);border:none;color:#fff;width:36px;height:36px;border-radius:50%;font-size:1.2em;cursor:pointer;font-family:'Fredoka One',cursive;}
    .vh .close:hover{background:rgba(255,255,255,0.35);}
    .vtabs{display:flex;overflow-x:auto;background:#f8f9ff;border-bottom:3px solid #e8eaff;}
    .vtabs button{padding:14px 22px;border:none;background:transparent;cursor:pointer;font-family:'Fredoka One',cursive;font-size:0.95em;color:#999;white-space:nowrap;border-bottom:3px solid transparent;margin-bottom:-3px;transition:color .2s,border-color .2s;}
    .vtabs button:hover{color:#667eea;}
    .vtabs button.on{color:#667eea;border-color:#667eea;}
    .vcontent{padding:24px;max-height:70vh;overflow-y:auto;}
    .vsec{display:none;}
    .vsec.on{display:block;}
    .vsec h3{font-family:'Fredoka One',cursive;font-size:1.2em;color:#667eea;margin-bottom:16px;display:flex;align-items:center;gap:8px;}
    .vsec h3:after{content:'';flex:1;height:3px;background:linear-gradient(90deg,#667eea,transparent);border-radius:2px;}
    .ai{background:#f8f9ff;border-radius:12px;padding:14px 18px;margin-bottom:10px;border-left:4px solid #667eea;}
    .ai .q{font-weight:700;color:#444;font-size:0.95em;margin-bottom:4px;}
    .ai .a{color:#667eea;font-size:1.05em;line-height:1.4;}
    .ai .stars{color:#fbbf24;font-size:1.3em;letter-spacing:3px;}
    .ai .pick{display:inline-block;background:#dbeafe;color:#2563eb;padding:6px 16px;border-radius:20px;font-weight:700;}
    .ai .chk{display:inline-block;background:#d1fae5;color:#059669;padding:4px 14px;border-radius:20px;}
    .none{color:#ccc;text-align:center;padding:40px;font-size:1.1em;}
    @media(max-width:768px){.stats{padding:14px 16px;}.main{padding:0 16px 20px;}.sub-grid{grid-template-columns:1fr;}.vtabs button{padding:10px 14px;font-size:.85em;}.vcontent{padding:16px;}}
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>&#128218; Memory Book Dashboard</h1>
      <p>Mrs. Shimaa's 5th Grade Class</p>
    </div>
  </div>
  <div class="stats" id="stats"></div>
  <div class="main">
    <h2>&#128101; Student Submissions</h2>
    <div id="list"></div>
    <div class="viewer" id="viewer"></div>
  </div>
  <script>
    var SUBMISSIONS = ${submissionsJson};
    var total = SUBMISSIONS.length;
    var avg = total ? Math.round(SUBMISSIONS.reduce(function(s,r){return s+(parseInt(r['Completion %'])||0);},0)/total) : 0;
    var done = SUBMISSIONS.filter(function(r){return parseInt(r['Completion %'])>=100;}).length;
    document.getElementById('stats').innerHTML =
      '<div class="stat"><div class="num">'+total+'</div><div class="lbl">Total Submissions</div></div>' +
      '<div class="stat" style="border-left-color:#6bcb77;"><div class="num">'+avg+'%</div><div class="lbl">Avg Completion</div></div>' +
      '<div class="stat" style="border-left-color:#fbbf24;"><div class="num">'+done+'</div><div class="lbl">100% Complete</div></div>';

    if (!total) {
      document.getElementById('list').innerHTML = '<div class="empty"><div class="big">&#128221;</div><h3>No submissions yet</h3><p>Waiting for students...</p></div>';
    } else {
      var html = '<div class="sub-grid">';
      SUBMISSIONS.forEach(function(s, i) {
        var pct = parseInt(s['Completion %'])||0;
        var d = s['Timestamp'] ? new Date(s['Timestamp']).toLocaleDateString() : '';
        html += '<div class="sub-card" onclick="show('+i+')" id="c'+i+'">' +
          '<div class="name">'+esc(s['Student Name']||'Anonymous')+'</div>' +
          '<div class="meta">'+d+' &middot; '+pct+'% complete</div>' +
          '<div class="bar"><div class="fill" style="width:'+pct+'%"></div></div></div>';
      });
      html += '</div>';
      document.getElementById('list').innerHTML = html;
    }

    function esc(s){if(!s)return '';var d=document.createElement('div');d.textContent=s;return d.innerHTML;}

    function show(idx) {
      var s = SUBMISSIONS[idx];
      document.querySelectorAll('.sub-card').forEach(function(c){c.classList.remove('active');});
      var card = document.getElementById('c'+idx); if(card) card.classList.add('active');
      var name = s['Student Name']||'Anonymous', pct = parseInt(s['Completion %'])||0;
      var d = s['Timestamp'] ? new Date(s['Timestamp']).toLocaleString() : '';
      var ans = s['Answers JSON']||{};
      var v = document.getElementById('viewer'); v.classList.add('show');

      var html = '<div class="vh"><div><h3>'+esc(name)+"'s Memory Book</h3><div style='font-size:.9em;opacity:.85;'>Submitted "+d+" &middot; "+pct+"% complete</div></div>" +
        '<button class="close" onclick="document.getElementById(\'viewer\').classList.remove(\'show\');this.innerHTML=\'\';document.querySelectorAll(\'.sub-card\').forEach(function(c){c.classList.remove(\'active\');})">&times;</button></div>';

      var keys = Object.keys(ans);
      if (!keys.length) {
        html += '<div class="empty" style="padding:40px;"><div class="big">&#128196;</div><h3>No answers</h3></div>';
        v.innerHTML = html; return;
      }

      html += '<div class="vtabs">';
      keys.forEach(function(k,i){html+='<button class="'+(i===0?'on':'')+'" onclick="vt(this,\\'vs'+i+'\\')">'+esc(k)+'</button>';});
      html += '</div><div class="vcontent">';
      keys.forEach(function(k,i){
        html += '<div class="vsec'+(i===0?' on':'')+'" id="vs'+i+'"><h3>'+esc(k)+'</h3>';
        var items = ans[k];
        if(!items||(Array.isArray(items)&&!items.length)){html+='<div class="none">Nothing filled in</div>';}
        else if(typeof items==='string'){html+='<div class="ai"><div class="a">'+esc(items)+'</div></div>';}
        else if(Array.isArray(items)&&typeof items[0]==='string'){items.forEach(function(it){html+='<div class="ai"><div class="a">'+esc(it)+'</div></div>';});}
        else if(Array.isArray(items)){items.forEach(function(it){
          if(it.type==='rating'){html+='<div class="ai"><div class="q">'+esc(it.label||'')+'</div><div class="a"><span class="stars">'+(it.stars||'\\u2b50'.repeat(it.value||0))+'</span></div></div>';}
          else if(it.type==='choice'){html+='<div class="ai"><div class="q">'+esc(it.label||'')+'</div><div class="a"><span class="pick">'+esc(it.value||'')+'</span></div></div>';}
          else if(it.type==='checkbox'){html+='<div class="ai"><div class="a"><span class="chk">\\u2713 '+esc(it.value||'')+'</span></div></div>';}
          else{html+='<div class="ai"><div class="q">'+esc(it.label||'')+'</div><div class="a">'+esc(it.value||'')+'</div></div>';}
        });}
        html += '</div>';
      });
      html += '</div>';
      v.innerHTML = html;
    }

    function vt(btn, id) {
      document.querySelectorAll('.vtabs button').forEach(function(b){b.classList.remove('on');});
      document.querySelectorAll('.vsec').forEach(function(s){s.classList.remove('on');});
      btn.classList.add('on'); document.getElementById(id).classList.add('on');
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
