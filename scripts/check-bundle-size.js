#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Performance budgets (in KB)
const BUDGETS = {
  'index': 200, // Main bundle should be under 200KB
  'react-vendor': 50,
  'supabase-vendor': 120,
  'admin-vendor': 20, // TinyMCE should be lazy loaded
  'charts-vendor': 100, // Recharts should be lazy loaded
  'ui-vendor': 10,
  'total': 500 // Total initial load should be under 500KB
};

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return Math.round(stats.size / 1024); // Convert to KB
  } catch (error) {
    return 0;
  }
}

function checkBundleSizes() {
  const distDir = path.join(__dirname, '..', 'dist', 'assets');
  
  if (!fs.existsSync(distDir)) {
    console.error('❌ Build directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  const files = fs.readdirSync(distDir);
  const jsFiles = files.filter(file => file.endsWith('.js') && !file.endsWith('.map'));
  
  console.log('📊 Bundle Size Analysis\n');
  console.log('File'.padEnd(40) + 'Size'.padEnd(10) + 'Budget'.padEnd(10) + 'Status');
  console.log('─'.repeat(70));

  let totalSize = 0;
  let hasErrors = false;

  jsFiles.forEach(file => {
    const size = getFileSize(path.join(distDir, file));
    totalSize += size;

    // Determine budget based on filename
    let budget = null;
    let budgetKey = null;
    
    for (const [key, value] of Object.entries(BUDGETS)) {
      if (key !== 'total' && file.includes(key)) {
        budget = value;
        budgetKey = key;
        break;
      }
    }

    if (!budget) {
      budget = BUDGETS.index;
      budgetKey = 'index';
    }

    const status = size <= budget ? '✅ PASS' : '❌ FAIL';
    if (size > budget) hasErrors = true;

    console.log(
      file.padEnd(40) + 
      `${size}KB`.padEnd(10) + 
      `${budget}KB`.padEnd(10) + 
      status
    );
  });

  console.log('─'.repeat(70));
  const totalStatus = totalSize <= BUDGETS.total ? '✅ PASS' : '❌ FAIL';
  if (totalSize > BUDGETS.total) hasErrors = true;
  
  console.log(
    'TOTAL'.padEnd(40) + 
    `${totalSize}KB`.padEnd(10) + 
    `${BUDGETS.total}KB`.padEnd(10) + 
    totalStatus
  );

  console.log('\n📋 Recommendations:');
  if (hasErrors) {
    console.log('• Consider lazy loading heavy components');
    console.log('• Review and remove unused dependencies');
    console.log('• Implement code splitting for admin routes');
    console.log('• Use dynamic imports for non-critical features');
  } else {
    console.log('• All bundles are within performance budgets! 🎉');
  }

  if (hasErrors) {
    console.log('\n❌ Bundle size check failed. Please optimize before deploying.');
    process.exit(1);
  } else {
    console.log('\n✅ Bundle size check passed!');
  }
}

checkBundleSizes();
