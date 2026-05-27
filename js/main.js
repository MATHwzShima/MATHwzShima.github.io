// Shared site functionality
(function() {
  'use strict';

  // Mobile nav toggle
  const nav = document.querySelector('nav');
  if (nav) {
    const ul = nav.querySelector('ul');
    const toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', 'Toggle navigation menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '&#9776;';
    toggle.addEventListener('click', function() {
      const open = ul.classList.toggle('open');
      this.setAttribute('aria-expanded', open);
      this.innerHTML = open ? '&#10005;' : '&#9776;';
    });
    // Close nav when a link is clicked (mobile)
    ul.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        ul.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '&#9776;';
      });
    });
    nav.insertBefore(toggle, ul);
  }

  // Scroll-to-top button
  const scrollBtn = document.createElement('button');
  scrollBtn.className = 'scroll-top';
  scrollBtn.setAttribute('aria-label', 'Scroll to top');
  scrollBtn.innerHTML = '&#8679;';
  scrollBtn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.body.appendChild(scrollBtn);

  window.addEventListener('scroll', function() {
    scrollBtn.classList.toggle('visible', window.scrollY > 400);
  });

  // Set active nav link based on current page
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(function(link) {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
})();

/* ═══════════════════════════════════════════════════════════════
   NEW: Shared Enhancements — Achievements, Confetti, Search, Toast
   ═══════════════════════════════════════════════════════════════ */

// ── Achievement System ─────────────────────────────────────────
(function() {
  'use strict';

  const ACHIEVEMENTS = [
    { id: 'first_quiz',    name: 'Quiz Starter',    desc: 'Complete your first quiz',        icon: '📝' },
    { id: 'perfect_quiz',  name: 'Perfect Score',   desc: 'Get 10/10 on any quiz',           icon: '🌟' },
    { id: 'quiz_master',   name: 'Quiz Master',     desc: 'Complete 5 different quizzes',    icon: '🏆' },
    { id: 'first_game',    name: 'Game On',         desc: 'Play any game',                   icon: '🎮' },
    { id: 'speed_demon',   name: 'Speed Demon',     desc: 'Answer 10 correct in 60 seconds', icon: '⚡' },
    { id: 'first_practice',name: 'Practice Makes Perfect', desc: 'Complete a practice problem', icon: '💪' },
    { id: 'puzzle_solver', name: 'Puzzle Solver',   desc: 'Solve 5 puzzles correctly',       icon: '🧩' },
    { id: 'memory_book',   name: 'Memory Maker',    desc: 'Submit your memory book',         icon: '📖' },
    { id: 'ask_teacher',   name: 'Curious Mind',    desc: 'Send a message to Mrs. Shimaa',   icon: '💬' },
    { id: 'streak_3',      name: 'On Fire',         desc: 'Get 3 correct answers in a row',  icon: '🔥' },
  ];

  function getUnlocked() {
    try { return JSON.parse(localStorage.getItem('mws_achievements') || '[]'); }
    catch(e) { return []; }
  }

  function saveUnlocked(list) {
    localStorage.setItem('mws_achievements', JSON.stringify(list));
  }

  function unlockAchievement(id) {
    const unlocked = getUnlocked();
    if (unlocked.includes(id)) return false;
    unlocked.push(id);
    saveUnlocked(unlocked);
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (ach) showToast(ach.icon + ' Achievement Unlocked: ' + ach.name, 'achievement');
    updateAchievementPanel();
    return true;
  }

  function updateAchievementPanel() {
    const panel = document.getElementById('achievementsPopup');
    if (!panel) return;
    const unlocked = getUnlocked();
    let html = '<h3>🏅 My Achievements (' + unlocked.length + '/' + ACHIEVEMENTS.length + ')</h3>';
    ACHIEVEMENTS.forEach(function(a) {
      const isUnlocked = unlocked.includes(a.id);
      html += '<div class="achievement-item ' + (isUnlocked ? 'unlocked' : '') + '">';
      html += '<div class="achievement-icon">' + a.icon + '</div>';
      html += '<div><div class="achievement-name">' + a.name + '</div>';
      html += '<div class="achievement-desc">' + a.desc + '</div></div>';
      html += '</div>';
    });
    panel.innerHTML = html;
  }

  function renderAchievementWidget() {
    if (document.getElementById('achievementsPanel')) return;
    const div = document.createElement('div');
    div.id = 'achievementsPanel';
    div.className = 'achievements-panel';
    div.innerHTML =
      '<div class="achievements-popup" id="achievementsPopup"></div>' +
      '<button class="achievements-toggle" onclick="toggleAchievements()" aria-label="My achievements">' +
      '🏅 <span>Achievements</span>' +
      '</button>';
    document.body.appendChild(div);
    updateAchievementPanel();
  }

  // Expose globally
  window.unlockAchievement = unlockAchievement;
  window.toggleAchievements = function() {
    document.getElementById('achievementsPopup').classList.toggle('open');
  };

  // Track events
  document.addEventListener('DOMContentLoaded', function() {
    renderAchievementWidget();
  });
})();

