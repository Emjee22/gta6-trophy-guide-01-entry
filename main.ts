// Leonida Trophy Guide entry program (Node 22, standard library only).
//
// The guide itself is plain static files in app/: index.html, app.js, style.css
// and data/trophies.json. It opens in a desktop browser and works with the
// network off, because everything it loads is a file under app/.
//
// This program hands the guide in. It copies app/ and screenshots/ from beside
// this file into the output directory and writes output/dossier.json with the
// vendored make.fun library, which is the summary the judge reads: the
// screenshots, the files the first load fetches and their sizes, and the source.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Run it twice and the two outputs must be byte for byte the same.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTreeIntoOutput() {
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
  const shots = join(repoRoot, 'screenshots');
  if (existsSync(shots)) {
    cpSync(shots, join(outputDir, 'screenshots'), { recursive: true });
  }
}

function writeDossier() {
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

copyTreeIntoOutput();
writeDossier();
