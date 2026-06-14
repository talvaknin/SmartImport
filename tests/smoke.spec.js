import { test, expect } from '@playwright/test'

// These tests guard against "renders into the DOM but is invisible" bugs —
// the exact failure mode that shipped once (login card stuck at opacity 0).

test('login CARD has a real background (not transparent)', async ({ page }) => {
  await page.goto('/')
  // Find the Card wrapping the title and assert its background isn't transparent.
  await expect.poll(async () => {
    return await page.getByText('SmartImport', { exact: true }).evaluate((el) => {
      let node = el
      while (node && node !== document.body) {
        const c = getComputedStyle(node).backgroundColor
        if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c
        node = node.parentElement
      }
      return 'transparent'
    })
  }, { timeout: 4000 }).not.toBe('transparent')
})

test('login page is actually VISIBLE (not stuck at opacity 0)', async ({ page }) => {
  await page.goto('/')

  // The brand title and the login button must be present...
  const title = page.getByText('SmartImport', { exact: true })
  const loginBtn = page.getByRole('button', { name: 'כניסה למערכת' })
  await expect(title).toBeVisible()
  await expect(loginBtn).toBeVisible()

  // Wait for the entrance fade-in (0.35s) to finish before measuring — otherwise
  // we'd catch the card mid-animation. This still fails if it never reaches 1.
  await expect.poll(async () => {
    return await loginBtn.evaluate((el) => {
      let node = el
      while (node && node !== document.body) {
        const op = parseFloat(getComputedStyle(node).opacity)
        if (op < 0.99) return op  // an ancestor is still transparent
        node = node.parentElement
      }
      return 1
    })
  }, { timeout: 4000 }).toBeGreaterThan(0.99)

  // The login button should be a real, clickable target with size.
  const box = await loginBtn.boundingBox()
  expect(box.width).toBeGreaterThan(100)
  expect(box.height).toBeGreaterThan(40)
})

test('email and password inputs render and accept typing', async ({ page }) => {
  await page.goto('/')
  const email = page.locator('input[type="email"]')
  const pass = page.locator('input[type="password"]')
  await expect(email).toBeVisible()
  await expect(pass).toBeVisible()
  await email.fill('test@example.com')
  await expect(email).toHaveValue('test@example.com')
})

test('no console errors on initial load', async ({ page }) => {
  const errors = []
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto('/')
  await page.waitForTimeout(1500)
  // Ignore benign network noise; fail on real JS/render errors.
  const real = errors.filter((e) => !/favicon|net::ERR|Failed to load resource/i.test(e))
  expect(real, real.join('\n')).toHaveLength(0)
})

test('login page shows the UMI navy surface, not a blank white screen', async ({ page }) => {
  await page.goto('/')
  // The navy is on the login background wrapper (.bg-brand-navy), not the body.
  // Assert that element exists and is the expected navy color.
  const navy = page.locator('.bg-brand-navy').first()
  await expect(navy).toBeVisible()
  const bg = await navy.evaluate((el) => getComputedStyle(el).backgroundColor)
  // brand navy #0B1F3A → rgb(11, 31, 58)
  expect(bg).toContain('11, 31, 58')
})