// ── Toast Notifications ────────────────────────────────────────
function showToast(message, type) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast ' + (type || '');
  let icon = '✅';
  if (type === 'achievement') icon = '🏅';
  if (type === 'error') icon = '❌';
  toast.innerHTML = '<span class="toast-icon">' + icon + '</span><span class="toast-text">' + message + '</span>';
  container.appendChild(toast);
  setTimeout(function() {
    toast.classList.add('toast-out');
    setTimeout(function() { toast.remove(); }, 400);
  }, 3500);
}

// ── Confetti System ────────────────────────────────────────────
function launchConfettiBurst() {
  const canvas = document.createElement('canvas');
  canvas.id = 'confettiCanvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#6c5ce7','#a29bfe','#ffd93d','#6bcb77','#ff6b9d','#ffa94d','#4d96ff'];
  const particles = [];
  for (let i = 0; i < 120; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 1.2) * 18,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      life: 1
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(function(p) {
      if (p.life <= 0) return;
      alive = true;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.rot += p.rotSpeed;
      p.life -= 0.012;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
      ctx.restore();
    });
    if (alive) requestAnimationFrame(animate);
    else canvas.remove();
  }
  animate();
}

// ── Continue Where You Left Off ────────────────────────────────
function saveProgress(type, id, title) {
  localStorage.setItem('mws_lastActivity', JSON.stringify({ type: type, id: id, title: title, time: Date.now() }));
}

function getContinueLink() {
  try {
    const data = JSON.parse(localStorage.getItem('mws_lastActivity'));
    if (!data) return null;
    if (Date.now() - data.time > 7 * 24 * 60 * 60 * 1000) return null; // 7 days
    return data;
  } catch(e) { return null; }
}

function renderContinueBanner() {
  const container = document.getElementById('continueBanner');
  if (!container) return;
  const data = getContinueLink();
  if (!data) { container.style.display = 'none'; return; }
  let url = '', icon = '';
  if (data.type === 'quiz') { url = 'quizzes.html'; icon = '📝'; }
  else if (data.type === 'game') { url = 'games.html'; icon = '🎮'; }
  else if (data.type === 'practice') { url = 'practices.html'; icon = '💪'; }
  else if (data.type === 'puzzle') { url = 'puzzles.html'; icon = '🧩'; }
  container.innerHTML =
    '<div class="cb-icon">' + icon + '</div>' +
    '<div class="cb-text">' +
    '<h4>Continue where you left off</h4>' +
    '<p>' + (data.title || 'Your last activity') + '</p></div>' +
    '<a href="' + url + '">Resume →</a>';
  container.style.display = 'flex';
}

// ── Daily Challenge ────────────────────────────────────────────
function getDailyProblem() {
  const problems = [
    { q: 'What is 12 × 15?', a: '180' },
    { q: 'What is 3/4 + 1/8?', a: '7/8' },
    { q: 'What is 25% of 240?', a: '60' },
    { q: 'Round 4,567 to the nearest hundred.', a: '4600' },
    { q: 'What is the volume of a 4×5×6 box?', a: '120' },
    { q: 'What comes next: 2, 6, 18, 54, ?', a: '162' },
    { q: 'How many faces does a cube have?', a: '6' },
    { q: 'What is 0.75 as a fraction?', a: '3/4' },
    { q: 'Solve: n + 7 = 23', a: '16' },
    { q: 'What is the mode of: 5, 3, 5, 7, 5, 2?', a: '5' },
    { q: 'Convert 2.5 meters to centimeters.', a: '250' },
    { q: 'What is 144 ÷ 12?', a: '12' },
    { q: 'Which is greater: 3/5 or 0.6?', a: 'equal' },
    { q: 'A triangle has angles 40° and 70°. What is the third angle?', a: '70' },
    { q: 'What is 1/2 × 3/4?', a: '3/8' },
  ];
  const today = new Date().toDateString();
  const saved = localStorage.getItem('mws_daily');
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.date === today) return parsed;
  }
  const idx = Math.floor(Math.random() * problems.length);
  const prob = problems[idx];
  const data = { date: today, q: prob.q, a: prob.a, solved: false };
  localStorage.setItem('mws_daily', JSON.stringify(data));
  return data;
}

