import { test, expect, type Page, type BrowserContext, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const routes = ['/', '/mission', '/how-it-works', '/partners', '/get-involved', '/register', '/survey', '/pickup', '/contact', '/sponsors', '/privacy', '/accessibility', '/demo', '/dashboard', '/missing-page'];
const staffOrigin = 'http://localhost:3151';
async function accessible(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(tags).analyze();
  expect(result.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }))).toEqual([]);
}
async function capture(page: Page, info: TestInfo, name: string) {
  const path = info.outputPath(name);
  await page.screenshot({ path });
  await info.attach(name, { path, contentType: 'image/png' });
}
async function noPageOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
}
async function staffSession(context: BrowserContext, role: string, seconds = 3600) {
  const now = Math.floor(Date.now() / 1000);
  const token = `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify({ sub: '00000000-0000-4000-8000-000000000001', role: 'authenticated', fixture_role: role, iat: now, exp: now + seconds })).toString('base64url')}.fictional-signature`;
  await context.addCookies([{ name: 'leftovers_session', value: token, url: staffOrigin, httpOnly: true, sameSite: 'Strict' }]);
}

test('all public pages have no axe violations at desktop and 320 CSS pixels', async ({ page }, info) => {
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      await test.step(`${route} at ${width}px`, async () => {
        await page.goto(route);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await accessible(page);
        await noPageOverflow(page);
        if (route === '/' && width === 1440) await capture(page, info, '01-home.png');
      });
    }
  }
});

test('skip link, mobile menu, FAQ and scrolling tables work with a keyboard', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/register');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  await menu.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'true');
  await capture(page, info, '02-mobile-menu.png');
  await accessible(page);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('Enter');
  await page.locator('#main-navigation').getByRole('link', { name: /Get involved/ }).focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('link', { name: /Ways to get involved/ })).toBeFocused();
  expect(await page.evaluate(() => { const el = document.activeElement!; const r = el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); })).toBe(true);
  await page.goto('/');
  const question = page.locator('.faq-list summary').first();
  await question.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.faq-list details').first()).toHaveAttribute('open', '');
  await accessible(page);
  await page.keyboard.press('Space');
  await expect(page.locator('.faq-list details').first()).not.toHaveAttribute('open', '');
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/demo');
  const table = page.getByRole('region', { name: 'Donor & interest records', exact: true });
  await table.focus(); await expect(table).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => table.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
  await capture(page, info, '06-demo-dashboard.png');
});

for (const [route, kind] of [['/register', 'donor'], ['/survey', 'survey'], ['/pickup', 'pickup'], ['/contact', 'contact'], ['/sponsors', 'sponsor']]) {
  test(`${kind} form exposes errors, links to fields and announces demo success`, async ({ page }, info) => {
    await page.goto(route);
    const submit = page.getByRole('button', { name: 'Try this form', exact: true });
    await expect(submit).toBeEnabled();
    await submit.click();
    const summary = page.getByRole('alert').filter({ hasText: 'Check your response' });
    await expect(summary).toBeFocused();
    await accessible(page);
    await summary.getByRole('link', { name: /^Email address:/ }).click();
    const email = page.getByLabel('Email address', { exact: true });
    await expect(email).toBeFocused();
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    const errorId = await email.getAttribute('aria-describedby');
    expect(errorId).toBeTruthy();
    await expect(page.locator(`[id="${errorId}"]`)).toHaveText('Enter a valid email address.');
    if (kind === 'donor') await capture(page, info, '03-donor-errors.png');
    if (kind !== 'contact') await page.getByLabel('Organization or household name', { exact: true }).fill('Fictional Accessibility Demo');
    await page.getByLabel('Your name', { exact: true }).fill('Demo Person');
    await email.fill('demo@example.org');
    if (['donor', 'survey', 'pickup'].includes(kind)) {
      await page.getByLabel('Phoenix-area ZIP code', { exact: true }).fill('85004');
      await page.getByLabel('Food category', { exact: true }).selectOption('Produce');
      if (kind === 'survey') await page.locator('input[name="pounds"]').fill('25');
    } else {
      await page.locator('textarea[name="notes"]').fill('Fictional accessibility test inquiry. No real submission is intended.');
    }
    if (kind === 'sponsor') {
      const recognition = page.getByRole('checkbox', { name: /^Optional:/ });
      await expect(recognition).not.toBeChecked();
      await recognition.focus(); await page.keyboard.press('Space');
      await expect(recognition).toBeChecked();
      await capture(page, info, '05-sponsor-consent.png');
    }
    await page.getByRole('checkbox', { name: /^I agree/ }).check();
    await page.waitForTimeout(2700); // Exercise the real minimum interaction-time protection.
    await submit.click();
    await expect(page.getByRole('region', { name: 'Demo complete.', exact: true })).toBeFocused();
    await expect(page.getByRole('region', { name: 'Demo complete.', exact: true }).getByRole('status')).toContainText('Nothing has been saved or sent');
    await accessible(page);
    if (kind === 'donor') await capture(page, info, '04-donor-success.png');
  });
}

