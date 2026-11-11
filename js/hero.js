// Landing-page hero demo: taps six bottles one by one and shows what the app shows for that shelf.
// Every number and drink name below was read from the CartPour app (November 2026). If the recipe book changes,
// re-read them in the app: set the shelf to these bottles in this order and copy "You can pour N", the
// "N more drinks are one bottle away" count and the Ready to mix list. The page's markup is the final frame,
// so with reduced motion (or no script) the phone simply shows that. The How it works story below uses the same shelf.
const STEPS = [ // bottle, ready, one bottle away, Ready to mix list
  ['vodka', 0, 12, []],
  ['club soda', 1, 19, ['Vodka Soda with Lime']],
  ['lime juice', 3, 22, ['Vodka Gimlet', 'Vodka Soda', 'Vodka Soda with Lime']],
  ['tequila', 5, 35, ['70 And Soda', 'Patrón Ranch Water', 'Vodka Gimlet', 'Vodka Soda', 'Vodka Soda with Lime']],
  ['triple sec', 7, 48, ['70 And Soda', 'Kamikaze', 'Margarita', 'Patrón Ranch Water', 'Vodka Gimlet', 'Vodka Soda', 'Vodka Soda with Lime']],
  ['orange juice', 10, 58, ['70 And Soda', 'Kamikaze', 'Margarita', 'Orange Crush', 'Patrón Ranch Water', 'Primavera Sunset', 'Screwdriver', 'Vodka Gimlet', 'Vodka Soda', 'Vodka Soda with Lime']],
];
// The words around those numbers, in the page's language (the Spanish ones are the app's own, read from it in Spanish).
// Drink names stay as the app shows them; the app keeps its English order in Spanish too.
const ES = document.documentElement.lang.startsWith('es');
const L = ES ? {
  pour: 'Puedes servir ', one: ' bebida esta noche.', many: ' bebidas esta noche.', none: 'Aún no hay nada listo para servir.',
  ask: '¿Qué tienes en tu barra?', tap: 'Toca las botellas que tienes.', away: n => `${n} bebidas más están a una botella.`,
  ready: 'Listas para preparar', nothing: 'Nada todavía', more: n => `+${n} más`,
  name: { 'Screwdriver': 'Destornillador', 'Vodka Soda': 'Vodka con soda', 'Vodka Soda with Lime': 'Vodka con soda y limón' },
} : {
  pour: 'You can pour ', one: ' drink tonight.', many: ' drinks tonight.', none: 'Nothing ready to pour yet.',
  ask: 'What’s on your shelf?', tap: 'Tap the bottles you own.', away: n => `${n} more are one bottle away.`,
  ready: 'Ready to mix', nothing: 'Nothing yet', more: n => `+${n} more`, name: {},
};
(() => {
  const $ = id => document.getElementById(id);
  const demo = $('demo');
  if (!demo || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hl = $('dhl'), sub = $('dsub'), rh = $('drh'), rl = $('drl'), rm = $('drm');
  const chips = [...$('dchips').children];

  const show = k => { // k bottles selected
    chips.forEach((c, i) => c.classList.toggle('on', i < k));
    const [, ready, away, now] = k ? STEPS[k - 1] : ['', 0, 0, []];
    const before = k > 1 ? STEPS[k - 2][3] : [];
    hl.textContent = '';
    if (ready) {
      const b = document.createElement('b'); b.textContent = ready; b.className = 'pop';
      hl.append(L.pour, b, ready === 1 ? L.one : L.many);
    } else hl.textContent = k ? L.none : L.ask;
    sub.textContent = k ? L.away(away) : L.tap;
    // newest drinks first, four rows, then "+N more"
    const order = [...now.filter(n => !before.includes(n)), ...now.filter(n => before.includes(n))];
    rh.textContent = ready ? `${L.ready} · ${ready}` : L.ready;
    rl.replaceChildren(...(order.length ? order.slice(0, 4) : [L.nothing]).map(n => {
      const li = document.createElement('li'); li.textContent = L.name[n] || n;
      if (!order.length) li.style.opacity = '.5'; else if (!before.includes(n)) li.className = 'new';
      return li;
    }));
    rm.textContent = order.length > 4 ? L.more(order.length - 4) : '';
  };

  let k = STEPS.length, timer = 0; // the markup starts on the final frame
  const tick = () => {
    if (k === STEPS.length) { k = 0; show(0); return; }
    const c = chips[k]; c.classList.add('tap'); setTimeout(() => c.classList.remove('tap'), 160);
    show(++k);
  };
  // play only while the phone is on screen; each time it comes back, start from an empty shelf
  new IntersectionObserver(([e]) => {
    clearInterval(timer);
    if (e.isIntersecting) { k = 0; show(0); timer = setInterval(tick, 1300); }
  }).observe(demo);
})();

// How it works story: the section pins below the header while you scroll through it, and the scroll plays the phone.
// Step 1 selects the six bottles (with the counts above), step 2 slides in the drinks, step 3 reveals the Margarita recipe.
// The drinks and recipe are written in the HTML; this only shows them. Scrolling back plays it backwards.
(() => {
  const story = document.getElementById('story');
  if (!story) return;
  const q = s => [...story.querySelectorAll(s)], views = q('.view'), words = q('.sw'), fills = q('.rail b');
  const chips = q('.chips .chip'), rows = q('.row'), lis = q('.rc li'), hl = story.querySelector('.hl'), sub = story.querySelector('.sub');
  const HEAD = 64; // the sticky header's height: the stage pins just below it
  let shown = 0, raf = 0, last = -1;
  const render = () => {
    raf = 0;
    const r = story.getBoundingClientRect(), p = Math.min(1, Math.max(0, (HEAD - r.top) / (r.height - (innerHeight - HEAD))));
    const step = Math.min(2, Math.floor(p * 3)), t = Math.min(1, (p * 3 - step) / .8); // each step plays over 80% of its third, then holds
    fills.forEach((f, i) => f.style.transform = `scaleX(${Math.min(1, Math.max(0, p * 3 - i))})`);
    if (step !== shown) { shown = step; views.forEach((v, i) => v.classList.toggle('on', i === step)); words.forEach((w, i) => w.classList.toggle('on', i === step)); }
    if (step === 0) {
      const k = Math.round(t * STEPS.length);
      if (k !== last) { last = k; chips.forEach((c, i) => c.classList.toggle('on', i < k));
        const [, ready, away] = k ? STEPS[k - 1] : ['', 0, 0];
        hl.textContent = '';
        if (ready) { const b = document.createElement('b'); b.textContent = ready; hl.append(L.pour, b, ready === 1 ? L.one : L.many); }
        else hl.textContent = k ? L.none : L.ask;
        sub.textContent = k ? L.away(away) : L.tap; }
    } else last = -1;
    if (step === 1) rows.forEach((x, i) => x.classList.toggle('on', i < Math.ceil(t * rows.length)));
    if (step === 2) lis.forEach((x, i) => x.classList.toggle('on', i < Math.ceil(t * lis.length)));
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(render); }, { passive: true });
  addEventListener('resize', render);
  render();
})();

// Footer wordmark: hover is CSS; this lights the letters a finger slides across, and sweeps the word once on arrival.
(() => {
  const word = document.querySelector('footer .word');
  if (!word) return;
  const letters = [...word.children], timers = new Map();
  const light = s => { s.classList.add('on'); clearTimeout(timers.get(s)); timers.set(s, setTimeout(() => s.classList.remove('on'), 1100)); };
  word.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') return; const el = document.elementFromPoint(e.clientX, e.clientY); if (letters.includes(el)) light(el); });
  word.addEventListener('pointerdown', e => { if (letters.includes(e.target)) light(e.target); });
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  new IntersectionObserver(([e], o) => { if (!e.isIntersecting) return; o.disconnect(); letters.forEach((s, i) => setTimeout(() => light(s), calm ? 0 : i * 70)); }, { threshold: .6 }).observe(word);
})();