function renderDailyChallenge() {
  const container = document.getElementById('dailyChallenge');
  if (!container) return;
  const prob = getDailyProblem();
  if (prob.solved) {
    container.innerHTML = '<h3>🎉 Daily Challenge Complete!</h3><p>Come back tomorrow for a new problem!</p>';
    return;
  }
  container.innerHTML =
    '<h3>🔥 Daily Math Challenge</h3>' +
    '<div class="dc-problem">' + prob.q + '</div>' +
    '<div class="dc-input">' +
    '<input type="text" id="dcAnswer" placeholder="Your answer" onkeydown="if(event.key===\'Enter\')checkDaily()">' +
    '<button onclick="checkDaily()">Check</button></div>' +
    '<div id="dcFeedback" style="margin-top:10px;font-weight:700;min-height:24px;"></div>';
}

function checkDaily() {
  const input = document.getElementById('dcAnswer');
  const fb = document.getElementById('dcFeedback');
  const prob = getDailyProblem();
  if (!input || !fb) return;
  const val = input.value.trim().toLowerCase().replace(/\s/g, '');
  const ans = prob.a.toLowerCase().replace(/\s/g, '');
  if (val === ans) {
    fb.innerHTML = '<span style="color:#d1fae5">✅ Correct! Great job!</span>';
    prob.solved = true;
    localStorage.setItem('mws_daily', JSON.stringify(prob));
    unlockAchievement('first_practice');
    launchConfettiBurst();
    setTimeout(renderDailyChallenge, 2000);
  } else {
    fb.innerHTML = '<span style="color:#ffe0e0">❌ Not quite. Try again!</span>';
  }
}

