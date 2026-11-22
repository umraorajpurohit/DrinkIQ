(() => {
  const language = 'en';
  const drinks = [
    ['beer330', '🍺 Beer', 'Beer', 330, 4.5],
    ['strong330', '🍺 Beer', 'Strong beer', 330, 7.5],
    ['beer375', '🍺 Beer', 'Beer', 375, 4.8],
    ['beer568', '🍺 Beer', 'Pint of beer', 568, 5.2],
    ['beer12oz', '🍺 Beer', 'Beer', 12 * 29.5735295625, 5],
    ['spirits60', '🥃 Spirits', 'Spirits', 60, 40],
    ['spirits45', '🥃 Spirits', 'Spirits', 45, 40],
    ['spirits30', '🥃 Spirits', 'Spirits', 30, 40],
    ['spirits25', '🥃 Spirits', 'Spirits', 25, 40],
    ['wine150', '🍷 Wine', 'Glass of wine', 150, 12.5],
    ['wine750', '🍷 Wine', 'Bottle of wine', 750, 12.5],
    ['cocktail200', '🍹 Cocktails', 'Cocktail', 200, 12.5],
  ].map(([id, group, label, ml, abv]) => ({
    id, group, label, ml, abv, grams: ml * (abv / 100) * 0.789,
  }));

  const sharedPresets = ['strong330', 'spirits45', 'spirits60', 'wine150', 'wine750', 'cocktail200'];
  const metric = { weight: 'kg', kgPerUnit: 1, volume: 'mL', mlPerUnit: 1 };
  const countries = {
    international: { name: 'International', locale: language, units: metric, presets: ['beer330', ...sharedPresets] },
    AU: {
      name: 'Australia', locale: 'en-AU', units: metric, presets: ['beer375', 'spirits30', ...sharedPresets],
      alcoholMeasure: { label: 'standard drinks', grams: 10, source: 'https://www.health.gov.au/topics/alcohol/about-alcohol/standard-drinks-guide' },
      emergency: { numbers: ['000'], source: 'https://www.acma.gov.au/emergency-calls' },
      driving: 'https://www.health.gov.au/topics/alcohol/about-alcohol/alcohol-laws-in-australia',
    },
    IN: {
      name: 'India', locale: 'en-IN', units: metric, presets: ['beer330', 'spirits30', ...sharedPresets],
      emergency: { numbers: ['112'], source: 'https://www.mha.gov.in/index.php/scheme/dial-112-emergency-response-support-system-erss' },
      driving: 'https://www.indiacode.nic.in/bitstream/123456789/1798/1/eng.pdf',
    },
    GB: {
      name: 'United Kingdom', locale: 'en-GB', units: metric, presets: ['beer568', 'spirits25', ...sharedPresets],
      alcoholMeasure: { label: 'UK units', ml: 10, source: 'https://www.nhs.uk/live-well/alcohol-advice/calculating-alcohol-units/' },
      emergency: { numbers: ['999', '112'], source: 'https://www.gov.uk/guidance/999-and-112-the-uks-national-emergency-numbers' },
      driving: 'https://www.gov.uk/drink-drive-limit',
    },
    US: {
      name: 'United States', locale: 'en-US',
      units: { weight: 'lb', kgPerUnit: 0.45359237, volume: 'US fl oz', mlPerUnit: 29.5735295625 },
      presets: ['beer12oz', ...sharedPresets],
      alcoholMeasure: { label: 'standard drinks', grams: 14, source: 'https://www.niaaa.nih.gov/alcohols-effects-health/what-standard-drink' },
      emergency: { numbers: ['911'], source: 'https://www.911.gov/calling-911/' },
      driving: 'https://www.nhtsa.gov/risky-driving/drunk-driving',
    },
  };

  window.drinkiqConfig = { language, countries, drinks };
})();
