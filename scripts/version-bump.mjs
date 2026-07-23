#!/usr/bin/env node

/**
 * Version bump script
 * Bumps version in package.json and creates git tag
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const bumpType = process.argv[2] || 'patch';

if (!['patch', 'minor', 'major'].includes(bumpType)) {
  console.error('Usage: node version-bump.mjs <patch|minor|major>');
  process.exit(1);
}

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
const [major, minor, patch] = pkg.version.split('.').map(Number);

let newVersion;
switch (bumpType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

console.log(`\n📦 Version Bump: ${pkg.version} → ${newVersion}\n`);

// Update package.json
pkg.version = newVersion;
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('  ✅ Updated package.json');

// Git commit and tag
try {
  execSync('git add package.json');
  execSync(`git commit -m "chore: release v${newVersion}"`);
  execSync(`git tag v${newVersion}`);
  console.log(`  ✅ Created git tag v${newVersion}`);
  console.log(`\n🚀 Run "git push origin main --tags" to publish\n`);
} catch (e) {
  console.error('  ❌ Git error:', e.message);
  process.exit(1);
}
