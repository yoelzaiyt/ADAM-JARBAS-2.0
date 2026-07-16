#!/usr/bin/env node

/**
 * Release readiness check script
 * Verifies all criteria are met before release
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

const checks = [];
let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    const result = fn();
    if (result) {
      console.log(`  ✅ ${name}`);
      passed++;
    } else {
      console.log(`  ❌ ${name}`);
      failed++;
    }
  } catch (e) {
    console.log(`  ❌ ${name}: ${e.message}`);
    failed++;
  }
}

console.log('\n🔍 Release Readiness Check\n');

// 1. Version consistency
check('package.json has version', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
  return pkg.version && !pkg.version.includes('SNAPSHOT');
});

// 2. No TODO/FIXME in critical files
check('No critical TODOs', () => {
  try {
    const result = execSync('grep -r "TODO\\|FIXME" --include="*.ts" packages/ | grep -v node_modules | grep -v ".test." | head -5', { encoding: 'utf-8' });
    return result.trim().length === 0;
  } catch {
    return true; // grep returns 1 when no matches found
  }
});

// 3. TypeScript compilation
check('TypeScript compiles', () => {
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
});

// 4. Tests pass
check('All tests pass', () => {
  try {
    execSync('pnpm test', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
});

// 5. Dockerfile exists
check('Dockerfile exists', () => existsSync('Dockerfile'));

// 6. docker-compose.yml exists
check('docker-compose.yml exists', () => existsSync('docker-compose.yml'));

// 7. LICENSE exists
check('LICENSE exists', () => existsSync('LICENSE'));

// 8. README exists
check('README.md exists', () => existsSync('README.md'));

// 9. CHANGELOG exists
check('CHANGELOG.md exists', () => existsSync('CHANGELOG.md'));

console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  console.log('❌ Release NOT ready. Fix the issues above.\n');
  process.exit(1);
} else {
  console.log('✅ Release is ready!\n');
  process.exit(0);
}
