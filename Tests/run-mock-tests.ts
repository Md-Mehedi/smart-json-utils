#!/usr/bin/env ts-node

/**
 * Standalone Mock Test Runner
 * 
 * This script runs the 5-level deep nested array sorting tests
 * using the mock data files to verify functionality.
 */

import { runTests } from './mock-integration-test';

console.log('🚀 JSON Checker - 5-Level Deep Nested Array Verification');
console.log('=' .repeat(60));

const success = runTests();

if (success) {
  console.log('\n🎉 SUCCESS: All 5-level deep sorting tests passed!');
  console.log('✅ The JSON processor correctly handles nested arrays at all levels.');
  process.exit(0);
} else {
  console.log('\n❌ FAILURE: Some tests failed.');
  console.log('🔍 Check the test output above for specific failures.');
  process.exit(1);
} 