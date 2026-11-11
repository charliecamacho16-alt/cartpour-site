// Site language. Loaded in <head> (not deferred) so a Spanish browser's first visit to the English page goes to /es/
// before it paints. The EN/ES link remembers the choice, so the redirect never fights it. Opening the app carries the
// page's language into the app, unless the app already has one picked.
(() => {
  const es = document.documentElement.lang.startsWith('es');
  let pick = null;
  try { pick = localStorage.getItem('siteLang'); } catch (e) {}
  if (!es && !pick && /^es/i.test(navigator.language)) { location.replace('/es/' + location.hash); return; }
  document.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a) return;
    try {
      if (a.classList.contains('lang')) localStorage.setItem('siteLang', a.hreflang);
      else if (a.pathname === '/app/' && !localStorage.getItem('barLang')) localStorage.setItem('barLang', es ? 'es' : 'en');
    } catch (x) {}
  });
})();
