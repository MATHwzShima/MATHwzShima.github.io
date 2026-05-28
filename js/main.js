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

  const searchItems = [
    { title: 'Place Value Practice', desc: 'Read, write, round, and compare whole numbers and decimals.', url: 'practices.html', tags: 'place value rounding decimals practice' },
    { title: 'Fractions', desc: 'Practice fraction operations and compare fractions in games.', url: 'practices.html', tags: 'fractions add subtract multiply divide compare' },
    { title: 'Decimal Dash', desc: 'A timed game for decimal addition, subtraction, and multiplication.', url: 'games.html', tags: 'decimal dash game decimals' },
    { title: 'Area Race', desc: 'Find the area of rectangles and shapes.', url: 'games.html', tags: 'area geometry shapes rectangles' },
    { title: 'PEMDAS Challenge', desc: 'Practice order of operations.', url: 'games.html', tags: 'pemdas order operations expressions' },
    { title: 'Prime Hunter', desc: 'Decide whether numbers are prime or composite.', url: 'games.html', tags: 'prime composite factors multiples' },
    { title: 'Math Quizzes', desc: 'Take 10-question topic quizzes and review your score.', url: 'quizzes.html', tags: 'quiz test review topic' },
    { title: 'Puzzles', desc: 'Solve number riddles, geometry puzzles, and brain twisters.', url: 'puzzles.html', tags: 'puzzle riddle logic hints' },
    { title: 'Materials', desc: 'Study guides, worksheets, and helpful math resources.', url: 'materials.html', tags: 'materials worksheets study guide anchor chart' },
    { title: 'Ask Mrs. Shimaa', desc: 'Send a question when you need help.', url: 'ask.html', tags: 'ask help question teacher' }
  ];

  const dailyChallenges = [
    { title: 'Fraction Detective', text: 'Compare two fractions, then explain how you know which one is larger.', url: 'games.html' },
    { title: 'Decimal Sprint', text: 'Solve 5 decimal problems and write down one mistake you fixed.', url: 'practices.html' },
    { title: 'Volume Builder', text: 'Draw a rectangular prism and find its volume using length x width x height.', url: 'quizzes.html' },
    { title: 'Pattern Scout', text: 'Create a number pattern with a rule, then challenge a friend to continue it.', url: 'games.html' },
    { title: 'Prime Check', text: 'Pick any number from 20 to 60 and prove whether it is prime or composite.', url: 'games.html' },
    { title: 'Word Problem Coach', text: 'Solve one word problem and underline the clue words before answering.', url: 'puzzles.html' },
    { title: 'Mistake Fixer', text: 'Redo one missed question and write the first step correctly.', url: 'practices.html' }
  ];

  const achievementNames = {
    first_quiz: 'Achievement unlocked: First Quiz',
    perfect_quiz: 'Achievement unlocked: Perfect Quiz',
    quiz_master: 'Achievement unlocked: Quiz Master',
    first_game: 'Achievement unlocked: First Game',
    speed_demon: 'Achievement unlocked: Speed Demon',
    puzzle_solver: 'Achievement unlocked: Puzzle Solver',
    ask_teacher: 'Achievement unlocked: Question Asker',
    memory_book: 'Achievement unlocked: Memory Keeper'
  };

  function getJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch (err) {
      return fallback;
    }
  }

  window.saveProgress = function(type, id, title) {
    const entry = {
      type: type,
      id: id,
      title: title,
      url: location.pathname.split('/').pop() || 'index.html',
      time: new Date().toISOString()
    };
    localStorage.setItem('mws_last_activity', JSON.stringify(entry));
  };

  window.renderContinueBanner = function() {
    const banner = document.getElementById('continueBanner');
    if (!banner) return;
    const last = getJson('mws_last_activity', null);
    if (!last || !last.title) return;

    const label = last.type ? last.type.charAt(0).toUpperCase() + last.type.slice(1) : 'Activity';
    const href = last.url || 'practices.html';
    banner.innerHTML = '<strong>Ready to keep going?</strong> Continue your last ' + label.toLowerCase() + ': <a href="' + href + '">' + last.title + '</a>';
    banner.style.display = '';
  };

  window.renderDailyChallenge = function() {
    const target = document.getElementById('dailyChallenge');
    if (!target) return;
    const dayIndex = Math.floor(Date.now() / 86400000) % dailyChallenges.length;
    const challenge = dailyChallenges[dayIndex];
    target.innerHTML =
      '<div class="challenge-icon" aria-hidden="true">&#127919;</div>' +
      '<div><h3>Daily Challenge: ' + challenge.title + '</h3><p>' + challenge.text + '</p></div>' +
      '<a class="challenge-link" href="' + challenge.url + '">Try it</a>';
  };

  window.performSearch = function(query) {
    const q = (query || '').trim().toLowerCase();
    if (q.length < 2) return null;
    return searchItems.filter(function(item) {
      return (item.title + ' ' + item.desc + ' ' + item.tags).toLowerCase().includes(q);
    }).slice(0, 6);
  };

  window.renderSearchResults = function(results, dropdown) {
    if (!dropdown) return;
    if (!results) {
      dropdown.classList.remove('active');
      dropdown.innerHTML = '';
      return;
    }
    if (!results.length) {
      dropdown.innerHTML = '<div class="search-empty">No matches yet. Try fractions, decimals, area, or prime.</div>';
      dropdown.classList.add('active');
      return;
    }
    dropdown.innerHTML = results.map(function(item) {
      return '<a class="search-result" href="' + item.url + '"><strong>' + item.title + '</strong><span>' + item.desc + '</span></a>';
    }).join('');
    dropdown.classList.add('active');
  };

  window.unlockAchievement = function(id) {
    const unlocked = getJson('mws_achievements', []);
    if (unlocked.includes(id)) return;
    unlocked.push(id);
    localStorage.setItem('mws_achievements', JSON.stringify(unlocked));

    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.textContent = achievementNames[id] || 'Achievement unlocked';
    document.body.appendChild(toast);
    requestAnimationFrame(function() { toast.classList.add('show'); });
    setTimeout(function() {
      toast.classList.remove('show');
      setTimeout(function() { toast.remove(); }, 300);
    }, 2600);
  };

  window.launchConfettiBurst = function() {
    const colors = ['#6c5ce7', '#00b894', '#fdcb6e', '#e17055', '#4d96ff'];
    for (let i = 0; i < 34; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = (Math.random() * 0.35) + 's';
      document.body.appendChild(piece);
      setTimeout(function() { piece.remove(); }, 1800);
    }
  };

  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.game-select-card, .qt-card').forEach(function(card) {
      if (card.tagName.toLowerCase() === 'button' || card.tagName.toLowerCase() === 'a') return;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          card.click();
        }
      });
    });
  });
})();
