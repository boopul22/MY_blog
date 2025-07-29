#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Performance thresholds for scoring
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  'speed-index': { good: 3400, poor: 5800 },
  'interactive': { good: 3800, poor: 7300 },
  'total-blocking-time': { good: 200, poor: 600 },
};

function getScoreLabel(metric, value) {
  const threshold = THRESHOLDS[metric];
  if (!threshold) return 'Unknown';
  
  if (value <= threshold.good) return '🟢 Good';
  if (value <= threshold.poor) return '🟡 Needs Improvement';
  return '🔴 Poor';
}

function formatValue(metric, value) {
  if (metric === 'CLS') {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
}

function generatePerformanceReport() {
  const resultsDir = path.join(__dirname, '..', 'lighthouse-results');
  
  if (!fs.existsSync(resultsDir)) {
    console.error('❌ No Lighthouse results found. Run "npm run perf:test" first.');
    process.exit(1);
  }

  console.log('📊 Performance Report\n');
  console.log('='.repeat(60));

  const files = fs.readdirSync(resultsDir).filter(file => file.endsWith('.json'));
  
  if (files.length === 0) {
    console.error('❌ No Lighthouse JSON results found.');
    process.exit(1);
  }

  let allResults = [];

  files.forEach(file => {
    const filePath = path.join(resultsDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (data.lhr) {
      allResults.push({
        url: data.lhr.finalUrl,
        audits: data.lhr.audits,
        categories: data.lhr.categories,
        timing: data.lhr.timing,
      });
    }
  });

  // Group results by URL
  const resultsByUrl = {};
  allResults.forEach(result => {
    const url = new URL(result.url).pathname;
    if (!resultsByUrl[url]) {
      resultsByUrl[url] = [];
    }
    resultsByUrl[url].push(result);
  });

  // Generate report for each URL
  Object.entries(resultsByUrl).forEach(([url, results]) => {
    console.log(`\n📄 ${url === '/' ? 'Homepage' : url}`);
    console.log('-'.repeat(40));

    // Calculate averages
    const avgMetrics = {};
    const avgScores = {};

    results.forEach(result => {
      // Core Web Vitals
      const lcp = result.audits['largest-contentful-paint']?.numericValue;
      const cls = result.audits['cumulative-layout-shift']?.numericValue;
      const fcp = result.audits['first-contentful-paint']?.numericValue;
      const si = result.audits['speed-index']?.numericValue;
      const tti = result.audits['interactive']?.numericValue;
      const tbt = result.audits['total-blocking-time']?.numericValue;

      if (lcp) avgMetrics.LCP = (avgMetrics.LCP || 0) + lcp;
      if (cls) avgMetrics.CLS = (avgMetrics.CLS || 0) + cls;
      if (fcp) avgMetrics.FCP = (avgMetrics.FCP || 0) + fcp;
      if (si) avgMetrics['speed-index'] = (avgMetrics['speed-index'] || 0) + si;
      if (tti) avgMetrics['interactive'] = (avgMetrics['interactive'] || 0) + tti;
      if (tbt) avgMetrics['total-blocking-time'] = (avgMetrics['total-blocking-time'] || 0) + tbt;

      // Category scores
      Object.entries(result.categories).forEach(([category, data]) => {
        avgScores[category] = (avgScores[category] || 0) + data.score;
      });
    });

    // Calculate averages
    const numResults = results.length;
    Object.keys(avgMetrics).forEach(key => {
      avgMetrics[key] = avgMetrics[key] / numResults;
    });
    Object.keys(avgScores).forEach(key => {
      avgScores[key] = (avgScores[key] / numResults) * 100;
    });

    // Display Core Web Vitals
    console.log('\n🎯 Core Web Vitals:');
    Object.entries(avgMetrics).forEach(([metric, value]) => {
      const formatted = formatValue(metric, value);
      const label = getScoreLabel(metric, value);
      console.log(`  ${metric.padEnd(20)} ${formatted.padEnd(10)} ${label}`);
    });

    // Display Category Scores
    console.log('\n📈 Category Scores:');
    Object.entries(avgScores).forEach(([category, score]) => {
      const emoji = score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴';
      console.log(`  ${category.padEnd(20)} ${Math.round(score)}% ${emoji}`);
    });

    // Check for issues
    const issues = [];
    if (avgMetrics.LCP > THRESHOLDS.LCP.poor) issues.push('LCP is too slow');
    if (avgMetrics.CLS > THRESHOLDS.CLS.poor) issues.push('CLS is too high');
    if (avgMetrics.FCP > THRESHOLDS.FCP.poor) issues.push('FCP is too slow');
    if (avgScores.performance < 70) issues.push('Performance score is low');

    if (issues.length > 0) {
      console.log('\n⚠️  Issues Found:');
      issues.forEach(issue => console.log(`  • ${issue}`));
    } else {
      console.log('\n✅ All metrics within acceptable ranges!');
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('📋 Recommendations:');
  console.log('• Run performance tests before each deployment');
  console.log('• Monitor Core Web Vitals in production');
  console.log('• Set up alerts for performance regressions');
  console.log('• Regular performance audits and optimizations');
  
  console.log('\n📁 Detailed results saved in: ./lighthouse-results/');
}

generatePerformanceReport();
