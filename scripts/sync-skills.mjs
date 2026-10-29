#!/usr/bin/env node
// Copies every skills/<name>/ folder (SKILL.md and any files next to it) into the
// project-level skill directories that other agent CLIs read, so the same skills
// work when an agent is started inside this repository.
//
//   node scripts/sync-skills.mjs          write the copies
//   node scripts/sync-skills.mjs --check  exit 1 when a copy is missing, differs or is stale
//
// skills/ is the source of truth: edit it, then run the sync and commit the copies.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'skills');

// Project-level skill directories, one per convention (see README, "Skills in other agent CLIs").
export const TARGETS = [
  '.claude/skills', // Claude Code
  '.agents/skills', // Codex (reads only .agents/skills), OpenCode, other agents-compatible hosts
  '.grok/skills', // Grok Build
  '.qwen/skills', // Qwen Code
  '.opencode/skills', // OpenCode native location
];

function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(path));
    else if (entry.isFile()) out.push(path);
  }
  return out;
}

// Line endings depend on the checkout (core.autocrlf), not on the content.
const normalize = (buf) => buf.toString('utf8').replace(/\r\n/g, '\n');

function skillNames() {
  return readdirSync(SOURCE, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(SOURCE, e.name, 'SKILL.md')))
    .map((e) => e.name)
    .sort();
}

function main() {
  const check = process.argv.includes('--check');
  const names = skillNames();
  const problems = [];
  let written = 0;

  for (const target of TARGETS) {
    const targetDir = join(ROOT, target);
    for (const name of names) {
      const from = join(SOURCE, name);
      const to = join(targetDir, name);
      const expected = new Set();
      for (const file of listFiles(from)) {
        const rel = relative(from, file);
        expected.add(rel);
        const dest = join(to, rel);
        const want = readFileSync(file);
        const same = existsSync(dest) && normalize(readFileSync(dest)) === normalize(want);
        if (same) continue;
        if (check) {
          problems.push(`${relative(ROOT, dest).replace(/\\/g, '/')}: ${existsSync(dest) ? 'differs' : 'missing'}`);
        } else {
          mkdirSync(dirname(dest), { recursive: true });
          writeFileSync(dest, want);
          written++;
        }
      }
      // Files left behind in a copy after they were removed from the source.
      if (existsSync(to)) {
        for (const file of listFiles(to)) {
          if (expected.has(relative(to, file))) continue;
          if (check) problems.push(`${relative(ROOT, file).replace(/\\/g, '/')}: not in skills/`);
          else rmSync(file);
        }
      }
    }
    // Whole skills that no longer exist in skills/.
    if (existsSync(targetDir)) {
      for (const entry of readdirSync(targetDir)) {
        if (names.includes(entry) || !statSync(join(targetDir, entry)).isDirectory()) continue;
        if (check) problems.push(`${target}/${entry}: not in skills/`);
        else rmSync(join(targetDir, entry), { recursive: true, force: true });
      }
    }
  }

  if (check) {
    if (problems.length) {
      console.error('Skill copies are out of date — run `node scripts/sync-skills.mjs` and commit:');
      for (const p of problems) console.error(`  ${p}`);
      process.exit(1);
    }
    console.log(`ok: ${names.length} skills in sync across ${TARGETS.length} directories`);
  } else {
    console.log(`synced ${names.length} skills into ${TARGETS.join(', ')} (${written} files written)`);
  }
}

main();
