# DrinkIQ — Drink Tracker and Alcohol Awareness Tool

DrinkIQ is a free website for tracking drinks, estimating blood alcohol concentration (BAC), and learning about alcohol and hangover recovery. It works on desktop and mobile browsers.

**[Open DrinkIQ](https://drinkiq.vercel.app)**

> BAC results are estimates for education only. Do not use the calculator or its timeline to decide whether it is safe to drive. DrinkIQ is not a breathalyser or medical device.

## What you can do

- Enter your drinks, body weight, sex, and drinking timeline to view an estimated BAC. Drink presets include a 60 mL spirits serving with its own quantity control.
- View a chart of the estimated change in BAC over time.
- Save calculation history in your current browser.
- Use guest mode or a device-local profile to organise history.
- Read the hangover recovery guide and alcohol awareness information.
- Switch between light and dark themes.
- Use responsive pages with keyboard focus and accessibility support.

## Country and language

The interface is in English. On the first visit, DrinkIQ requests location through the browser’s permission prompt to detect Australia, India, the United Kingdom, or the United States. The country setting controls drink presets, measurement units, date formatting, and local resources. International is used when permission is denied, location is unavailable or uncertain, or the country is unsupported.

Country matching runs in the browser. DrinkIQ stores the country code or International fallback to avoid asking again. Precise coordinates are discarded. The boundary data is a public-domain subset of [Natural Earth 1:110m admin-0 boundaries v5.1.2](https://github.com/nvkelso/natural-earth-vector/tree/v5.1.2/geojson).

Made in Jodhpur/Adelaide.

## How history and profiles work

History and profile data are stored in browser local storage. They do not provide cloud sync across devices.

Guest and device-local profile histories use separate storage keys. Profile changes are synchronized across tabs to reduce stale history operations. Older history is handled through a conservative migration, with ambiguous legacy guest records preserved separately.

**Local profiles are not secure online accounts.** They should not be relied on to protect sensitive information from someone with access to the same browser or device.

## Advertising placeholders

The preview panels reserve space for possible future advertising. Wide desktops show two side rails, which become sticky when the viewport is tall enough. The placeholder below the calculator disclaimer matches the estimate card on desktop and uses a compact square on mobile. Every page has a horizontal panel above the footer. AdSense scripts and live ads are disabled.

## Verification

Static checks cover JavaScript syntax, page markup, structured data, action bindings, placeholder placement, and the configured Content Security Policy. A redacted pattern-based secret scan of the files selected for this update found no matches. The site has no application package manifest or runtime package dependency tree.

Browser and runtime regression checks on the final hardened snapshot remain pending because the required isolated environment was unavailable. This includes computed desktop and mobile ad layouts, enforced browser CSP and HTTPS response behaviour, calculation and serving-size parity, location permission and fallback, and legacy history behaviour. Earlier browser checks covered the calculator, simulated location outcomes, and legacy history before the hardening and final layout changes.

## Project files

| File | Purpose |
| --- | --- |
| `README.md` | Project overview, file reference, and verification status |
| `index.html` | Calculator, drink selection, estimate display, and device-local profile and history UI |
| `hangover-recovery.html` | Hangover recovery and alcohol awareness guide |
| `about.html` | About DrinkIQ |
| `privacy-policy.html` | Privacy information |
| `terms.html` | Terms and disclaimers |
| `base.css` | Shared resets, base element styles, and accessibility utilities |
| `styles.css` | Responsive page layout, calculator controls, and inactive ad placeholders |
| `tokens.css` | Shared colours, spacing, and theme values |
| `calculator.js` | BAC calculation, drink controls, chart, and device-local history and profiles |
| `country-config.js` | Country formats, drink presets, and local resources |
| `country.js` | One-time location request, fallback, and rendering of country-specific resources |
| `country-location.js` | On-device country boundary lookup |
| `country-boundaries.json` | Vendored boundary data for the supported countries |
| `theme.js` | Light and dark theme control and preference |
| `accessibility.js` | Dialog focus, keyboard, validation, and accessible UI behaviour |
| `favicon.svg` | Website icon |
| `vercel.json` | Hosting headers and configuration |
| `robots.txt` | Crawler rules and sitemap location |
| `sitemap.xml` | Public page URLs for search engines |

## Technology

The website uses HTML, CSS, and JavaScript, with browser local storage and Vercel hosting. The current website has no application backend or server-managed authentication.

## Planned features

These are planned ideas, not current features or delivery commitments:

- Online login using Supabase Auth, including email verification and password recovery.
- Private cloud history using Supabase Postgres, with explicit import from the device.
- User-controlled result sharing with a preview, text, and a downloadable image.
- Live advertising, subject to a separate review before enabling an ad provider.
- A mobile app or installable web app.
- Ride-booking links and additional safety tools.
- Alcohol reduction and recovery resources.
- Community articles and moderated support features.
- Consumption trends and personal analytics.

## Feedback and contributions

Report bugs or suggest improvements through [GitHub Issues](https://github.com/umraorajpurohit/DrinkIQ/issues). Pull requests are welcome.

## License

A project license has not yet been selected.
