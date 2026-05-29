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
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });

  // Daily quest bar keeps the whole site feeling like one student journey.
  const questPages = [
    { key: 'practice', label: 'Practice', href: 'practices.html' },
    { key: 'quiz', label: 'Quiz', href: 'quizzes.html' },
    { key: 'puzzle', label: 'Puzzle', href: 'puzzles.html' },
    { key: 'game', label: 'Game', href: 'games.html' }
  ];
  const isTeacherPage = currentPage === 'teacher.html';
  const hasNav = Boolean(nav && nav.parentNode);

  if (!isTeacherPage && hasNav) {
    const todayKey = 'mws_daily_quest_' + new Date().toISOString().slice(0, 10);
    let state = {};
    try {
      state = JSON.parse(localStorage.getItem(todayKey) || '{}') || {};
    } catch (err) {
      state = {};
    }

    const quest = document.createElement('section');
    quest.className = 'daily-quest';
    quest.setAttribute('aria-label', 'Daily math quest');

    const inner = document.createElement('div');
    inner.className = 'daily-quest-inner';

    const copy = document.createElement('div');
    copy.innerHTML = '<div class="dq-title">Today\'s Math Quest</div><div class="dq-subtitle">Finish a few small steps and build your streak.</div>';

    const steps = document.createElement('div');
    steps.className = 'dq-steps';

    questPages.forEach(function(item) {
      const step = document.createElement('a');
      step.href = item.href;
      step.className = 'dq-step';
      if (state[item.key]) step.classList.add('done');
      if (currentPage === item.href) step.classList.add('current');
      step.innerHTML = '<span aria-hidden="true">' + (state[item.key] ? '&#10003;' : '&#9675;') + '</span><span>' + item.label + '</span>';
      steps.appendChild(step);
    });

    const actions = document.createElement('div');
    actions.className = 'dq-actions';
    const doneCount = questPages.filter(function(item) { return state[item.key]; }).length;
    const currentQuest = questPages.find(function(item) { return item.href === currentPage; });
    const progress = document.createElement('div');
    progress.className = 'dq-progress';
    progress.textContent = doneCount + '/' + questPages.length;

    const mark = document.createElement('button');
    mark.className = 'dq-mark';
    mark.type = 'button';
    if (currentQuest) {
      mark.textContent = state[currentQuest.key] ? 'Step done' : 'Mark done';
      mark.disabled = Boolean(state[currentQuest.key]);
      mark.addEventListener('click', function() {
        state[currentQuest.key] = true;
        localStorage.setItem(todayKey, JSON.stringify(state));
        location.reload();
      });
    } else {
      mark.textContent = 'Start quest';
      mark.addEventListener('click', function() {
        location.href = 'practices.html';
      });
    }

    actions.appendChild(progress);
    actions.appendChild(mark);
    inner.appendChild(copy);
    inner.appendChild(steps);
    inner.appendChild(actions);
    quest.appendChild(inner);
    nav.insertAdjacentElement('afterend', quest);
  }
})();
