/* Shared before-paint theme, using DrinkIQ's existing storage key. */
(() => {
  let saved;
  try { saved = localStorage.getItem('drinkiq_theme'); } catch {}
  const theme = saved === 'light' || saved === 'dark' ? saved : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
  window.drinkiqTheme = {
    apply(next) {
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('drinkiq_theme', next); } catch {}
      this.updateButtons();
      document.dispatchEvent(new Event('drinkiq:theme'));
    },
    updateButtons() {
      const dark = document.documentElement.dataset.theme === 'dark';
      const paper = getComputedStyle(document.documentElement).getPropertyValue('--color-paper').trim();
      document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
        meta.removeAttribute('media');
        meta.content = paper;
      });
      document.querySelectorAll('[data-theme-toggle]').forEach(button => {
        button.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
        button.setAttribute('aria-pressed', String(dark));
        button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4L19 5"/></svg><span>' + (dark ? 'Light theme' : 'Dark theme') + '</span>';
      });
    }
  };
  document.addEventListener('DOMContentLoaded', () => {
    window.drinkiqTheme.updateButtons();
    document.querySelectorAll('[data-theme-toggle]:not(#themeBtn)').forEach(button => button.addEventListener('click', () => {
      const next = button.hasAttribute('onclick') ? document.documentElement.dataset.theme : (document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
      window.drinkiqTheme.apply(next);
    }));
  });
  window.addEventListener('storage', event => {
    if (event.key === 'drinkiq_theme') {
      document.documentElement.dataset.theme = event.newValue === 'light' ? 'light' : 'dark';
      window.drinkiqTheme.updateButtons();
      document.dispatchEvent(new Event('drinkiq:theme'));
    }
  });
})();
