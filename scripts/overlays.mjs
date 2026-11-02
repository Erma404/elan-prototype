import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const theme of ['light', 'dark']) {
  const p = await (await b.newContext({ colorScheme: theme, viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto('http://127.0.0.1:5173/styleguide', { waitUntil: 'networkidle' });
  await p.getByRole('button', { name: 'Ouvrir un dialogue' }).click(); await p.waitForTimeout(500);
  await p.screenshot({ path: `docs/screens/overlay-dialog-${theme}.png` });
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  await p.getByRole('button', { name: 'Ouvrir l’assistant' }).click(); await p.waitForTimeout(2200);
  await p.screenshot({ path: `docs/screens/overlay-ai-${theme}.png` });
}
await b.close();
