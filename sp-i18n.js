/* =============================================================================
   SEVEN POINTS — sp-i18n.js
   Language switch (English / العربية / کوردی):
   - remembers the visitor's choice (the English page sends a returning visitor
     straight to Arabic or Kurdish — see the small script in the page head);
   - keeps their place: the section in view travels with them (#about, #values …),
     and the new page opens at that section.
   ============================================================================= */
(function () {
  'use strict';
  var doc = document;
  // Sections in page order; the more specific About chapters come after #about.
  var PLACES = ['top', 'about', 'who', 'values', 'team', 'founders', 'services', 'projects', 'partners', 'contact'];

  function place() {
    var line = window.innerHeight * 0.4, found = '';
    for (var i = 0; i < PLACES.length; i++) {
      var el = doc.getElementById(PLACES[i]);
      if (!el) continue;
      var r = el.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) found = PLACES[i];
    }
    return found === 'top' ? '' : found;
  }

  Array.prototype.forEach.call(doc.querySelectorAll('[data-lang]'), function (a) {
    a.addEventListener('click', function () {
      try { localStorage.setItem('sp-lang', a.getAttribute('data-lang')); } catch (e) { /* private mode */ }
      var p = place();
      a.setAttribute('href', a.getAttribute('href').split('#')[0] + (p ? '#' + p : ''));
    });
  });
})();
