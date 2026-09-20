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
    paintFavicon();
    // The hero terminal sets its palette from this, through nus's own Palette.
    window.dispatchEvent(new CustomEvent('nus:theme'));
  }

  function currentIsInk() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'ink';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function paintFavicon() {
    var favicon=document.querySelector('[data-nus-favicon]');
    if(favicon) favicon.href=favicon.dataset.iconRoot+'nus-'+(currentIsInk()?'ink':'paper')+'.svg';
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
          paintFavicon();
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

/* The same sixteenth-note face sequence as the app's launch mark. */
(() => {
 const faces=[['Plex Mono','normal',600,26],['Silkscreen','normal',400,23],['Plex Mono','italic',400,26],['Bungee','normal',400,23],['Rubik Mono','normal',400,20],['Newsreader','italic',500,29]];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 for(const link of document.querySelectorAll('.mark')) {
  const word=link.querySelector('.wordmark'); if(!word)continue;
  let generation=0,timer;
  const settle=()=>{generation++;clearTimeout(timer);word.style.removeProperty('font');word.style.removeProperty('letter-spacing');};
  const start=async()=>{
   settle();if(reduced.matches)return;
   const run=generation;
   await Promise.all(faces.map(([name,style,weight,size])=>document.fonts.load(`${style} ${weight} ${size}px "${name}"`).catch(()=>{})));
   if(run!==generation || reduced.matches)return;
   let frame=0;
   const beat=()=>{if(run!==generation)return;const [name,style,weight,size]=faces[frame++];word.style.font=`${style} ${weight} ${size}px "${name}"`;word.style.letterSpacing='-.06em';if(frame<faces.length)timer=setTimeout(beat,60000/152/4);else settle();};
   beat();
  };
  link.addEventListener('pointerenter',start);link.addEventListener('pointerleave',settle);
  link.addEventListener('focus',start);link.addEventListener('blur',settle);
  reduced.addEventListener('change',settle);document.addEventListener('visibilitychange',()=>{if(document.hidden)settle();});
 }
})();
