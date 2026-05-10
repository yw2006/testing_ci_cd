// jest.integration.config.js
// Integration tests fire real HTTP requests through Express, which means
// controllers, middleware, models, and routes all get exercised.
// So it is correct (and meaningful) to measure the full src tree here.

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/integration/**/*.test.js"],

  // ── Coverage ────────────────────────────────────────────────────────────────
  collectCoverage: true,
  coverageDirectory: "coverage/integration",
  coverageReporters: ["text", "lcov"],

  collectCoverageFrom: [
    "src/**/*.js",
    "!src/index.js",   // entry-point boot file — not meaningful to cover
  ],

  // Integration tests touch every layer so 70%+ across the board is realistic
  coverageThreshold: {
    global: {
      statements: 70,
      branches:   70,
      functions:  70,
      lines:      70,
    },
  },
};
