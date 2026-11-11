// Landing-page hero demo: taps six bottles one by one and shows what the app shows for that shelf.
// Every number and drink name below was read from the CartPour app (November 2026). If the recipe book changes,
// re-read them in the app: set the shelf to these bottles in this order and copy "You can pour N", the
// "N more drinks are one bottle away" count and the Ready to mix list. The page's markup is the final frame,
// so with reduced motion (or no script) the phone simply shows that.
(() => {
  const STEPS = [ // bottle, ready, one bottle away, Ready to mix list
    ['vodka', 0, 12, []],
    ['club soda', 1, 19, ['Vodka Soda with Lime']],
    ['lime juice', 3, 22, ['Vodka Gimlet', 'Vodka Soda', 'Vodka Soda with Lime']],
    ['tequila', 5, 35, ['70 And Soda', 'Patrón Ranch Water', 'Vodka Gimlet', 'Vodka Soda', 'Vodka Soda with Lime']],
    ['triple sec', 7, 48, ['70 And Soda', 'Kamikaze', 'Margarita', 'Patrón Ranch Water', 'Vodka Gimlet', 'Vodka Soda', 'Vodka Soda with Lime']],
    ['orange juice', 10, 58, ['70 And Soda', 'Kamikaze', 'Margarita', 'Orange Crush', 'Patrón Ranch Water', 'Primavera Sunset', 'Screwdriver', 'Vodka Gimlet', 'Vodka Soda', 'Vodka Soda with Lime']],
  ];
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
      hl.append('You can pour ', b, ready === 1 ? ' drink tonight.' : ' drinks tonight.');
    } else hl.textContent = k ? 'Nothing ready to pour yet.' : 'What’s on your shelf?';
    sub.textContent = k ? `${away} more are one bottle away.` : 'Tap the bottles you own.';
    // newest drinks first, four rows, then "+N more"
    const order = [...now.filter(n => !before.includes(n)), ...now.filter(n => before.includes(n))];
    rh.textContent = ready ? `Ready to mix · ${ready}` : 'Ready to mix';
    rl.replaceChildren(...(order.length ? order.slice(0, 4) : ['Nothing yet']).map(n => {
      const li = document.createElement('li'); li.textContent = n;
      if (!order.length) li.style.opacity = '.5'; else if (!before.includes(n)) li.className = 'new';
      return li;
    }));
    rm.textContent = order.length > 4 ? `+${order.length - 4} more` : '';
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