// ── Site-wide Search Data ──────────────────────────────────────
const SITE_INDEX = [
  { title: 'Place Value',           url: 'quizzes.html',  icon: '📝', type: 'Quiz' },
  { title: 'Add & Subtract Decimals',url:'quizzes.html',  icon: '📝', type: 'Quiz' },
  { title: 'Multiplication',        url: 'quizzes.html',  icon: '📝', type: 'Quiz' },
  { title: 'Decimal Multiplication',url: 'quizzes.html',  icon: '📝', type: 'Quiz' },
  { title: 'Long Division',         url: 'quizzes.html',  icon: '📝', type: 'Quiz' },
  { title: 'Decimal Division',      url: 'quizzes.html',  icon: '📝', type: 'Quiz' },
  { title: 'Add & Subtract Fractions',url:'quizzes.html',icon: '📝', type: 'Quiz' },
  { title: 'Multiply Fractions',    url: 'quizzes.html',  icon: '📝', type: 'Quiz' },
  { title: 'Divide Fractions',      url: 'quizzes.html',  icon: '📝', type: 'Quiz' },
  { title: 'Volume',                url: 'quizzes.html',  icon: '📝', type: 'Quiz' },
  { title: 'Order of Operations',   url: 'quizzes.html',  icon: '📝', type: 'Quiz' },
  { title: 'Metric & Customary',    url: 'quizzes.html',  icon: '📝', type: 'Quiz' },
  { title: 'Coordinate Plane',      url: 'quizzes.html',  icon: '📝', type: 'Quiz' },
  { title: 'Line Plot',             url: 'quizzes.html',  icon: '📝', type: 'Quiz' },
  { title: 'Numerical Patterns',    url: 'quizzes.html',  icon: '📝', type: 'Quiz' },
  { title: 'Quadrilaterals',        url: 'quizzes.html',  icon: '📝', type: 'Quiz' },
  { title: 'Triangles',             url: 'quizzes.html',  icon: '📝', type: 'Quiz' },
  { title: 'Percentages',           url: 'quizzes.html',  icon: '📝', type: 'Quiz' },
  { title: 'Prime & Composite',     url: 'quizzes.html',  icon: '📝', type: 'Quiz' },
  { title: 'Mean, Median, Mode',    url: 'quizzes.html',  icon: '📝', type: 'Quiz' },
  { title: 'Elapsed Time',          url: 'quizzes.html',  icon: '📝', type: 'Quiz' },
  { title: 'Expressions & Equations',url:'quizzes.html', icon: '📝', type: 'Quiz' },
  { title: 'Speed Multiply',        url: 'games.html',    icon: '🎮', type: 'Game' },
  { title: 'Pattern Finder',        url: 'games.html',    icon: '🎮', type: 'Game' },
  { title: 'Math Sprint',           url: 'games.html',    icon: '🎮', type: 'Game' },
  { title: 'Fraction War',          url: 'games.html',    icon: '🎮', type: 'Game' },
  { title: 'True or False',         url: 'games.html',    icon: '🎮', type: 'Game' },
  { title: 'Missing Number',        url: 'games.html',    icon: '🎮', type: 'Game' },
  { title: 'Number Sorter',         url: 'games.html',    icon: '🎮', type: 'Game' },
  { title: 'PEMDAS Challenge',      url: 'games.html',    icon: '🎮', type: 'Game' },
  { title: 'Percent Whiz',          url: 'games.html',    icon: '🎮', type: 'Game' },
  { title: 'Prime Hunter',          url: 'games.html',    icon: '🎮', type: 'Game' },
  { title: 'Area Race',             url: 'games.html',    icon: '🎮', type: 'Game' },
  { title: 'Decimal Dash',          url: 'games.html',    icon: '🎮', type: 'Game' },
  { title: 'Place Value',           url: 'materials.html',icon: '📚', type: 'Material' },
  { title: 'Multiplication',        url: 'materials.html',icon: '📚', type: 'Material' },
  { title: 'Long Division',         url: 'materials.html',icon: '📚', type: 'Material' },
  { title: 'Order of Operations',   url: 'materials.html',icon: '📚', type: 'Material' },
  { title: 'Add & Subtract Decimals',url:'materials.html',icon: '📚', type: 'Material' },
  { title: 'Decimal Multiplication',url: 'materials.html',icon: '📚', type: 'Material' },
  { title: 'Decimal Division',      url: 'materials.html',icon: '📚', type: 'Material' },
  { title: 'Add & Subtract Fractions',url:'materials.html',icon:'📚', type: 'Material' },
  { title: 'Multiply Fractions',    url: 'materials.html',icon: '📚', type: 'Material' },
  { title: 'Divide Fractions',      url: 'materials.html',icon: '📚', type: 'Material' },
  { title: 'Volume',                url: 'materials.html',icon: '📚', type: 'Material' },
  { title: 'Coordinate Plane',      url: 'materials.html',icon: '📚', type: 'Material' },
  { title: 'Quadrilaterals',        url: 'materials.html',icon: '📚', type: 'Material' },
  { title: 'Triangles',             url: 'materials.html',icon: '📚', type: 'Material' },
  { title: 'Metric & Customary',    url: 'materials.html',icon: '📚', type: 'Material' },
  { title: 'Line Plot',             url: 'materials.html',icon: '📚', type: 'Material' },
  { title: 'Numerical Patterns',    url: 'materials.html',icon: '📚', type: 'Material' },
  { title: 'Number Riddles',        url: 'puzzles.html',  icon: '🧩', type: 'Puzzle' },
  { title: 'Geometry Puzzles',      url: 'puzzles.html',  icon: '🧩', type: 'Puzzle' },
  { title: 'Word Problems',         url: 'puzzles.html',  icon: '🧩', type: 'Puzzle' },
  { title: 'Brain Twisters',        url: 'puzzles.html',  icon: '🧩', type: 'Puzzle' },
  { title: 'Decimals & Fractions',  url: 'puzzles.html',  icon: '🧩', type: 'Puzzle' },
  { title: 'Memory Book 2025/2026', url: 'memory-book.html', icon: '📖', type: 'Memory Book' },
  { title: 'Ask Mrs. Shimaa',       url: 'ask.html',      icon: '💬', type: 'Message' },
  { title: 'Gallery',               url: 'gallery.html',  icon: '📷', type: 'Gallery' },
];

function performSearch(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return SITE_INDEX.filter(function(item) {
    return item.title.toLowerCase().includes(q) || item.type.toLowerCase().includes(q);
  }).slice(0, 8);
}

function renderSearchResults(results, container) {
  if (!container) return;
  if (results.length === 0) {
    container.innerHTML = '<div class="no-res">No results found 🔍</div>';
    container.classList.add('active');
    return;
  }
  let html = '';
  results.forEach(function(r) {
    html += '<a href="' + r.url + '">';
    html += '<span class="res-icon">' + r.icon + '</span>';
    html += '<div><div>' + r.title + '</div><div class="res-meta">' + r.type + '</div></div>';
    html += '</a>';
  });
  container.innerHTML = html;
  container.classList.add('active');
}
