# Ready Enough

A calm household preparedness guide. No panic. Just in case.

Static, buildless website. Serve `index.html` alongside `assets/`. No dependency installation is required.

## Included
- Large-type print styles, full guide, starter checklist and household contact sheet.
- Browser-local checklist and household planner; downloadable offline HTML.
- Water, food, first aid, communication, power, tools, hygiene, shelter and radiation guidance with source links.
- Local map search and optional browser geolocation using OpenStreetMap.
- Offline phone navigation instructions: native compass and satellite GPS can work without internet; download and test maps in advance, learn to find coordinates, and keep a paper backup.
- Local emergency radio guide (`radio-guide.html`) with radio types, operating/licensing notes, printable PDF sheet, and aircraft rescue signaling guidance.

## Editorial policy
No weapons content, predictions, affiliate sales or alarmist news. Safety information links to official sources. Local emergency instructions take priority. Content is general guidance, not independently professionally reviewed.

## Limitations
The proposed $10/year newsletter is not accepting subscriptions; payment and mailing integrations are not configured. Maps require internet and must be exported separately for printing. Household fields are stored unencrypted in the visitor's browser and included in downloaded/printed copies. The site is not an emergency alert service.

Edition: October 30, 2026.

## App notes — offline navigation (November 3, 2026)
- Surface a visible “Your Phone Can Navigate Without Internet” entry in the emergency app and its printed/offline guide.
- Compass: most phones have a magnetometer and do not require a connection, but metal and magnets can disturb readings.
- GPS: satellite positioning can work without mobile data, though a cold fix may be slow and indoor reception poor.
- Offline maps must be downloaded while connected. Teach users to locate and record GPS coordinates, test airplane mode, and retain a paper map.
- Do not promise that browser-based compass controls work across all phones. Prefer instructions for native phone features instead of an unreliable custom compass.
- When reviewing the app, test offline navigation content, PDF export, and service-worker caching with network disabled.

## App notes — Emergency Location Message (November 3, 2026)
- Large red “I NEED HELP — LOCATION” button at top of homepage links to emergency-location panel.
- User-initiated GPS permission request, editable latitude/longitude, injury/party details, optional contact, copy message and open SMS draft.
- There is NO automatic SOS dispatch, continuous beacon transmission, background tracking, or guaranteed queuing/retry/delivery. Call 911 first in immediate danger, use native satellite SOS if supported, and verify the recipient has received any message.
- Test on iOS and Android browsers, offline, with location denied, with a cold GPS fix, and with no texting app available. Verify main navigation and accessibility.

## ReadyEnough Pocket app — November 3, 2026

A separate, mobile-first installable progressive web app is now in `app/`, linked from the main homepage.

**Included**
- New dedicated rescue-location icon (`app/icon.svg`) and PWA manifest.
- Large red I NEED HELP button, on-demand browser geolocation, editable GPS coordinates, emergency situation details, optional trusted contact, copy-message and SMS draft.
- Official NWS weather alert query by user-provided GPS coordinates, on demand only. Failure or no alerts is NEVER an all-clear.
- Offline compass/GPS and pre-downloaded map guidance, radio-frequency guide and printable PDF, visual rescue-aircraft signaling instructions.
- Local readiness checklist, offline shell cache, print/save-PDF using browser print.
- Does NOT send any message on its own, dispatch help, schedule/retry SMS, activate satellite SOS, or transmit radio signals. Explicit receipt confirmation is needed.
- The ZIP-frequency guide currently links to official lookup sources rather than automatically resolving station data.

**Follow-up testing / deployment**
- Confirm `https://readyenough.org/app/` serves the directory index and PWA manifest. App may require a manual server/deployment refresh.
- Test actual Android/iOS installation, SMS composer link, geolocation permission/denial, accuracy, long GPS acquisition, alert request errors, and offline cold start.
- Confirm `app/sw.js` caches `app/index.html`, icon, manifest and `radio-guide.html`; test with airplane mode. Neither NWS API nor remote lookup sites work offline.
- SVG icons may need generated 192x192 and 512x512 PNG versions for broader home-screen install support. Current icon uses SVG.
- Test accessible contrast, tap targets, manual coordinate entry, and all print/export instructions.
- Do not claim this is a certified beacon or emergency service.
