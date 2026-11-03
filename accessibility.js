/* Focus management and visual enhancements; calculation and storage stay in index.html. */
(() => {
  const overlays = [...document.querySelectorAll('.overlay')];
  let active = null;
  const returnTargets = new Map();
  const visible = element => !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  const focusables = root => [...root.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]')].filter(visible);
  function syncDialogs() {
    const open = overlays.filter(el => !el.classList.contains('hidden'));
    const next = open.at(-1) || null;
    for (const element of document.body.children) {
      if (!['SCRIPT', 'STYLE'].includes(element.tagName)) element.inert = !!next && element !== next;
    }
    if (next !== active) {
      const previous = active;
      if (next) {
        if (!returnTargets.has(next)) returnTargets.set(next, document.activeElement);
        next.style.zIndex = '401';
        (focusables(next)[0] || next).focus();
      } else if (previous) {
        const target = returnTargets.get(previous);
        if (target?.isConnected) target.focus();
      }
      if (previous && previous.classList.contains('hidden')) {
        previous.style.zIndex = '';
        if (next) {
          const target = returnTargets.get(previous);
          if (target && next.contains(target)) target.focus();
        }
        returnTargets.delete(previous);
      }
      active = next;
    }
  }
  overlays.forEach(overlay => {
    const title = overlay.querySelector('.modal-title');
    if (title) { title.id ||= overlay.id + 'Title'; overlay.setAttribute('aria-labelledby', title.id); }
    overlay.setAttribute('tabindex', '-1');
    new MutationObserver(syncDialogs).observe(overlay, { attributes: true, attributeFilter: ['class'] });
  });
  document.addEventListener('keydown', event => {
    if (!active) return;
    if (event.key === 'Tab') {
      const items = focusables(active);
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && (document.activeElement === first || !active.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !active.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
    }
    if (event.key === 'Escape') {
      const close = active.querySelector('.modal-close, .tc-close');
      if (close) { event.preventDefault(); close.click(); }
    }
  });
  const agree = document.getElementById('discAgreeBtn');
  if (agree) {
    const syncAgreement = () => { agree.disabled = !agree.classList.contains('enabled'); };
    new MutationObserver(syncAgreement).observe(agree, { attributes: true, attributeFilter: ['class'] });
    syncAgreement();
  }
  document.querySelectorAll('.auth-field').forEach(field => {
    const label = field.querySelector('label'), input = field.querySelector('input');
    if (label && input) label.htmlFor = input.id;
  });
  document.querySelectorAll('.modal-close').forEach(button => button.setAttribute('aria-label', 'Close dialog'));
  const authMessage = document.getElementById('authMsg');
  if (authMessage) { authMessage.setAttribute('role', 'status'); authMessage.setAttribute('aria-live', 'polite'); }
  const calcError = document.getElementById('calcError');
  if (calcError) {
    new MutationObserver(() => {
      const shown = calcError.style.display !== 'none';
      const weight = document.getElementById('weightKg');
      weight.setAttribute('aria-invalid', String(shown && calcError.textContent.includes('weight')));
      if (shown && calcError.textContent.includes('weight')) {
        weight.focus({ preventScroll: true });
        weight.scrollIntoView({ block: 'center' });
      } else if (shown) {
        calcError.tabIndex = -1;
        calcError.focus({ preventScroll: true });
        calcError.scrollIntoView({ block: 'center' });
      }
    }).observe(calcError, { childList: true, attributes: true, attributeFilter: ['style'] });
  }
  const timeError = document.getElementById('timeError');
  if (timeError) new MutationObserver(() => {
    if (timeError.style.display !== 'none') { timeError.tabIndex = -1; timeError.focus({ preventScroll: true }); timeError.scrollIntoView({ block: 'center' }); }
  }).observe(timeError, { childList: true, attributes: true, attributeFilter: ['style'] });
  document.querySelectorAll('.faq-q').forEach(button => {
    const answer = button.closest('.faq-item').querySelector('.faq-a');
    if (answer) { answer.id ||= 'faq-answer-' + [...document.querySelectorAll('.faq-q')].indexOf(button); button.setAttribute('aria-controls', answer.id); }
    button.addEventListener('click', () => document.querySelectorAll('.faq-q').forEach(other => other.setAttribute('aria-expanded', String(other.closest('.faq-item').classList.contains('open')))));
  });
  document.querySelector('[onclick="calculate()"]')?.addEventListener('click', () => {
    if (document.getElementById('calcError').style.display === 'none' && document.getElementById('timeError').style.display === 'none') {
      const result = document.getElementById('resultCard');
      result.tabIndex = -1;
      result.focus({ preventScroll: true });
      if (matchMedia('(max-width: 720px)').matches) result.scrollIntoView({ block: 'center' });
    }
  });
  document.addEventListener('drinkiq:theme', () => {
    if (typeof isDark !== 'undefined') isDark = document.documentElement.dataset.theme === 'dark';
    const canvas = document.getElementById('bacCanvas');
    const chart = document.getElementById('chartWrap');
    if (canvas && chart.style.display !== 'none') {
      const bac = parseFloat(document.getElementById('bacText').textContent);
      const rate = parseFloat(document.getElementById('rateText').textContent);
      const end = document.getElementById('stillDrinking').checked ? new Date() : new Date(document.getElementById('endTime').value);
      if (bac > 0 && rate > 0) drawChart(bac, rate, end);
    }
  });
  syncDialogs();
})();
