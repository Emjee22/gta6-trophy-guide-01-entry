// Leonida Trophy Guide — the program that hands the guide in.
//
// Node 22, standard library only. It takes the guide that lives beside this
// file (app/ plus screenshots/) and lays it out in the output directory the
// grader gives it, then writes dossier.json there with the vendored make.fun
// library. The grader runs this file twice from a different working directory,
// as a user who cannot write outside the output directory, so every path is
// resolved from this file's own location and the output directory itself is
// never removed — only what sits inside it.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The folder this file lives in. All source paths hang off it, so the current
// working directory never matters.
function repoRoot(): string {
  return fileURLToPath(new URL('.', import.meta.url));
}

// The directory the grader wants the entry in. It is created for us, empty,
// and it sits under a read-only filesystem, so deleting it would fail.
function outputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
}

// Make sure the output directory exists, then empty it without touching the
// directory itself: remove each child, files and folders alike.
function prepareOutputDir(out: string): void {
  mkdirSync(out, { recursive: true });
  for (const child of readdirSync(out)) {
    rmSync(join(out, child), { recursive: true, force: true });
  }
}

// Copy one folder from the repository into the output directory, creating the
// destination first. A missing source folder is skipped quietly.
function copyTree(from: string, to: string): void {
  if (!existsSync(from)) return;
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

// Count the regular files under a folder, recursively, for the summary line.
function countFiles(dir: string): number {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    total += entry.isDirectory() ? countFiles(path) : 1;
  }
  return total;
}

function main(): void {
  const root = repoRoot();
  const out = outputDir();

  prepareOutputDir(out);
  copyTree(join(root, 'app'), join(out, 'app'));
  copyTree(join(root, 'screenshots'), join(out, 'screenshots'));

  // The dossier is the summary the judge reads: the screenshots, the first
  // load's files and bytes, and the source. The scorer rebuilds it with its
  // own copy of the library and compares the two byte for byte, so the
  // numbers here must match the gate's caps.
  const dossier = buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(out, 'dossier.json'), dossier);
  const appFiles = countFiles(join(out, 'app'));
  const shotFiles = existsSync(join(out, 'screenshots')) ? countFiles(join(out, 'screenshots')) : 0;
  console.log('dossier written to ' + join(out, 'dossier.json') + ' (' + appFiles + ' app files, ' + shotFiles + ' screenshots)');
}

main();
