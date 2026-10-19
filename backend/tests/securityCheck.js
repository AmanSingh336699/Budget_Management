// Automated Security Test Suite
// Run using: npm run test:security (with backend server running)

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

const runTest = async (testName, fn) => {
  try {
    const passed = await fn();
    if (passed) {
      console.log(`[PASS] ${testName}`);
      return true;
    } else {
      console.error(`[FAIL] ${testName}`);
      return false;
    }
  } catch (error) {
    console.error(`[ERROR] ${testName}:`, error.message);
    return false;
  }
};

const runAllTests = async () => {
  console.log(`\n========================================`);
  console.log(` Starting Security Verification Suite `);
  console.log(` Target: ${BASE_URL} `);
  console.log(`========================================\n`);

  let passedCount = 0;
  let totalCount = 0;

  // Test 1: Security Headers (Helmet, Anti-clickjacking, MIME sniffing, X-Powered-By hidden)
  totalCount++;
  if (
    await runTest('1. Security Headers (Anti-Clickjacking, NoSniff, No X-Powered-By)', async () => {
      const res = await fetch(`${BASE_URL}/api/health`);
      const headers = res.headers;
      const xFrame = headers.get('x-frame-options');
      const noSniff = headers.get('x-content-type-options');
      const poweredBy = headers.get('x-powered-by');

      const isProtected = xFrame === 'DENY' && noSniff === 'nosniff' && !poweredBy;
      if (!isProtected) {
        console.log(`   Headers found: x-frame-options=${xFrame}, nosniff=${noSniff}, x-powered-by=${poweredBy}`);
      }
      return isProtected;
    })
  ) passedCount++;

  // Test 2: NoSQL Injection Block (Passing object query selectors)
  totalCount++;
  if (
    await runTest('2. NoSQL Injection Prevention (Operator query in login)', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: { $ne: null }, password: { $gt: '' } }),
      });
      // Should be blocked by validation or sanitizer (status 400)
      return res.status === 400;
    })
  ) passedCount++;

  // Test 3: Large Payload DoS Protection (> 10kb body)
  totalCount++;
  if (
    await runTest('3. Body Payload Limit (10kb maximum payload defense)', async () => {
      const largeData = 'A'.repeat(15 * 1024); // 15KB
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: largeData }),
      });
      // Should return 413 Payload Too Large
      return res.status === 413;
    })
  ) passedCount++;

  // Test 4: Missing Authentication Token Rejection
  totalCount++;
  if (
    await runTest('4. Function-level Authorization (Unauthenticated request blocked)', async () => {
      const res = await fetch(`${BASE_URL}/api/expenses`);
      return res.status === 401;
    })
  ) passedCount++;

  // Test 5: Malformed Token Rejection
  totalCount++;
  if (
    await runTest('5. JWT Integrity (Forged/invalid token rejected)', async () => {
      const res = await fetch(`${BASE_URL}/api/expenses`, {
        headers: { Authorization: 'Bearer forged.fake.jwt.token' },
      });
      return res.status === 401;
    })
  ) passedCount++;

  // Test 6: BOLA / Invalid ObjectId Parameter Handling (No server 500 error)
  totalCount++;
  if (
    await runTest('6. BOLA/IDOR ID Validation (Invalid ObjectId returns 400/401, not 500)', async () => {
      const res = await fetch(`${BASE_URL}/api/expenses/invalid-non-mongo-id`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer fake' },
      });
      // Should not be 500 internal server error
      return res.status === 400 || res.status === 401;
    })
  ) passedCount++;

  console.log(`\n========================================`);
  console.log(` Results: ${passedCount}/${totalCount} tests passed `);
  console.log(`========================================\n`);

  if (passedCount === totalCount) {
    console.log('All security checks passed successfully!\n');
    process.exit(0);
  } else {
    console.error('Some security tests failed.\n');
    process.exit(1);
  }
};

runAllTests().catch((err) => {
  console.error('Security test runner error:', err.message);
  process.exit(1);
});
