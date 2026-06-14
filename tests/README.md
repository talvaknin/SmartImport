# Smoke tests

Real-browser checks that guard against the failure mode that shipped once:
the app renders into the DOM but is visually invisible (login card stuck at
`opacity: 0`), plus console errors and blank-screen regressions.

## Run locally
```bash
npm install          # once
npm run test:install # once — downloads the Chromium browser
npm test             # builds, serves, runs the tests on desktop + mobile
```

## In CI
`.github/workflows/smoke.yml` runs these automatically on every push to main.
If the login is invisible or the console errors, the check goes red and a
report is attached to the run.
