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
        let label = button.querySelector('span');
        if (!label) {
          const svgNamespace = 'http://www.w3.org/2000/svg';
          const icon = document.createElementNS(svgNamespace, 'svg');
          icon.setAttribute('viewBox', '0 0 24 24');
          icon.setAttribute('fill', 'none');
          icon.setAttribute('stroke', 'currentColor');
          icon.setAttribute('stroke-width', '1.6');
          icon.setAttribute('aria-hidden', 'true');
          const centre = document.createElementNS(svgNamespace, 'circle');
          centre.setAttribute('cx', '12');
          centre.setAttribute('cy', '12');
          centre.setAttribute('r', '4');
          const rays = document.createElementNS(svgNamespace, 'path');
          rays.setAttribute('d', 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4L19 5');
          icon.append(centre, rays);
          label = document.createElement('span');
          button.replaceChildren(icon, label);
        }
        label.textContent = dark ? 'Light theme' : 'Dark theme';
      });
    }
  };
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-theme-toggle]').forEach(button => button.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      window.drinkiqTheme.apply(next);
    }));
    window.drinkiqTheme.updateButtons();
  });
  window.addEventListener('storage', event => {
    if (event.key === 'drinkiq_theme') {
      document.documentElement.dataset.theme = event.newValue === 'light' ? 'light' : 'dark';
      window.drinkiqTheme.updateButtons();
      document.dispatchEvent(new Event('drinkiq:theme'));
    }
  });
})();
