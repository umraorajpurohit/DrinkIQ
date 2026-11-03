# DrinkIQ — Drink Tracker and Alcohol Awareness Tool

DrinkIQ is a free website for tracking drinks, viewing an approximate blood alcohol concentration (BAC), and learning about alcohol and hangover recovery. It includes Indian and international drink options and works on desktop and mobile browsers.

**[Open DrinkIQ](https://drinkiq.vercel.app)**

> BAC results are estimates for education only. Do not use the calculator or its timeline to decide whether it is safe to drive. DrinkIQ is not a breathalyser or medical device.

## What you can do

- Enter your drinks, body weight, sex, and drinking timeline to view an estimated BAC.
- View a chart of the estimated change in BAC over time.
- Save calculation history in your current browser.
- Use guest mode or a local profile to organise history.
- Read the hangover recovery guide and alcohol awareness information.
- Switch between light and dark themes.
- Use responsive pages with keyboard focus and accessibility support.

## How history and profiles work

History and profile data are stored in browser local storage. They do not provide cloud sync across devices.

Guest history and account history use separate storage keys. Account changes are synchronized across tabs to reduce stale history operations. Older history is handled through a conservative migration, with ambiguous legacy guest records preserved separately.

**Local profiles are not secure online accounts.** They should not be relied on to protect sensitive information from someone with access to the same browser or device.

## Recent website updates

- Updated the layout, colours, navigation, and mobile presentation.
- Added shared styles, light and dark themes, and accessibility improvements.
- Separated guest and account histories and added cross-tab session handling.

The security-related history changes have received source review, but **runtime security regression testing remains pending** because the required isolated test environment was unavailable. This is not a claim that the application is fully secure.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Drink tracker, BAC calculator, profiles, and history |
| `hangover-recovery.html` | Hangover recovery and alcohol awareness guide |
| `about.html` | About DrinkIQ |
| `privacy-policy.html` | Privacy information |
| `terms.html` | Terms and disclaimers |
| `base.css`, `styles.css`, `tokens.css` | Shared layout, styling, and theme values |
| `theme.js` | Theme selection |
| `accessibility.js` | Accessibility behaviour |
| `favicon.svg` | Website icon |
| `vercel.json` | Hosting headers and configuration |
| `robots.txt`, `sitemap.xml` | Search engine discovery |

## Technology

The website uses HTML, CSS, and JavaScript, with browser local storage and Vercel hosting. The current website has no application backend or server-managed authentication.

## Future ideas

These are planned ideas, not current features or delivery commitments:

- A mobile app or installable web app.
- Ride-booking links and additional safety tools.
- Alcohol reduction and recovery resources.
- Community articles and moderated support features.
- Consumption trends and personal analytics.
- Backend accounts and secure authentication if cloud features are introduced.

## Feedback and contributions

Report bugs or suggest improvements through [GitHub Issues](https://github.com/umraorajpurohit/DrinkIQ/issues). Pull requests are welcome.

## License

A project license has not yet been selected.
