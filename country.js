(() => {
  const { countries } = window.drinkiqConfig;
  const preferenceKey = 'drinkiq_detected_country';
  let selected = 'international';

  function render() {
    const country = countries[selected];
    document.querySelectorAll('[data-country-emergency]').forEach(element => {
      element.replaceChildren();
      if (!country.emergency) {
        element.textContent = 'Call local emergency services immediately.';
        return;
      }
      element.append(`In ${country.name}, call `);
      country.emergency.numbers.forEach((number, index) => {
        if (index) element.append(' or ');
        const link = document.createElement('a');
        link.href = `tel:${number}`;
        link.textContent = number;
        element.append(link);
      });
      element.append(' in an emergency.');
    });
    document.querySelectorAll('[data-country-driving]').forEach(link => {
      link.hidden = !country.driving;
      link.href = country.driving || '';
      link.textContent = `Official drink-driving information for ${country.name}`;
    });
  }

  function applyCountry(code) {
    if (!Object.hasOwn(countries, code) || code === selected) return;
    selected = code;
    render();
    window.dispatchEvent(new Event('drinkiq-country-change'));
  }

  async function detectOnce() {
    try {
      const saved = localStorage.getItem(preferenceKey);
      if (Object.hasOwn(countries, saved)) {
        applyCountry(saved);
        return;
      }
      // Record the attempt before asking so a reload cannot repeat the prompt.
      localStorage.setItem(preferenceKey, 'international');
      if (!navigator.geolocation) return;
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
      });
      const { findCountry } = await import('./country-location.js');
      const code = await findCountry(position.coords);
      if (Object.hasOwn(countries, code)) {
        localStorage.setItem(preferenceKey, code);
        applyCountry(code);
      }
    } catch {
      // International also covers browsers where storing the attempt is blocked.
    }
  }

  window.drinkiqCountry = { get current() { return countries[selected]; } };
  try { applyCountry(localStorage.getItem(preferenceKey)); } catch {}
  render();
  window.addEventListener('storage', event => {
    if (event.storageArea === localStorage && event.key === preferenceKey) applyCountry(event.newValue);
  });
  if (navigator.locks) {
    navigator.locks.request(preferenceKey, detectOnce).catch(() => {});
  } else {
    void detectOnce();
  }
})();
