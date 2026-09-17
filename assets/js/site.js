/* nus.dev — theme and signal.
   The app follows the OS theme and paints one colour on screen: the Space's
   signal. The site does the same, and remembers your choice. */

(function () {
  'use strict';

  var SIGNALS = [
    ['red',    '#c8102e'],
    ['blue',   '#1f5fbf'],
    ['gold',   '#d9a400'],
    ['green',  '#2e7d32'],
    ['violet', '#6b3fa0'],
    ['teal',   '#1a7f8a']
  ];

  var root = document.documentElement;

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private window */ } }

  /* --- signal ------------------------------------------------------------ */

  function applySignal(hex) {
    root.style.setProperty('--signal', hex);
    // Gold needs ink on top; everything else takes paper.
    root.style.setProperty('--on-signal', hex === '#d9a400' ? '#141414' : '#ffffff');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', hex);
  }

  var savedSignal = get('nus.signal');
  if (savedSignal && SIGNALS.some(function (s) { return s[1] === savedSignal; })) {
    applySignal(savedSignal);
  }

  function buildSignalPicker(host) {
    var current = get('nus.signal') || SIGNALS[0][1];
    SIGNALS.forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.style.background = s[1];
      b.title = 'Signal — ' + s[0];
      b.setAttribute('aria-label', 'Signal colour ' + s[0]);
      b.setAttribute('aria-pressed', String(s[1] === current));
      b.addEventListener('click', function () {
        applySignal(s[1]);
        set('nus.signal', s[1]);
        host.querySelectorAll('button').forEach(function (o) {
          o.setAttribute('aria-pressed', String(o === b));
        });
      });
      host.appendChild(b);
    });
  }

  /* --- theme ------------------------------------------------------------- */

  function applyTheme(mode) {
    if (mode === 'paper' || mode === 'ink') root.setAttribute('data-theme', mode);
    else root.removeAttribute('data-theme');
    // The hero terminal sets its palette from this, through nus's own Palette.
    window.dispatchEvent(new CustomEvent('nus:theme'));
  }

  function currentIsInk() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'ink';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  applyTheme(get('nus.theme'));

  function wireThemeToggle(btn) {
    var sun = btn.querySelector('[data-sun]');
    var moon = btn.querySelector('[data-moon]');

    function paintIcon() {
      var ink = currentIsInk();
      if (sun) sun.hidden = !ink;
      if (moon) moon.hidden = ink;
      btn.setAttribute('aria-label', ink ? 'Switch to paper' : 'Switch to ink');
      btn.title = ink ? 'Paper' : 'Ink';
    }

    btn.addEventListener('click', function () {
      var next = currentIsInk() ? 'paper' : 'ink';
      applyTheme(next);
      set('nus.theme', next);
      paintIcon();
    });

    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', function () {
        if (!root.getAttribute('data-theme')) {
          paintIcon();
          window.dispatchEvent(new CustomEvent('nus:theme'));
        }
      });

    paintIcon();
  }

  /* --- boot -------------------------------------------------------------- */

  document.addEventListener('DOMContentLoaded', function () {
    var pick = document.querySelector('[data-signalpick]');
    if (pick) buildSignalPicker(pick);

    var toggle = document.querySelector('[data-theme-toggle]');
    if (toggle) wireThemeToggle(toggle);

    // Mark the current page in the nav. In-page anchors are not pages.
    var here = location.pathname.replace(/index\.html$/, '').replace(/\/+$/, '') || '/';
    document.querySelectorAll('.nav a, .doc__nav a').forEach(function (a) {
      var to = a.getAttribute('href');
      if (!to || to.charAt(0) === '#' || /^https?:/.test(to)) return;
      var p = new URL(to, location.href).pathname.replace(/index\.html$/, '').replace(/\/+$/, '') || '/';
      if (p === here) a.setAttribute('aria-current', 'page');
    });

    spy();
  });

  /* --- scrollspy: mark the section you are reading ----------------------- */

  function spy() {
    var links = [].slice.call(document.querySelectorAll('.doc__nav a[href^="#"]'));
    if (!links.length || !window.IntersectionObserver) return;

    var byId = {};
    var targets = [];
    links.forEach(function (a) {
      var el = document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
      if (el) { byId[el.id] = a; targets.push(el); }
    });

    var visible = new Set();

    function paint() {
      var current = null;
      for (var i = 0; i < targets.length; i++) {
        if (visible.has(targets[i].id)) { current = targets[i].id; break; }
      }
      links.forEach(function (a) { a.removeAttribute('data-here'); });
      if (current && byId[current]) byId[current].setAttribute('data-here', '');
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) visible.add(e.target.id);
        else visible.delete(e.target.id);
      });
      paint();
    }, { rootMargin: '-90px 0px -65% 0px' });

    targets.forEach(function (t) { io.observe(t); });
  }
})();
