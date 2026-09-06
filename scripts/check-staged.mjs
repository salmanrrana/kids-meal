import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const names = (filter) =>
  execFileSync(
    'git',
    ['diff', '--cached', '--name-only', `--diff-filter=${filter}`, '-z'],
    { encoding: 'utf8' },
  )
    .split('\0')
    .filter(Boolean);

const changed = names('ACMRD');
if (changed.length === 0) process.exit(0);

const present = names('ACMR');
const formatted = present.filter(
  (file) =>
    /\.(?:[cm]?[jt]sx?|css|html|json|md)$/.test(file) &&
    file !== 'package-lock.json',
);
const formatRanges = (file, content) => {
  const diff = execFileSync(
    'git',
    ['diff', '--cached', '--unified=0', '--', file],
    { encoding: 'utf8' },
  );
  const lines = content.match(/.*(?:\n|$)/g) ?? [];
  const offsets = [0];
  for (const line of lines) offsets.push(offsets.at(-1) + line.length);

  return [...diff.matchAll(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm)]
    .map((match) => ({ start: Number(match[1]), count: Number(match[2] ?? 1) }))
    .filter(({ count }) => count > 0)
    .map(({ start, count }) => ({
      start: offsets[start - 1] ?? 0,
      end: offsets[start - 1 + count] ?? content.length,
    }));
};
const projectChanged = changed.some(
  (file) =>
    /\.(?:[cm]?[jt]sx?)$/.test(file) ||
    /^(?:package(?:-lock)?\.json|tsconfig\.json|vite\.config\.js|\.oxlintrc\.json)$/.test(
      file,
    ),
);
const root = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  encoding: 'utf8',
}).trim();
const snapshot = mkdtempSync(join(tmpdir(), 'kids-meal-staged-'));

try {
  execFileSync('git', ['checkout-index', '--all', `--prefix=${snapshot}/`]);
  symlinkSync(
    join(root, 'node_modules'),
    join(snapshot, 'node_modules'),
    'dir',
  );
  const binary = (name) => join(root, 'node_modules', '.bin', name);

  for (const file of formatted) {
    if (!file.startsWith('src/')) {
      execFileSync(binary('prettier'), ['--check', file], {
        cwd: snapshot,
        stdio: 'inherit',
      });
      continue;
    }

    const content = execFileSync('git', ['show', `:${file}`], {
      encoding: 'utf8',
    });
    for (const range of formatRanges(file, content)) {
      execFileSync(
        binary('prettier'),
        [
          '--check',
          '--range-start',
          String(range.start),
          '--range-end',
          String(range.end),
          file,
        ],
        { cwd: snapshot, stdio: 'inherit' },
      );
    }
  }
  if (projectChanged) {
    execFileSync('npm', ['run', 'lint'], { cwd: snapshot, stdio: 'inherit' });
    execFileSync('npm', ['run', 'typecheck'], {
      cwd: snapshot,
      stdio: 'inherit',
    });
    execFileSync('npm', ['test'], { cwd: snapshot, stdio: 'inherit' });
  }
} finally {
  rmSync(snapshot, { recursive: true, force: true });
}
