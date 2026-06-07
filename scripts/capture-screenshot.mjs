import { chromium } from '@playwright/test';

const URL = process.env.URL || 'http://localhost:5173';
const OUT = process.argv[2] || 'docs/images/screenshot.png';

const settings = { language: 'en', apiKey: null };

const branches = (a, b, c) => [a, b, c].filter(Boolean);
const el = (emoji, name) => ({ emoji, name });

const mapStructure = [
  { level: 1, branches: branches(el('🗡️', 'sword'), el('🪄', 'wand'), el('🏹', 'bow')) },
  { level: 2, branches: branches(el('🛡️', 'shield'), el('🧪', 'potion')) },
  { level: 3, branches: branches(el('💎', 'gem'), el('🗝️', 'key'), el('🪙', 'coin'), el('🔮', 'orb')) },
  { level: 4, branches: branches(el('🐺', 'wolf'), el('🦅', 'eagle'), el('🐉', 'dragon')) },
  { level: 5, branches: branches(el('🌲', 'forest'), el('🏔️', 'mountain')) },
  { level: 6, branches: branches(el('🕯️', 'candle'), el('🔥', 'fire'), el('❄️', 'ice')) },
  { level: 7, branches: branches(el('📜', 'scroll'), el('📖', 'book')) },
  { level: 8, branches: branches(el('🌙', 'moon'), el('☀️', 'sun'), el('⭐', 'star')) },
  { level: 9, branches: branches(el('👑', 'crown'), el('💍', 'ring')) },
  { level: 10, branches: branches(el('🏆', 'trophy')) },
];

const progress = {
  initialStory: 'A brave young dragon explores an enchanted castle, gathering treasures and meeting magical creatures along the way.',
  currentLevel: 4,
  completedLevels: [1, 2, 3],
  mapStructure,
  mapStartEmoji: '🐉',
  chosenElements: [el('🗡️', 'sword'), el('🛡️', 'shield'), el('💎', 'gem')],
  stars: { 1: 3, 2: 2, 3: 3 },
};

const currentLevel = {
  problem: {
    narrative:
      'The young dragon found a shimmering gem inside the castle. The gem grows brighter for every step the dragon takes. Print "Bright!" three times to show the gem glowing.',
    expectedOutput: 'Bright!\nBright!\nBright!',
  },
  code: 'REPEAT 3 TIMES\n  WRITE "Bright!"\nEND\n',
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

await page.goto(URL);

await page.evaluate(
  ({ settings, progress, currentLevel }) => {
    localStorage.setItem('codino_settings', JSON.stringify(settings));
    localStorage.setItem('codino_progress', JSON.stringify(progress));
    localStorage.setItem('codino_current_level', JSON.stringify(currentLevel));
  },
  { settings, progress, currentLevel }
);

await page.reload();

await page.waitForSelector('.cm-content', { timeout: 10000 });
await page.waitForTimeout(1200);

await page.screenshot({ path: OUT, fullPage: false });
console.log(`Saved screenshot to ${OUT}`);

await browser.close();
