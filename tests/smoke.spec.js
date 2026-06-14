import { test, expect } from '@playwright/test'

// These tests guard against "renders into the DOM but is invisible" bugs —
// the exact failure mode that shipped once (login card stuck at opacity 0).

test('login CARD has a real background (not transparent)', async ({ page }) => {
  await page.goto('/')
  // Find the Card wrapping the title and assert its background isn't transparent.
  const bg = await page.getByText('SmartImport', { exact: true }).evaluate((el) => {
    let node = el
    while (node && node !== document.body) {
      const c = getComputedStyle(node).backgroundColor
      if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c
      node = node.parentElement
    }
    return 'transparent'
  })
  expect(bg).not.toBe('transparent')
})

test('login page is actually VISIBLE (not stuck at opacity 0)', async ({ page }) => {
  await page.goto('/')

  // The brand title and the login button must be present...
  const title = page.getByText('SmartImport', { exact: true })
  const loginBtn = page.getByRole('button', { name: 'כניסה למערכת' })
  await expect(title).toBeVisible()
  await expect(loginBtn).toBeVisible()

  // ...and critically, the animated wrapper must have finished its fade-in.
  // Walk up from the button to the positioned wrapper and assert opacity ~1.
  const opacity = await loginBtn.evaluate((el) => {
    let node = el
    while (node && node !== document.body) {
      const op = parseFloat(getComputedStyle(node).opacity)
      if (op < 0.99) return op  // found an ancestor that's still transparent
      node = node.parentElement
    }
    return 1
  })
  expect(opacity).toBeGreaterThan(0.99)

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

test('page background is the UMI navy, not a blank white screen', async ({ page }) => {
  await page.goto('/')
  const bg = await page.evaluate(() => {
    const root = document.querySelector('.bg-brand-navy') || document.body
    return getComputedStyle(root).backgroundColor
  })
  // brand navy #0B1F3A → rgb(11, 31, 58)
  expect(bg).toContain('11, 31, 58')
})
