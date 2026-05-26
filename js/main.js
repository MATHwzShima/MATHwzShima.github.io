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
