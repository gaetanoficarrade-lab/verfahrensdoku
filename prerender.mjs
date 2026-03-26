import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import puppeteer from 'puppeteer';

const PORT = 4173;
const BASE = `http://localhost:${PORT}`;

const ROUTES = [
  '/',
  '/fuer-selbststaendige',
  '/fuer-dienstleister',
  '/verfahrensdokumentation-erstellen',
  '/partner',
  '/angebot',
  '/blog',
  '/blog/gobd-checkliste-verfahrensdokumentation',
  '/blog/verfahrensdokumentation-2025-was-sich-geaendert-hat',
  '/blog/verfahrensdokumentation-vorlage-steuerberater-oder-tool',
  '/blog/betriebspruefung-ohne-verfahrensdokumentation',
  '/blog/verfahrensdokumentation-als-dienstleistung-anbieten',
  '/blog/verfahrensdokumentation-freelancer',
  '/datenschutz',
  '/impressum',
  '/agb',
  '/avv',
];

// Blog routes need to wait for article title
const BLOG_ROUTES = ROUTES.filter(r => r.startsWith('/blog/') && r !== '/blog');

async function prerender() {
  console.log('🚀 Starting Vite preview server...');

  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT)], {
    stdio: 'pipe',
    shell: true,
  });

  // Wait for server to be ready
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server start timeout')), 30000);
    server.stdout.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes('Local') || msg.includes(String(PORT))) {
        clearTimeout(timeout);
        resolve(true);
      }
    });
    server.stderr.on('data', (data) => {
      console.error('Server stderr:', data.toString());
    });
  });

  // Extra wait for server stability
  await new Promise(r => setTimeout(r, 2000));

  console.log('🌐 Launching Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    pipe: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--disable-extensions',
    ],
  });

  let successCount = 0;
  let errorCount = 0;

  const MAX_RETRIES = 2;

  for (const route of ROUTES) {
    let success = false;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`  🔄 Retry ${attempt}/${MAX_RETRIES} for ${route}`);
        } else {
          console.log(`📄 Rendering: ${route}`);
        }
        const page = await browser.newPage();

        await page.goto(`${BASE}${route}`, {
          waitUntil: 'networkidle0',
          timeout: 30000,
        });

        // For blog article routes, wait for the article title to appear
        if (BLOG_ROUTES.includes(route)) {
          try {
            await page.waitForSelector('h1', { timeout: 10000 });
          } catch {
            console.warn(`  ⚠️ Could not find h1 on ${route}, continuing anyway`);
          }
        }

        // Additional wait for React to fully render
        await new Promise(r => setTimeout(r, 2000));

        const html = await page.content();
        await page.close();

        // Determine output path
        const outDir = 'dist';
        let filePath;
        if (route === '/') {
          filePath = join(outDir, 'index.html');
        } else {
          filePath = join(outDir, route, 'index.html');
        }

        const dir = dirname(filePath);
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }

        writeFileSync(filePath, html, 'utf-8');
        console.log(`  ✅ Saved: ${filePath}`);
        successCount++;
        success = true;
        break;
      } catch (err) {
        console.error(`  ❌ Error rendering ${route} (attempt ${attempt + 1}):`, err.message);
        if (attempt === MAX_RETRIES) {
          errorCount++;
        }
      }
    }
  }

  console.log(`\n🏁 Done! ${successCount} pages rendered, ${errorCount} errors.`);

  await browser.close();
  server.kill();
  process.exit(0);
}

prerender().catch((err) => {
  console.warn('Pre-rendering failed, continuing without it:', err.message);
  process.exit(0);
});