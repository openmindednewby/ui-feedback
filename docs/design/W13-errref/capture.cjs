const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('C:/desktopContents/projects/SaaS/E2ETests/node_modules/playwright');
const { discoverRows } = require('C:/desktopContents/projects/SaaS/kefi-web/docs/visual-review/lib/visible-in-frame.cjs');

const OUT = __dirname;
const ORIGIN = 'https://ui.dloizides.com';
const ROUTE = '/feedback';
const TRACE = '4bf92f3577b34da6a3ce929d0e0e4736';
const SHORT = TRACE.slice(0, 8);
const VIEWPORTS = { '360x640': devices['Galaxy S5'], '1280x800': { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } };
const OPTIONS = { A: { page: true, toast: true }, B: { page: true, toast: false }, C: { page: false, toast: false } };
const ITEMS = {
  page: [
    ['page-icon', '[data-testid="showcase-error-rich-icon"]'],
    ['page-title', '[data-testid="showcase-error-rich-title"]'],
    ['page-message', '[data-testid="showcase-error-rich"] >> text=catalogue'],
    ['page-retry', '[data-testid="showcase-error-rich"] [data-testid="error-state-retry"]'],
    ['page-back', '[data-testid="showcase-error-rich-secondary"]'],
  ],
  toast: [['toast-message', '[data-testid="showcase-toast"]']],
};
const ALL_ITEMS = [...ITEMS.page, ...ITEMS.toast].map(([id]) => id);

async function steps(page, shot) {
  await page.goto(ORIGIN + ROUTE);
  await page.getByTestId('showcase-error-rich').waitFor({ timeout: 60000 });
  await page.getByTestId('showcase-control-mode-light').click();
  const anchor = page.getByTestId(shot === 'page' ? 'showcase-error-rich' : 'showcase-toast-trigger');
  await anchor.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(400);
  if (shot === 'toast') {
    await page.getByTestId('showcase-toast-error').click();
    await page.getByTestId('showcase-toast').waitFor({ timeout: 5000 });
    await page.waitForTimeout(450);
  }
  return Math.round((await anchor.boundingBox()).y);
}

async function injectPage(page) {
  await page.locator('[data-testid="showcase-error-rich"] >> text=catalogue').evaluate((msg, ids) => {
    const cs = getComputedStyle(msg);
    const row = document.createElement('div');
    row.setAttribute('data-testid', 'error-state-reference');
    row.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:6px;margin-top:4px;flex-wrap:nowrap;white-space:nowrap';
    const label = document.createElement('span');
    label.textContent = 'Error reference';
    label.style.cssText = `font:400 13px/18px ${cs.fontFamily};color:${cs.color}`;
    const code = document.createElement('span');
    code.textContent = ids.short;
    code.title = ids.full;
    code.style.cssText = `font:500 13px/18px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:${cs.color};letter-spacing:.04em;user-select:all`;
    const copy = document.createElement('button');
    copy.textContent = 'Copy';
    copy.setAttribute('aria-label', 'Copy error reference');
    copy.style.cssText = `box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-height:44px;min-width:56px;padding:0 8px;border:0;background:transparent;font:600 13px/18px ${cs.fontFamily};color:${cs.color};text-decoration:underline;text-underline-offset:3px;cursor:pointer`;
    row.append(label, code, copy);
    row.style.marginTop = '12px';
    const retry = document.querySelector('[data-testid="showcase-error-rich"] [data-testid="error-state-retry"]');
    const actions = retry ? retry.parentElement : null;
    (actions && actions !== msg.parentElement ? actions : msg).after(row);
  }, { short: SHORT, full: TRACE });
}

