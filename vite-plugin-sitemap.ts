import { Plugin } from "vite";
import { writeFileSync } from "fs";
import { resolve } from "path";

interface RouteConfig {
  path: string;
  changefreq: string;
  priority: number;
}

const routes: RouteConfig[] = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/fuer-selbststaendige", changefreq: "weekly", priority: 0.9 },
  { path: "/fuer-dienstleister", changefreq: "weekly", priority: 0.9 },
  { path: "/angebot", changefreq: "weekly", priority: 0.9 },
  { path: "/partner", changefreq: "monthly", priority: 0.7 },
  { path: "/blog", changefreq: "weekly", priority: 0.8 },
  { path: "/test-starten", changefreq: "monthly", priority: 0.8 },
  { path: "/impressum", changefreq: "yearly", priority: 0.3 },
  { path: "/datenschutz", changefreq: "yearly", priority: 0.3 },
  { path: "/agb", changefreq: "yearly", priority: 0.3 },
  { path: "/avv", changefreq: "yearly", priority: 0.3 },
];

const BASE_URL = "https://gobd-suite.de";

export default function sitemapPlugin(): Plugin {
  return {
    name: "vite-plugin-sitemap",
    closeBundle() {
      const today = new Date().toISOString().split("T")[0];

      const urls = routes
        .map(
          (r) => `  <url>
    <loc>${BASE_URL}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`
        )
        .join("\n");

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

      const outDir = resolve(process.cwd(), "dist");
      writeFileSync(resolve(outDir, "sitemap.xml"), xml, "utf-8");
      console.log(`✅ sitemap.xml generated with ${routes.length} URLs (lastmod: ${today})`);
    },
  };
}