test('a failed submission keeps entered values and announces the problem', async ({ page }) => {
  await page.route('**/api/interest', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Unable to save your submission. Please try again later.' }) }));
  await page.goto('/contact');
  await page.getByLabel('Your name', { exact: true }).fill('Demo Person');
  await page.getByLabel('Email address', { exact: true }).fill('demo@example.org');
  await page.getByLabel('Your message', { exact: true }).fill('Fictional test of an unavailable service.');
  await page.getByRole('checkbox', { name: /^I agree/ }).check();
  await page.getByRole('button', { name: 'Try this form', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Unable to save your submission.' })).toBeVisible();
  await expect(page.getByLabel('Your message', { exact: true })).toHaveValue('Fictional test of an unavailable service.');
  await accessible(page);
});

test('200 percent text and WCAG text spacing do not overflow pages', async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await staffSession(context, 'admin');
  for (const route of [...routes, staffOrigin + '/dashboard']) {
    await test.step(route, async () => {
      await page.goto(route);
      await page.evaluate(() => {
        const sizes = Array.from(document.querySelectorAll<HTMLElement>('html, body, body *')).map(el => ({ el, size: parseFloat(getComputedStyle(el).fontSize) }));
        for (const { el, size } of sizes) el.style.setProperty('font-size', `${size * 2}px`, 'important');
      });
      await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }' });
      await noPageOverflow(page);
      const heading = page.getByRole('heading', { level: 1 });
      expect(await heading.evaluate(el => el.scrollHeight <= el.clientHeight + 1)).toBe(true);
    });
  }
});

test('form boundaries, keyboard focus, reduced motion and forced colors are supported', async ({ page }) => {
  await page.goto('/register');
  const input = page.getByLabel('Your name', { exact: true });
  const ratio = await input.evaluate(el => {
    const s = getComputedStyle(el);
    const luminance = (color: string) => {
      const rgb = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(v => { const x = v / 255; return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; });
      return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
    };
    const values = [luminance(s.borderTopColor), luminance(s.backgroundColor)].sort((a, b) => a - b);
    return (values[1] + .05) / (values[0] + .05);
  });
  expect(ratio).toBeGreaterThanOrEqual(3);
  await input.focus();
  await expect(input).toHaveCSS('outline-style', 'solid');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  await page.emulateMedia({ forcedColors: 'active' });
  const consent = page.getByRole('checkbox', { name: /^I agree/ });
  await consent.focus(); await page.keyboard.press('Space');
  await expect(consent).toBeChecked();
  await expect(consent).toHaveCSS('appearance', 'auto');
  expect(await consent.evaluate(el => { const r = el.getBoundingClientRect(); return r.width >= 24 && r.height >= 24; })).toBe(true);
  await noPageOverflow(page);
});

for (const role of ['admin', 'coordinator', 'analyst']) {
  test(`${role} staff dashboard has accessible landmarks, records and role controls`, async ({ page, context }) => {
    await staffSession(context, role);
    await page.goto(staffOrigin + '/dashboard');
    await expect(page.getByRole('heading', { name: 'Recovery overview', exact: true })).toBeVisible();
    await expect(page.getByRole('main')).toHaveCount(1);
    for (const width of [1440, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await accessible(page); await noPageOverflow(page);
    }
    await expect(page.getByRole('heading', { name: 'Manage pilot planning', exact: true })).toHaveCount(role === 'analyst' ? 0 : 1);
    await expect(page.getByRole('heading', { name: 'Public sponsor recognition', exact: true })).toHaveCount(role === 'admin' ? 1 : 0);
    if (role === 'admin') {
      await page.getByRole('combobox', { name: 'Action', exact: true }).selectOption('cost');
      await accessible(page);
    }
  });
}

test('staff sign-in supports password managers, paste, visibility and focused errors', async ({ page }, info) => {
  await page.goto(staffOrigin + '/dashboard');
  await expect(page.getByRole('heading', { name: 'Pilot workspace', exact: true })).toBeVisible();
  await capture(page, info, '07-staff-sign-in.png');
  await accessible(page);
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('autocomplete', 'current-password');
  await page.getByRole('button', { name: 'Show password', exact: true }).click();
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Hide password', exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill('admin@example.org');
  await page.getByLabel('Password', { exact: true }).fill('fictional-incorrect-password');
  await page.getByRole('button', { name: /Sign in securely/ }).click();
  const error = page.getByRole('alert').filter({ hasText: 'Unable to sign in' });
  await expect(error).toBeFocused();
  await accessible(page);
});

test('session warning and renewal preserve unsaved fields and restore keyboard focus', async ({ page, context }, info) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await staffSession(context, 'admin', 90);
  await page.goto(staffOrigin + '/dashboard');
  await page.getByRole('combobox', { name: 'Action', exact: true }).selectOption('partner');
  await page.getByLabel('Organization', { exact: true }).fill('Unsaved Fictional Partner');
  await expect(page.getByRole('status').filter({ hasText: 'expires in less than two minutes' })).toBeVisible();
  const renew = page.getByRole('button', { name: 'Renew staff session', exact: true });
  await renew.focus(); await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Renew your staff session', exact: true });
  await expect(dialog).toBeVisible();
  await accessible(page);
  await capture(page, info, '08-session-renewal.png');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible(); await expect(renew).toBeFocused();
  await renew.click();
  await dialog.getByLabel('Email', { exact: true }).fill('admin@example.org');
  await dialog.getByLabel('Password', { exact: true }).fill('fictional-accessibility-password');
  await dialog.getByRole('button', { name: /Sign in securely/ }).click();
  await expect(dialog).not.toBeVisible();
  await expect(renew).toBeFocused();
  await expect(page.getByLabel('Organization', { exact: true })).toHaveValue('Unsaved Fictional Partner');
  await expect(page.getByRole('status').filter({ hasText: 'expires in less than two minutes' })).toHaveCount(0);
  const session = (await context.cookies(staffOrigin)).find(c => c.name === 'leftovers_session')!;
  expect(session.httpOnly).toBe(true); expect(session.secure).toBe(true); expect(session.sameSite).toBe('Strict');
  await renew.click();
  await expect(dialog.getByLabel('Password', { exact: true })).toHaveValue('');
  await page.keyboard.press('Escape');
  await expect(page.getByLabel('Organization', { exact: true })).toHaveValue('Unsaved Fictional Partner');
});

test('staff record and sponsor failures retain values and focus feedback', async ({ page, context }) => {
  await staffSession(context, 'admin');
  await page.route('**/api/records', r => r.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Unable to save this test record.' }) }));
  await page.route('**/api/sponsors', r => r.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Unable to publish this test acknowledgment.' }) }));
  await page.goto(staffOrigin + '/dashboard');
  await page.getByRole('combobox', { name: 'Action', exact: true }).selectOption('partner');
  await page.getByLabel('Organization', { exact: true }).fill('Fictional Partner');
  await page.getByLabel('ZIP', { exact: true }).fill('85004');
  await page.getByRole('button', { name: 'Save record', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Unable to save this test record.' })).toBeFocused();
  await expect(page.getByLabel('Organization', { exact: true })).toHaveValue('Fictional Partner');
  await page.getByRole('combobox', { name: 'Reviewed sponsor inquiry', exact: true }).selectOption({ label: 'Fictional Sponsor' });
  await page.getByLabel('Public organizational acknowledgment', { exact: true }).fill('Fictional organization support for an accessibility test.');
  await page.getByRole('checkbox', { name: /I have confirmed/ }).check();
  await page.getByRole('button', { name: 'Publish approved acknowledgment', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Unable to publish this test acknowledgment.' })).toBeFocused();
  await accessible(page);
});