async function injectToast(page) {
  await page.getByTestId('showcase-toast').evaluate((toast, short) => {
    const textEl = [...toast.querySelectorAll('div,span')].reverse().find((n) => n.childElementCount === 0 && n.textContent.trim()) || toast;
    const cs = getComputedStyle(textEl);
    const ref = document.createElement('div');
    ref.setAttribute('data-testid', 'notification-toast-reference');
    ref.style.cssText = `margin-top:2px;font:400 12px/16px ${cs.fontFamily};color:${cs.color};opacity:.9`;
    const id = document.createElement('span');
    id.textContent = short;
    id.style.cssText = 'font:500 12px/16px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.04em';
    ref.append('Error reference ', id);
    const col = document.createElement('div');
    col.style.cssText = 'display:flex;flex-direction:column;flex:1 1 auto;min-width:0';
    textEl.replaceWith(col);
    col.append(textEl, ref);
  }, SHORT);
}

async function visibleItems(page, shot) {
  const out = [];
  for (const [id, sel] of ITEMS[shot]) {
    const loc = page.locator(sel).first();
    if (!(await loc.count())) continue;
    const ok = await loc.evaluate((e) => {
      const r = e.getBoundingClientRect();
      if (r.width < 1 || r.height < 1 || r.bottom <= 0 || r.right <= 0 || r.top >= innerHeight || r.left >= innerWidth) return false;
      for (let n = e; n; n = n.parentElement) { const s = getComputedStyle(n); if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return false; }
      const x = Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1), y = Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1);
      const hit = document.elementFromPoint(x, y);
      return !!hit && (e === hit || e.contains(hit) || hit.contains(e));
    });
    if (ok) out.push(id);
  }
  return out;
}

(async () => {
  fs.mkdirSync(path.join(OUT, 'img/before'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'img/after'), { recursive: true });
  const browser = await chromium.launch();
  const frames = [];
  const options = {};
  for (const [opt, show] of Object.entries(OPTIONS)) {
    const seen = new Set();
    for (const [vp, desc] of Object.entries(VIEWPORTS)) {
      for (const shot of ['page', 'toast']) {
        const pair = { route: ROUTE, state: shot === 'page' ? 'error-state-rich-shown' : 'error-toast-shown', fixture: 'ui-showcase-feedback-specimens', viewport: vp, scrollAnchor: shot === 'page' ? 'showcase-error-rich' : 'showcase-toast-trigger', crop: 'viewport' };
        const rec = {};
        for (const side of ['before', 'after']) {
          const ctx = await browser.newContext({ ...desc, colorScheme: 'light' });
          const page = await ctx.newPage();
          const anchorTop = await steps(page, shot);
          if (side === 'after' && show.page) await injectPage(page);
          if (side === 'after' && shot === 'toast' && show.toast) await injectToast(page);
          const file = `img/${side}/${opt}-${shot}-${vp}.png`;
          await page.screenshot({ path: path.join(OUT, file) });
          const vis = await visibleItems(page, shot);
          vis.forEach((v) => side === 'after' && seen.add(v));
          rec[side] = { anchorTop, vis, rows: await page.evaluate(discoverRows, null) };
          frames.push({ option: opt, shot: `${shot}-${vp}`, side, build: side === 'before' ? 'live ui.dloizides.com (ui-feedback 1.18.0)' : `live + option ${opt} mock`, file, pair, landed: { path: new URL(page.url()).pathname, anchorTop } });
          await ctx.close();
        }
        if (Math.abs(rec.before.anchorTop - rec.after.anchorTop) > 1) throw new Error(`anchor drift ${opt} ${shot} ${vp}`);
        frames.filter((f) => f.option === opt && f.shot === `${shot}-${vp}`).forEach((f) => { f.visibleItems = { before: rec.before.vis, after: rec.after.vis }; f.rows = rec[f.side].rows; });
      }
    }
    options[opt] = { items: ALL_ITEMS, inventory: `${seen.size}/${ALL_ITEMS.length}`, aligned: 'pass', alignedNote: 'no side-by-side form row on these screens' };
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify({ countMethod: 'visible-in-frame', rowsMethod: 'auto', pairMethod: 'same-steps', traceIdShown: TRACE, options, frames }, null, 2));
  console.log(JSON.stringify(options));
})().catch((e) => { console.error(e); process.exit(1); });
